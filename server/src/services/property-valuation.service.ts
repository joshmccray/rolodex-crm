import { RentCastAVMResponse, RentCastProperty, RentCastComparable } from '../types/index.js';
import { checkRateLimit } from '../utils/rate-limiter.js';
import { db, apiUsage } from '../db/index.js';
import { eq, and, gte, lte } from 'drizzle-orm';

const RENTCAST_API_URL = 'https://api.rentcast.io/v1';

interface MarketData {
  zipCode: string;
  averagePrice: number;
  medianPrice: number;
  averagePricePerSqft: number;
  averageDaysOnMarket: number;
  saleToListRatio: number;
  priceChange1Year: number;
  priceChange3Year: number;
  inventoryCount: number;
  propertyCount: number;
}

export class PropertyValuationService {
  private apiKey: string;
  private organizationId: string;

  constructor(organizationId: string, apiKey?: string) {
    this.organizationId = organizationId;
    this.apiKey = apiKey || process.env.RENTCAST_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('RentCast API key is required');
    }
  }

  // Make authenticated request to RentCast API
  private async makeRequest<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    // Check rate limit
    const rateLimitKey = `rentcast:${this.organizationId}`;
    const rateCheck = checkRateLimit(rateLimitKey, 'rentcast');

    if (!rateCheck.allowed) {
      throw new Error(`Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetMs / 1000)} seconds.`);
    }

    // Build URL with params
    const url = new URL(`${RENTCAST_API_URL}/${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'X-Api-Key': this.apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`RentCast API request failed: ${response.status} - ${error}`);
    }

    // Track API usage
    await this.trackUsage('rentcast', endpoint);

    return response.json();
  }

  // Track API usage for billing
  private async trackUsage(apiType: string, endpoint: string): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    try {
      const existing = await db.query.apiUsage.findFirst({
        where: and(
          eq(apiUsage.organizationId, this.organizationId),
          eq(apiUsage.apiType, apiType),
          gte(apiUsage.periodStart, periodStart),
          lte(apiUsage.periodEnd, periodEnd)
        ),
      });

      if (existing) {
        await db
          .update(apiUsage)
          .set({ requestCount: (existing.requestCount || 0) + 1 })
          .where(eq(apiUsage.id, existing.id));
      } else {
        await db.insert(apiUsage).values({
          organizationId: this.organizationId,
          apiType,
          endpoint,
          requestCount: 1,
          periodStart,
          periodEnd,
        });
      }
    } catch (error) {
      console.error('Failed to track API usage:', error);
    }
  }

  // Get property value estimate (AVM)
  async getPropertyValue(address: string): Promise<RentCastAVMResponse> {
    const encodedAddress = encodeURIComponent(address);

    const response = await this.makeRequest<RentCastAVMResponse>('avm/value', {
      address: encodedAddress,
    });

    return response;
  }

  // Get detailed property information
  async getPropertyDetails(address: string): Promise<RentCastProperty | null> {
    const encodedAddress = encodeURIComponent(address);

    try {
      const response = await this.makeRequest<RentCastProperty[]>('properties', {
        address: encodedAddress,
      });

      return response[0] || null;
    } catch (error) {
      console.error('Error fetching property details:', error);
      return null;
    }
  }

  // Get market data for a zip code
  async getMarketData(zipCode: string): Promise<MarketData | null> {
    try {
      const response = await this.makeRequest<MarketData>('markets', {
        zipCode,
      });

      return response;
    } catch (error) {
      console.error('Error fetching market data:', error);
      return null;
    }
  }

  // Get comparable sales
  async getComparableSales(
    address: string,
    radiusMiles: number = 0.5,
    daysBack: number = 180
  ): Promise<RentCastComparable[]> {
    const encodedAddress = encodeURIComponent(address);

    try {
      const response = await this.makeRequest<{
        comparables: RentCastComparable[];
      }>('avm/value', {
        address: encodedAddress,
        compCount: '10',
      });

      // Filter by distance and date if needed
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);

      return (response.comparables || []).filter((comp) => {
        const withinRadius = comp.distance <= radiusMiles;
        const withinDate = !comp.saleDate || new Date(comp.saleDate) >= cutoffDate;
        return withinRadius && withinDate;
      });
    } catch (error) {
      console.error('Error fetching comparable sales:', error);
      return [];
    }
  }

  // Get value with full property details in one call
  async getFullPropertyData(address: string): Promise<{
    value: RentCastAVMResponse | null;
    property: RentCastProperty | null;
    market: MarketData | null;
  }> {
    const [value, property] = await Promise.all([
      this.getPropertyValue(address).catch(() => null),
      this.getPropertyDetails(address).catch(() => null),
    ]);

    // Get market data based on property zip code
    let market: MarketData | null = null;
    if (property?.zipCode) {
      market = await this.getMarketData(property.zipCode).catch(() => null);
    }

    return { value, property, market };
  }

  // Calculate value change between two valuations
  static calculateValueChange(
    currentValue: number,
    previousValue: number
  ): { change: number; percentChange: number; direction: 'up' | 'down' | 'flat' } {
    const change = currentValue - previousValue;
    const percentChange = previousValue > 0 ? (change / previousValue) * 100 : 0;

    let direction: 'up' | 'down' | 'flat' = 'flat';
    if (percentChange > 0.5) direction = 'up';
    else if (percentChange < -0.5) direction = 'down';

    return {
      change,
      percentChange: Math.round(percentChange * 100) / 100,
      direction,
    };
  }

  // Format currency for display
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }
}

// Factory function
export function createPropertyValuationService(organizationId: string): PropertyValuationService {
  return new PropertyValuationService(organizationId);
}

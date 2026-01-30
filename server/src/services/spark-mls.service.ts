import { SparkListing, SparkTokenResponse } from '../types/index.js';
import { checkRateLimit } from '../utils/rate-limiter.js';
import { milesToMeters, calculateDistanceMiles } from '../utils/geocoding.js';
import { db, apiUsage } from '../db/index.js';
import { eq, and, gte, lte } from 'drizzle-orm';

const SPARK_AUTH_URL = 'https://sparkplatform.com/oauth2';
const SPARK_TOKEN_URL = 'https://sparkapi.com/v1/oauth2/grant';
const SPARK_RESO_API_URL = 'https://replication.sparkapi.com/Reso/OData';

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

// In-memory token cache (per organization)
const tokenCache: Map<string, TokenCache> = new Map();

export class SparkMlsService {
  private clientId: string;
  private clientSecret: string;
  private organizationId: string;

  constructor(organizationId: string, clientId?: string, clientSecret?: string) {
    this.organizationId = organizationId;
    // Use provided credentials or fall back to platform-level credentials
    this.clientId = clientId || process.env.SPARK_API_KEY || '';
    this.clientSecret = clientSecret || process.env.SPARK_API_SECRET || '';
  }

  // Get access token using client credentials flow
  private async getAccessToken(): Promise<string> {
    const cacheKey = `${this.organizationId}:${this.clientId}`;
    const cached = tokenCache.get(cacheKey);

    // Return cached token if still valid (with 5 minute buffer)
    if (cached && cached.expiresAt > Date.now() + 5 * 60 * 1000) {
      return cached.accessToken;
    }

    // Request new token
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await fetch(SPARK_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Spark API authentication failed: ${error}`);
    }

    const data: SparkTokenResponse = await response.json();

    // Cache the token
    tokenCache.set(cacheKey, {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    });

    return data.access_token;
  }

  // Make authenticated request to Spark RESO API
  private async makeRequest<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    // Check rate limit
    const rateLimitKey = `spark:${this.organizationId}`;
    const rateCheck = checkRateLimit(rateLimitKey, 'spark_vow');

    if (!rateCheck.allowed) {
      throw new Error(`Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetMs / 1000)} seconds.`);
    }

    const token = await this.getAccessToken();

    // Build URL with params
    const url = new URL(`${SPARK_RESO_API_URL}/${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Spark API request failed: ${response.status} - ${error}`);
    }

    // Track API usage
    await this.trackUsage('spark', endpoint);

    return response.json();
  }

  // Track API usage for billing
  private async trackUsage(apiType: string, endpoint: string): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // End of current month

    try {
      // Check for existing usage record
      const existing = await db.query.apiUsage.findFirst({
        where: and(
          eq(apiUsage.organizationId, this.organizationId),
          eq(apiUsage.apiType, apiType),
          gte(apiUsage.periodStart, periodStart),
          lte(apiUsage.periodEnd, periodEnd)
        ),
      });

      if (existing) {
        // Update existing record
        await db
          .update(apiUsage)
          .set({ requestCount: (existing.requestCount || 0) + 1 })
          .where(eq(apiUsage.id, existing.id));
      } else {
        // Create new record
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

  // Get sold listings near a location
  async getSoldListingsNearby(
    latitude: number,
    longitude: number,
    radiusMiles: number = 1,
    daysBack: number = 90
  ): Promise<SparkListing[]> {
    const meters = milesToMeters(radiusMiles);
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysBack);
    const dateStr = sinceDate.toISOString().split('T')[0];

    // RESO OData filter query
    // Note: The exact syntax may vary by MLS - this is a common format
    const filter = [
      `StandardStatus eq 'Closed'`,
      `CloseDate ge ${dateStr}`,
      `geo.distance(geography'POINT(${longitude} ${latitude})', Location) lt ${meters}`,
    ].join(' and ');

    const select = [
      'ListingKey',
      'StandardStatus',
      'ClosePrice',
      'CloseDate',
      'ListPrice',
      'StreetNumber',
      'StreetDirPrefix',
      'StreetName',
      'StreetSuffix',
      'City',
      'StateOrProvince',
      'PostalCode',
      'Latitude',
      'Longitude',
      'BedroomsTotal',
      'BathroomsTotalInteger',
      'LivingArea',
      'YearBuilt',
      'PropertySubType',
      'DaysOnMarket',
    ].join(',');

    try {
      const response = await this.makeRequest<{ value: SparkListing[] }>('Property', {
        '$filter': filter,
        '$select': select,
        '$orderby': 'CloseDate desc',
        '$top': '100',
      });

      // Calculate distance for each listing
      return response.value.map((listing) => ({
        ...listing,
        _distanceMiles: listing.Latitude && listing.Longitude
          ? calculateDistanceMiles(latitude, longitude, listing.Latitude, listing.Longitude)
          : undefined,
      }));
    } catch (error) {
      console.error('Error fetching sold listings:', error);
      throw error;
    }
  }

  // Get listing details by listing key
  async getListingDetails(listingKey: string): Promise<SparkListing | null> {
    try {
      const response = await this.makeRequest<{ value: SparkListing[] }>('Property', {
        '$filter': `ListingKey eq '${listingKey}'`,
      });

      return response.value[0] || null;
    } catch (error) {
      console.error('Error fetching listing details:', error);
      throw error;
    }
  }

  // Search by address (partial match)
  async searchByAddress(
    streetAddress: string,
    city?: string,
    state?: string
  ): Promise<SparkListing[]> {
    const filters: string[] = [];

    if (streetAddress) {
      // Search by street name contains
      filters.push(`contains(StreetName, '${streetAddress}')`);
    }
    if (city) {
      filters.push(`City eq '${city}'`);
    }
    if (state) {
      filters.push(`StateOrProvince eq '${state}'`);
    }

    const filter = filters.join(' and ');

    try {
      const response = await this.makeRequest<{ value: SparkListing[] }>('Property', {
        '$filter': filter,
        '$top': '50',
        '$orderby': 'ModificationTimestamp desc',
      });

      return response.value;
    } catch (error) {
      console.error('Error searching by address:', error);
      throw error;
    }
  }

  // Get recently sold properties in a specific area
  async getRecentSalesByArea(
    city: string,
    state: string,
    daysBack: number = 30
  ): Promise<SparkListing[]> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysBack);
    const dateStr = sinceDate.toISOString().split('T')[0];

    const filter = [
      `StandardStatus eq 'Closed'`,
      `CloseDate ge ${dateStr}`,
      `City eq '${city}'`,
      `StateOrProvince eq '${state}'`,
    ].join(' and ');

    try {
      const response = await this.makeRequest<{ value: SparkListing[] }>('Property', {
        '$filter': filter,
        '$orderby': 'CloseDate desc',
        '$top': '100',
      });

      return response.value;
    } catch (error) {
      console.error('Error fetching recent sales:', error);
      throw error;
    }
  }

  // Format address from listing data
  static formatAddress(listing: SparkListing): string {
    const parts = [
      listing.StreetNumber,
      listing.StreetDirPrefix,
      listing.StreetName,
      listing.StreetSuffix,
    ].filter(Boolean);

    const street = parts.join(' ');
    const cityStateZip = [
      listing.City,
      listing.StateOrProvince,
      listing.PostalCode,
    ].filter(Boolean).join(', ');

    return `${street}, ${cityStateZip}`;
  }
}

// Factory function to create service with organization credentials
export async function createSparkMlsService(
  organizationId: string,
  encryptedCredentials?: string | null
): Promise<SparkMlsService> {
  if (encryptedCredentials) {
    const { decrypt } = await import('../utils/encryption.js');
    try {
      const creds = JSON.parse(decrypt(encryptedCredentials));
      return new SparkMlsService(organizationId, creds.clientId, creds.clientSecret);
    } catch (error) {
      console.error('Failed to decrypt org credentials, using platform credentials:', error);
    }
  }

  // Fall back to platform-level credentials
  return new SparkMlsService(organizationId);
}

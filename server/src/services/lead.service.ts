import { db, leads, propertyValues, nearbySales, notifications, organizations } from '../db/index.js';
import { eq, and, desc } from 'drizzle-orm';
import { CreateLeadInput, UpdateLeadInput } from '../types/index.js';
import { geocodeAddress } from '../utils/geocoding.js';
import { createPropertyValuationService } from './property-valuation.service.js';
import { createSparkMlsService } from './spark-mls.service.js';

export class LeadService {
  // Create a new lead
  async createLead(
    organizationId: string,
    userId: string,
    input: CreateLeadInput
  ): Promise<typeof leads.$inferSelect> {
    // Geocode the address
    let latitude: number | undefined;
    let longitude: number | undefined;

    const fullAddress = [
      input.propertyAddress,
      input.propertyCity,
      input.propertyState,
      input.propertyZip,
    ].filter(Boolean).join(', ');

    const geocodeResult = await geocodeAddress(fullAddress);
    if (geocodeResult) {
      latitude = geocodeResult.latitude;
      longitude = geocodeResult.longitude;
    }

    // Insert lead
    const [lead] = await db.insert(leads).values({
      organizationId,
      userId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      propertyAddress: input.propertyAddress,
      propertyCity: input.propertyCity,
      propertyState: input.propertyState,
      propertyZip: input.propertyZip,
      latitude,
      longitude,
      temperature: input.temperature || 'warm',
      leadType: input.leadType || 'buying',
      priceRangeLow: input.priceRangeLow,
      priceRangeHigh: input.priceRangeHigh,
      notifyNearbySales: input.notifyNearbySales ?? true,
      notifyValueChanges: input.notifyValueChanges ?? true,
      searchRadiusMiles: input.searchRadiusMiles || 0.5,
      alertFrequency: input.alertFrequency || 'weekly',
      notes: input.notes,
    }).returning();

    // Get initial property value (async, don't block)
    this.fetchInitialPropertyValue(lead).catch(console.error);

    return lead;
  }

  // Fetch initial property value for a new lead
  private async fetchInitialPropertyValue(lead: typeof leads.$inferSelect): Promise<void> {
    try {
      const valuationService = createPropertyValuationService(lead.organizationId);
      const fullAddress = [
        lead.propertyAddress,
        lead.propertyCity,
        lead.propertyState,
        lead.propertyZip,
      ].filter(Boolean).join(', ');

      const value = await valuationService.getPropertyValue(fullAddress);

      if (value) {
        await db.insert(propertyValues).values({
          leadId: lead.id,
          organizationId: lead.organizationId,
          estimatedValue: value.price,
          valueLow: value.priceRangeLow,
          valueHigh: value.priceRangeHigh,
          pricePerSqft: value.pricePerSquareFoot,
          source: 'rentcast',
          rawResponse: value as unknown as Record<string, unknown>,
        });
      }
    } catch (error) {
      console.error('Failed to fetch initial property value:', error);
    }
  }

  // Get leads for a user (or all leads in org for admins)
  async getLeads(
    organizationId: string,
    userId: string,
    role: 'owner' | 'admin' | 'agent'
  ): Promise<Array<typeof leads.$inferSelect>> {
    if (role === 'owner' || role === 'admin') {
      // Admins see all leads in organization
      return db.query.leads.findMany({
        where: eq(leads.organizationId, organizationId),
        orderBy: [desc(leads.updatedAt)],
      });
    }

    // Agents only see their own leads
    return db.query.leads.findMany({
      where: and(
        eq(leads.organizationId, organizationId),
        eq(leads.userId, userId)
      ),
      orderBy: [desc(leads.updatedAt)],
    });
  }

  // Get a single lead with property values and nearby sales
  async getLeadWithDetails(
    leadId: string,
    organizationId: string
  ): Promise<{
    lead: typeof leads.$inferSelect;
    latestValue: typeof propertyValues.$inferSelect | null;
    valueHistory: Array<typeof propertyValues.$inferSelect>;
    recentSales: Array<typeof nearbySales.$inferSelect>;
  } | null> {
    const lead = await db.query.leads.findFirst({
      where: and(
        eq(leads.id, leadId),
        eq(leads.organizationId, organizationId)
      ),
    });

    if (!lead) {
      return null;
    }

    // Get property value history
    const valueHistory = await db.query.propertyValues.findMany({
      where: eq(propertyValues.leadId, leadId),
      orderBy: [desc(propertyValues.recordedAt)],
      limit: 12, // Last 12 valuations
    });

    const latestValue = valueHistory[0] || null;

    // Get recent nearby sales
    const recentSales = await db.query.nearbySales.findMany({
      where: eq(nearbySales.leadId, leadId),
      orderBy: [desc(nearbySales.closeDate)],
      limit: 20,
    });

    return {
      lead,
      latestValue,
      valueHistory,
      recentSales,
    };
  }

  // Update lead
  async updateLead(
    leadId: string,
    organizationId: string,
    input: UpdateLeadInput
  ): Promise<typeof leads.$inferSelect> {
    // If address changed, re-geocode
    if (input.propertyAddress) {
      const fullAddress = [
        input.propertyAddress,
        input.propertyCity,
        input.propertyState,
        input.propertyZip,
      ].filter(Boolean).join(', ');

      const geocodeResult = await geocodeAddress(fullAddress);
      if (geocodeResult) {
        input.latitude = geocodeResult.latitude;
        input.longitude = geocodeResult.longitude;
      }
    }

    const [updated] = await db.update(leads)
      .set({ ...input, updatedAt: new Date() })
      .where(and(
        eq(leads.id, leadId),
        eq(leads.organizationId, organizationId)
      ))
      .returning();

    return updated;
  }

  // Delete lead
  async deleteLead(leadId: string, organizationId: string): Promise<void> {
    await db.delete(leads).where(and(
      eq(leads.id, leadId),
      eq(leads.organizationId, organizationId)
    ));
  }

  // Refresh nearby sales for a lead
  async refreshNearbySales(
    leadId: string,
    organizationId: string
  ): Promise<Array<typeof nearbySales.$inferSelect>> {
    const lead = await db.query.leads.findFirst({
      where: and(
        eq(leads.id, leadId),
        eq(leads.organizationId, organizationId)
      ),
    });

    if (!lead || !lead.latitude || !lead.longitude) {
      throw new Error('Lead not found or missing location');
    }

    // Get organization for Spark credentials
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
    });

    const sparkService = await createSparkMlsService(organizationId, org?.sparkCredentials);

    const soldListings = await sparkService.getSoldListingsNearby(
      lead.latitude,
      lead.longitude,
      lead.searchRadiusMiles || 0.5,
      90 // Last 90 days
    );

    // Upsert nearby sales
    const insertedSales: Array<typeof nearbySales.$inferSelect> = [];

    for (const listing of soldListings) {
      const address = sparkService.constructor.prototype.constructor.formatAddress
        ? (sparkService.constructor as typeof import('./spark-mls.service.js').SparkMlsService).formatAddress(listing)
        : [listing.StreetNumber, listing.StreetName, listing.City].filter(Boolean).join(' ');

      // Check if sale already exists
      const existing = await db.query.nearbySales.findFirst({
        where: and(
          eq(nearbySales.leadId, leadId),
          eq(nearbySales.mlsListingKey, listing.ListingKey)
        ),
      });

      if (!existing) {
        const [sale] = await db.insert(nearbySales).values({
          leadId,
          organizationId,
          mlsListingKey: listing.ListingKey,
          address,
          city: listing.City,
          state: listing.StateOrProvince,
          zip: listing.PostalCode,
          closePrice: listing.ClosePrice,
          closeDate: listing.CloseDate,
          listPrice: listing.ListPrice,
          daysOnMarket: listing.DaysOnMarket,
          distanceMiles: (listing as any)._distanceMiles,
          bedrooms: listing.BedroomsTotal,
          bathrooms: listing.BathroomsTotalInteger,
          squareFeet: listing.LivingArea,
          pricePerSqft: listing.LivingArea && listing.ClosePrice
            ? listing.ClosePrice / listing.LivingArea
            : undefined,
          yearBuilt: listing.YearBuilt,
          propertyType: listing.PropertySubType,
          latitude: listing.Latitude,
          longitude: listing.Longitude,
          photoUrl: listing.Media?.[0]?.MediaURL,
          rawResponse: listing as unknown as Record<string, unknown>,
        }).returning();

        insertedSales.push(sale);
      }
    }

    // Create notification if new sales found
    if (insertedSales.length > 0 && lead.notifyNearbySales) {
      await db.insert(notifications).values({
        leadId,
        organizationId,
        userId: lead.userId,
        type: 'nearby_sale',
        title: `${insertedSales.length} new sale${insertedSales.length > 1 ? 's' : ''} near ${lead.name}'s property`,
        message: `Found ${insertedSales.length} recently sold home${insertedSales.length > 1 ? 's' : ''} within ${lead.searchRadiusMiles} miles.`,
        metadata: {
          salesCount: insertedSales.length,
          sales: insertedSales.map(s => ({
            id: s.id,
            address: s.address,
            price: s.closePrice,
            date: s.closeDate,
          })),
        },
      });
    }

    return insertedSales;
  }

  // Refresh property value for a lead
  async refreshPropertyValue(
    leadId: string,
    organizationId: string
  ): Promise<typeof propertyValues.$inferSelect | null> {
    const lead = await db.query.leads.findFirst({
      where: and(
        eq(leads.id, leadId),
        eq(leads.organizationId, organizationId)
      ),
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    const valuationService = createPropertyValuationService(organizationId);
    const fullAddress = [
      lead.propertyAddress,
      lead.propertyCity,
      lead.propertyState,
      lead.propertyZip,
    ].filter(Boolean).join(', ');

    const value = await valuationService.getPropertyValue(fullAddress);

    if (!value) {
      return null;
    }

    // Get previous value for comparison
    const previousValue = await db.query.propertyValues.findFirst({
      where: eq(propertyValues.leadId, leadId),
      orderBy: [desc(propertyValues.recordedAt)],
    });

    // Insert new value
    const [newValue] = await db.insert(propertyValues).values({
      leadId,
      organizationId,
      estimatedValue: value.price,
      valueLow: value.priceRangeLow,
      valueHigh: value.priceRangeHigh,
      pricePerSqft: value.pricePerSquareFoot,
      source: 'rentcast',
      rawResponse: value as unknown as Record<string, unknown>,
    }).returning();

    // Check for significant value change and create notification
    if (previousValue?.estimatedValue && lead.notifyValueChanges) {
      const change = value.price - previousValue.estimatedValue;
      const percentChange = (change / previousValue.estimatedValue) * 100;

      if (Math.abs(percentChange) >= 2) {
        const direction = percentChange > 0 ? 'increased' : 'decreased';
        const formattedChange = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(Math.abs(change));

        await db.insert(notifications).values({
          leadId,
          organizationId,
          userId: lead.userId,
          type: percentChange > 0 ? 'value_increase' : 'value_decrease',
          title: `${lead.name}'s property value ${direction}`,
          message: `Estimated value changed by ${formattedChange} (${Math.abs(percentChange).toFixed(1)}%)`,
          metadata: {
            previousValue: previousValue.estimatedValue,
            newValue: value.price,
            change,
            percentChange,
          },
        });
      }
    }

    return newValue;
  }
}

export const leadService = new LeadService();

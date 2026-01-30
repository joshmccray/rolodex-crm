import cron from 'node-cron';
import { db, leads, organizations, nearbySales, notifications } from '../db/index.js';
import { eq, and, isNotNull } from 'drizzle-orm';
import { createSparkMlsService, SparkMlsService } from '../services/spark-mls.service.js';
import { calculateDistanceMiles } from '../utils/geocoding.js';

// Run daily at 6 AM
const CRON_SCHEDULE = '0 6 * * *';

interface SyncResult {
  organizationId: string;
  leadsProcessed: number;
  newSalesFound: number;
  errors: string[];
}

async function syncNearbySalesForOrganization(orgId: string): Promise<SyncResult> {
  const result: SyncResult = {
    organizationId: orgId,
    leadsProcessed: 0,
    newSalesFound: 0,
    errors: [],
  };

  try {
    // Get organization
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });

    if (!org) {
      result.errors.push('Organization not found');
      return result;
    }

    // Create Spark service for this org
    const sparkService = await createSparkMlsService(orgId, org.sparkCredentials);

    // Get all leads with location and notify_nearby_sales enabled
    const leadsToProcess = await db.query.leads.findMany({
      where: and(
        eq(leads.organizationId, orgId),
        eq(leads.notifyNearbySales, true),
        isNotNull(leads.latitude),
        isNotNull(leads.longitude)
      ),
    });

    for (const lead of leadsToProcess) {
      try {
        if (!lead.latitude || !lead.longitude) continue;

        result.leadsProcessed++;

        // Fetch sold listings
        const soldListings = await sparkService.getSoldListingsNearby(
          lead.latitude,
          lead.longitude,
          lead.searchRadiusMiles || 0.5,
          7 // Last 7 days
        );

        const newSales: typeof nearbySales.$inferSelect[] = [];

        for (const listing of soldListings) {
          // Check if sale already exists
          const existing = await db.query.nearbySales.findFirst({
            where: and(
              eq(nearbySales.leadId, lead.id),
              eq(nearbySales.mlsListingKey, listing.ListingKey)
            ),
          });

          if (!existing) {
            const address = SparkMlsService.formatAddress(listing);
            const distance = listing.Latitude && listing.Longitude
              ? calculateDistanceMiles(lead.latitude!, lead.longitude!, listing.Latitude, listing.Longitude)
              : undefined;

            const [sale] = await db.insert(nearbySales).values({
              leadId: lead.id,
              organizationId: orgId,
              mlsListingKey: listing.ListingKey,
              address,
              city: listing.City,
              state: listing.StateOrProvince,
              zip: listing.PostalCode,
              closePrice: listing.ClosePrice,
              closeDate: listing.CloseDate,
              listPrice: listing.ListPrice,
              daysOnMarket: listing.DaysOnMarket,
              distanceMiles: distance,
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
            }).returning();

            newSales.push(sale);
            result.newSalesFound++;
          }
        }

        // Create notification if new sales found
        if (newSales.length > 0) {
          await db.insert(notifications).values({
            leadId: lead.id,
            organizationId: orgId,
            userId: lead.userId,
            type: 'nearby_sale',
            title: `${newSales.length} new sale${newSales.length > 1 ? 's' : ''} near ${lead.name}'s property`,
            message: `Found ${newSales.length} recently sold home${newSales.length > 1 ? 's' : ''} within ${lead.searchRadiusMiles} miles.`,
            metadata: {
              salesCount: newSales.length,
              sales: newSales.map(s => ({
                id: s.id,
                address: s.address,
                price: s.closePrice,
                date: s.closeDate,
              })),
            },
          });
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (leadError) {
        const errorMsg = leadError instanceof Error ? leadError.message : 'Unknown error';
        result.errors.push(`Lead ${lead.id}: ${errorMsg}`);
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Organization error: ${errorMsg}`);
  }

  return result;
}

async function runSyncJob(): Promise<void> {
  console.log('[SyncNearbySales] Starting job at', new Date().toISOString());

  try {
    // Get all organizations
    const orgs = await db.query.organizations.findMany();

    const results: SyncResult[] = [];

    for (const org of orgs) {
      console.log(`[SyncNearbySales] Processing organization: ${org.name}`);
      const result = await syncNearbySalesForOrganization(org.id);
      results.push(result);
      console.log(`[SyncNearbySales] Org ${org.name}: ${result.leadsProcessed} leads, ${result.newSalesFound} new sales`);

      if (result.errors.length > 0) {
        console.error(`[SyncNearbySales] Errors for ${org.name}:`, result.errors);
      }
    }

    const totalLeads = results.reduce((sum, r) => sum + r.leadsProcessed, 0);
    const totalSales = results.reduce((sum, r) => sum + r.newSalesFound, 0);

    console.log(`[SyncNearbySales] Completed: ${totalLeads} leads, ${totalSales} new sales across ${orgs.length} orgs`);
  } catch (error) {
    console.error('[SyncNearbySales] Job failed:', error);
  }
}

// Start the cron job
export function startSyncNearbySalesJob(): void {
  console.log(`[SyncNearbySales] Scheduling job with cron: ${CRON_SCHEDULE}`);

  cron.schedule(CRON_SCHEDULE, () => {
    runSyncJob().catch(console.error);
  });
}

// Export for manual triggering
export { runSyncJob, syncNearbySalesForOrganization };

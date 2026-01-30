import cron from 'node-cron';
import { db, leads, organizations, propertyValues, notifications } from '../db/index.js';
import { eq, and, desc } from 'drizzle-orm';
import { createPropertyValuationService, PropertyValuationService } from '../services/property-valuation.service.js';

// Run weekly on Sunday at midnight
const CRON_SCHEDULE = '0 0 * * 0';

interface UpdateResult {
  organizationId: string;
  leadsProcessed: number;
  valuesUpdated: number;
  significantChanges: number;
  errors: string[];
}

async function updatePropertyValuesForOrganization(orgId: string): Promise<UpdateResult> {
  const result: UpdateResult = {
    organizationId: orgId,
    leadsProcessed: 0,
    valuesUpdated: 0,
    significantChanges: 0,
    errors: [],
  };

  try {
    // Create valuation service for this org
    const valuationService = createPropertyValuationService(orgId);

    // Get all leads with notify_value_changes enabled
    const leadsToProcess = await db.query.leads.findMany({
      where: and(
        eq(leads.organizationId, orgId),
        eq(leads.notifyValueChanges, true)
      ),
    });

    for (const lead of leadsToProcess) {
      try {
        result.leadsProcessed++;

        // Build full address
        const fullAddress = [
          lead.propertyAddress,
          lead.propertyCity,
          lead.propertyState,
          lead.propertyZip,
        ].filter(Boolean).join(', ');

        // Get current value
        const currentValue = await valuationService.getPropertyValue(fullAddress);

        if (!currentValue) {
          result.errors.push(`Lead ${lead.id}: No value returned`);
          continue;
        }

        // Get previous value
        const previousValue = await db.query.propertyValues.findFirst({
          where: eq(propertyValues.leadId, lead.id),
          orderBy: [desc(propertyValues.recordedAt)],
        });

        // Insert new value
        await db.insert(propertyValues).values({
          leadId: lead.id,
          organizationId: orgId,
          estimatedValue: currentValue.price,
          valueLow: currentValue.priceRangeLow,
          valueHigh: currentValue.priceRangeHigh,
          pricePerSqft: currentValue.pricePerSquareFoot,
          source: 'rentcast',
          rawResponse: currentValue as unknown as Record<string, unknown>,
        });

        result.valuesUpdated++;

        // Check for significant change (2% or more)
        if (previousValue?.estimatedValue) {
          const change = currentValue.price - previousValue.estimatedValue;
          const percentChange = (change / previousValue.estimatedValue) * 100;

          if (Math.abs(percentChange) >= 2) {
            result.significantChanges++;

            const direction = percentChange > 0 ? 'increased' : 'decreased';
            const formattedChange = PropertyValuationService.formatCurrency(Math.abs(change));

            await db.insert(notifications).values({
              leadId: lead.id,
              organizationId: orgId,
              userId: lead.userId,
              type: percentChange > 0 ? 'value_increase' : 'value_decrease',
              title: `${lead.name}'s property value ${direction}`,
              message: `Estimated value changed by ${formattedChange} (${Math.abs(percentChange).toFixed(1)}%)`,
              metadata: {
                previousValue: previousValue.estimatedValue,
                newValue: currentValue.price,
                change,
                percentChange: Math.round(percentChange * 100) / 100,
              },
            });
          }
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
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

async function runUpdateJob(): Promise<void> {
  console.log('[UpdatePropertyValues] Starting job at', new Date().toISOString());

  try {
    // Get all organizations
    const orgs = await db.query.organizations.findMany();

    const results: UpdateResult[] = [];

    for (const org of orgs) {
      console.log(`[UpdatePropertyValues] Processing organization: ${org.name}`);
      const result = await updatePropertyValuesForOrganization(org.id);
      results.push(result);
      console.log(`[UpdatePropertyValues] Org ${org.name}: ${result.leadsProcessed} leads, ${result.valuesUpdated} updated, ${result.significantChanges} significant changes`);

      if (result.errors.length > 0) {
        console.error(`[UpdatePropertyValues] Errors for ${org.name}:`, result.errors);
      }
    }

    const totalLeads = results.reduce((sum, r) => sum + r.leadsProcessed, 0);
    const totalUpdated = results.reduce((sum, r) => sum + r.valuesUpdated, 0);
    const totalChanges = results.reduce((sum, r) => sum + r.significantChanges, 0);

    console.log(`[UpdatePropertyValues] Completed: ${totalLeads} leads, ${totalUpdated} updated, ${totalChanges} significant changes across ${orgs.length} orgs`);
  } catch (error) {
    console.error('[UpdatePropertyValues] Job failed:', error);
  }
}

// Start the cron job
export function startUpdatePropertyValuesJob(): void {
  console.log(`[UpdatePropertyValues] Scheduling job with cron: ${CRON_SCHEDULE}`);

  cron.schedule(CRON_SCHEDULE, () => {
    runUpdateJob().catch(console.error);
  });
}

// Export for manual triggering
export { runUpdateJob, updatePropertyValuesForOrganization };

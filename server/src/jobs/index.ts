import { startSyncNearbySalesJob } from './sync-nearby-sales.job.js';
import { startUpdatePropertyValuesJob } from './update-property-values.job.js';

export function startAllJobs(): void {
  console.log('[Jobs] Starting all background jobs...');

  // Start nearby sales sync (daily at 6 AM)
  startSyncNearbySalesJob();

  // Start property value updates (weekly on Sunday)
  startUpdatePropertyValuesJob();

  console.log('[Jobs] All background jobs scheduled');
}

export { startSyncNearbySalesJob, startUpdatePropertyValuesJob };
export { runSyncJob as runNearbySalesSync } from './sync-nearby-sales.job.js';
export { runUpdateJob as runPropertyValueUpdate } from './update-property-values.job.js';

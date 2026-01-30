import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  doublePrecision,
  date,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Organizations (Brokerages) - Top level tenant
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  subscriptionTier: varchar('subscription_tier', { length: 50 }).default('free'),
  mlsRegion: varchar('mls_region', { length: 100 }),
  sparkCredentials: text('spark_credentials'), // encrypted JSON
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('org_slug_idx').on(table.slug),
}));

// Users (Agents) - belong to an organization
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('agent').notNull(), // owner, admin, agent
  settings: jsonb('settings').default({}),
  inviteToken: varchar('invite_token', { length: 255 }),
  inviteExpiresAt: timestamp('invite_expires_at'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailOrgIdx: index('user_email_org_idx').on(table.email, table.organizationId),
  orgIdx: index('user_org_idx').on(table.organizationId),
}));

// Leads/Contacts - scoped to organization and assigned to a user
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  propertyAddress: text('property_address').notNull(),
  propertyCity: varchar('property_city', { length: 100 }),
  propertyState: varchar('property_state', { length: 50 }),
  propertyZip: varchar('property_zip', { length: 20 }),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  temperature: varchar('temperature', { length: 20 }).default('warm'), // hot, warm, cold
  leadType: varchar('lead_type', { length: 50 }).default('buying'), // buying, selling, both
  priceRangeLow: integer('price_range_low'),
  priceRangeHigh: integer('price_range_high'),
  notifyNearbySales: boolean('notify_nearby_sales').default(true),
  notifyValueChanges: boolean('notify_value_changes').default(true),
  searchRadiusMiles: doublePrecision('search_radius_miles').default(0.5),
  alertFrequency: varchar('alert_frequency', { length: 50 }).default('weekly'),
  notes: text('notes'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('lead_org_idx').on(table.organizationId),
  userIdx: index('lead_user_idx').on(table.userId),
  locationIdx: index('lead_location_idx').on(table.latitude, table.longitude),
}));

// Property Value Tracking
export const propertyValues = pgTable('property_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  estimatedValue: integer('estimated_value'),
  valueLow: integer('value_low'),
  valueHigh: integer('value_high'),
  pricePerSqft: doublePrecision('price_per_sqft'),
  squareFeet: integer('square_feet'),
  bedrooms: integer('bedrooms'),
  bathrooms: doublePrecision('bathrooms'),
  yearBuilt: integer('year_built'),
  source: varchar('source', { length: 50 }).default('rentcast'),
  rawResponse: jsonb('raw_response'),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
}, (table) => ({
  leadIdx: index('prop_value_lead_idx').on(table.leadId),
  orgIdx: index('prop_value_org_idx').on(table.organizationId),
  recordedIdx: index('prop_value_recorded_idx').on(table.recordedAt),
}));

// Nearby Sales (cached from MLS)
export const nearbySales = pgTable('nearby_sales', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  mlsListingKey: varchar('mls_listing_key', { length: 100 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zip: varchar('zip', { length: 20 }),
  closePrice: integer('close_price'),
  closeDate: date('close_date'),
  listPrice: integer('list_price'),
  daysOnMarket: integer('days_on_market'),
  distanceMiles: doublePrecision('distance_miles'),
  bedrooms: integer('bedrooms'),
  bathrooms: doublePrecision('bathrooms'),
  squareFeet: integer('square_feet'),
  pricePerSqft: doublePrecision('price_per_sqft'),
  yearBuilt: integer('year_built'),
  propertyType: varchar('property_type', { length: 100 }),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  photoUrl: text('photo_url'),
  rawResponse: jsonb('raw_response'),
  syncedAt: timestamp('synced_at').defaultNow().notNull(),
}, (table) => ({
  leadIdx: index('nearby_sale_lead_idx').on(table.leadId),
  orgIdx: index('nearby_sale_org_idx').on(table.organizationId),
  mlsKeyIdx: index('nearby_sale_mls_key_idx').on(table.mlsListingKey),
  closeDateIdx: index('nearby_sale_close_date_idx').on(table.closeDate),
}));

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // nearby_sale, value_increase, value_decrease, price_drop
  title: varchar('title', { length: 255 }),
  message: text('message'),
  metadata: jsonb('metadata').default({}),
  emailSentAt: timestamp('email_sent_at'),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('notification_org_idx').on(table.organizationId),
  userIdx: index('notification_user_idx').on(table.userId),
  typeIdx: index('notification_type_idx').on(table.type),
  createdIdx: index('notification_created_idx').on(table.createdAt),
}));

// API Usage Tracking (for billing and rate limiting)
export const apiUsage = pgTable('api_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  apiType: varchar('api_type', { length: 50 }).notNull(), // spark, rentcast
  endpoint: varchar('endpoint', { length: 255 }),
  requestCount: integer('request_count').default(0),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
}, (table) => ({
  orgApiPeriodIdx: index('api_usage_org_period_idx').on(table.organizationId, table.apiType, table.periodStart),
}));

// Refresh tokens for OAuth
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 500 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  tokenIdx: index('refresh_token_idx').on(table.token),
  userIdx: index('refresh_token_user_idx').on(table.userId),
}));

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  leads: many(leads),
  propertyValues: many(propertyValues),
  nearbySales: many(nearbySales),
  notifications: many(notifications),
  apiUsage: many(apiUsage),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  leads: many(leads),
  notifications: many(notifications),
  refreshTokens: many(refreshTokens),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [leads.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [leads.userId],
    references: [users.id],
  }),
  propertyValues: many(propertyValues),
  nearbySales: many(nearbySales),
  notifications: many(notifications),
}));

export const propertyValuesRelations = relations(propertyValues, ({ one }) => ({
  lead: one(leads, {
    fields: [propertyValues.leadId],
    references: [leads.id],
  }),
  organization: one(organizations, {
    fields: [propertyValues.organizationId],
    references: [organizations.id],
  }),
}));

export const nearbySalesRelations = relations(nearbySales, ({ one }) => ({
  lead: one(leads, {
    fields: [nearbySales.leadId],
    references: [leads.id],
  }),
  organization: one(organizations, {
    fields: [nearbySales.organizationId],
    references: [organizations.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  lead: one(leads, {
    fields: [notifications.leadId],
    references: [leads.id],
  }),
  organization: one(organizations, {
    fields: [notifications.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const apiUsageRelations = relations(apiUsage, ({ one }) => ({
  organization: one(organizations, {
    fields: [apiUsage.organizationId],
    references: [organizations.id],
  }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

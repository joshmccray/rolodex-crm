import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db, organizations, users, apiUsage } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { CreateOrganizationInput } from '../types/index.js';
import { encryptJSON } from '../utils/encryption.js';

export class OrganizationService {
  // Create a new organization with owner user
  async createOrganization(input: CreateOrganizationInput): Promise<{
    organization: typeof organizations.$inferSelect;
    owner: typeof users.$inferSelect;
  }> {
    // Check if slug is already taken
    const existingOrg = await db.query.organizations.findFirst({
      where: eq(organizations.slug, input.slug),
    });

    if (existingOrg) {
      throw new Error('Organization slug already exists');
    }

    // Check if email is already used
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, input.ownerEmail),
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.ownerPassword, 12);

    // Create organization
    const [org] = await db.insert(organizations).values({
      name: input.name,
      slug: input.slug,
      mlsRegion: input.mlsRegion,
    }).returning();

    // Create owner user
    const [owner] = await db.insert(users).values({
      organizationId: org.id,
      email: input.ownerEmail,
      name: input.ownerName,
      passwordHash,
      role: 'owner',
    }).returning();

    return { organization: org, owner };
  }

  // Get organization by ID
  async getOrganization(id: string): Promise<typeof organizations.$inferSelect | null> {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, id),
    });
    return org ?? null;
  }

  // Get organization by slug
  async getOrganizationBySlug(slug: string): Promise<typeof organizations.$inferSelect | null> {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.slug, slug),
    });
    return org ?? null;
  }

  // Update organization
  async updateOrganization(
    id: string,
    data: Partial<{
      name: string;
      mlsRegion: string;
      subscriptionTier: string;
      settings: Record<string, unknown>;
    }>
  ): Promise<typeof organizations.$inferSelect> {
    const [updated] = await db.update(organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();

    return updated;
  }

  // Set Spark API credentials for organization
  async setSparkCredentials(
    organizationId: string,
    clientId: string,
    clientSecret: string
  ): Promise<void> {
    const encrypted = encryptJSON({ clientId, clientSecret });

    await db.update(organizations)
      .set({ sparkCredentials: encrypted, updatedAt: new Date() })
      .where(eq(organizations.id, organizationId));
  }

  // Get all users in organization
  async getOrganizationUsers(organizationId: string): Promise<Array<typeof users.$inferSelect>> {
    return db.query.users.findMany({
      where: eq(users.organizationId, organizationId),
      orderBy: (users, { asc }) => [asc(users.createdAt)],
    });
  }

  // Generate invite token for new user
  async createUserInvite(
    organizationId: string,
    email: string,
    name: string,
    role: 'admin' | 'agent' = 'agent'
  ): Promise<string> {
    // Check if email already exists in this org
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      throw new Error('User with this email already exists');
    }

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create pending user with invite token
    await db.insert(users).values({
      organizationId,
      email,
      name,
      passwordHash: '', // Will be set when invite is accepted
      role,
      inviteToken,
      inviteExpiresAt,
    });

    return inviteToken;
  }

  // Accept invite and set password
  async acceptInvite(token: string, password: string): Promise<typeof users.$inferSelect> {
    const user = await db.query.users.findFirst({
      where: eq(users.inviteToken, token),
    });

    if (!user) {
      throw new Error('Invalid invite token');
    }

    if (user.inviteExpiresAt && user.inviteExpiresAt < new Date()) {
      throw new Error('Invite token has expired');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [updated] = await db.update(users)
      .set({
        passwordHash,
        inviteToken: null,
        inviteExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return updated;
  }

  // Remove user from organization
  async removeUser(organizationId: string, userId: string): Promise<void> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || user.organizationId !== organizationId) {
      throw new Error('User not found in organization');
    }

    if (user.role === 'owner') {
      throw new Error('Cannot remove organization owner');
    }

    await db.delete(users).where(eq(users.id, userId));
  }

  // Get API usage for organization
  async getApiUsage(organizationId: string): Promise<Array<{
    apiType: string;
    requestCount: number;
    periodStart: Date;
    periodEnd: Date;
  }>> {
    const usage = await db.query.apiUsage.findMany({
      where: eq(apiUsage.organizationId, organizationId),
      orderBy: (apiUsage, { desc }) => [desc(apiUsage.periodStart)],
    });

    return usage.map((u) => ({
      apiType: u.apiType,
      requestCount: u.requestCount || 0,
      periodStart: u.periodStart,
      periodEnd: u.periodEnd,
    }));
  }
}

export const organizationService = new OrganizationService();

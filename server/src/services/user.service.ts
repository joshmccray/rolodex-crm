import bcrypt from 'bcryptjs';
import { db, users, refreshTokens } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { signToken } from '../utils/jwt.js';
import crypto from 'crypto';

export class UserService {
  // Authenticate user and return tokens
  async login(email: string, password: string): Promise<{
    user: Omit<typeof users.$inferSelect, 'passwordHash'>;
    accessToken: string;
    refreshToken: string;
  } | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        organization: true,
      },
    });

    if (!user || !user.passwordHash) {
      return null;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return null;
    }

    // Update last login
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Generate tokens
    const accessToken = signToken({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role as 'owner' | 'admin' | 'agent',
      email: user.email,
    });

    // Generate refresh token
    const refreshTokenValue = crypto.randomBytes(64).toString('hex');
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshTokenValue,
      expiresAt: refreshExpiresAt,
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  // Refresh access token
  async refreshAccessToken(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    const storedToken = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.token, token),
      with: {
        user: true,
      },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      // Delete expired token
      if (storedToken) {
        await db.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id));
      }
      return null;
    }

    const user = storedToken.user;

    // Generate new access token
    const accessToken = signToken({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role as 'owner' | 'admin' | 'agent',
      email: user.email,
    });

    // Rotate refresh token
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id));
    await db.insert(refreshTokens).values({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: refreshExpiresAt,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  // Logout (invalidate refresh token)
  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await db.delete(refreshTokens)
        .where(and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.token, refreshToken)
        ));
    } else {
      // Logout from all devices
      await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
    }
  }

  // Get user by ID
  async getUserById(id: string): Promise<typeof users.$inferSelect | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return user ?? null;
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<typeof users.$inferSelect | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return user ?? null;
  }

  // Update user profile
  async updateUser(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      settings: Record<string, unknown>;
    }>
  ): Promise<typeof users.$inferSelect> {
    const [updated] = await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return updated;
  }

  // Change password
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return false;
    }

    const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!validPassword) {
      return false;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await db.update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, id));

    // Invalidate all refresh tokens
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, id));

    return true;
  }

  // Update user role (admin only)
  async updateUserRole(
    organizationId: string,
    userId: string,
    newRole: 'admin' | 'agent'
  ): Promise<typeof users.$inferSelect> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || user.organizationId !== organizationId) {
      throw new Error('User not found in organization');
    }

    if (user.role === 'owner') {
      throw new Error('Cannot change owner role');
    }

    const [updated] = await db.update(users)
      .set({ role: newRole, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return updated;
  }
}

export const userService = new UserService();

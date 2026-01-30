import { db, notifications, leads, users } from '../db/index.js';
import { eq, and, isNull, desc } from 'drizzle-orm';

export class NotificationService {
  // Get notifications for a user
  async getNotifications(
    organizationId: string,
    userId: string,
    role: 'owner' | 'admin' | 'agent',
    options: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    notifications: Array<typeof notifications.$inferSelect & { lead?: typeof leads.$inferSelect }>;
    total: number;
  }> {
    const { unreadOnly = false, limit = 50, offset = 0 } = options;

    // Build where conditions
    const conditions = [eq(notifications.organizationId, organizationId)];

    if (role === 'agent') {
      // Agents only see their own notifications
      conditions.push(eq(notifications.userId, userId));
    }

    if (unreadOnly) {
      conditions.push(isNull(notifications.readAt));
    }

    const notificationList = await db.query.notifications.findMany({
      where: and(...conditions),
      with: {
        lead: true,
      },
      orderBy: [desc(notifications.createdAt)],
      limit,
      offset,
    });

    // Get total count
    const allNotifications = await db.query.notifications.findMany({
      where: and(...conditions),
    });

    return {
      notifications: notificationList,
      total: allNotifications.length,
    };
  }

  // Mark notification as read
  async markAsRead(
    notificationId: string,
    organizationId: string
  ): Promise<typeof notifications.$inferSelect> {
    const [updated] = await db.update(notifications)
      .set({ readAt: new Date() })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.organizationId, organizationId)
      ))
      .returning();

    return updated;
  }

  // Mark all notifications as read for a user
  async markAllAsRead(
    organizationId: string,
    userId: string
  ): Promise<number> {
    const result = await db.update(notifications)
      .set({ readAt: new Date() })
      .where(and(
        eq(notifications.organizationId, organizationId),
        eq(notifications.userId, userId),
        isNull(notifications.readAt)
      ))
      .returning();

    return result.length;
  }

  // Get unread count for a user
  async getUnreadCount(
    organizationId: string,
    userId: string,
    role: 'owner' | 'admin' | 'agent'
  ): Promise<number> {
    const conditions = [
      eq(notifications.organizationId, organizationId),
      isNull(notifications.readAt),
    ];

    if (role === 'agent') {
      conditions.push(eq(notifications.userId, userId));
    }

    const unread = await db.query.notifications.findMany({
      where: and(...conditions),
    });

    return unread.length;
  }

  // Create a notification
  async createNotification(input: {
    leadId: string;
    organizationId: string;
    userId?: string;
    type: string;
    title: string;
    message?: string;
    metadata?: Record<string, unknown>;
  }): Promise<typeof notifications.$inferSelect> {
    const [notification] = await db.insert(notifications).values({
      leadId: input.leadId,
      organizationId: input.organizationId,
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      metadata: input.metadata || {},
    }).returning();

    return notification;
  }

  // Delete notification
  async deleteNotification(
    notificationId: string,
    organizationId: string
  ): Promise<void> {
    await db.delete(notifications).where(and(
      eq(notifications.id, notificationId),
      eq(notifications.organizationId, organizationId)
    ));
  }

  // Get notifications for a specific lead
  async getNotificationsForLead(
    leadId: string,
    organizationId: string,
    limit: number = 20
  ): Promise<Array<typeof notifications.$inferSelect>> {
    return db.query.notifications.findMany({
      where: and(
        eq(notifications.leadId, leadId),
        eq(notifications.organizationId, organizationId)
      ),
      orderBy: [desc(notifications.createdAt)],
      limit,
    });
  }
}

export const notificationService = new NotificationService();

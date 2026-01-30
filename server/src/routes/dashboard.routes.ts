import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { db, leads, notifications, nearbySales, propertyValues } from '../db/index.js';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get dashboard stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { organizationId, userId, role } = req.ctx!;

    // Build base conditions
    const isAgent = role === 'agent';

    // Get lead counts by temperature
    const allLeads = await db.query.leads.findMany({
      where: isAgent
        ? and(eq(leads.organizationId, organizationId), eq(leads.userId, userId))
        : eq(leads.organizationId, organizationId),
    });

    const hotLeads = allLeads.filter(l => l.temperature === 'hot').length;
    const warmLeads = allLeads.filter(l => l.temperature === 'warm').length;
    const coldLeads = allLeads.filter(l => l.temperature === 'cold').length;

    // Get unread notifications count
    const unreadNotifications = await db.query.notifications.findMany({
      where: isAgent
        ? and(
            eq(notifications.organizationId, organizationId),
            eq(notifications.userId, userId)
          )
        : eq(notifications.organizationId, organizationId),
    });
    const unreadCount = unreadNotifications.filter(n => !n.readAt).length;

    // Get leads with market alerts enabled
    const leadsWithAlerts = allLeads.filter(l => l.notifyNearbySales).length;

    // Get recent nearby sales
    const recentSales = await db.query.nearbySales.findMany({
      where: eq(nearbySales.organizationId, organizationId),
      orderBy: [desc(nearbySales.syncedAt)],
      limit: 10,
    });

    // Get recent value changes
    const recentValues = await db.query.propertyValues.findMany({
      where: eq(propertyValues.organizationId, organizationId),
      orderBy: [desc(propertyValues.recordedAt)],
      limit: 10,
      with: {
        lead: true,
      },
    });

    res.json({
      leads: {
        total: allLeads.length,
        hot: hotLeads,
        warm: warmLeads,
        cold: coldLeads,
        withMarketAlerts: leadsWithAlerts,
      },
      notifications: {
        unread: unreadCount,
      },
      recentActivity: {
        nearbySales: recentSales.length,
        valueUpdates: recentValues.length,
      },
      recentSales: recentSales.slice(0, 5).map(s => ({
        id: s.id,
        address: s.address,
        closePrice: s.closePrice,
        closeDate: s.closeDate,
      })),
      recentValueUpdates: recentValues.slice(0, 5).map(v => ({
        id: v.id,
        leadName: v.lead?.name,
        estimatedValue: v.estimatedValue,
        recordedAt: v.recordedAt,
      })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to get dashboard stats' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { notificationService } from '../services/notification.service.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get notifications
router.get('/', async (req: Request, res: Response) => {
  try {
    const unreadOnly = req.query.unreadOnly === 'true';
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await notificationService.getNotifications(
      req.ctx!.organizationId,
      req.ctx!.userId,
      req.ctx!.role,
      { unreadOnly, limit, offset }
    );

    res.json(result);
  } catch {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to get notifications' });
  }
});

// Get unread count
router.get('/unread-count', async (req: Request, res: Response) => {
  try {
    const count = await notificationService.getUnreadCount(
      req.ctx!.organizationId,
      req.ctx!.userId,
      req.ctx!.role
    );

    res.json({ count });
  } catch {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to get unread count' });
  }
});

// Mark notification as read
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.ctx!.organizationId
    );

    if (!notification) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Notification not found' });
      return;
    }

    res.json(notification);
  } catch {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to mark as read' });
  }
});

// Mark all as read
router.post('/mark-all-read', async (req: Request, res: Response) => {
  try {
    const count = await notificationService.markAllAsRead(
      req.ctx!.organizationId,
      req.ctx!.userId
    );

    res.json({ markedCount: count });
  } catch {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to mark all as read' });
  }
});

// Delete notification
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await notificationService.deleteNotification(
      req.params.id,
      req.ctx!.organizationId
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to delete notification' });
  }
});

export default router;

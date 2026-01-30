import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, requireAdmin, requireOwner } from '../middleware/auth.middleware.js';
import { organizationService } from '../services/organization.service.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get current organization
router.get('/', async (req: Request, res: Response) => {
  try {
    const org = await organizationService.getOrganization(req.ctx!.organizationId);

    if (!org) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Organization not found' });
      return;
    }

    // Don't expose encrypted credentials
    const { sparkCredentials, ...orgData } = org;
    res.json({
      ...orgData,
      hasSparkCredentials: !!sparkCredentials,
    });
  } catch {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to get organization' });
  }
});

// Update organization (admin only)
router.put('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updateSchema = z.object({
      name: z.string().min(2).max(255).optional(),
      mlsRegion: z.string().optional(),
      settings: z.record(z.unknown()).optional(),
    });

    const body = updateSchema.parse(req.body);
    const org = await organizationService.updateOrganization(req.ctx!.organizationId, body);

    const { sparkCredentials, ...orgData } = org;
    res.json(orgData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors });
      return;
    }
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to update organization' });
  }
});

// Set Spark API credentials (owner only)
router.post('/spark-credentials', requireOwner, async (req: Request, res: Response) => {
  try {
    const credentialsSchema = z.object({
      clientId: z.string().min(1),
      clientSecret: z.string().min(1),
    });

    const body = credentialsSchema.parse(req.body);

    await organizationService.setSparkCredentials(
      req.ctx!.organizationId,
      body.clientId,
      body.clientSecret
    );

    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors });
      return;
    }
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to set credentials' });
  }
});

// Get all users in organization (admin only)
router.get('/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const users = await organizationService.getOrganizationUsers(req.ctx!.organizationId);

    // Remove password hashes
    const safeUsers = users.map(({ passwordHash, ...user }) => user);
    res.json(safeUsers);
  } catch {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to get users' });
  }
});

// Invite new user (admin only)
router.post('/users/invite', requireAdmin, async (req: Request, res: Response) => {
  try {
    const inviteSchema = z.object({
      email: z.string().email(),
      name: z.string().min(2).max(255),
      role: z.enum(['admin', 'agent']).default('agent'),
    });

    const body = inviteSchema.parse(req.body);

    const inviteToken = await organizationService.createUserInvite(
      req.ctx!.organizationId,
      body.email,
      body.name,
      body.role
    );

    // In production, send email with invite link
    // For now, return the token (for testing)
    res.json({
      success: true,
      inviteToken, // Remove in production - send via email instead
      inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite?token=${inviteToken}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ code: 'INVITE_FAILED', message: error.message });
      return;
    }
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to create invite' });
  }
});

// Remove user (admin only)
router.delete('/users/:userId', requireAdmin, async (req: Request, res: Response) => {
  try {
    await organizationService.removeUser(req.ctx!.organizationId, req.params.userId);
    res.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ code: 'REMOVE_FAILED', message: error.message });
      return;
    }
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to remove user' });
  }
});

// Get API usage (admin only)
router.get('/usage', requireAdmin, async (req: Request, res: Response) => {
  try {
    const usage = await organizationService.getApiUsage(req.ctx!.organizationId);
    res.json(usage);
  } catch {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to get API usage' });
  }
});

export default router;

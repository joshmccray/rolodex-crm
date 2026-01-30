import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { organizationService } from '../services/organization.service.js';
import { userService } from '../services/user.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  organizationName: z.string().min(2).max(255),
  organizationSlug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  mlsRegion: z.string().optional(),
  ownerEmail: z.string().email(),
  ownerName: z.string().min(2).max(255),
  ownerPassword: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

const acceptInviteSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

// Register new organization with owner
router.post('/register', async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);

    const { organization, owner } = await organizationService.createOrganization({
      name: body.organizationName,
      slug: body.organizationSlug,
      mlsRegion: body.mlsRegion,
      ownerEmail: body.ownerEmail,
      ownerName: body.ownerName,
      ownerPassword: body.ownerPassword,
    });

    // Auto-login after registration
    const loginResult = await userService.login(body.ownerEmail, body.ownerPassword);

    if (!loginResult) {
      res.status(500).json({ code: 'LOGIN_FAILED', message: 'Registration succeeded but login failed' });
      return;
    }

    res.status(201).json({
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
      user: loginResult.user,
      accessToken: loginResult.accessToken,
      refreshToken: loginResult.refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ code: 'REGISTRATION_FAILED', message: error.message });
      return;
    }
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);

    const result = await userService.login(body.email, body.password);

    if (!result) {
      res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
      return;
    }

    res.json({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors });
      return;
    }
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Login failed' });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const body = refreshSchema.parse(req.body);

    const result = await userService.refreshAccessToken(body.refreshToken);

    if (!result) {
      res.status(401).json({ code: 'INVALID_TOKEN', message: 'Invalid or expired refresh token' });
      return;
    }

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors });
      return;
    }
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Token refresh failed' });
  }
});

// Logout
router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken;
    await userService.logout(req.ctx!.userId, refreshToken);
    res.json({ success: true });
  } catch {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Logout failed' });
  }
});

// Accept invite
router.post('/accept-invite', async (req: Request, res: Response) => {
  try {
    const body = acceptInviteSchema.parse(req.body);

    const user = await organizationService.acceptInvite(body.token, body.password);

    // Auto-login after accepting invite
    const loginResult = await userService.login(user.email, body.password);

    if (!loginResult) {
      res.status(500).json({ code: 'LOGIN_FAILED', message: 'Invite accepted but login failed' });
      return;
    }

    res.json({
      user: loginResult.user,
      accessToken: loginResult.accessToken,
      refreshToken: loginResult.refreshToken,
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
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to accept invite' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.ctx!.userId);

    if (!user) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'User not found' });
      return;
    }

    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to get user' });
  }
});

export default router;

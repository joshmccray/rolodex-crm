import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { leadService } from '../services/lead.service.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Validation schemas
const createLeadSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  propertyAddress: z.string().min(1),
  propertyCity: z.string().max(100).optional(),
  propertyState: z.string().max(50).optional(),
  propertyZip: z.string().max(20).optional(),
  temperature: z.enum(['hot', 'warm', 'cold']).optional(),
  leadType: z.enum(['buying', 'selling', 'both']).optional(),
  priceRangeLow: z.number().int().positive().optional(),
  priceRangeHigh: z.number().int().positive().optional(),
  notifyNearbySales: z.boolean().optional(),
  notifyValueChanges: z.boolean().optional(),
  searchRadiusMiles: z.number().positive().max(10).optional(),
  alertFrequency: z.string().optional(),
  notes: z.string().optional(),
});

const updateLeadSchema = createLeadSchema.partial();

// Get all leads
router.get('/', async (req: Request, res: Response) => {
  try {
    const leads = await leadService.getLeads(
      req.ctx!.organizationId,
      req.ctx!.userId,
      req.ctx!.role
    );

    res.json(leads);
  } catch {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to get leads' });
  }
});

// Create lead
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = createLeadSchema.parse(req.body);

    const lead = await leadService.createLead(
      req.ctx!.organizationId,
      req.ctx!.userId,
      body
    );

    res.status(201).json(lead);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors });
      return;
    }
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to create lead' });
  }
});

// Get lead with details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await leadService.getLeadWithDetails(
      req.params.id,
      req.ctx!.organizationId
    );

    if (!result) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Lead not found' });
      return;
    }

    // Check if user has access to this lead
    if (req.ctx!.role === 'agent' && result.lead.userId !== req.ctx!.userId) {
      res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied' });
      return;
    }

    res.json(result);
  } catch {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to get lead' });
  }
});

// Update lead
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const body = updateLeadSchema.parse(req.body);

    // Check access
    const existing = await leadService.getLeadWithDetails(req.params.id, req.ctx!.organizationId);
    if (!existing) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Lead not found' });
      return;
    }

    if (req.ctx!.role === 'agent' && existing.lead.userId !== req.ctx!.userId) {
      res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied' });
      return;
    }

    const lead = await leadService.updateLead(
      req.params.id,
      req.ctx!.organizationId,
      body
    );

    res.json(lead);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors });
      return;
    }
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to update lead' });
  }
});

// Delete lead
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    // Check access
    const existing = await leadService.getLeadWithDetails(req.params.id, req.ctx!.organizationId);
    if (!existing) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Lead not found' });
      return;
    }

    if (req.ctx!.role === 'agent' && existing.lead.userId !== req.ctx!.userId) {
      res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied' });
      return;
    }

    await leadService.deleteLead(req.params.id, req.ctx!.organizationId);
    res.json({ success: true });
  } catch {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to delete lead' });
  }
});

// Refresh nearby sales for a lead
router.post('/:id/nearby-sales/refresh', async (req: Request, res: Response) => {
  try {
    // Check access
    const existing = await leadService.getLeadWithDetails(req.params.id, req.ctx!.organizationId);
    if (!existing) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Lead not found' });
      return;
    }

    if (req.ctx!.role === 'agent' && existing.lead.userId !== req.ctx!.userId) {
      res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied' });
      return;
    }

    const sales = await leadService.refreshNearbySales(
      req.params.id,
      req.ctx!.organizationId
    );

    res.json({
      newSalesCount: sales.length,
      sales,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ code: 'REFRESH_FAILED', message: error.message });
      return;
    }
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to refresh nearby sales' });
  }
});

// Refresh property value for a lead
router.post('/:id/value/refresh', async (req: Request, res: Response) => {
  try {
    // Check access
    const existing = await leadService.getLeadWithDetails(req.params.id, req.ctx!.organizationId);
    if (!existing) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Lead not found' });
      return;
    }

    if (req.ctx!.role === 'agent' && existing.lead.userId !== req.ctx!.userId) {
      res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied' });
      return;
    }

    const value = await leadService.refreshPropertyValue(
      req.params.id,
      req.ctx!.organizationId
    );

    res.json(value);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ code: 'REFRESH_FAILED', message: error.message });
      return;
    }
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to refresh property value' });
  }
});

// Get value history for a lead
router.get('/:id/value-history', async (req: Request, res: Response) => {
  try {
    const result = await leadService.getLeadWithDetails(req.params.id, req.ctx!.organizationId);

    if (!result) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Lead not found' });
      return;
    }

    if (req.ctx!.role === 'agent' && result.lead.userId !== req.ctx!.userId) {
      res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied' });
      return;
    }

    res.json(result.valueHistory);
  } catch {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to get value history' });
  }
});

// Get nearby sales for a lead
router.get('/:id/nearby-sales', async (req: Request, res: Response) => {
  try {
    const result = await leadService.getLeadWithDetails(req.params.id, req.ctx!.organizationId);

    if (!result) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Lead not found' });
      return;
    }

    if (req.ctx!.role === 'agent' && result.lead.userId !== req.ctx!.userId) {
      res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied' });
      return;
    }

    res.json(result.recentSales);
  } catch {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to get nearby sales' });
  }
});

export default router;

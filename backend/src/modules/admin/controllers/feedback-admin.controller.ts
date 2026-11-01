import type { Response } from 'express';
import { FeedbackAdminService } from '../services/feedback-admin.service.js';
import type { AdminRequest } from '../types/admin.types.js';

const emailOf = (req: AdminRequest) => req.user?.email ?? null;

export const FeedbackAdminController = {
  async create(req: AdminRequest, res: Response) {
    res.status(201).json({
      success: true,
      data: await FeedbackAdminService.create(req.body, emailOf(req)),
    });
  },

  summary(_req: AdminRequest, res: Response) {
    res.json({ success: true, data: FeedbackAdminService.summary() });
  },

  notifyStatus(req: AdminRequest, res: Response) {
    res.json({ success: true, data: FeedbackAdminService.notifyStatus(emailOf(req)) });
  },

  async setNotify(req: AdminRequest, res: Response) {
    res.json({
      success: true,
      data: await FeedbackAdminService.setNotify(emailOf(req), req.body?.subscribed),
    });
  },

  async sendTest(req: AdminRequest, res: Response) {
    res.json({ success: true, data: await FeedbackAdminService.sendTest(emailOf(req)) });
  },
};

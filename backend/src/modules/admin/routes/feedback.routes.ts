import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { FeedbackAdminController } from '../controllers/feedback-admin.controller.js';
import { optionalAuth, requireAdmin } from '../middlewares/admin-auth.middleware.js';
import { asyncHandler } from '../middlewares/async-handler.js';

export const feedbackRouter = Router();

const limit = (max: number) =>
  rateLimit({
    windowMs: 60_000,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'ส่งถี่เกินไป กรุณารอสักครู่' },
  });

// คนทั่วไปส่งความคิดเห็นได้ ส่วนการดูสรุปและตั้งค่าแจ้งเตือนต้องล็อกอิน
feedbackRouter.post('/', limit(5), optionalAuth, asyncHandler(FeedbackAdminController.create));
feedbackRouter.get('/', requireAdmin, FeedbackAdminController.summary);
feedbackRouter.get('/notify', requireAdmin, FeedbackAdminController.notifyStatus);
feedbackRouter.put('/notify', requireAdmin, asyncHandler(FeedbackAdminController.setNotify));
feedbackRouter.post('/notify/test', limit(3), requireAdmin, asyncHandler(FeedbackAdminController.sendTest));

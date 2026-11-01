import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAdmin } from '../middlewares/admin-auth.middleware.js';
import { asyncHandler } from '../middlewares/async-handler.js';

export const authRouter = Router();

const loginLimit = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'ลองล็อกอินถี่เกินไป กรุณารอสักครู่' },
});

authRouter.get('/config', AuthController.config);
authRouter.post('/login', loginLimit, asyncHandler(AuthController.login));
authRouter.get('/me', requireAdmin, AuthController.me);

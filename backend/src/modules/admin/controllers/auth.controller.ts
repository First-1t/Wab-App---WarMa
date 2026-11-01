import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import type { AdminRequest } from '../types/admin.types.js';

export const AuthController = {
  config(_req: Request, res: Response) {
    res.json({ success: true, data: AuthService.config() });
  },

  async login(req: Request, res: Response) {
    const data = await AuthService.loginWithGoogle(req.body?.credential);
    res.json({ success: true, data });
  },

  me(req: AdminRequest, res: Response) {
    res.json({ success: true, data: req.user ?? null });
  },
};

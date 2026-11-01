import type { NextFunction, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AdminError, type AdminRequest } from '../types/admin.types.js';

const bearer = (req: AdminRequest) => {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  return scheme === 'Bearer' ? (token ?? '') : '';
};

/** ต้องล็อกอินด้วยอีเมลมหาวิทยาลัย (โหมดพัฒนาผ่านได้ถ้ายังไม่ตั้ง GOOGLE_CLIENT_ID) */
export function requireAdmin(req: AdminRequest, _res: Response, next: NextFunction) {
  if (AuthService.devMode) return next();
  if (!AuthService.enabled) {
    return next(new AdminError(503, 'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่าการล็อกอิน (GOOGLE_CLIENT_ID)'));
  }
  try {
    req.user = AuthService.verifySession(bearer(req));
    next();
  } catch (e) {
    next(e);
  }
}

/** คนทั่วไปใช้ได้ ถ้าส่ง token ที่ถูกต้องมาด้วยจะรู้ว่าเป็นใคร */
export function optionalAuth(req: AdminRequest, _res: Response, next: NextFunction) {
  const token = bearer(req);
  if (AuthService.enabled && token) {
    try {
      req.user = AuthService.verifySession(token);
    } catch {
      // token เสีย/หมดอายุ = ผู้ใช้ทั่วไป
    }
  }
  next();
}

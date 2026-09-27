import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AdminUser, AuthService } from './auth/auth.service';

export type AdminRequest = Request & { user?: AdminUser };

/**
 * ป้องกัน endpoint สำหรับอาจารย์ (เพิ่ม/แก้ไข/ลบ scenario)
 * ต้องส่ง header `Authorization: Bearer <token>` ที่ได้จาก POST /auth/google
 * (ล็อกอินด้วยอีเมลมหาวิทยาลัยผ่าน Google)
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.auth.enabled) {
      // ยังไม่ตั้ง GOOGLE_CLIENT_ID (โหมดพัฒนา) — อนุญาตทั้งหมด
      return true;
    }
    const req = context.switchToHttp().getRequest<AdminRequest>();
    const [scheme, token] = (req.headers.authorization ?? '').split(' ');
    req.user = await this.auth.verifySession(
      scheme === 'Bearer' ? (token ?? '') : '',
    );
    return true;
  }
}

/**
 * สำหรับ endpoint ที่คนทั่วไปใช้ได้ (เช่น ส่งความคิดเห็น) — ไม่บังคับล็อกอิน
 * ถ้าส่ง token ที่ถูกต้องมาด้วย จะรู้ว่าเป็นใคร (req.user) ถ้าไม่มี/ไม่ถูกต้อง = ผู้ใช้ทั่วไป
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AdminRequest>();
    const [scheme, token] = (req.headers.authorization ?? '').split(' ');
    if (this.auth.enabled && scheme === 'Bearer' && token) {
      req.user = await this.auth.verifySession(token).catch(() => undefined);
    }
    return true;
  }
}

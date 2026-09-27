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

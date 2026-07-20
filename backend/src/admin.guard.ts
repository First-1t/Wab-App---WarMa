import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * ป้องกัน endpoint สำหรับอาจารย์ (เพิ่ม/แก้ไข/ลบ scenario)
 * ตรวจ header `x-admin-key` เทียบกับ env ADMIN_KEY
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) {
      // ยังไม่ตั้งรหัส (โหมดพัฒนา) — อนุญาตทั้งหมด
      return true;
    }
    const req = context.switchToHttp().getRequest<Request>();
    if (req.headers['x-admin-key'] !== adminKey) {
      throw new UnauthorizedException('รหัสผู้ดูแลไม่ถูกต้อง');
    }
    return true;
  }
}

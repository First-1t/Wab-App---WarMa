import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

/**
 * แปลง error จากฐานข้อมูลเป็น HTTP status ที่ถูกต้อง แทนที่จะตอบ 500 ทุกกรณี
 * เช่น แก้ไข/ลบ id ที่ไม่มีอยู่ → 404
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Prisma');

  catch(e: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const map: Record<string, [number, string]> = {
      P2025: [HttpStatus.NOT_FOUND, 'ไม่พบข้อมูลที่ต้องการ'],
      P2002: [HttpStatus.CONFLICT, 'ข้อมูลนี้มีอยู่แล้ว'],
    };
    const known = map[e.code];
    if (!known) this.logger.error(e.message);
    const [status, message] = known ?? [
      HttpStatus.INTERNAL_SERVER_ERROR,
      'เกิดข้อผิดพลาดกับฐานข้อมูล',
    ];
    res.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status],
    });
  }
}

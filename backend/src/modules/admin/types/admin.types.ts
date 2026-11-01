import type { Request } from 'express';

export interface AdminUser {
  email: string;
  name: string;
  picture?: string;
}

export type AdminRequest = Request & { user?: AdminUser };

export interface Feedback {
  id: string;
  rating: number; // 1–5 ดาว
  comment: string | null;
  email: string | null; // null = ผู้ใช้ทั่วไป (ไม่ได้ล็อกอิน)
  page: string | null;
  createdAt: string;
}

/** error ที่ตั้งใจส่งกลับผู้ใช้ พร้อม HTTP status */
export class AdminError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: string[],
  ) {
    super(message);
  }
}

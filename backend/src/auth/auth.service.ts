import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

export interface AdminUser {
  email: string;
  name: string;
  picture?: string;
}

/**
 * ยืนยันตัวตนอาจารย์ด้วย Google (อีเมลมหาวิทยาลัย)
 * - GOOGLE_CLIENT_ID      : OAuth Client ID จาก Google Cloud Console
 * - ALLOWED_EMAIL_DOMAIN  : โดเมนที่อนุญาต คั่นด้วย , เช่น kku.ac.th,kkumail.com
 * - AUTH_SECRET           : ใช้เซ็น session token ของระบบเอง
 * ถ้าไม่ตั้ง GOOGLE_CLIENT_ID = ปิดการตรวจสอบ (โหมดพัฒนา)
 */
@Injectable()
export class AuthService {
  private readonly clientId = process.env.GOOGLE_CLIENT_ID ?? '';
  private readonly domains = (
    process.env.ALLOWED_EMAIL_DOMAIN || 'kku.ac.th,kkumail.com'
  )
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  private readonly google = new OAuth2Client(this.clientId);

  constructor(private readonly jwt: JwtService) {}

  get enabled() {
    return Boolean(this.clientId);
  }

  config() {
    return {
      enabled: this.enabled,
      clientId: this.clientId,
      domains: this.domains,
    };
  }

  /** ตรวจ Google ID token → ออก session token ของระบบ (อายุ 8 ชม.) */
  async loginWithGoogle(credential: string) {
    if (!this.enabled) {
      throw new UnauthorizedException('ยังไม่ได้ตั้งค่า GOOGLE_CLIENT_ID');
    }
    if (!credential) {
      throw new UnauthorizedException('ไม่พบข้อมูลการล็อกอิน');
    }

    let payload: TokenPayload | undefined;
    try {
      const ticket = await this.google.verifyIdToken({
        idToken: credential,
        audience: this.clientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('ยืนยันตัวตนกับ Google ไม่สำเร็จ');
    }

    const email = payload?.email?.toLowerCase() ?? '';
    const hd = payload?.hd?.toLowerCase();
    if (
      !payload?.email_verified ||
      !hd ||
      !this.domains.includes(hd) ||
      !email.endsWith(`@${hd}`)
    ) {
      throw new UnauthorizedException(
        `ต้องใช้อีเมลมหาวิทยาลัย (${this.domains.map((d) => '@' + d).join(', ')}) เท่านั้น`,
      );
    }

    const user: AdminUser = {
      email,
      name: payload.name ?? email,
      picture: payload.picture,
    };
    const token = await this.jwt.signAsync(user);
    return { token, user };
  }

  /** ตรวจ session token จาก header Authorization */
  async verifySession(token: string): Promise<AdminUser> {
    if (!token) {
      throw new UnauthorizedException(
        'กรุณาล็อกอินด้วยอีเมลมหาวิทยาลัยก่อนใช้งาน',
      );
    }
    try {
      const { email, name, picture } =
        await this.jwt.verifyAsync<AdminUser>(token);
      if (!this.isAllowedEmail(email)) throw new Error('domain');
      return { email, name, picture };
    } catch {
      throw new UnauthorizedException('เซสชันหมดอายุ กรุณาล็อกอินใหม่');
    }
  }

  private isAllowedEmail(email: string) {
    return this.domains.some((d) => email.endsWith(`@${d}`));
  }
}

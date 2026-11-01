import { randomBytes } from 'crypto';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { AdminError, type AdminUser } from '../types/admin.types.js';

/**
 * ยืนยันตัวตนผู้ดูแลด้วย Google (อีเมลมหาวิทยาลัย)
 * - GOOGLE_CLIENT_ID     : OAuth Client ID จาก Google Cloud Console
 * - ALLOWED_EMAIL_DOMAIN : โดเมนที่อนุญาต คั่นด้วย , (ค่าเริ่มต้น kku.ac.th,kkumail.com)
 * - AUTH_SECRET          : ใช้เซ็น session token
 * ไม่ตั้ง GOOGLE_CLIENT_ID = โหมดพัฒนา (ไม่ตรวจ) — ใช้ได้เฉพาะตอน NODE_ENV ไม่ใช่ production
 *
 * อ่าน env ตอนเรียกใช้ ไม่ใช่ตอนโหลดไฟล์ เพราะ dotenv.config() ใน index.ts รันหลัง import
 */
const SESSION_TTL = '8h';
let fallbackSecret: string | undefined;

const clientId = () => process.env.GOOGLE_CLIENT_ID ?? '';
const domains = () =>
  (process.env.ALLOWED_EMAIL_DOMAIN || 'kku.ac.th,kkumail.com')
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
// ไม่ตั้ง AUTH_SECRET = สุ่มใหม่ทุกครั้งที่เปิดเซิร์ฟเวอร์ (ต้องล็อกอินใหม่)
const secret = () =>
  process.env.AUTH_SECRET ||
  (fallbackSecret ??= randomBytes(32).toString('hex'));

export const AuthService = {
  get enabled() {
    return Boolean(clientId());
  },

  /** โหมดพัฒนาเปิดได้เฉพาะนอก production — production ลืมตั้งค่าต้องปิด ไม่ใช่เปิดโล่ง */
  get devMode() {
    return !clientId() && process.env.NODE_ENV !== 'production';
  },

  config() {
    return { enabled: this.enabled, clientId: clientId(), domains: domains() };
  },

  async loginWithGoogle(credential: unknown) {
    if (!this.enabled) {
      throw new AdminError(503, 'ยังไม่ได้ตั้งค่า GOOGLE_CLIENT_ID');
    }
    if (typeof credential !== 'string' || !credential || credential.length > 5000) {
      throw new AdminError(400, 'ไม่พบข้อมูลการล็อกอิน');
    }

    let payload: TokenPayload | undefined;
    try {
      const ticket = await new OAuth2Client(clientId()).verifyIdToken({
        idToken: credential,
        audience: clientId(),
      });
      payload = ticket.getPayload();
    } catch {
      throw new AdminError(401, 'ยืนยันตัวตนกับ Google ไม่สำเร็จ');
    }

    const email = payload?.email?.toLowerCase() ?? '';
    const hd = payload?.hd?.toLowerCase();
    if (
      !payload?.email_verified ||
      !hd ||
      !domains().includes(hd) ||
      !email.endsWith(`@${hd}`)
    ) {
      const list = domains().map((d) => `@${d}`).join(', ');
      throw new AdminError(401, `ต้องใช้อีเมลมหาวิทยาลัย (${list}) เท่านั้น`);
    }

    const user: AdminUser = {
      email,
      name: payload.name ?? email,
      picture: payload.picture,
    };
    const token = jwt.sign(user, secret(), {
      algorithm: 'HS256',
      expiresIn: SESSION_TTL,
    });
    return { token, user };
  },

  verifySession(token: string): AdminUser {
    if (!token) {
      throw new AdminError(401, 'กรุณาล็อกอินด้วยอีเมลมหาวิทยาลัยก่อนใช้งาน');
    }
    try {
      const { email, name, picture } = jwt.verify(token, secret(), {
        algorithms: ['HS256'],
      }) as AdminUser;
      if (!domains().some((d) => email.endsWith(`@${d}`))) throw new Error('domain');
      return { email, name, picture };
    } catch {
      throw new AdminError(401, 'เซสชันหมดอายุ กรุณาล็อกอินใหม่');
    }
  },
};

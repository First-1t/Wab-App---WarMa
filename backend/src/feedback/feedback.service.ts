import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Feedback } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';
import { FeedbackDto } from './feedback.dto';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

/** แปลง error จาก SMTP เป็นข้อความภาษาไทยที่บอกวิธีแก้ */
function explainSmtpError(err: unknown): string {
  const { code, message } = (err ?? {}) as { code?: string; message?: string };
  if (code === 'EDNS' || code === 'ENOTFOUND')
    return 'หาเซิร์ฟเวอร์ส่งอีเมลไม่เจอ — ตรวจ SMTP_HOST ใน backend/.env (Gmail ใช้ smtp.gmail.com)';
  if (code === 'EAUTH')
    return 'ล็อกอินบัญชีส่งอีเมลไม่ผ่าน — ตรวจ SMTP_USER และ SMTP_PASS (ต้องเป็น App Password 16 ตัว)';
  if (code === 'ETIMEDOUT' || code === 'ECONNECTION' || code === 'ESOCKET')
    return 'เชื่อมต่อเซิร์ฟเวอร์ส่งอีเมลไม่ได้ — ตรวจ SMTP_HOST / SMTP_PORT หรืออินเทอร์เน็ต';
  return `ส่งอีเมลไม่สำเร็จ: ${message ?? 'ไม่ทราบสาเหตุ'}`;
}

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger('Feedback');

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async create(dto: FeedbackDto, email: string | null) {
    const feedback = await this.prisma.feedback.create({
      data: {
        rating: dto.rating,
        comment: dto.comment?.trim() || null,
        page: dto.page ?? null,
        email,
      },
    });
    // แจ้งเตือนทางอีเมลแบบไม่รอ — ส่งเมลช้า/พลาดก็ไม่ทำให้การส่งความคิดเห็นล้มเหลว
    void this.notify(feedback).catch((e: Error) =>
      this.logger.error(`ส่งเมลแจ้งเตือนไม่สำเร็จ: ${e.message}`),
    );
    return feedback;
  }

  /** ส่งเมลหาทุกคนที่เปิดรับแจ้งเตือน (ยกเว้นคนที่ส่งความคิดเห็นเอง) */
  private async notify(f: Feedback) {
    const subs = await this.prisma.notifySubscription.findMany();
    const to = subs.map((s) => s.email).filter((e) => e !== f.email);
    if (to.length === 0) return;

    const adminUrl = `${process.env.APP_URL ?? 'http://localhost:3000'}/admin`;
    const who = f.email ?? 'ผู้ใช้ (ไม่ระบุ)';
    const time = f.createdAt.toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const subject = `⭐ ความคิดเห็นใหม่ใน WarMa: ${f.rating}/5 ดาว`;
    const text = [
      'มีความคิดเห็นใหม่ใน WarMa',
      '',
      `คะแนน: ${stars(f.rating)} (${f.rating}/5)`,
      `ความคิดเห็น: ${f.comment ?? '-'}`,
      `จาก: ${who}`,
      `เวลา: ${time}`,
      '',
      `ดูทั้งหมด: ${adminUrl}`,
      '',
      '— ปิดการแจ้งเตือนได้ที่หน้าตั้งค่า แท็บ "ความคิดเห็นผู้ใช้"',
    ].join('\n');
    const comment = f.comment
      ? esc(f.comment)
      : '<i style="color:#94a3b8">ไม่ได้พิมพ์ความคิดเห็น</i>';
    const html = `
<div style="font-family:Sarabun,Tahoma,sans-serif;max-width:520px;margin:auto;color:#1e293b">
  <div style="background:#075985;color:#fff;padding:16px 20px;border-radius:12px 12px 0 0">
    <b style="font-size:18px">💧 WarMa</b> — มีความคิดเห็นใหม่
  </div>
  <div style="border:1px solid #e2e8f0;border-top:0;padding:20px;border-radius:0 0 12px 12px">
    <div style="font-size:28px;color:#f59e0b;letter-spacing:2px">${stars(f.rating)}</div>
    <div style="color:#64748b;margin-bottom:12px">${f.rating} จาก 5 ดาว</div>
    <div style="background:#f8fafc;border-left:4px solid #0369a1;padding:12px 14px;font-size:16px;white-space:pre-wrap">${comment}</div>
    <p style="color:#64748b;font-size:14px">จาก ${esc(who)} · ${esc(time)}</p>
    <a href="${esc(adminUrl)}" style="display:inline-block;background:#0369a1;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:bold">ดูความคิดเห็นทั้งหมด</a>
    <p style="color:#94a3b8;font-size:12px;margin-top:20px">คุณได้รับอีเมลนี้เพราะเปิดการแจ้งเตือนไว้ ปิดได้ที่หน้าตั้งค่า แท็บ “ความคิดเห็นผู้ใช้”</p>
  </div>
</div>`;
    await this.mail.send(to, subject, html, text);
  }

  // ---------- การตั้งค่าแจ้งเตือนของผู้ใช้ที่ล็อกอิน ----------

  private requireEmail(email: string | null): string {
    if (!email) {
      throw new BadRequestException(
        'โหมดพัฒนาไม่มีอีเมลผู้ใช้ — ต้องตั้งค่า GOOGLE_CLIENT_ID และล็อกอินก่อน',
      );
    }
    return email;
  }

  async notifyStatus(email: string | null) {
    const sub = email
      ? await this.prisma.notifySubscription.findUnique({ where: { email } })
      : null;
    return {
      mailEnabled: this.mail.enabled,
      email,
      subscribed: !!sub,
      subscribers: await this.prisma.notifySubscription.count(),
    };
  }

  async setNotify(email: string | null, subscribed: boolean) {
    const e = this.requireEmail(email);
    if (subscribed) {
      await this.prisma.notifySubscription.upsert({
        where: { email: e },
        create: { email: e },
        update: {},
      });
    } else {
      await this.prisma.notifySubscription.deleteMany({ where: { email: e } });
    }
    return this.notifyStatus(e);
  }

  async sendTest(email: string | null) {
    const e = this.requireEmail(email);
    if (!this.mail.enabled) {
      throw new BadRequestException(
        'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่าการส่งอีเมล (SMTP_HOST ใน backend/.env)',
      );
    }
    try {
      await this.mail.send(
        [e],
        'ทดสอบการแจ้งเตือนจาก WarMa',
        '<p style="font-family:Sarabun,Tahoma,sans-serif;font-size:16px">✅ ระบบแจ้งเตือนทางอีเมลของ WarMa ใช้งานได้ปกติ</p>',
        'ระบบแจ้งเตือนทางอีเมลของ WarMa ใช้งานได้ปกติ',
      );
    } catch (err) {
      throw new BadGatewayException(explainSmtpError(err));
    }
    return { sent: true, to: e };
  }

  /** สรุปคะแนน + รายการล่าสุด สำหรับหน้าตั้งค่า */
  async summary() {
    // ยิงทีละ query (ไม่ใช้ Promise.all) — ฐานข้อมูลตอนพัฒนา (prisma dev) รับได้ทีละการเชื่อมต่อ
    const items = await this.prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const agg = await this.prisma.feedback.aggregate({
      _count: true,
      _avg: { rating: true },
    });
    const groups = await this.prisma.feedback.groupBy({
      by: ['rating'],
      _count: true,
    });
    const distribution = [1, 2, 3, 4, 5].map(
      (r) => groups.find((g) => g.rating === r)?._count ?? 0,
    );
    return {
      count: agg._count,
      average: agg._avg.rating,
      distribution, // จำนวนคนที่ให้ 1..5 ดาว
      items,
    };
  }
}

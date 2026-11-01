import { randomUUID } from 'crypto';
import { AdminError, type Feedback } from '../types/admin.types.js';
import { readData, writeData } from './data-store.js';
import { MailService } from './mail.service.js';

const FEEDBACK_KEY = 'feedback';
const NOTIFY_KEY = 'notify-subscribers';

let feedbacks = await readData<Feedback[]>(FEEDBACK_KEY, []);
let subscribers = await readData<string[]>(NOTIFY_KEY, []);

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

/** แปลง error จาก SMTP เป็นข้อความภาษาไทยที่บอกวิธีแก้ */
function explainSmtpError(err: unknown): string {
  const { code, message } = (err ?? {}) as { code?: string; message?: string };
  if (code === 'EDNS' || code === 'ENOTFOUND') {
    return 'หาเซิร์ฟเวอร์ส่งอีเมลไม่เจอ — ตรวจ SMTP_HOST ใน backend/.env (Gmail ใช้ smtp.gmail.com)';
  }
  if (code === 'EAUTH') {
    return 'ล็อกอินบัญชีส่งอีเมลไม่ผ่าน — ตรวจ SMTP_USER และ SMTP_PASS (ต้องเป็น App Password 16 ตัว)';
  }
  if (code === 'ETIMEDOUT' || code === 'ECONNECTION' || code === 'ESOCKET') {
    return 'เชื่อมต่อเซิร์ฟเวอร์ส่งอีเมลไม่ได้ — ตรวจ SMTP_HOST / SMTP_PORT หรืออินเทอร์เน็ต';
  }
  return `ส่งอีเมลไม่สำเร็จ: ${message ?? 'ไม่ทราบสาเหตุ'}`;
}

/** ส่งเมลหาทุกคนที่เปิดรับแจ้งเตือน (ยกเว้นคนที่เขียนความคิดเห็นเอง) */
async function notify(f: Feedback) {
  const to = subscribers.filter((e) => e !== f.email);
  if (to.length === 0) return;

  const adminUrl = `${process.env.APP_URL ?? 'http://localhost:3000'}/admin`;
  const who = f.email ?? 'ผู้ใช้ทั่วไป';
  const time = new Date(f.createdAt).toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
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
    'ปิดการแจ้งเตือนได้ที่หน้าตั้งค่า แท็บ "ความคิดเห็นผู้ใช้"',
  ].join('\n');
  const comment = f.comment
    ? esc(f.comment)
    : '<i style="color:#6e7b6c">ไม่ได้พิมพ์ความคิดเห็น</i>';
  const html = `
<div style="font-family:'Noto Sans Thai',Tahoma,sans-serif;max-width:520px;margin:auto;color:#131b2e">
  <div style="background:#006b2c;color:#fff;padding:16px 20px;border-radius:12px 12px 0 0">
    <b style="font-size:18px">WarMa</b> — มีความคิดเห็นใหม่
  </div>
  <div style="border:1px solid #eaedff;border-top:0;padding:20px;border-radius:0 0 12px 12px">
    <div style="font-size:28px;color:#b15f00;letter-spacing:2px">${stars(f.rating)}</div>
    <div style="color:#3e4a3d;margin-bottom:12px">${f.rating} จาก 5 ดาว</div>
    <div style="background:#f2f3ff;border-left:4px solid #006b2c;padding:12px 14px;font-size:16px;white-space:pre-wrap">${comment}</div>
    <p style="color:#3e4a3d;font-size:14px">จาก ${esc(who)} · ${esc(time)}</p>
    <a href="${esc(adminUrl)}" style="display:inline-block;background:#006b2c;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:bold">ดูความคิดเห็นทั้งหมด</a>
  </div>
</div>`;
  await MailService.send(to, `ความคิดเห็นใหม่ใน WarMa: ${f.rating}/5 ดาว`, html, text);
}

export const FeedbackAdminService = {
  async create(body: unknown, email: string | null): Promise<Feedback> {
    const b = (body ?? {}) as Record<string, unknown>;
    if (!Number.isInteger(b.rating) || Number(b.rating) < 1 || Number(b.rating) > 5) {
      throw new AdminError(400, 'คะแนนต้องอยู่ระหว่าง 1–5');
    }
    if (b.comment != null && (typeof b.comment !== 'string' || b.comment.length > 1000)) {
      throw new AdminError(400, 'ความคิดเห็นยาวได้ไม่เกิน 1,000 ตัวอักษร');
    }
    const feedback: Feedback = {
      id: randomUUID(),
      rating: Number(b.rating),
      comment: typeof b.comment === 'string' ? b.comment.trim() || null : null,
      email,
      page: typeof b.page === 'string' ? b.page.slice(0, 200) : null,
      createdAt: new Date().toISOString(),
    };
    const next = [feedback, ...feedbacks];
    await writeData(FEEDBACK_KEY, next);
    feedbacks = next;
    // ไม่รอ — ส่งเมลช้า/พลาดต้องไม่ทำให้การส่งความคิดเห็นล้มเหลว
    notify(feedback).catch((e: Error) =>
      console.error(`[Feedback] ส่งเมลแจ้งเตือนไม่สำเร็จ: ${e.message}`),
    );
    return feedback;
  },

  summary() {
    const count = feedbacks.length;
    const total = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    return {
      count,
      average: count ? total / count : null,
      distribution: [1, 2, 3, 4, 5].map(
        (r) => feedbacks.filter((f) => f.rating === r).length,
      ),
      items: feedbacks.slice(0, 100),
    };
  },

  notifyStatus(email: string | null) {
    return {
      mailEnabled: MailService.enabled,
      email,
      subscribed: !!email && subscribers.includes(email),
      subscribers: subscribers.length,
    };
  },

  async setNotify(email: string | null, subscribed: unknown) {
    if (typeof subscribed !== 'boolean') {
      throw new AdminError(400, 'subscribed ต้องเป็น true หรือ false');
    }
    if (!email) throw new AdminError(400, 'โหมดพัฒนาไม่มีอีเมลผู้ใช้ — ต้องล็อกอินก่อน');
    const next = subscribers.filter((e) => e !== email);
    if (subscribed) next.push(email);
    await writeData(NOTIFY_KEY, next);
    subscribers = next;
    return this.notifyStatus(email);
  },

  async sendTest(email: string | null) {
    if (!email) throw new AdminError(400, 'โหมดพัฒนาไม่มีอีเมลผู้ใช้ — ต้องล็อกอินก่อน');
    if (!MailService.enabled) {
      throw new AdminError(400, 'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่าการส่งอีเมล (SMTP_HOST ใน backend/.env)');
    }
    try {
      await MailService.send(
        [email],
        'ทดสอบการแจ้งเตือนจาก WarMa',
        '<p>ระบบแจ้งเตือนทางอีเมลของ WarMa ใช้งานได้ปกติ</p>',
        'ระบบแจ้งเตือนทางอีเมลของ WarMa ใช้งานได้ปกติ',
      );
    } catch (err) {
      throw new AdminError(502, explainSmtpError(err));
    }
    return { sent: true, to: email };
  },
};

import { Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

/**
 * ส่งอีเมลผ่าน SMTP (เช่น Gmail + App Password)
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS : บัญชีที่ใช้ส่ง
 * - MAIL_FROM : ชื่อ/อีเมลผู้ส่ง (ไม่ตั้ง = ใช้ SMTP_USER)
 * ไม่ตั้ง SMTP_HOST = ปิดการส่งเมล (แค่พิมพ์ log แทน)
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger('Mail');
  private readonly transporter: Transporter | null = process.env.SMTP_HOST
    ? createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      })
    : null;
  private readonly from =
    process.env.MAIL_FROM ||
    `WarMa <${process.env.SMTP_USER ?? 'noreply@localhost'}>`;

  get enabled() {
    return this.transporter !== null;
  }

  /** ส่งเมล — ส่งแบบ BCC เพื่อไม่ให้ผู้รับเห็นอีเมลของกันและกัน */
  async send(to: string[], subject: string, html: string, text: string) {
    if (to.length === 0) return;
    if (!this.transporter) {
      this.logger.log(
        `(ยังไม่ตั้งค่า SMTP — ไม่ได้ส่งจริง) ถึง ${to.join(', ')}: ${subject}`,
      );
      return;
    }
    await this.transporter.sendMail({
      from: this.from,
      bcc: to,
      subject,
      html,
      text,
    });
    this.logger.log(`ส่งเมล "${subject}" ถึง ${to.length} คน`);
  }
}

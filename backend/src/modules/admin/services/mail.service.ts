import { createTransport, type Transporter } from 'nodemailer';

/**
 * ส่งอีเมลผ่าน SMTP (เช่น Gmail + App Password)
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
 * ไม่ตั้ง SMTP_HOST = ไม่ส่งจริง พิมพ์ log แทน
 */
let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  return (transporter ??= createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  }));
}

export const MailService = {
  get enabled() {
    return Boolean(process.env.SMTP_HOST);
  },

  /** ส่งแบบ BCC เพื่อไม่ให้ผู้รับเห็นอีเมลของกันและกัน */
  async send(to: string[], subject: string, html: string, text: string) {
    if (to.length === 0) return;
    if (!this.enabled) {
      console.log(`[Mail] (ยังไม่ตั้งค่า SMTP — ไม่ได้ส่งจริง) ${to.length} คน: ${subject}`);
      return;
    }
    const { MAIL_FROM, SMTP_USER } = process.env;
    await getTransporter().sendMail({
      from: MAIL_FROM || `WarMa <${SMTP_USER}>`,
      bcc: to,
      subject,
      html,
      text,
    });
  },
};

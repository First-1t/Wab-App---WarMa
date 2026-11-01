import { useEffect, useState } from 'react';
import { adminApi, type NotifyStatus } from '../services/admin-api.service';

/** สวิตช์เปิด/ปิดการแจ้งเตือนทางอีเมล เมื่อมีคนส่งความคิดเห็นใหม่ */
export function NotifySettingsCard() {
  const [status, setStatus] = useState<NotifyStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    adminApi
      .notifyStatus()
      .then(setStatus)
      .catch((e: Error) => setMsg({ text: e.message, error: true }));
  }, []);

  async function run(action: () => Promise<string>) {
    setBusy(true);
    setMsg(null);
    try {
      setMsg({ text: await action() });
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : 'ทำรายการไม่สำเร็จ', error: true });
    } finally {
      setBusy(false);
    }
  }

  const toggle = () =>
    run(async () => {
      const next = await adminApi.setNotify(!status?.subscribed);
      setStatus(next);
      return next.subscribed ? `เปิดแล้ว ส่งแจ้งเตือนไปที่ ${next.email}` : 'ปิดการแจ้งเตือนแล้ว';
    });
  const test = () =>
    run(async () => {
      const r = await adminApi.sendTestMail();
      return `ส่งอีเมลทดสอบไปที่ ${r.to} แล้ว ถ้าไม่เห็นให้ดูในโฟลเดอร์สแปม`;
    });

  const on = !!status?.subscribed;

  return (
    <section
      className="rounded-xl border border-border bg-surface p-5 shadow-xs"
      aria-labelledby="notify-title"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="notify-title" className="font-bold text-brand">
            แจ้งเตือนทางอีเมล
          </h2>
          <p id="notify-desc" className="mt-1 text-base text-on-surface-variant">
            ส่งอีเมลหาฉันทุกครั้งที่มีคนให้คะแนนหรือแสดงความคิดเห็น
            {status?.email && (
              <>
                {' '}
                ไปที่ <b className="break-all">{status.email}</b>
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-labelledby="notify-title"
          aria-describedby="notify-desc"
          disabled={!status?.email || busy}
          onClick={toggle}
          className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:ring-4 focus-visible:ring-secondary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${on ? 'bg-primary' : 'bg-text-muted'}`}
        >
          <span
            className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-6' : ''}`}
          />
        </button>
      </div>

      {status && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-on-surface-variant">
          <span>ผู้รับแจ้งเตือนทั้งหมด {status.subscribers} คน</span>
          {status.mailEnabled && status.email && (
            <button
              type="button"
              onClick={test}
              disabled={busy}
              className="cursor-pointer rounded-lg border border-border px-3 py-1.5 font-semibold text-on-surface hover:bg-surface-sunken disabled:opacity-50"
            >
              ส่งอีเมลทดสอบ
            </button>
          )}
        </div>
      )}
      {status && !status.mailEnabled && (
        <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
          เซิร์ฟเวอร์ยังไม่ได้ตั้งค่าบัญชีส่งอีเมล (SMTP) เปิดสวิตช์ไว้ได้ แต่จะยังไม่มีอีเมลส่งออก
        </p>
      )}
      {status && !status.email && (
        <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
          โหมดพัฒนา: ต้องล็อกอินด้วยอีเมลมหาวิทยาลัยก่อนจึงจะเปิดการแจ้งเตือนได้
        </p>
      )}
      <p
        role="status"
        aria-live="polite"
        className={`mt-2 text-sm font-semibold ${msg?.error ? 'text-danger' : 'text-brand'}`}
      >
        {msg?.text}
      </p>
    </section>
  );
}

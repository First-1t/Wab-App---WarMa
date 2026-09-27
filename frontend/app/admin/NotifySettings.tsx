"use client";

import { useEffect, useState } from "react";
import { api, type NotifyStatus } from "@/lib/api";

/** สวิตช์เปิด/ปิดการแจ้งเตือนทางอีเมล เมื่อมีคนส่งความคิดเห็นใหม่ */
export default function NotifySettings() {
  const [status, setStatus] = useState<NotifyStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    api
      .notifyStatus()
      .then(setStatus)
      .catch((e: Error) => setMsg({ text: e.message, error: true }));
  }, []);

  async function toggle() {
    if (!status) return;
    setBusy(true);
    setMsg(null);
    try {
      const next = await api.setNotify(!status.subscribed);
      setStatus(next);
      setMsg({
        text: next.subscribed
          ? `เปิดแล้ว — จะส่งแจ้งเตือนไปที่ ${next.email}`
          : "ปิดการแจ้งเตือนแล้ว",
      });
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "บันทึกไม่สำเร็จ", error: true });
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await api.sendTestMail();
      setMsg({ text: `ส่งอีเมลทดสอบไปที่ ${r.to} แล้ว — ถ้าไม่เห็นให้ดูในโฟลเดอร์สแปม` });
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "ส่งไม่สำเร็จ", error: true });
    } finally {
      setBusy(false);
    }
  }

  const on = !!status?.subscribed;

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm" aria-labelledby="notify-title">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="notify-title" className="font-bold text-sky-900">
            🔔 แจ้งเตือนทางอีเมล
          </h2>
          <p id="notify-desc" className="mt-1 text-base text-slate-600">
            ส่งอีเมลหาฉันทุกครั้งที่มีคนให้คะแนนหรือแสดงความคิดเห็น
            {status?.email && (
              <>
                {" "}
                ไปที่ <b className="break-all">{status.email}</b>
              </>
            )}
          </p>
        </div>
        <button
          role="switch"
          aria-checked={on}
          aria-labelledby="notify-title"
          aria-describedby="notify-desc"
          disabled={!status || busy || !status.email}
          onClick={toggle}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:outline-none disabled:opacity-50 ${on ? "bg-green-600" : "bg-slate-300"}`}
        >
          <span
            className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${on ? "translate-x-6" : ""}`}
          />
          <span className="sr-only">{on ? "เปิดอยู่" : "ปิดอยู่"}</span>
        </button>
      </div>

      {status && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
          <span>ผู้รับแจ้งเตือนทั้งหมด {status.subscribers} คน</span>
          {status.mailEnabled && status.email && (
            <button
              onClick={test}
              disabled={busy}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none disabled:opacity-50"
            >
              ✉️ ส่งอีเมลทดสอบ
            </button>
          )}
        </div>
      )}

      {status && !status.mailEnabled && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          ⚠️ เซิร์ฟเวอร์ยังไม่ได้ตั้งค่าบัญชีส่งอีเมล (SMTP) — เปิดสวิตช์ไว้ได้
          แต่จะยังไม่มีอีเมลส่งออกจนกว่าผู้ดูแลระบบจะตั้งค่าใน backend/.env
        </p>
      )}
      {status && !status.email && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          โหมดพัฒนา: ต้องล็อกอินด้วยอีเมลมหาวิทยาลัยก่อนจึงจะเปิดการแจ้งเตือนได้
        </p>
      )}

      <p
        role="status"
        aria-live="polite"
        className={`mt-2 text-sm font-semibold ${msg?.error ? "text-red-600" : "text-green-700"}`}
      >
        {msg?.text}
      </p>
    </section>
  );
}

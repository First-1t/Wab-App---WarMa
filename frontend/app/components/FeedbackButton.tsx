"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const LABELS = ["", "ต้องปรับปรุง", "พอใช้", "ดี", "ดีมาก", "ยอดเยี่ยม"];

/** ปุ่มลอยมุมขวาล่าง — เก็บคะแนน 1–5 ดาว + ความคิดเห็นจากผู้ใช้จริง */
export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function reset() {
    setRating(0);
    setComment("");
    setError("");
    setDone(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return setError("กรุณาเลือกจำนวนดาว");
    setSending(true);
    setError("");
    try {
      await api.sendFeedback({
        rating,
        comment: comment.trim() || undefined,
        page: window.location.pathname,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่งไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  }

  const shown = hover || rating;

  return (
    <>
      <button
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="fixed right-4 bottom-4 z-20 flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-amber-900/20 hover:bg-amber-600 sm:right-6 sm:bottom-6"
      >
        ⭐ ให้คะแนน
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div className="py-4 text-center">
                <div className="text-5xl">🙏</div>
                <h2 className="mt-3 text-lg font-bold text-sky-900">
                  ขอบคุณสำหรับความคิดเห็น
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  ทีมงานจะนำไปปรับปรุงระบบให้ดีขึ้น
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-5 rounded-full bg-sky-700 px-6 py-2 font-semibold text-white hover:bg-sky-800"
                >
                  ปิด
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h2 id="feedback-title" className="text-lg font-bold text-sky-900">
                  ระบบนี้ช่วยคุณได้แค่ไหน?
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  ความเห็นของคุณช่วยให้เราปรับปรุง WarMa ได้ตรงจุด
                </p>

                <div
                  className="mt-5 flex justify-center gap-1"
                  onMouseLeave={() => setHover(0)}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-label={`${n} ดาว`}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHover(n)}
                      className={`text-4xl transition-transform hover:scale-110 ${n <= shown ? "text-amber-400" : "text-slate-200"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="mt-1 h-5 text-center text-sm font-semibold text-amber-600">
                  {LABELS[shown]}
                </p>

                <label className="mt-4 block">
                  <span className="mb-1 block text-sm font-semibold">
                    ความคิดเห็นเพิ่มเติม{" "}
                    <span className="font-normal text-slate-500">(ไม่บังคับ)</span>
                  </span>
                  <textarea
                    rows={3}
                    maxLength={1000}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="เช่น ใช้งานง่าย / อยากให้เพิ่มพันธุ์อื่น"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
                  />
                </label>

                {error && (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <div className="mt-5 flex gap-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 rounded-full bg-sky-700 py-2.5 font-bold text-white hover:bg-sky-800 disabled:opacity-60"
                  >
                    {sending ? "กำลังส่ง…" : "ส่งความคิดเห็น"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-slate-100 px-5 py-2.5 font-semibold hover:bg-slate-200"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

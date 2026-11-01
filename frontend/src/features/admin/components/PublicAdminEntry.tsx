import { useEffect, useState, type FormEvent } from 'react';
import { adminApi, adminToken } from '../services/admin-api.service';

const LABELS = ['', 'ต้องปรับปรุง', 'พอใช้', 'ดี', 'ดีมาก', 'ยอดเยี่ยม'];

/**
 * ปุ่มลอยบนหน้าสาธารณะ: ให้คะแนน + ทางเข้าหน้าตั้งค่า
 * แยกเป็น component ลอยเพื่อไม่ต้องแก้ Header / App ของโมดูล Output
 */
export function PublicAdminEntry() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function start() {
    setRating(0);
    setComment('');
    setError('');
    setDone(false);
    setOpen(true);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!rating) return setError('กรุณาเลือกจำนวนดาว');
    setSending(true);
    setError('');
    try {
      await adminApi.sendFeedback({
        rating,
        comment: comment.trim() || undefined,
        page: window.location.pathname,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ส่งไม่สำเร็จ');
    } finally {
      setSending(false);
    }
  }

  const shown = hover || rating;
  const isAdmin = !!adminToken.get();

  return (
    <>
      <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-2 sm:right-6 sm:bottom-6">
        <a
          href={isAdmin ? '/admin' : '/login?next=%2Fadmin'}
          className="flex min-h-11 items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface shadow-md hover:bg-surface-container-low"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isAdmin ? 'settings' : 'admin_panel_settings'}
          </span>
          {isAdmin ? 'ตั้งค่าข้อมูล' : 'สำหรับผู้ดูแล'}
        </a>
        <button
          type="button"
          onClick={start}
          className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full bg-tertiary-container px-4 py-2 text-sm font-bold text-on-tertiary-container shadow-md hover:bg-tertiary"
        >
          <span className="material-symbols-outlined text-[18px]">star</span>
          ให้คะแนน
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-inverse-surface/40 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div className="py-4 text-center">
                <h2 id="feedback-title" className="text-lg font-bold text-primary">
                  ขอบคุณสำหรับความคิดเห็น
                </h2>
                <p className="mt-1 text-base text-on-surface-variant">ทีมงานจะนำไปปรับปรุงระบบให้ดีขึ้น</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-5 cursor-pointer rounded-full bg-primary px-6 py-2 font-semibold text-on-primary"
                >
                  ปิด
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h2 id="feedback-title" className="text-lg font-bold text-primary">
                  ระบบนี้ช่วยคุณได้แค่ไหน?
                </h2>
                <div className="mt-4 flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-label={`${n} ดาว`}
                      aria-pressed={rating === n}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHover(n)}
                      className={`cursor-pointer text-4xl transition-transform hover:scale-110 ${n <= shown ? 'text-tertiary-container' : 'text-outline-variant'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="mt-1 h-6 text-center text-sm font-semibold text-tertiary">{LABELS[shown]}</p>
                <label className="mt-3 block">
                  <span className="mb-1 block text-sm font-semibold">
                    ความคิดเห็นเพิ่มเติม{' '}
                    <span className="font-normal text-on-surface-variant">(ไม่บังคับ)</span>
                  </span>
                  <textarea
                    rows={3}
                    maxLength={1000}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-base focus:border-primary focus:outline-none"
                  />
                </label>
                {error && (
                  <p role="alert" className="mt-3 rounded-lg bg-error-container px-3 py-2 text-sm text-on-error-container">
                    {error}
                  </p>
                )}
                <div className="mt-5 flex gap-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 cursor-pointer rounded-full bg-primary py-2.5 font-bold text-on-primary disabled:opacity-60"
                  >
                    {sending ? 'กำลังส่ง…' : 'ส่งความคิดเห็น'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="cursor-pointer rounded-full bg-surface-container px-5 py-2.5 font-semibold"
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

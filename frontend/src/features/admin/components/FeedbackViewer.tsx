import { useEffect, useState } from 'react';
import { adminApi, type FeedbackSummary } from '../services/admin-api.service';

const Stars = ({ n }: { n: number }) => (
  <span role="img" aria-label={`${n} จาก 5 ดาว`}>
    <span className="text-tertiary-container">{'★'.repeat(n)}</span>
    <span className="text-outline-variant">{'★'.repeat(5 - n)}</span>
  </span>
);

/** สรุปคะแนนและรายการความคิดเห็นจากผู้ใช้ */
export function FeedbackViewer() {
  const [data, setData] = useState<FeedbackSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .feedbackSummary()
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  const max = Math.max(1, ...(data?.distribution ?? []));

  return (
    <section className="rounded-xl border border-surface-container bg-surface-container-lowest p-5 shadow-xs">
      <h2 className="mb-3 font-bold text-primary">ความคิดเห็นผู้ใช้ {data && `(${data.count})`}</h2>
      {error && (
        <p role="alert" className="rounded-lg bg-error-container px-3 py-2 text-sm text-on-error-container">
          โหลดความคิดเห็นไม่สำเร็จ: {error}
        </p>
      )}
      {!data && !error && <p className="text-sm text-on-surface-variant">กำลังโหลด…</p>}
      {data?.count === 0 && (
        <p className="py-4 text-center text-sm text-on-surface-variant">ยังไม่มีผู้ใช้ให้คะแนน</p>
      )}
      {data && data.count > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="text-center sm:px-4">
              <div className="text-4xl font-bold text-tertiary">{data.average?.toFixed(1)}</div>
              <Stars n={Math.round(data.average ?? 0)} />
              <div className="text-sm text-on-surface-variant">จาก {data.count} ความคิดเห็น</div>
            </div>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const n = data.distribution[star - 1];
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-7 text-right text-on-surface-variant">{star}★</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-container">
                      <div
                        className="h-full rounded-full bg-tertiary-container"
                        style={{ width: `${(n / max) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-on-surface-variant">{n}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <ul className="mt-4 max-h-96 divide-y divide-surface-container overflow-y-auto">
            {data.items.map((f) => (
              <li key={f.id} className="py-2.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <Stars n={f.rating} />
                  <span className="text-on-surface-variant">
                    {new Date(f.createdAt).toLocaleString('th-TH', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                {f.comment && <p className="mt-1 text-base whitespace-pre-wrap">{f.comment}</p>}
                <p className="mt-0.5 text-sm text-on-surface-variant">{f.email ?? 'ผู้ใช้ทั่วไป'}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

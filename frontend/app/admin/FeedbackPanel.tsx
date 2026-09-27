"use client";

import { useEffect, useState } from "react";
import { api, type FeedbackSummary } from "@/lib/api";

/** สรุปคะแนน/ความคิดเห็นจากผู้ใช้ — แสดงในหน้าตั้งค่า */
export default function FeedbackPanel() {
  const [data, setData] = useState<FeedbackSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .feedbackSummary()
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  const max = Math.max(1, ...(data?.distribution ?? []));

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-3 font-bold text-sky-900">
        ⭐ ความคิดเห็นผู้ใช้ {data && `(${data.count})`}
      </h2>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          โหลดความคิดเห็นไม่สำเร็จ: {error}
        </p>
      )}
      {!data && !error && <p className="text-sm text-slate-400">กำลังโหลด…</p>}

      {data && data.count === 0 && (
        <p className="py-4 text-center text-sm text-slate-400">
          ยังไม่มีผู้ใช้ให้คะแนน
        </p>
      )}

      {data && data.count > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="text-center sm:px-4">
              <div className="text-4xl font-bold text-amber-500">
                {data.average?.toFixed(1)}
              </div>
              <div className="text-amber-400">
                {"★".repeat(Math.round(data.average ?? 0))}
                <span className="text-slate-200">
                  {"★".repeat(5 - Math.round(data.average ?? 0))}
                </span>
              </div>
              <div className="text-xs text-slate-500">จาก {data.count} คน</div>
            </div>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const n = data.distribution[star - 1];
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-6 text-right text-slate-500">{star}★</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${(n / max) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-slate-500">{n}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <ul className="mt-4 max-h-80 divide-y divide-slate-100 overflow-y-auto">
            {data.items.map((f) => (
              <li key={f.id} className="py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-amber-500">
                    {"★".repeat(f.rating)}
                    <span className="text-slate-200">{"★".repeat(5 - f.rating)}</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(f.createdAt).toLocaleString("th-TH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                {f.comment && <p className="mt-1 text-sm">{f.comment}</p>}
                <p className="mt-0.5 text-xs text-slate-400">
                  {f.email ?? "ไม่ระบุ"}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

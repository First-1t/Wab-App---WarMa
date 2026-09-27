"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import { rainBadgeClass } from "@/lib/format";
import type { RainfallResult } from "@/lib/types";

// แผนที่ใช้ Leaflet (window เท่านั้น) → โหลดแบบ client-only ปิด SSR
const RainMap = dynamic(() => import("./RainMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-400 sm:h-[420px]">
      กำลังโหลดแผนที่...
    </div>
  ),
});

const legend = [
  { c: "bg-sky-200", t: "< 10" },
  { c: "bg-sky-600", t: "10–20" },
  { c: "bg-green-600", t: "20–35" },
  { c: "bg-yellow-400", t: "35–50" },
  { c: "bg-orange-500", t: "50–90" },
  { c: "bg-red-600", t: "≥ 90" },
];

export default function RainfallPanel() {
  const [data, setData] = useState<RainfallResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .rainfall()
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="font-bold text-sky-900">
          ☁️ ปริมาณฝน 24 ชม. ย้อนหลัง (มม.)
        </h2>
        {data?.updatedAt && (
          <span className="text-xs text-slate-500">
            ล่าสุด: {data.updatedAt}
          </span>
        )}
      </div>
      <p className="mb-2 text-xs text-slate-400">
        ข้อมูลจาก ThaiWater (คลังข้อมูลน้ำแห่งชาติ / สสน.)
      </p>

      {error ? (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          โหลดข้อมูลฝนไม่ได้: {error}
        </p>
      ) : (
        <>
          <RainMap stations={data?.stations ?? []} />

          {/* legend สีตามปริมาณฝน */}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
            {legend.map((l) => (
              <span key={l.t} className="flex items-center gap-1">
                <span className={`inline-block h-3 w-3 rounded-full ${l.c}`} />
                {l.t}
              </span>
            ))}
          </div>

          {/* ตารางสถานีฝนหนัก */}
          <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-slate-100">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-sky-50 text-sky-900">
                <tr className="text-left">
                  <th className="p-2">ที่ตั้ง</th>
                  <th className="p-2 whitespace-nowrap">เวลา</th>
                  <th className="p-2 text-right">มม.</th>
                </tr>
              </thead>
              <tbody>
                {(data?.stations ?? []).slice(0, 60).map((s) => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="p-2">
                      สถานี{s.name}
                      <span className="block text-xs text-slate-500">
                        อ.{s.amphoe} จ.{s.province}
                      </span>
                    </td>
                    <td className="p-2 whitespace-nowrap text-slate-600">
                      {s.datetime.slice(11, 16)}
                    </td>
                    <td className="p-2 text-right">
                      <span
                        className={`inline-block min-w-12 rounded px-2 py-0.5 text-center font-bold ${rainBadgeClass(s.rain24h)}`}
                      >
                        {s.rain24h.toLocaleString("th-TH")}
                      </span>
                    </td>
                  </tr>
                ))}
                {!data && !error && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-400">
                      กำลังโหลดข้อมูลสถานี...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

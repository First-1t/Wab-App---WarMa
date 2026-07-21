"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { colorsFor, fmt } from "@/lib/format";
import type { MatchResult } from "@/lib/types";
import RainfallPanel from "./components/RainfallPanel";

export default function HomePage() {
  const [crops, setCrops] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [crop, setCrop] = useState("");
  const [season, setSeason] = useState("");
  const [water, setWater] = useState("");
  const [area, setArea] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .options()
      .then(({ crops, seasons }) => {
        setCrops(crops);
        setSeasons(seasons);
        setCrop((c) => c || crops[0] || "");
        setSeason((s) => s || seasons[0] || "");
      })
      .catch(() =>
        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบว่า backend ทำงานอยู่"),
      );
    api.aiStatus().then(({ enabled }) => setAiEnabled(enabled)).catch(() => {});
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAiText("");
    setLoading(true);
    try {
      const res = await api.match({
        crop,
        season,
        water: parseFloat(water),
        area: parseFloat(area),
      });
      setResult(res);
      setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function onExplain() {
    if (!result) return;
    setAiLoading(true);
    try {
      const { explanation } = await api.aiExplain(result.input, result.matched);
      setAiText(explanation);
    } catch (err) {
      setAiText(
        err instanceof Error ? `ขออภัย: ${err.message}` : "เกิดข้อผิดพลาด",
      );
    } finally {
      setAiLoading(false);
    }
  }

  const maxTotal = result
    ? Math.max(...result.candidates.map((s) => s.waterPerRai * result.input.area))
    : 0;

  return (
    <>
      <header className="sticky top-0 z-10 bg-gradient-to-r from-sky-900 to-sky-700 text-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold sm:text-xl">💧 WarMa</h1>
            <p className="text-xs opacity-85">
              ระบบแนะนำการจัดการทรัพยากรน้ำเพื่อการเกษตร
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-white/50 px-3 py-1 text-xs whitespace-nowrap hover:bg-white/10"
          >
            ⚙️ สำหรับอาจารย์
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-4 py-4 lg:grid-cols-2">
        {/* ซ้าย: แผนที่ฝน ThaiWater (บนมือถือแสดงล่างระบบแนะนำ) */}
        <div className="order-2 lg:order-1">
          <RainfallPanel />
        </div>

        {/* ขวา: ระบบแนะนำการจัดการน้ำของเรา */}
        <div className="order-1 space-y-4 lg:order-2">
        {/* ฟอร์มปัจจัยนำเข้า */}
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-bold text-sky-900">
            📋 กรอกข้อมูลปัจจัยนำเข้า
          </h2>
          <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">ชนิดพืช</span>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus:border-sky-600 focus:outline-none"
              >
                {crops.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">
                ช่วงฤดูกาล
              </span>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus:border-sky-600 focus:outline-none"
              >
                {seasons.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">
                ปริมาณน้ำต้นทุน{" "}
                <span className="font-normal text-slate-500">(ลบ.ม.)</span>
              </span>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="เช่น 12000"
                value={water}
                onChange={(e) => setWater(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-sky-600 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">
                ขนาดพื้นที่เพาะปลูก{" "}
                <span className="font-normal text-slate-500">(ไร่)</span>
              </span>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                placeholder="เช่น 10"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-sky-600 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-sky-700 px-5 py-3 font-bold text-white hover:bg-sky-800 disabled:opacity-50 sm:col-span-2 sm:justify-self-start"
            >
              {loading ? "กำลังวิเคราะห์..." : "🔍 วิเคราะห์และรับคำแนะนำ"}
            </button>
          </form>
          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </section>

        {/* ผลลัพธ์ */}
        {result && (
          <div ref={resultRef} className="space-y-4">
            <section
              className={`rounded-xl border-l-8 p-5 ${colorsFor(result.matched.level).bg} ${colorsFor(result.matched.level).border}`}
            >
              <h3 className="text-lg font-bold">
                {result.matched.name}{" "}
                <span
                  className={`ml-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${colorsFor(result.matched.level).badge}`}
                >
                  น้ำ{result.matched.level}
                </span>
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                พื้นที่ {fmt(result.input.area)} ไร่ · น้ำต้นทุน{" "}
                {fmt(result.input.water)} ลบ.ม. (คิดเป็น{" "}
                {fmt(result.input.waterPerRai)} ลบ.ม./ไร่)
              </p>
            </section>

            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                [fmt(result.totalAllocation), "น้ำที่ควรจัดสรร (ลบ.ม.)"],
                [fmt(result.matched.waterPerRai), "น้ำต่อไร่ (ลบ.ม./ไร่)"],
                [result.matched.expectedYield, "ผลผลิตคาดการณ์"],
                [result.matched.risk, "ระดับความเสี่ยง"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-xl bg-sky-50 p-3 text-center"
                >
                  <div className="text-lg font-bold text-sky-900">{value}</div>
                  <div className="text-xs text-slate-500">{label}</div>
                </div>
              ))}
            </section>

            <section className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="mb-2 font-bold text-sky-900">
                ✅ คำแนะนำการจัดการน้ำ
              </h2>
              <ul className="divide-y divide-dashed divide-slate-200">
                {result.matched.advice.map((a) => (
                  <li key={a} className="flex gap-2 py-2 text-sm">
                    <span>💧</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
              {aiEnabled && (
                <div className="mt-3">
                  <button
                    onClick={onExplain}
                    disabled={aiLoading}
                    className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                  >
                    {aiLoading
                      ? "AI กำลังเรียบเรียง..."
                      : "✨ ให้ AI อธิบายแบบง่าย"}
                  </button>
                  {aiText && (
                    <p className="mt-3 whitespace-pre-wrap rounded-lg bg-violet-50 p-4 text-sm leading-relaxed">
                      {aiText}
                    </p>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="mb-2 font-bold text-sky-900">🗓️ ตารางการให้น้ำ</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-sky-50 text-left text-sky-900">
                      <th className="p-2">ระยะการเจริญเติบโต</th>
                      <th className="p-2">ความถี่การให้น้ำ</th>
                      <th className="p-2 text-right">น้ำ/ไร่</th>
                      <th className="p-2 text-right">รวมทั้งแปลง</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.matched.schedule.map((row) => (
                      <tr key={row.phase} className="border-b border-slate-100">
                        <td className="p-2">{row.phase}</td>
                        <td className="p-2">{row.freq}</td>
                        <td className="p-2 text-right">{fmt(row.amount)}</td>
                        <td className="p-2 text-right">
                          {fmt(row.amount * result.input.area)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="mb-1 font-bold text-sky-900">
                📊 เปรียบเทียบ scenario
              </h2>
              <p className="mb-3 text-xs text-slate-500">
                แถบสีแสดงปริมาณน้ำจัดสรรรวมสำหรับพื้นที่ของท่าน — กรอบน้ำเงินคือ
                scenario ที่ระบบเลือก
              </p>
              <div className="space-y-2">
                {result.candidates.map((s) => {
                  const total = s.waterPerRai * result.input.area;
                  const pct = Math.max((total / maxTotal) * 100, 10);
                  const selected = s.id === result.matched.id;
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      <div className="w-1/3 text-right text-xs text-slate-500">
                        {s.name}
                      </div>
                      <div className="h-6 flex-1 overflow-hidden rounded-md bg-slate-100">
                        <div
                          className={`flex h-full items-center justify-end rounded-md pr-2 text-xs font-bold text-white ${colorsFor(s.level).bar} ${selected ? "ring-3 ring-inset ring-sky-900" : ""}`}
                          style={{ width: `${pct}%` }}
                        >
                          {fmt(total)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-sky-50 text-left text-sky-900">
                      <th className="p-2">Scenario</th>
                      <th className="p-2">สถานะน้ำ</th>
                      <th className="p-2 text-right">น้ำ/ไร่</th>
                      <th className="p-2">ผลผลิตคาด</th>
                      <th className="p-2">ความเสี่ยง</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.candidates.map((s) => (
                      <tr
                        key={s.id}
                        className={`border-b border-slate-100 ${s.id === result.matched.id ? "bg-green-50 font-semibold" : ""}`}
                      >
                        <td className="p-2">
                          {s.name}
                          {s.id === result.matched.id ? " ⭐" : ""}
                        </td>
                        <td className="p-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs text-white ${colorsFor(s.level).badge}`}
                          >
                            {s.level}
                          </span>
                        </td>
                        <td className="p-2 text-right">{fmt(s.waterPerRai)}</td>
                        <td className="p-2">{s.expectedYield}</td>
                        <td className="p-2">{s.risk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {!result && !error && (
          <p className="py-8 text-center text-sm text-slate-400">
            กรอกข้อมูลด้านบนแล้วกด &quot;วิเคราะห์&quot; เพื่อรับคำแนะนำ
          </p>
        )}
        </div>
      </main>

      <footer className="px-4 pb-6 pt-2 text-center text-xs text-slate-400">
        โปรเจกต์คณะเกษตรศาสตร์ — Water Resources Management Advisor
      </footer>
    </>
  );
}

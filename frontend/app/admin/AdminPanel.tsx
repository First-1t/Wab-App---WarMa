"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { colorsFor, fmt } from "@/lib/format";
import type { Scenario, ScenarioInput, SchedulePhase } from "@/lib/types";

const emptyForm: ScenarioInput = {
  name: "",
  crop: "",
  season: "",
  level: "เพียงพอ",
  waterPerRai: 0,
  minRatio: 0,
  maxRatio: 99,
  expectedYield: "",
  risk: "ต่ำ",
  advice: [],
  schedule: [],
};

export default function AdminPage() {
  const [list, setList] = useState<Scenario[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ScenarioInput | null>(null);
  const [adviceText, setAdviceText] = useState("");
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [adminKey, setAdminKey] = useState("");

  const load = useCallback(() => {
    api
      .listScenarios()
      .then(setList)
      .catch((e: Error) =>
        setMsg({ text: `โหลดข้อมูลไม่สำเร็จ: ${e.message}`, error: true }),
      );
  }, []);

  useEffect(() => {
    setAdminKey(localStorage.getItem("warma_admin_key") ?? "");
    load();
  }, [load]);

  function flash(text: string, error = false) {
    setMsg({ text, error });
    setTimeout(() => setMsg(null), 3500);
  }

  function openEditor(s?: Scenario) {
    if (s) {
      const { id: _id, ...rest } = s;
      setEditingId(s.id);
      setForm(rest);
      setAdviceText(s.advice.join("\n"));
    } else {
      setEditingId(null);
      setForm({ ...emptyForm, schedule: [{ phase: "", freq: "", amount: 0 }] });
      setAdviceText("");
    }
  }

  function setPhase(i: number, patch: Partial<SchedulePhase>) {
    if (!form) return;
    const schedule = form.schedule.map((p, j) =>
      j === i ? { ...p, ...patch } : p,
    );
    setForm({ ...form, schedule });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const data: ScenarioInput = {
      ...form,
      waterPerRai: Number(form.waterPerRai),
      minRatio: Number(form.minRatio),
      maxRatio: Number(form.maxRatio),
      advice: adviceText.split("\n").map((a) => a.trim()).filter(Boolean),
      schedule: form.schedule
        .filter((p) => p.phase.trim())
        .map((p) => ({ ...p, amount: Number(p.amount) })),
    };
    try {
      if (editingId) {
        await api.updateScenario(editingId, data);
        flash("แก้ไข scenario เรียบร้อย");
      } else {
        await api.createScenario(data);
        flash("เพิ่ม scenario ใหม่เรียบร้อย");
      }
      setForm(null);
      setEditingId(null);
      load();
    } catch (err) {
      flash(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ", true);
    }
  }

  async function remove(s: Scenario) {
    if (!confirm(`ลบ scenario "${s.name}" ?`)) return;
    try {
      await api.deleteScenario(s.id);
      flash("ลบ scenario เรียบร้อย");
      load();
    } catch (err) {
      flash(err instanceof Error ? err.message : "ลบไม่สำเร็จ", true);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-10 bg-gradient-to-r from-sky-900 to-sky-700 text-white shadow">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold sm:text-xl">⚙️ WarMa Admin</h1>
            <p className="text-xs opacity-85">จัดการข้อมูล scenario สำหรับอาจารย์</p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/50 px-3 py-1 text-xs whitespace-nowrap hover:bg-white/10"
          >
            💧 หน้าผู้ใช้
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-4">
        {msg && (
          <p
            className={`rounded-lg px-4 py-2 text-sm ${msg.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
          >
            {msg.text}
          </p>
        )}

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-2 font-bold text-sky-900">🔑 รหัสผู้ดูแล</h2>
          <input
            type="password"
            value={adminKey}
            placeholder="ใส่รหัสที่อาจารย์ได้รับ (ถ้าเซิร์ฟเวอร์ตั้งไว้)"
            onChange={(e) => {
              setAdminKey(e.target.value);
              localStorage.setItem("warma_admin_key", e.target.value);
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-sky-600 focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-500">
            ใช้ยืนยันตัวตนเมื่อเพิ่ม/แก้ไข/ลบข้อมูล — เก็บไว้ในเครื่องนี้เท่านั้น
          </p>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-sky-900">
              📚 รายการ scenario ({list.length})
            </h2>
            <button
              onClick={() => openEditor()}
              className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-bold text-white hover:bg-sky-800"
            >
              ➕ เพิ่มใหม่
            </button>
          </div>
          <ul className="divide-y divide-slate-100">
            {list.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-2 py-2.5"
              >
                <div>
                  <div className="text-sm font-semibold">
                    {s.name}{" "}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs text-white ${colorsFor(s.level).badge}`}
                    >
                      {s.level}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {s.crop} · {s.season} · {fmt(s.waterPerRai)} ลบ.ม./ไร่ ·
                    ratio {s.minRatio}–{s.maxRatio >= 99 ? "∞" : s.maxRatio}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => openEditor(s)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200"
                  >
                    ✏️ แก้ไข
                  </button>
                  <button
                    onClick={() => remove(s)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
            {list.length === 0 && (
              <li className="py-6 text-center text-sm text-slate-400">
                ยังไม่มีข้อมูล scenario
              </li>
            )}
          </ul>
        </section>

        {form && (
          <section className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold text-sky-900">
              {editingId ? `✏️ แก้ไข: ${form.name}` : "➕ เพิ่ม scenario"}
            </h2>
            <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-semibold">
                  ชื่อ scenario
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-600 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">ชนิดพืช</span>
                <input
                  required
                  value={form.crop}
                  onChange={(e) => setForm({ ...form, crop: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-600 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">ฤดูกาล</span>
                <input
                  required
                  value={form.season}
                  onChange={(e) => setForm({ ...form, season: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-600 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">สถานะน้ำ</span>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-sky-600 focus:outline-none"
                >
                  <option>เพียงพอ</option>
                  <option>จำกัด</option>
                  <option>ขาดแคลน</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">
                  น้ำจัดสรรต่อไร่ (ลบ.ม./ไร่)
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={form.waterPerRai}
                  onChange={(e) =>
                    setForm({ ...form, waterPerRai: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-600 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">
                  ratio ต่ำสุด{" "}
                  <span className="font-normal text-slate-500">
                    (น้ำที่มี ÷ น้ำที่พืชต้องการ)
                  </span>
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.05"
                  required
                  value={form.minRatio}
                  onChange={(e) =>
                    setForm({ ...form, minRatio: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-600 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">
                  ratio สูงสุด{" "}
                  <span className="font-normal text-slate-500">
                    (99 = ไม่จำกัด)
                  </span>
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.05"
                  required
                  value={form.maxRatio}
                  onChange={(e) =>
                    setForm({ ...form, maxRatio: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-600 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">
                  ผลผลิตคาดการณ์
                </span>
                <input
                  value={form.expectedYield}
                  placeholder="เช่น 650–750 กก./ไร่"
                  onChange={(e) =>
                    setForm({ ...form, expectedYield: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-600 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">
                  ระดับความเสี่ยง
                </span>
                <select
                  value={form.risk}
                  onChange={(e) => setForm({ ...form, risk: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-sky-600 focus:outline-none"
                >
                  <option>ต่ำ</option>
                  <option>ปานกลาง</option>
                  <option>สูง</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-semibold">
                  คำแนะนำ{" "}
                  <span className="font-normal text-slate-500">
                    (1 บรรทัด = 1 ข้อ)
                  </span>
                </span>
                <textarea
                  rows={4}
                  value={adviceText}
                  onChange={(e) => setAdviceText(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-600 focus:outline-none"
                />
              </label>

              <div className="sm:col-span-2">
                <span className="mb-1 block text-sm font-semibold">
                  ตารางการให้น้ำ
                </span>
                <div className="space-y-2">
                  {form.schedule.map((p, i) => (
                    <div
                      key={i}
                      className="grid gap-2 rounded-lg border border-dashed border-slate-300 p-3 sm:grid-cols-[2fr_2fr_1fr_auto]"
                    >
                      <input
                        placeholder="ระยะ เช่น แตกกอ (วันที่ 16–45)"
                        value={p.phase}
                        onChange={(e) => setPhase(i, { phase: e.target.value })}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
                      />
                      <input
                        placeholder="ความถี่ เช่น ทุก 5–7 วัน"
                        value={p.freq}
                        onChange={(e) => setPhase(i, { freq: e.target.value })}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
                      />
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="ลบ.ม./ไร่"
                        value={p.amount}
                        onChange={(e) =>
                          setPhase(i, { amount: Number(e.target.value) })
                        }
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            schedule: form.schedule.filter((_, j) => j !== i),
                          })
                        }
                        className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        ลบ
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      schedule: [
                        ...form.schedule,
                        { phase: "", freq: "", amount: 0 },
                      ],
                    })
                  }
                  className="mt-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200"
                >
                  ＋ เพิ่มระยะ
                </button>
              </div>

              <div className="flex gap-2 sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-sky-700 px-5 py-2.5 font-bold text-white hover:bg-sky-800"
                >
                  💾 บันทึก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm(null);
                    setEditingId(null);
                  }}
                  className="rounded-lg bg-slate-100 px-5 py-2.5 font-semibold hover:bg-slate-200"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      <footer className="px-4 pb-6 pt-2 text-center text-xs text-slate-400">
        WarMa Admin Panel — แก้ไขข้อมูล scenario ได้โดยไม่ต้องแก้โค้ด
      </footer>
    </>
  );
}

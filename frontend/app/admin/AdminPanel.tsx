"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { colorsFor, fmt } from "@/lib/format";
import type { Scenario, ScenarioInput } from "@/lib/types";
import { useSession } from "../components/RequireAuth";
import UserMenu from "../components/UserMenu";
import FeedbackPanel from "./FeedbackPanel";
import ScenarioEditor, { emptyScenario, LEVELS, ratioText } from "./ScenarioEditor";

const SEASON_ORDER = ["ฤดูหนาว", "ฤดูร้อน", "ฤดูฝน"];
const rank = (order: readonly string[], v: string) => {
  const i = order.indexOf(v);
  return i === -1 ? order.length : i;
};

const RISK_TEXT: Record<string, string> = {
  ต่ำ: "text-green-700",
  ปานกลาง: "text-amber-700",
  สูง: "text-red-700",
};

type Editing = { mode: "create" | "edit" | "copy"; id?: string; data: ScenarioInput };

/** เอาเฉพาะ field ที่แก้ไขได้ (ตัด id / createdAt / updatedAt ออก) */
function toInput(s: Scenario): ScenarioInput {
  const { name, crop, season, level, waterPerRai, minRatio, maxRatio, expectedYield, risk, advice, schedule } = s;
  return { name, crop, season, level, waterPerRai, minRatio, maxRatio, expectedYield, risk, advice, schedule };
}

/** กล่องยืนยันการลบ — ใช้ <dialog> ของเบราว์เซอร์ (คีย์บอร์ด/โปรแกรมอ่านหน้าจอใช้ได้) */
function ConfirmDelete({
  scenario,
  onConfirm,
  onClose,
}: {
  scenario: Scenario;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (ref.current && !ref.current.open) ref.current.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="del-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 backdrop:bg-slate-900/50"
    >
      <div className="p-6">
        <h2 id="del-title" className="text-lg font-bold text-red-700">
          ลบข้อมูลชุดนี้?
        </h2>
        <p className="mt-2 text-base text-slate-700">
          “{scenario.name}” จะถูกลบถาวร เกษตรกรจะไม่ได้รับคำแนะนำจากข้อมูลชุดนี้อีก
        </p>
        <div className="mt-6 flex gap-2">
          <button
            autoFocus
            onClick={() => ref.current?.close()}
            className="flex-1 rounded-lg bg-slate-100 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
          >
            ไม่ลบ
          </button>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onConfirm();
              ref.current?.close();
            }}
            className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:outline-none disabled:opacity-60"
          >
            {busy ? "กำลังลบ…" : "ลบถาวร"}
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default function AdminPanel() {
  const { user, logout } = useSession();
  const [list, setList] = useState<Scenario[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState<"data" | "feedback">("data");
  const [crop, setCrop] = useState("ทั้งหมด");
  const [season, setSeason] = useState("ทั้งหมด");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Editing | null>(null);
  const [deleting, setDeleting] = useState<Scenario | null>(null);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);
  // AdminPanel แสดงหลัง RequireAuth ตรวจ session แล้วเท่านั้น (ฝั่ง client) จึงอ่าน localStorage ได้ตรงนี้
  const [showHelp, setShowHelp] = useState(() => {
    try {
      return localStorage.getItem("warma_admin_help") !== "hidden";
    } catch {
      return true;
    }
  });

  const load = useCallback(() => {
    api
      .listScenarios()
      .then((l) => {
        setList(l);
        setLoadError("");
      })
      .catch((e: Error) => setLoadError(e.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function flash(text: string, error = false) {
    setToast({ text, error });
    setTimeout(() => setToast(null), 4000);
  }

  function hideHelp() {
    setShowHelp(false);
    try {
      localStorage.setItem("warma_admin_help", "hidden");
    } catch {}
  }

  const crops = useMemo(
    () => [...new Set((list ?? []).map((s) => s.crop))].sort((a, b) => a.localeCompare(b, "th")),
    [list],
  );
  const seasons = useMemo(
    () =>
      [...new Set((list ?? []).map((s) => s.season))].sort(
        (a, b) => rank(SEASON_ORDER, a) - rank(SEASON_ORDER, b),
      ),
    [list],
  );

  // กรอง แล้วจัดกลุ่ม พันธุ์ → ฤดู → สถานะน้ำ
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = (list ?? []).filter(
      (s) =>
        (crop === "ทั้งหมด" || s.crop === crop) &&
        (season === "ทั้งหมด" || s.season === season) &&
        (!q || `${s.name} ${s.crop} ${s.season} ${s.level}`.toLowerCase().includes(q)),
    );
    const byCrop = new Map<string, Map<string, Scenario[]>>();
    for (const s of filtered) {
      if (!byCrop.has(s.crop)) byCrop.set(s.crop, new Map());
      const bySeason = byCrop.get(s.crop)!;
      if (!bySeason.has(s.season)) bySeason.set(s.season, []);
      bySeason.get(s.season)!.push(s);
    }
    return [...byCrop.entries()]
      .sort(([a], [b]) => a.localeCompare(b, "th"))
      .map(([c, m]) => ({
        crop: c,
        seasons: [...m.entries()]
          .sort(([a], [b]) => rank(SEASON_ORDER, a) - rank(SEASON_ORDER, b))
          .map(([s, items]) => ({
            season: s,
            items: items.sort((a, b) => rank(LEVELS, a.level) - rank(LEVELS, b.level)),
          })),
      }));
  }, [list, crop, season, query]);

  const shownCount = groups.reduce(
    (n, g) => n + g.seasons.reduce((m, s) => m + s.items.length, 0),
    0,
  );

  function handleAuthError(err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      logout();
      return true;
    }
    return false;
  }

  async function save(data: ScenarioInput) {
    if (!editing) return;
    try {
      if (editing.mode === "edit" && editing.id) {
        await api.updateScenario(editing.id, data);
        flash(`บันทึก “${data.name}” เรียบร้อย`);
      } else {
        await api.createScenario(data);
        flash(`เพิ่ม “${data.name}” เรียบร้อย`);
      }
      setEditing(null);
      load();
    } catch (err) {
      if (!handleAuthError(err)) throw err; // ให้หน้าต่างแก้ไขแสดง error
    }
  }

  async function remove(s: Scenario) {
    try {
      await api.deleteScenario(s.id);
      flash(`ลบ “${s.name}” แล้ว`);
      load();
    } catch (err) {
      if (!handleAuthError(err)) flash(err instanceof Error ? err.message : "ลบไม่สำเร็จ", true);
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify((list ?? []).map(toInput), null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `warma-scenarios-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const chip = (active: boolean) =>
    `rounded-full border-2 px-4 py-2 text-sm font-semibold whitespace-nowrap focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none ${
      active
        ? "border-sky-700 bg-sky-700 text-white"
        : "border-slate-300 bg-white text-slate-700 hover:border-sky-500"
    }`;

  return (
    <>
      <header className="sticky top-0 z-10 bg-gradient-to-r from-sky-900 to-sky-700 text-white shadow">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3">
          <div className="min-w-0">
            <h1 className="text-lg font-bold sm:text-xl">⚙️ ตั้งค่าข้อมูล</h1>
            <p className="truncate text-sm opacity-90">แก้ไขคำแนะนำการให้น้ำที่เกษตรกรเห็น</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-full border border-white/50 px-3 py-1.5 text-sm whitespace-nowrap hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              ← หน้าหลัก
            </Link>
            <UserMenu showSettings={false} />
          </div>
        </div>

        {/* แท็บ */}
        <div className="mx-auto flex max-w-4xl gap-1 px-4" role="tablist" aria-label="ส่วนของหน้าตั้งค่า">
          {(
            [
              ["data", "📚 ข้อมูลคำแนะนำ"],
              ["feedback", "⭐ ความคิดเห็นผู้ใช้"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              id={`tab-${key}`}
              aria-selected={tab === key}
              aria-controls={`panel-${key}`}
              onClick={() => setTab(key)}
              className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none ${
                tab === key ? "bg-slate-50 text-sky-900" : "text-white/85 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-4 px-4 py-5">
        {!user && (
          <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            ⚠️ โหมดพัฒนา — เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า GOOGLE_CLIENT_ID จึงไม่ต้องล็อกอิน
            (ห้ามใช้แบบนี้ตอน deploy จริง)
          </p>
        )}

        {tab === "feedback" && (
          <div role="tabpanel" id="panel-feedback" aria-labelledby="tab-feedback">
            <FeedbackPanel />
          </div>
        )}

        {tab === "data" && (
          <div role="tabpanel" id="panel-data" aria-labelledby="tab-data" className="space-y-4">
            {/* วิธีใช้ */}
            {showHelp ? (
              <section className="rounded-xl border border-sky-200 bg-sky-50 p-5 text-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-bold text-sky-900">ระบบเลือกคำแนะนำอย่างไร?</h2>
                  <button
                    onClick={hideHelp}
                    className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-sky-800 hover:bg-sky-100 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                  >
                    ซ่อนคำอธิบาย
                  </button>
                </div>
                <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-base">
                  <li>เกษตรกรเลือก <b>พันธุ์</b> และ <b>ฤดู</b> แล้วกรอกน้ำที่มีกับขนาดแปลง</li>
                  <li>
                    ระบบคิดว่าน้ำที่มีคิดเป็นกี่ % ของน้ำที่พันธุ์นั้นต้องการ
                    <span className="text-slate-500"> (น้ำที่ต้องการ = ค่าในชุด “น้ำเพียงพอ”)</span>
                  </li>
                  <li>
                    แล้วเลือก <b>ข้อมูลชุดที่ช่วง % ตรงกัน</b> มาแสดง เช่น ชุด “จำกัด” ใช้เมื่อมีน้ำ 70–100%
                  </li>
                </ol>
                <p className="mt-3 text-sm text-slate-600">
                  แต่ละพันธุ์ในแต่ละฤดู ควรมีข้อมูลครอบคลุมทุกช่วง % ไม่ให้มีช่องว่าง
                </p>
              </section>
            ) : (
              <button
                onClick={() => setShowHelp(true)}
                className="text-sm font-semibold text-sky-700 hover:underline"
              >
                ❓ ระบบเลือกคำแนะนำอย่างไร?
              </button>
            )}

            {/* แถบเครื่องมือ */}
            <section className="space-y-3 rounded-xl bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold text-sky-900">
                  ข้อมูลคำแนะนำ{" "}
                  <span className="text-base font-normal text-slate-500">
                    ({list ? `แสดง ${shownCount} จาก ${list.length} ชุด` : "กำลังโหลด…"})
                  </span>
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={exportJson}
                    disabled={!list?.length}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none disabled:opacity-50"
                  >
                    ⬇️ สำรองข้อมูล (JSON)
                  </button>
                  <button
                    onClick={() =>
                      setEditing({
                        mode: "create",
                        data: {
                          ...emptyScenario,
                          crop: crop !== "ทั้งหมด" ? crop : "",
                          season: season !== "ทั้งหมด" ? season : "",
                        },
                      })
                    }
                    className="rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-800 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    ＋ เพิ่มข้อมูลใหม่
                  </button>
                </div>
              </div>

              <label className="block">
                <span className="sr-only">ค้นหา</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="🔍 ค้นหาชื่อ พันธุ์ ฤดู หรือสถานะน้ำ"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base focus:border-sky-600 focus:ring-2 focus:ring-sky-200 focus:outline-none"
                />
              </label>

              <div role="group" aria-label="กรองตามพันธุ์" className="flex flex-wrap items-center gap-2">
                <span className="w-12 text-sm font-semibold text-slate-500">พันธุ์</span>
                {["ทั้งหมด", ...crops].map((c) => (
                  <button key={c} aria-pressed={crop === c} onClick={() => setCrop(c)} className={chip(crop === c)}>
                    {c}
                  </button>
                ))}
              </div>
              <div role="group" aria-label="กรองตามฤดู" className="flex flex-wrap items-center gap-2">
                <span className="w-12 text-sm font-semibold text-slate-500">ฤดู</span>
                {["ทั้งหมด", ...seasons].map((s) => (
                  <button key={s} aria-pressed={season === s} onClick={() => setSeason(s)} className={chip(season === s)}>
                    {s}
                  </button>
                ))}
              </div>
            </section>

            {loadError && (
              <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
                <p className="font-bold">โหลดข้อมูลไม่สำเร็จ</p>
                <p className="text-sm">{loadError}</p>
                <button onClick={load} className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                  ลองใหม่
                </button>
              </div>
            )}

            {list && shownCount === 0 && (
              <p className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-sm">
                {list.length === 0 ? "ยังไม่มีข้อมูล กด “เพิ่มข้อมูลใหม่” เพื่อเริ่มต้น" : "ไม่พบข้อมูลที่ตรงกับตัวกรอง"}
              </p>
            )}

            {/* รายการ: พันธุ์ → ฤดู → การ์ด */}
            {groups.map((g) => (
              <section key={g.crop} className="rounded-xl bg-white p-4 shadow-sm sm:p-5" aria-labelledby={`crop-${g.crop}`}>
                <h2 id={`crop-${g.crop}`} className="text-lg font-bold text-slate-800">
                  🥔 พันธุ์{g.crop}
                </h2>
                {g.seasons.map((s) => (
                  <div key={s.season} className="mt-4">
                    <h3 className="mb-2 text-sm font-bold tracking-wide text-slate-500">{s.season}</h3>
                    <ul className="grid gap-3 md:grid-cols-2">
                      {s.items.map((sc) => (
                        <li
                          key={sc.id}
                          className={`flex flex-col rounded-lg border-l-4 bg-slate-50 p-4 ${colorsFor(sc.level).border}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`rounded-full px-3 py-1 text-sm font-bold text-white ${colorsFor(sc.level).badge}`}>
                              น้ำ{sc.level}
                            </span>
                            <span className={`text-sm font-semibold ${RISK_TEXT[sc.risk] ?? "text-slate-600"}`}>
                              ความเสี่ยง{sc.risk}
                            </span>
                          </div>
                          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                            <dt className="text-slate-500">ใช้เมื่อ</dt>
                            <dd className="font-semibold">{ratioText(sc.minRatio, sc.maxRatio)} ของที่ต้องการ</dd>
                            <dt className="text-slate-500">น้ำแนะนำ</dt>
                            <dd className="font-semibold">{fmt(sc.waterPerRai)} ลบ.ม./ไร่</dd>
                            <dt className="text-slate-500">ผลผลิต</dt>
                            <dd className="font-semibold">{sc.expectedYield || "–"}</dd>
                            <dt className="text-slate-500">เนื้อหา</dt>
                            <dd>
                              คำแนะนำ {sc.advice.length} ข้อ · ตารางน้ำ {sc.schedule.length} ระยะ
                            </dd>
                          </dl>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              onClick={() => setEditing({ mode: "edit", id: sc.id, data: toInput(sc) })}
                              aria-label={`แก้ไข ${sc.name}`}
                              className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                            >
                              ✏️ แก้ไข
                            </button>
                            <button
                              onClick={() =>
                                setEditing({
                                  mode: "copy",
                                  data: { ...toInput(sc), name: "" },
                                })
                              }
                              aria-label={`คัดลอก ${sc.name} เป็นข้อมูลใหม่`}
                              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                            >
                              📄 คัดลอก
                            </button>
                            <button
                              onClick={() => setDeleting(sc)}
                              aria-label={`ลบ ${sc.name}`}
                              className="ml-auto rounded-lg px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:outline-none"
                            >
                              🗑️ ลบ
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}
      </main>

      {editing && (
        <ScenarioEditor
          key={editing.id ?? editing.mode}
          initial={editing.data}
          mode={editing.mode}
          cropOptions={crops}
          seasonOptions={seasons}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}

      {deleting && (
        <ConfirmDelete scenario={deleting} onConfirm={() => remove(deleting)} onClose={() => setDeleting(null)} />
      )}

      {/* แจ้งผลการทำงาน — โปรแกรมอ่านหน้าจอจะอ่านให้อัตโนมัติ */}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        {toast && (
          <p
            className={`pointer-events-auto rounded-full px-5 py-3 text-base font-semibold text-white shadow-lg ${toast.error ? "bg-red-600" : "bg-slate-800"}`}
          >
            {toast.error ? "⚠️ " : "✓ "}
            {toast.text}
          </p>
        )}
      </div>
    </>
  );
}

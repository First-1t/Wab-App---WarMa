"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { colorsFor, fmt } from "@/lib/format";
import type { Scenario, ScenarioInput } from "@/lib/types";
import { useSession } from "../components/RequireAuth";
import UserMenu from "../components/UserMenu";
import { SeasonArt, VarietyArt } from "./CardArt";
import FeedbackPanel from "./FeedbackPanel";
import NotifySettings from "./NotifySettings";
import ScenarioEditor, { emptyScenario, LEVELS, ratioText } from "./ScenarioEditor";

const SEASON_ORDER = ["ต้นฤดูฝน", "ปลายฤดูฝน", "ฤดูแล้ง"];
const SEASON_INFO: Record<string, string> = {
  ต้นฤดูฝน: "ปลูก เม.ย.–พ.ค. อาศัยน้ำฝนเป็นหลัก",
  ปลายฤดูฝน: "ปลูก ต.ค.–พ.ย. ต้นต้องผ่านหน้าแล้ง",
  ฤดูแล้ง: "ปลูก ม.ค.–ก.พ. ต้องมีน้ำชลประทาน",
};
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
type View = { crop: string | null; season: string | null };

/** เอาเฉพาะ field ที่แก้ไขได้ (ตัด id / createdAt / updatedAt ออก) */
function toInput(s: Scenario): ScenarioInput {
  const { name, crop, season, level, waterPerRai, minRatio, maxRatio, expectedYield, risk, advice, schedule } = s;
  return { name, crop, season, level, waterPerRai, minRatio, maxRatio, expectedYield, risk, advice, schedule };
}

/** ตรวจว่าข้อมูลในฤดูหนึ่งครอบคลุมทุกช่วง % หรือไม่ — คืนรายการช่วงที่ขาด */
function gaps(items: Scenario[]): string[] {
  const sorted = [...items].sort((a, b) => a.minRatio - b.minRatio);
  const out: string[] = [];
  let cur = 0;
  for (const s of sorted) {
    if (s.minRatio > cur + 1e-9) out.push(`${Math.round(cur * 100)}–${Math.round(s.minRatio * 100)}%`);
    cur = Math.max(cur, s.maxRatio);
  }
  if (cur < 99) out.push(`${Math.round(cur * 100)}% ขึ้นไป`);
  return out;
}

function readView(): View {
  if (typeof window === "undefined") return { crop: null, season: null };
  const sp = new URLSearchParams(window.location.search);
  return { crop: sp.get("crop"), season: sp.get("season") };
}

function CoverageNote({ items }: { items: Scenario[] }) {
  const g = gaps(items);
  return g.length ? (
    <span className="text-sm font-semibold text-amber-700">⚠️ ยังไม่มีข้อมูลช่วง {g.join(", ")}</span>
  ) : (
    <span className="text-sm font-semibold text-green-700">✓ ครอบคลุมทุกช่วงน้ำ</span>
  );
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

/** แถบแสดงช่วง % ของน้ำที่ข้อมูลแต่ละชุดครอบคลุม (0–150%) */
function CoverageBar({ items }: { items: Scenario[] }) {
  const SCALE = 1.5;
  return (
    <figure className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
      <figcaption className="text-sm font-semibold text-slate-700">
        ช่วงน้ำที่ข้อมูลแต่ละชุดใช้{" "}
        <span className="font-normal text-slate-500">(% ของน้ำที่พันธุ์นี้ต้องการ)</span>
      </figcaption>
      <div
        className="relative mt-3 h-9 overflow-hidden rounded-lg bg-slate-100"
        role="img"
        aria-label={items.map((s) => `น้ำ${s.level}: ${ratioText(s.minRatio, s.maxRatio)}`).join(", ")}
      >
        {items.map((s) => {
          const left = (Math.min(s.minRatio, SCALE) / SCALE) * 100;
          const right = (Math.min(s.maxRatio, SCALE) / SCALE) * 100;
          return (
            <div
              key={s.id}
              className={`absolute inset-y-0 flex items-center justify-center border-r-2 border-white text-sm font-bold text-white ${colorsFor(s.level).bar}`}
              style={{ left: `${left}%`, width: `${right - left}%` }}
            >
              <span className="truncate px-1">{s.level}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-sm text-slate-500" aria-hidden="true">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
        <span>150%+</span>
      </div>
    </figure>
  );
}

function Breadcrumb({ view, go }: { view: View; go: (v: View) => void }) {
  const link =
    "rounded font-semibold text-sky-700 hover:underline focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none";
  return (
    <nav aria-label="ตำแหน่งปัจจุบัน" className="text-base">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          {view.crop ? (
            <button onClick={() => go({ crop: null, season: null })} className={link}>
              ทุกพันธุ์
            </button>
          ) : (
            <span aria-current="page" className="font-semibold text-slate-800">
              ทุกพันธุ์
            </span>
          )}
        </li>
        {view.crop && (
          <>
            <li aria-hidden="true" className="text-slate-400">›</li>
            <li>
              {view.season ? (
                <button onClick={() => go({ crop: view.crop, season: null })} className={link}>
                  {view.crop}
                </button>
              ) : (
                <span aria-current="page" className="font-semibold text-slate-800">
                  {view.crop}
                </span>
              )}
            </li>
          </>
        )}
        {view.season && (
          <>
            <li aria-hidden="true" className="text-slate-400">›</li>
            <li aria-current="page" className="font-semibold text-slate-800">
              {view.season}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}

export default function AdminPanel() {
  const { user, logout } = useSession();
  const [list, setList] = useState<Scenario[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState<"data" | "feedback">("data");
  const [view, setView] = useState<View>(readView);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [deleting, setDeleting] = useState<Scenario | null>(null);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
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
    // ปุ่มย้อนกลับของเบราว์เซอร์ = ถอยกลับทีละชั้น
    const onPop = () => setView(readView());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [load]);

  /** เปลี่ยนชั้นที่ดู + เก็บใน URL (แชร์ลิงก์/กดย้อนกลับได้) แล้วย้ายโฟกัสไปหัวข้อใหม่ */
  const go = useCallback((v: View) => {
    const url = new URL(window.location.href);
    url.searchParams.delete("crop");
    url.searchParams.delete("season");
    if (v.crop) url.searchParams.set("crop", v.crop);
    if (v.crop && v.season) url.searchParams.set("season", v.season);
    window.history.pushState(null, "", url);
    setView(v);
    window.scrollTo({ top: 0 });
    setTimeout(() => headingRef.current?.focus(), 0);
  }, []);

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

  const all = useMemo(() => list ?? [], [list]);
  const crops = useMemo(
    () => [...new Set(all.map((s) => s.crop))].sort((a, b) => a.localeCompare(b, "th", { numeric: true })),
    [all],
  );
  const allSeasons = useMemo(
    () =>
      [...new Set(all.map((s) => s.season))].sort(
        (a, b) => rank(SEASON_ORDER, a) - rank(SEASON_ORDER, b),
      ),
    [all],
  );
  const cropSeasons = useMemo(
    () =>
      view.crop
        ? [...new Set(all.filter((s) => s.crop === view.crop).map((s) => s.season))].sort(
            (a, b) => rank(SEASON_ORDER, a) - rank(SEASON_ORDER, b),
          )
        : [],
    [all, view.crop],
  );
  const inSeason = (crop: string, season: string) =>
    all
      .filter((s) => s.crop === crop && s.season === season)
      .sort((a, b) => rank(LEVELS, a.level) - rank(LEVELS, b.level));

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
      // พาไปดูชั้นที่ข้อมูลชุดนั้นอยู่
      if (data.crop !== view.crop || data.season !== view.season) {
        go({ crop: data.crop, season: data.season });
      }
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
    const blob = new Blob([JSON.stringify(all.map(toInput), null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `warma-scenarios-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function create(prefill: Partial<ScenarioInput>) {
    setEditing({ mode: "create", data: { ...emptyScenario, ...prefill } });
  }

  const card =
    "group flex flex-col overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-sky-400 focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none";
  const addCard =
    "flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-6 text-slate-600 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-800 focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none";

  const seasonItems = view.crop && view.season ? inSeason(view.crop, view.season) : [];

  return (
    <>
      <header className="sticky top-0 z-10 bg-gradient-to-r from-sky-900 to-sky-700 text-white shadow">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
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

        <div className="mx-auto flex max-w-5xl gap-1 px-4" role="tablist" aria-label="ส่วนของหน้าตั้งค่า">
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

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-5 px-4 py-5">
        {!user && (
          <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            ⚠️ โหมดพัฒนา — เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า GOOGLE_CLIENT_ID จึงไม่ต้องล็อกอิน
            (ห้ามใช้แบบนี้ตอน deploy จริง)
          </p>
        )}

        {tab === "feedback" && (
          <div role="tabpanel" id="panel-feedback" aria-labelledby="tab-feedback" className="space-y-4">
            <NotifySettings />
            <FeedbackPanel />
          </div>
        )}

        {tab === "data" && (
          <div role="tabpanel" id="panel-data" aria-labelledby="tab-data" className="space-y-5">
            {loadError && (
              <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
                <p className="font-bold">โหลดข้อมูลไม่สำเร็จ</p>
                <p className="text-sm">{loadError}</p>
                <button onClick={load} className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                  ลองใหม่
                </button>
              </div>
            )}
            {!list && !loadError && <p className="py-10 text-center text-slate-400">กำลังโหลดข้อมูล…</p>}

            {list && (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Breadcrumb view={view} go={go} />
                  {view.crop && (
                    <button
                      onClick={() => go({ crop: view.season ? view.crop : null, season: null })}
                      className="self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                    >
                      ← ย้อนกลับ
                    </button>
                  )}
                </div>

                {/* ───── ชั้นที่ 1: เลือกพันธุ์ ───── */}
                {!view.crop && (
                  <>
                    {showHelp ? (
                      <section className="rounded-xl border border-sky-200 bg-sky-50 p-5 text-slate-700">
                        <div className="flex items-start justify-between gap-3">
                          <h2 className="font-bold text-sky-900">วิธีแก้ไขข้อมูล</h2>
                          <button
                            onClick={hideHelp}
                            className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-sky-800 hover:bg-sky-100 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                          >
                            ซ่อนคำอธิบาย
                          </button>
                        </div>
                        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-base">
                          <li><b>เลือกพันธุ์</b> มันสำปะหลังที่ต้องการแก้</li>
                          <li><b>เลือกฤดูปลูก</b> ของพันธุ์นั้น</li>
                          <li>
                            กด <b>แก้ไข</b> ข้อมูลตามสถานะน้ำ (เพียงพอ / จำกัด / ขาดแคลน) — ระบบจะเลือกชุดที่ตรงกับ
                            น้ำที่เกษตรกรมีไปแสดงให้อัตโนมัติ
                          </li>
                        </ol>
                      </section>
                    ) : (
                      <button onClick={() => setShowHelp(true)} className="text-sm font-semibold text-sky-700 hover:underline">
                        ❓ วิธีแก้ไขข้อมูล
                      </button>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-sky-900 focus:outline-none">
                          เลือกพันธุ์มันสำปะหลัง
                        </h2>
                        <p className="text-base text-slate-500">
                          {crops.length} พันธุ์ · ข้อมูลทั้งหมด {all.length} ชุด
                        </p>
                      </div>
                      <button
                        onClick={exportJson}
                        disabled={!all.length}
                        className="self-start rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none disabled:opacity-50"
                      >
                        ⬇️ สำรองข้อมูล (JSON)
                      </button>
                    </div>

                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {crops.map((c, i) => {
                        const items = all.filter((s) => s.crop === c);
                        const seasons = [...new Set(items.map((s) => s.season))];
                        const hasGap = seasons.some((se) => gaps(inSeason(c, se)).length > 0);
                        return (
                          <li key={c}>
                            <button onClick={() => go({ crop: c, season: null })} className={`${card} h-full w-full`}>
                              <VarietyArt index={i} className="h-32 w-full" />
                              <div className="flex flex-1 flex-col gap-1 p-4">
                                <span className="text-lg font-bold text-slate-800">พันธุ์{c}</span>
                                <span className="text-base text-slate-600">
                                  {seasons.length} ฤดูปลูก · {items.length} ชุดข้อมูล
                                </span>
                                <span className={`text-sm font-semibold ${hasGap ? "text-amber-700" : "text-green-700"}`}>
                                  {hasGap ? "⚠️ บางฤดูยังมีข้อมูลไม่ครบ" : "✓ ข้อมูลครบทุกฤดู"}
                                </span>
                                <span className="mt-auto pt-2 text-sm font-semibold text-sky-700 group-hover:underline">
                                  ดูฤดูปลูก →
                                </span>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                      <li>
                        <button onClick={() => create({})} className={`${addCard} h-full w-full`}>
                          <span className="text-4xl" aria-hidden="true">＋</span>
                          <span className="text-base font-bold">เพิ่มพันธุ์ใหม่</span>
                        </button>
                      </li>
                    </ul>
                  </>
                )}

                {/* ───── ชั้นที่ 2: เลือกฤดูของพันธุ์นั้น ───── */}
                {view.crop && !view.season && (
                  <>
                    <div>
                      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-sky-900 focus:outline-none">
                        พันธุ์{view.crop} — เลือกฤดูปลูก
                      </h2>
                      <p className="text-base text-slate-500">กดที่ฤดูเพื่อดูและแก้ไขข้อมูลของฤดูนั้น</p>
                    </div>
                    {cropSeasons.length === 0 && (
                      <p className="rounded-xl bg-white p-6 text-center text-slate-500 shadow-sm">
                        ยังไม่มีข้อมูลของพันธุ์นี้
                      </p>
                    )}
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {cropSeasons.map((se) => {
                        const items = inSeason(view.crop!, se);
                        return (
                          <li key={se}>
                            <button onClick={() => go({ crop: view.crop, season: se })} className={`${card} h-full w-full`}>
                              <SeasonArt season={se} className="h-32 w-full" />
                              <div className="flex flex-1 flex-col gap-2 p-4">
                                <span className="text-lg font-bold text-slate-800">{se}</span>
                                {SEASON_INFO[se] && <span className="text-base text-slate-600">{SEASON_INFO[se]}</span>}
                                <span className="flex flex-wrap gap-1.5">
                                  {items.map((s) => (
                                    <span key={s.id} className={`rounded-full px-2.5 py-0.5 text-sm font-semibold text-white ${colorsFor(s.level).badge}`}>
                                      {s.level}
                                    </span>
                                  ))}
                                </span>
                                <CoverageNote items={items} />
                                <span className="mt-auto pt-1 text-sm font-semibold text-sky-700 group-hover:underline">
                                  แก้ไขฤดูนี้ →
                                </span>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                      <li>
                        <button onClick={() => create({ crop: view.crop! })} className={`${addCard} h-full w-full`}>
                          <span className="text-4xl" aria-hidden="true">＋</span>
                          <span className="text-base font-bold">เพิ่มฤดูปลูก</span>
                          <span className="text-sm">ให้พันธุ์{view.crop}</span>
                        </button>
                      </li>
                    </ul>
                  </>
                )}

                {/* ───── ชั้นที่ 3: ข้อมูลของพันธุ์ + ฤดู ───── */}
                {view.crop && view.season && (
                  <>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-sky-900 focus:outline-none">
                          พันธุ์{view.crop} · {view.season}
                        </h2>
                        <p className="text-base text-slate-500">
                          {SEASON_INFO[view.season] ?? "ข้อมูลแยกตามสถานะน้ำ"} — มี {seasonItems.length} ชุด
                        </p>
                      </div>
                      <button
                        onClick={() => create({ crop: view.crop!, season: view.season! })}
                        className="self-start rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-800 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:outline-none"
                      >
                        ＋ เพิ่มสถานะน้ำ
                      </button>
                    </div>

                    {seasonItems.length > 0 ? (
                      <>
                        <CoverageBar items={seasonItems} />
                        <p className="-mt-2">
                          <CoverageNote items={seasonItems} />
                        </p>
                      </>
                    ) : (
                      <p className="rounded-xl bg-white p-6 text-center text-slate-500 shadow-sm">
                        ยังไม่มีข้อมูลในฤดูนี้ กด “เพิ่มสถานะน้ำ” เพื่อเริ่มต้น
                      </p>
                    )}

                    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {seasonItems.map((sc) => (
                        <li
                          key={sc.id}
                          className={`flex flex-col rounded-xl border-t-4 bg-white p-5 shadow-sm ${colorsFor(sc.level).border}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`rounded-full px-3 py-1 text-base font-bold text-white ${colorsFor(sc.level).badge}`}>
                              น้ำ{sc.level}
                            </span>
                            <span className={`text-sm font-semibold ${RISK_TEXT[sc.risk] ?? "text-slate-600"}`}>
                              ความเสี่ยง{sc.risk}
                            </span>
                          </div>
                          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-base">
                            <dt className="text-slate-500">ใช้เมื่อ</dt>
                            <dd className="font-semibold">{ratioText(sc.minRatio, sc.maxRatio)}</dd>
                            <dt className="text-slate-500">น้ำแนะนำ</dt>
                            <dd className="font-semibold">{fmt(sc.waterPerRai)} ลบ.ม./ไร่</dd>
                            <dt className="text-slate-500">ผลผลิต</dt>
                            <dd className="font-semibold">{sc.expectedYield || "–"}</dd>
                            <dt className="text-slate-500">เนื้อหา</dt>
                            <dd>
                              คำแนะนำ {sc.advice.length} ข้อ · ตารางน้ำ {sc.schedule.length} ระยะ
                            </dd>
                          </dl>
                          <div className="mt-auto flex flex-wrap gap-2 pt-5">
                            <button
                              onClick={() => setEditing({ mode: "edit", id: sc.id, data: toInput(sc) })}
                              aria-label={`แก้ไข ${sc.name}`}
                              className="flex-1 rounded-lg bg-sky-700 px-4 py-2.5 text-base font-semibold text-white hover:bg-sky-800 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                            >
                              ✏️ แก้ไข
                            </button>
                            <button
                              onClick={() => setEditing({ mode: "copy", data: { ...toInput(sc), name: "" } })}
                              aria-label={`คัดลอก ${sc.name} เป็นข้อมูลใหม่`}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base font-semibold text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                            >
                              📄 คัดลอก
                            </button>
                            <button
                              onClick={() => setDeleting(sc)}
                              aria-label={`ลบ ${sc.name}`}
                              className="rounded-lg px-3 py-2.5 text-base font-semibold text-red-600 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:outline-none"
                            >
                              🗑️ ลบ
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {editing && (
        <ScenarioEditor
          key={editing.id ?? editing.mode}
          initial={editing.data}
          mode={editing.mode}
          cropOptions={crops}
          seasonOptions={allSeasons}
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

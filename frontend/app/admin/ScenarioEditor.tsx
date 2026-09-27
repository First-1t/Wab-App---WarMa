"use client";

import { useEffect, useId, useRef, useState } from "react";
import { fmt } from "@/lib/format";
import type { ScenarioInput, SchedulePhase } from "@/lib/types";

export const LEVELS = ["เพียงพอ", "จำกัด", "ขาดแคลน"] as const;
export const RISKS = ["ต่ำ", "ปานกลาง", "สูง"] as const;
const NO_LIMIT = 99; // maxRatio 99 = ไม่มีเพดาน

const LEVEL_STYLE: Record<string, string> = {
  เพียงพอ: "peer-checked:bg-green-600 peer-checked:border-green-600",
  จำกัด: "peer-checked:bg-amber-500 peer-checked:border-amber-500",
  ขาดแคลน: "peer-checked:bg-red-600 peer-checked:border-red-600",
  ต่ำ: "peer-checked:bg-green-600 peer-checked:border-green-600",
  ปานกลาง: "peer-checked:bg-amber-500 peer-checked:border-amber-500",
  สูง: "peer-checked:bg-red-600 peer-checked:border-red-600",
};

export const emptyScenario: ScenarioInput = {
  name: "",
  crop: "",
  season: "",
  level: "เพียงพอ",
  waterPerRai: 0,
  minRatio: 1,
  maxRatio: NO_LIMIT,
  expectedYield: "",
  risk: "ต่ำ",
  advice: [""],
  schedule: [
    { phase: "ปลูก–งอก", freq: "", amount: 0 },
    { phase: "สร้างทรงพุ่ม–เริ่มลงหัว", freq: "", amount: 0 },
    { phase: "หัวขยาย", freq: "", amount: 0 },
    { phase: "สุกแก่–ขุด", freq: "", amount: 0 },
  ],
};

/** แปลงช่วง ratio เป็นภาษาคน เช่น "มีน้ำ 70–100% ของที่พืชต้องการ" */
export function ratioText(min: number, max: number) {
  const lo = Math.round(min * 100);
  const hi = Math.round(max * 100);
  if (max >= NO_LIMIT) return lo === 0 ? "ทุกกรณี" : `มีน้ำ ${lo}% ขึ้นไป`;
  if (min <= 0) return `มีน้ำน้อยกว่า ${hi}%`;
  return `มีน้ำ ${lo}–${hi}%`;
}

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base focus:border-sky-600 focus:ring-2 focus:ring-sky-200 focus:outline-none aria-[invalid=true]:border-red-500";

function Field({
  label,
  hint,
  error,
  children,
  id,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  id: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-slate-800">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function Choice({
  name,
  options,
  value,
  onChange,
  legend,
}: {
  name: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  legend: string;
}) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-semibold text-slate-800">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o}
              checked={value === o}
              onChange={() => onChange(o)}
              className="peer sr-only"
            />
            <span
              className={`inline-block rounded-full border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-sky-400 ${LEVEL_STYLE[o] ?? ""}`}
            >
              {o}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Section({
  step,
  title,
  desc,
  children,
}: {
  step: number;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
      <h3 className="flex items-center gap-2 font-bold text-sky-900">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm text-sky-800">
          {step}
        </span>
        {title}
      </h3>
      {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

type Errors = Partial<Record<string, string>>;
const NO_ERRORS: Errors = {};

function validate(f: ScenarioInput, noLimit: boolean): Errors {
  const e: Errors = {};
  if (!f.crop.trim()) e.crop = "กรุณากรอกพันธุ์มันฝรั่ง";
  if (!f.season.trim()) e.season = "กรุณากรอกฤดูกาล";
  if (!(f.waterPerRai > 0)) e.waterPerRai = "กรุณากรอกปริมาณน้ำมากกว่า 0";
  if (f.minRatio < 0) e.minRatio = "ต้องไม่ติดลบ";
  if (!noLimit && f.maxRatio <= f.minRatio)
    e.maxRatio = "ค่าสูงสุดต้องมากกว่าค่าต่ำสุด";
  if (!f.schedule.some((p) => p.phase.trim()))
    e.schedule = "ต้องมีตารางให้น้ำอย่างน้อย 1 ระยะ";
  return e;
}

/**
 * หน้าต่างเพิ่ม/แก้ไข scenario — แบ่งเป็น 4 ขั้นตอน ใช้ภาษาคนแทนศัพท์ระบบ
 * (ratio แสดงเป็น % ของน้ำที่พืชต้องการ, คำแนะนำเพิ่มทีละข้อ)
 */
export default function ScenarioEditor({
  initial,
  mode,
  cropOptions,
  seasonOptions,
  onSave,
  onClose,
}: {
  initial: ScenarioInput;
  mode: "create" | "edit" | "copy";
  cropOptions: string[];
  seasonOptions: string[];
  onSave: (data: ScenarioInput) => Promise<void>;
  onClose: () => void;
}) {
  const uid = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<ScenarioInput>(() => ({
    ...initial,
    advice: initial.advice.length ? initial.advice : [""],
  }));
  const [noLimit, setNoLimit] = useState(initial.maxRatio >= NO_LIMIT);
  const [errors, setErrors] = useState<Errors>(NO_ERRORS);
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
  }, []);

  function patch(p: Partial<ScenarioInput>) {
    setForm((f) => ({ ...f, ...p }));
    setDirty(true);
  }

  function requestClose() {
    if (dirty && !confirm("ยังไม่ได้บันทึกการแก้ไข ต้องการปิดหน้าต่างนี้หรือไม่?")) {
      return;
    }
    onClose();
  }

  const setPhase = (i: number, p: Partial<SchedulePhase>) =>
    patch({ schedule: form.schedule.map((s, j) => (j === i ? { ...s, ...p } : s)) });

  const autoName = `มันฝรั่ง${form.crop.trim()} ${form.season.trim()} น้ำ${form.level}`.trim();
  const scheduleTotal = form.schedule.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalOff =
    form.waterPerRai > 0 &&
    Math.abs(scheduleTotal - form.waterPerRai) / form.waterPerRai > 0.05;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const errs = validate(form, noLimit);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        name: form.name.trim() || autoName,
        crop: form.crop.trim(),
        season: form.season.trim(),
        maxRatio: noLimit ? NO_LIMIT : form.maxRatio,
        advice: form.advice.map((a) => a.trim()).filter(Boolean),
        schedule: form.schedule
          .filter((p) => p.phase.trim())
          .map((p) => ({ ...p, amount: Number(p.amount) || 0 })),
      });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  const title =
    mode === "edit" ? "แก้ไขข้อมูลคำแนะนำ" : mode === "copy" ? "คัดลอกเป็นข้อมูลใหม่" : "เพิ่มข้อมูลคำแนะนำใหม่";
  const errorList = [...Object.values(errors), serverError].filter(Boolean);

  // มี error → เลื่อนและย้ายโฟกัสไปที่กล่องสรุป error (โปรแกรมอ่านหน้าจอจะอ่านให้)
  useEffect(() => {
    if (errors !== NO_ERRORS || serverError) errorRef.current?.focus();
  }, [errors, serverError]);
  const id = (k: string) => `${uid}-${k}`;
  const describedBy = (k: string) => (errors[k] ? `${id(k)}-err` : `${id(k)}-hint`);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={id("title")}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-slate-900/50 sm:m-auto sm:h-auto sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-2xl"
    >
      <form
        onSubmit={submit}
        noValidate
        className="flex h-full flex-col bg-white sm:max-h-[92dvh] sm:rounded-2xl"
      >
        {/* หัวหน้าต่าง */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h2 id={id("title")} className="text-lg font-bold text-sky-900">
              {title}
            </h2>
            <p className="truncate text-sm text-slate-500">{form.name || autoName}</p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="ปิดหน้าต่าง"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {errorList.length > 0 && (
            <div
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 focus:outline-none"
            >
              <p className="font-bold">กรุณาแก้ไขก่อนบันทึก</p>
              <ul className="mt-1 list-disc pl-5">
                {errorList.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          <Section step={1} title="ใช้กับกรณีไหน" desc="พันธุ์และฤดูที่ข้อมูลชุดนี้ใช้แนะนำ">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id={id("crop")} label="พันธุ์มันฝรั่ง" hint="เลือกจากรายการ หรือพิมพ์พันธุ์ใหม่" error={errors.crop}>
                <input
                  id={id("crop")}
                  list={id("crops")}
                  value={form.crop}
                  onChange={(e) => patch({ crop: e.target.value })}
                  aria-invalid={!!errors.crop}
                  aria-describedby={describedBy("crop")}
                  placeholder="เช่น แอตแลนติก"
                  className={input}
                />
                <datalist id={id("crops")}>
                  {cropOptions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field id={id("season")} label="ฤดูกาล" hint="เลือกจากรายการ หรือพิมพ์ฤดูใหม่" error={errors.season}>
                <input
                  id={id("season")}
                  list={id("seasons")}
                  value={form.season}
                  onChange={(e) => patch({ season: e.target.value })}
                  aria-invalid={!!errors.season}
                  aria-describedby={describedBy("season")}
                  placeholder="เช่น ฤดูหนาว"
                  className={input}
                />
                <datalist id={id("seasons")}>
                  {seasonOptions.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </Field>
            </div>
          </Section>

          <Section
            step={2}
            title="สถานการณ์น้ำ"
            desc="ระบบเทียบน้ำที่เกษตรกรมีกับน้ำที่พันธุ์นี้ต้องการ แล้วเลือกข้อมูลชุดที่ช่วง % ตรงกัน"
          >
            <Choice
              legend="สถานะน้ำ"
              name={id("level")}
              options={LEVELS}
              value={form.level}
              onChange={(v) => patch({ level: v })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id={id("min")}
                label="ใช้เมื่อมีน้ำตั้งแต่ (%)"
                hint="ของน้ำที่พันธุ์นี้ต้องการ เช่น 70"
                error={errors.minRatio}
              >
                <div className="relative">
                  <input
                    id={id("min")}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={5}
                    value={Math.round(form.minRatio * 100)}
                    onChange={(e) => patch({ minRatio: Number(e.target.value) / 100 })}
                    aria-invalid={!!errors.minRatio}
                    aria-describedby={describedBy("minRatio")}
                    className={`${input} pr-10`}
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-500">%</span>
                </div>
              </Field>
              <Field
                id={id("max")}
                label="ถึงน้อยกว่า (%)"
                hint={noLimit ? "ไม่มีเพดาน — น้ำมากเท่าไรก็ใช้ชุดนี้" : "เช่น 100"}
                error={errors.maxRatio}
              >
                <div className="relative">
                  <input
                    id={id("max")}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={5}
                    disabled={noLimit}
                    value={noLimit ? "" : Math.round(form.maxRatio * 100)}
                    placeholder={noLimit ? "ไม่จำกัด" : ""}
                    onChange={(e) => patch({ maxRatio: Number(e.target.value) / 100 })}
                    aria-invalid={!!errors.maxRatio}
                    aria-describedby={describedBy("maxRatio")}
                    className={`${input} pr-10 disabled:bg-slate-100`}
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-500">%</span>
                </div>
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={noLimit}
                    onChange={(e) => {
                      setNoLimit(e.target.checked);
                      if (!e.target.checked && form.maxRatio >= NO_LIMIT) patch({ maxRatio: 1 });
                      else setDirty(true);
                    }}
                    className="h-5 w-5 accent-sky-700"
                  />
                  ไม่มีเพดาน
                </label>
              </Field>
            </div>
            <p className="rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-900">
              💡 สรุป: ใช้ข้อมูลชุดนี้เมื่อ
              <b> {ratioText(form.minRatio, noLimit ? NO_LIMIT : form.maxRatio)} </b>
              ของน้ำที่พันธุ์นี้ต้องการ
            </p>
            <Field
              id={id("water")}
              label="น้ำที่แนะนำให้ใช้ (ลบ.ม. ต่อไร่ ตลอดฤดู)"
              hint="ชุด “น้ำเพียงพอ” ถือเป็นน้ำที่พันธุ์นี้ต้องการเต็มที่ ใช้เป็นฐานคำนวณ %"
              error={errors.waterPerRai}
            >
              <input
                id={id("water")}
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={form.waterPerRai || ""}
                onChange={(e) => patch({ waterPerRai: Number(e.target.value) })}
                aria-invalid={!!errors.waterPerRai}
                aria-describedby={describedBy("waterPerRai")}
                placeholder="เช่น 800"
                className={input}
              />
            </Field>
          </Section>

          <Section step={3} title="ผลลัพธ์และคำแนะนำ" desc="สิ่งที่เกษตรกรจะเห็นเมื่อระบบเลือกข้อมูลชุดนี้">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id={id("yield")} label="ผลผลิตที่คาดว่าจะได้" hint="เช่น 2,500–3,000 กก./ไร่">
                <input
                  id={id("yield")}
                  value={form.expectedYield}
                  onChange={(e) => patch({ expectedYield: e.target.value })}
                  aria-describedby={id("yield-hint")}
                  className={input}
                />
              </Field>
              <Choice
                legend="ระดับความเสี่ยง"
                name={id("risk")}
                options={RISKS}
                value={form.risk}
                onChange={(v) => patch({ risk: v })}
              />
            </div>

            <fieldset>
              <legend className="mb-1 text-sm font-semibold text-slate-800">คำแนะนำ (ทีละข้อ)</legend>
              <ol className="space-y-2">
                {form.advice.map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-2.5 w-6 shrink-0 text-right text-sm font-semibold text-slate-400">
                      {i + 1}.
                    </span>
                    <textarea
                      rows={2}
                      value={a}
                      aria-label={`คำแนะนำข้อที่ ${i + 1}`}
                      onChange={(e) =>
                        patch({ advice: form.advice.map((x, j) => (j === i ? e.target.value : x)) })
                      }
                      className={`${input} resize-y`}
                    />
                    <button
                      type="button"
                      onClick={() => patch({ advice: form.advice.filter((_, j) => j !== i) })}
                      aria-label={`ลบคำแนะนำข้อที่ ${i + 1}`}
                      className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => patch({ advice: [...form.advice, ""] })}
                className="mt-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-sky-500 hover:text-sky-700"
              >
                ＋ เพิ่มคำแนะนำ
              </button>
            </fieldset>
          </Section>

          <Section
            step={4}
            title="ตารางการให้น้ำ"
            desc="แบ่งตามระยะการเติบโต ใส่ปริมาณน้ำที่ให้ในแต่ละระยะ (ลบ.ม./ไร่)"
          >
            {errors.schedule && (
              <p className="text-sm font-semibold text-red-600">{errors.schedule}</p>
            )}
            <ol className="space-y-3">
              {form.schedule.map((p, i) => (
                <li key={i} className="rounded-lg bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">ระยะที่ {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => patch({ schedule: form.schedule.filter((_, j) => j !== i) })}
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                    >
                      ลบระยะนี้
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[2fr_2fr_1fr]">
                    <Field id={id(`ph${i}`)} label="ชื่อระยะ">
                      <input
                        id={id(`ph${i}`)}
                        value={p.phase}
                        onChange={(e) => setPhase(i, { phase: e.target.value })}
                        placeholder="เช่น หัวขยาย (วันที่ 44–81)"
                        className={input}
                      />
                    </Field>
                    <Field id={id(`fq${i}`)} label="ความถี่การให้น้ำ">
                      <input
                        id={id(`fq${i}`)}
                        value={p.freq}
                        onChange={(e) => setPhase(i, { freq: e.target.value })}
                        placeholder="เช่น ทุก 3–5 วัน"
                        className={input}
                      />
                    </Field>
                    <Field id={id(`am${i}`)} label="น้ำ (ลบ.ม./ไร่)">
                      <input
                        id={id(`am${i}`)}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="any"
                        value={p.amount || ""}
                        onChange={(e) => setPhase(i, { amount: Number(e.target.value) })}
                        placeholder="0"
                        className={input}
                      />
                    </Field>
                  </div>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => patch({ schedule: [...form.schedule, { phase: "", freq: "", amount: 0 }] })}
              className="rounded-lg border-2 border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-sky-500 hover:text-sky-700"
            >
              ＋ เพิ่มระยะ
            </button>
            <p
              className={`rounded-lg px-3 py-2 text-sm ${totalOff ? "bg-amber-50 text-amber-800" : "bg-slate-50 text-slate-600"}`}
              aria-live="polite"
            >
              รวมทุกระยะ <b>{fmt(scheduleTotal)}</b> ลบ.ม./ไร่ · น้ำที่แนะนำ{" "}
              <b>{fmt(form.waterPerRai || 0)}</b> ลบ.ม./ไร่
              {totalOff ? " — ⚠️ สองค่านี้ไม่ตรงกัน ตรวจสอบอีกครั้ง" : " ✓"}
            </p>
          </Section>

          <Field
            id={id("name")}
            label="ชื่อข้อมูลชุดนี้"
            hint={`เว้นว่างได้ ระบบจะตั้งชื่อให้เป็น “${autoName}”`}
          >
            <input
              id={id("name")}
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder={autoName}
              aria-describedby={id("name-hint")}
              className={input}
            />
          </Field>
        </div>

        {/* ปุ่มล่าง — ติดขอบล่างเสมอ */}
        <div className="flex gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-sky-700 px-5 py-3 font-bold text-white hover:bg-sky-800 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60 sm:flex-none"
          >
            {saving ? "กำลังบันทึก…" : "💾 บันทึก"}
          </button>
          <button
            type="button"
            onClick={requestClose}
            className="rounded-lg bg-slate-100 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </dialog>
  );
}

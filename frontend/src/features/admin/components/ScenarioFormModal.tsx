import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { IrrigationPhase } from '../../../shared/types/scenario.contracts';
import type { ScenarioInput, ScenarioOptions } from '../services/admin-api.service';

const RISKS = ['ต่ำ', 'ปานกลาง', 'สูง'];

/** ช่วงน้ำที่ Output ใช้เลือกแต่ละสถานะ (กำหนดในโค้ดจับคู่ แก้จากหน้านี้ไม่ได้) */
export const CONDITION_RANGE: Record<string, string> = {
  น้ำเพียงพอ: 'มีน้ำ 100% ขึ้นไป',
  น้ำจำกัด: 'มีน้ำ 60–100%',
  พึ่งพาน้ำฝน: 'มีน้ำน้อยกว่า 60%',
};

export function emptyScenario(partial: Partial<ScenarioInput>): ScenarioInput {
  return {
    name: '',
    crop: '' as ScenarioInput['crop'],
    plantingSeason: '' as ScenarioInput['plantingSeason'],
    waterCondition: 'น้ำเพียงพอ',
    waterPerRaiM3: 0,
    waterRequirementM3: 0,
    dryYieldKgPerRai: 0,
    freshYield: { minKgPerRai: 0, maxKgPerRai: 0, avgTonsPerRai: 0, estimatedStarchPercent: 0 },
    risk: 'ปานกลาง',
    advice: [''],
    schedule: [
      { phase: 'ระยะงอกและตั้งตัว (1–30 วัน)', management: '', freq: '', amountPerRaiM3: 0 },
      { phase: 'ระยะสร้างลำต้นและใบ (31–90 วัน)', management: '', freq: '', amountPerRaiM3: 0 },
      { phase: 'ระยะสะสมแป้งขยายหัว (91–240 วัน)', management: '', freq: '', amountPerRaiM3: 0 },
      { phase: 'ก่อนเก็บเกี่ยว (241 วันขึ้นไป)', management: '', freq: 'งดให้น้ำ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    ...partial,
  };
}

const input =
  'w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-base focus:border-primary focus:ring-2 focus:ring-primary-fixed focus:outline-none disabled:bg-surface-container';

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-sm text-on-surface-variant">{hint}</p>}
    </div>
  );
}

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <Field id={id} label={label} hint={hint}>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        value={value || ''}
        placeholder="0"
        onChange={(e) => onChange(Number(e.target.value))}
        className={input}
      />
    </Field>
  );
}

function Section({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-surface-container p-4 sm:p-5">
      <h3 className="flex items-center gap-2 font-bold text-primary">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-sm text-on-primary-fixed">
          {step}
        </span>
        {title}
      </h3>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/** หน้าต่างเพิ่ม/แก้ไข Scenario ใช้ <dialog> ของเบราว์เซอร์ (คีย์บอร์ด/โปรแกรมอ่านหน้าจอใช้ได้) */
export function ScenarioFormModal({
  initial,
  isEdit,
  options,
  onSave,
  onClose,
}: {
  initial: ScenarioInput;
  isEdit: boolean;
  options: ScenarioOptions;
  onSave: (data: ScenarioInput) => Promise<void>;
  onClose: () => void;
}) {
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<ScenarioInput>(() => ({
    ...initial,
    advice: initial.advice.length ? initial.advice : [''],
  }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
  }, []);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  function patch(p: Partial<ScenarioInput>) {
    setForm((f) => ({ ...f, ...p }));
    setDirty(true);
  }
  const patchYield = (p: Partial<ScenarioInput['freshYield']>) =>
    patch({ freshYield: { ...form.freshYield, ...p } });
  const setPhase = (i: number, p: Partial<IrrigationPhase>) =>
    patch({ schedule: form.schedule.map((s, j) => (j === i ? { ...s, ...p } : s)) });

  function requestClose() {
    if (dirty && !window.confirm('ยังไม่ได้บันทึกการแก้ไข ต้องการปิดหน้าต่างนี้หรือไม่?')) return;
    onClose();
  }

  const autoName = `มันสำปะหลัง${form.crop} ${form.plantingSeason} (${form.waterCondition})`;
  const scheduleTotal = form.schedule.reduce((sum, p) => sum + (Number(p.amountPerRaiM3) || 0), 0);
  const totalOff =
    form.waterPerRaiM3 > 0 && Math.abs(scheduleTotal - form.waterPerRaiM3) / form.waterPerRaiM3 > 0.05;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.crop || !form.plantingSeason) return setError('กรุณาเลือกพันธุ์และฤดูปลูก');
    setSaving(true);
    try {
      await onSave({
        ...form,
        name: form.name.trim() || autoName,
        advice: form.advice.map((a) => a.trim()).filter(Boolean),
        schedule: form.schedule.filter((p) => p.phase.trim()),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={id('title')}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-inverse-surface/50 sm:m-auto sm:h-auto sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-2xl"
    >
      <form
        onSubmit={submit}
        noValidate
        className="flex h-full flex-col bg-surface-container-lowest text-on-surface sm:max-h-[92dvh] sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-surface-container px-5 py-4">
          <div className="min-w-0">
            <h2 id={id('title')} className="text-lg font-bold text-primary">
              {isEdit ? 'แก้ไขข้อมูลคำแนะนำ' : 'เพิ่มข้อมูลคำแนะนำ'}
            </h2>
            <p className="truncate text-sm text-on-surface-variant">{form.name || autoName}</p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="ปิดหน้าต่าง"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {error && (
            <div
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container focus:outline-none"
            >
              <p className="font-bold">บันทึกไม่สำเร็จ</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <Section step={1} title="ใช้กับกรณีไหน">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id={id('crop')} label="พันธุ์">
                <select
                  id={id('crop')}
                  value={form.crop}
                  onChange={(e) => patch({ crop: e.target.value as ScenarioInput['crop'] })}
                  className={input}
                >
                  <option value="">เลือกพันธุ์</option>
                  {options.crops.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field id={id('season')} label="ฤดูปลูก">
                <select
                  id={id('season')}
                  value={form.plantingSeason}
                  onChange={(e) =>
                    patch({ plantingSeason: e.target.value as ScenarioInput['plantingSeason'] })
                  }
                  className={input}
                >
                  <option value="">เลือกฤดู</option>
                  {options.seasons.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field id={id('cond')} label="สถานะน้ำ">
                <select
                  id={id('cond')}
                  value={form.waterCondition}
                  onChange={(e) =>
                    patch({ waterCondition: e.target.value as ScenarioInput['waterCondition'] })
                  }
                  className={input}
                >
                  {options.waterConditions.map((w) => (
                    <option key={w}>{w}</option>
                  ))}
                </select>
              </Field>
            </div>
            <p className="rounded-lg bg-secondary-fixed px-3 py-2 text-sm text-on-secondary-fixed">
              ระบบจะใช้ข้อมูลชุดนี้เมื่อ <b>{CONDITION_RANGE[form.waterCondition]}</b>{' '}
              ของน้ำที่พันธุ์นี้ต้องการ
            </p>
          </Section>

          <Section step={2} title="ปริมาณน้ำ">
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id={id('req')}
                label="น้ำที่พันธุ์นี้ต้องการ (ลบ.ม./ไร่)"
                hint="ใช้ร่วมกันทุกสถานะน้ำของพันธุ์และฤดูนี้ แก้ที่นี่จะเปลี่ยนให้ทุกชุด"
                value={form.waterRequirementM3}
                onChange={(n) => patch({ waterRequirementM3: n })}
              />
              <NumberField
                id={id('water')}
                label="น้ำที่แนะนำให้จัดสรร (ลบ.ม./ไร่)"
                value={form.waterPerRaiM3}
                onChange={(n) => patch({ waterPerRaiM3: n })}
              />
            </div>
          </Section>

          <Section step={3} title="ผลผลิตและความเสี่ยง">
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id={id('min')}
                label="ผลผลิตสดต่ำสุด (กก./ไร่)"
                value={form.freshYield.minKgPerRai}
                onChange={(n) => patchYield({ minKgPerRai: n })}
              />
              <NumberField
                id={id('max')}
                label="ผลผลิตสดสูงสุด (กก./ไร่)"
                value={form.freshYield.maxKgPerRai}
                onChange={(n) => patchYield({ maxKgPerRai: n })}
              />
              <NumberField
                id={id('avg')}
                label="ผลผลิตสดเฉลี่ย (ตัน/ไร่)"
                value={form.freshYield.avgTonsPerRai}
                onChange={(n) => patchYield({ avgTonsPerRai: n })}
              />
              <NumberField
                id={id('starch')}
                label="เปอร์เซ็นต์แป้ง (%)"
                value={form.freshYield.estimatedStarchPercent}
                onChange={(n) => patchYield({ estimatedStarchPercent: n })}
              />
              <NumberField
                id={id('dry')}
                label="ผลผลิตแห้งจาก DSSAT (กก./ไร่)"
                value={form.dryYieldKgPerRai}
                onChange={(n) => patch({ dryYieldKgPerRai: n })}
              />
              <Field id={id('risk')} label="ระดับความเสี่ยง">
                <select
                  id={id('risk')}
                  value={form.risk}
                  onChange={(e) => patch({ risk: e.target.value as ScenarioInput['risk'] })}
                  className={input}
                >
                  {RISKS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          <Section step={4} title="คำแนะนำ">
            <ol className="space-y-2">
              {form.advice.map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-2.5 w-6 shrink-0 text-right text-sm font-semibold text-on-surface-variant">
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
                    className="mt-1 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => patch({ advice: [...form.advice, ''] })}
              className="cursor-pointer rounded-lg border-2 border-dashed border-outline-variant px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary"
            >
              เพิ่มคำแนะนำ
            </button>
          </Section>

          <Section step={5} title="ตารางการให้น้ำ">
            <ol className="space-y-3">
              {form.schedule.map((p, i) => (
                <li key={i} className="rounded-lg bg-surface-container-low p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold">ระยะที่ {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => patch({ schedule: form.schedule.filter((_, j) => j !== i) })}
                      className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold text-error hover:bg-error-container"
                    >
                      ลบระยะนี้
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field id={id(`ph${i}`)} label="ชื่อระยะ">
                      <input
                        id={id(`ph${i}`)}
                        value={p.phase}
                        onChange={(e) => setPhase(i, { phase: e.target.value })}
                        className={input}
                      />
                    </Field>
                    <Field id={id(`mg${i}`)} label="วิธีจัดการ">
                      <input
                        id={id(`mg${i}`)}
                        value={p.management}
                        onChange={(e) => setPhase(i, { management: e.target.value })}
                        className={input}
                      />
                    </Field>
                    <Field id={id(`fq${i}`)} label="ความถี่การให้น้ำ">
                      <input
                        id={id(`fq${i}`)}
                        value={p.freq}
                        onChange={(e) => setPhase(i, { freq: e.target.value })}
                        className={input}
                      />
                    </Field>
                    <NumberField
                      id={id(`am${i}`)}
                      label="น้ำ (ลบ.ม./ไร่)"
                      value={p.amountPerRaiM3}
                      onChange={(n) => setPhase(i, { amountPerRaiM3: n })}
                    />
                  </div>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() =>
                patch({
                  schedule: [...form.schedule, { phase: '', management: '', freq: '', amountPerRaiM3: 0 }],
                })
              }
              className="cursor-pointer rounded-lg border-2 border-dashed border-outline-variant px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary"
            >
              เพิ่มระยะ
            </button>
            <p
              aria-live="polite"
              className={`rounded-lg px-3 py-2 text-sm ${totalOff ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container-low'}`}
            >
              รวมทุกระยะ <b>{scheduleTotal.toLocaleString()}</b> ลบ.ม./ไร่ · น้ำที่แนะนำ{' '}
              <b>{(form.waterPerRaiM3 || 0).toLocaleString()}</b> ลบ.ม./ไร่
              {totalOff ? ' สองค่านี้ไม่ตรงกัน ตรวจสอบอีกครั้ง' : ''}
            </p>
          </Section>

          <Section step={6} title="ข้อมูลเพิ่มเติม">
            <Field id={id('name')} label="ชื่อข้อมูลชุดนี้" hint="เว้นว่างได้ ระบบจะตั้งชื่อให้">
              <input
                id={id('name')}
                value={form.name}
                placeholder={autoName}
                onChange={(e) => patch({ name: e.target.value })}
                className={input}
              />
            </Field>
            <Field id={id('note')} label="หมายเหตุ (ไม่บังคับ)">
              <input
                id={id('note')}
                value={form.note ?? ''}
                onChange={(e) => patch({ note: e.target.value })}
                className={input}
              />
            </Field>
            <label className="flex cursor-pointer items-center gap-2 text-base">
              <input
                type="checkbox"
                checked={form.isMockData}
                onChange={(e) => patch({ isMockData: e.target.checked })}
                className="h-5 w-5 accent-primary"
              />
              เป็นข้อมูลจำลอง (ยังไม่ใช่ผลจาก DSSAT จริง)
            </label>
          </Section>
        </div>

        <div className="flex gap-2 border-t border-surface-container px-5 py-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 cursor-pointer rounded-lg bg-primary px-5 py-3 font-bold text-on-primary hover:bg-on-primary-fixed-variant disabled:opacity-60 sm:flex-none"
          >
            {saving ? 'กำลังบันทึก…' : 'บันทึก'}
          </button>
          <button
            type="button"
            onClick={requestClose}
            className="cursor-pointer rounded-lg bg-surface-container px-5 py-3 font-semibold"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </dialog>
  );
}

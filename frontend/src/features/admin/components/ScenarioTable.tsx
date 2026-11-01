import type { Scenario } from '../../../shared/types/scenario.contracts';
import type { ScenarioOptions } from '../services/admin-api.service';
import { PhotoCredits, SeasonArt, VarietyArt } from './CardArt';
import { CONDITION_RANGE } from './ScenarioFormModal';

export type View = { crop: string | null; season: string | null };

const CONDITION_STYLE: Record<string, { badge: string; border: string }> = {
  น้ำเพียงพอ: { badge: 'bg-primary text-on-primary', border: 'border-primary' },
  น้ำจำกัด: { badge: 'bg-warning text-white', border: 'border-warning' },
  พึ่งพาน้ำฝน: { badge: 'bg-secondary text-on-secondary', border: 'border-secondary' },
};
const SEASON_INFO: Record<string, string> = {
  ต้นฤดูฝน: 'ปลูกช่วงต้นฝน อาศัยน้ำฝนเป็นหลัก',
  ปลายฤดูฝน: 'ปลูกช่วงปลายฝน ต้นต้องผ่านหน้าแล้ง',
};

const card =
  'group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-xl bg-surface text-left shadow-xs ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-md hover:ring-brand focus-visible:ring-4 focus-visible:ring-secondary focus-visible:outline-none';

function Coverage({ have, total }: { have: number; total: number }) {
  if (have === 0) {
    return (
      <span className="text-sm font-semibold text-on-surface-variant">
        ยังไม่มีข้อมูล ระบบจะตอบว่าไม่รองรับ
      </span>
    );
  }
  return have >= total ? (
    <span className="text-sm font-semibold text-brand">ข้อมูลครบทุกสถานะน้ำ</span>
  ) : (
    <span className="text-sm font-semibold text-warning">
      มีข้อมูล {have} จาก {total} สถานะน้ำ
    </span>
  );
}

/** ชั้นที่ 1: เลือกพันธุ์ */
export function CropGrid({
  scenarios,
  options,
  go,
}: {
  scenarios: Scenario[];
  options: ScenarioOptions;
  go: (v: View) => void;
}) {
  const perCrop = options.seasons.length * options.waterConditions.length;
  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {options.crops.map((c, i) => {
          const items = scenarios.filter((s) => s.crop === c);
          return (
            <li key={c}>
              <button type="button" onClick={() => go({ crop: c, season: null })} className={card}>
                <VarietyArt index={i} className="h-32 w-full" />
                <span className="flex flex-1 flex-col gap-1 p-4">
                  <span className="text-lg font-bold">พันธุ์{c}</span>
                  <span className="text-base text-on-surface-variant">{items.length} ชุดข้อมูล</span>
                  <Coverage have={items.length} total={perCrop} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <PhotoCredits />
    </>
  );
}

/** ชั้นที่ 2: เลือกฤดูปลูกของพันธุ์นั้น */
export function SeasonGrid({
  crop,
  scenarios,
  options,
  go,
}: {
  crop: string;
  scenarios: Scenario[];
  options: ScenarioOptions;
  go: (v: View) => void;
}) {
  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {options.seasons.map((season) => {
          const items = scenarios.filter((s) => s.crop === crop && s.plantingSeason === season);
          return (
            <li key={season}>
              <button type="button" onClick={() => go({ crop, season })} className={card}>
                <SeasonArt season={season} className="h-32 w-full" />
                <span className="flex flex-1 flex-col gap-2 p-4">
                  <span className="text-lg font-bold">{season}</span>
                  {SEASON_INFO[season] && (
                    <span className="text-base text-on-surface-variant">{SEASON_INFO[season]}</span>
                  )}
                  <span className="flex flex-wrap gap-1.5">
                    {items.map((s) => (
                      <span
                        key={s.id}
                        className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${CONDITION_STYLE[s.waterCondition]?.badge ?? ''}`}
                      >
                        {s.waterCondition}
                      </span>
                    ))}
                  </span>
                  <Coverage have={items.length} total={options.waterConditions.length} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <PhotoCredits />
    </>
  );
}

/** ชั้นที่ 3: ข้อมูลตามสถานะน้ำ — สถานะที่ยังไม่มีข้อมูลแสดงปุ่มเพิ่ม */
export function ScenarioTable({
  crop,
  season,
  scenarios,
  options,
  onEdit,
  onDelete,
  onAdd,
}: {
  crop: string;
  season: string;
  scenarios: Scenario[];
  options: ScenarioOptions;
  onEdit: (s: Scenario) => void;
  onDelete: (s: Scenario) => void;
  onAdd: (waterCondition: string) => void;
}) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {options.waterConditions.map((condition) => {
        const sc = scenarios.find(
          (s) => s.crop === crop && s.plantingSeason === season && s.waterCondition === condition,
        );
        if (!sc) {
          return (
            <li key={condition}>
              <button
                type="button"
                onClick={() => onAdd(condition)}
                className="flex h-full min-h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-on-surface-variant hover:border-brand hover:text-brand focus-visible:ring-4 focus-visible:ring-secondary focus-visible:outline-none"
              >
                <span className="material-symbols-outlined text-4xl">add</span>
                <span className="text-base font-bold">เพิ่มข้อมูล{condition}</span>
                <span className="text-sm">ใช้เมื่อ{CONDITION_RANGE[condition]}</span>
              </button>
            </li>
          );
        }
        const style = CONDITION_STYLE[condition];
        return (
          <li
            key={sc.id}
            className={`flex flex-col rounded-xl border-t-4 bg-surface p-5 shadow-xs ${style?.border ?? ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className={`rounded-full px-3 py-1 text-base font-bold ${style?.badge ?? ''}`}>
                {condition}
              </span>
              <span className="text-sm font-semibold text-on-surface-variant">ความเสี่ยง{sc.risk}</span>
            </div>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-base">
              <dt className="text-on-surface-variant">ใช้เมื่อ</dt>
              <dd className="font-semibold">{CONDITION_RANGE[condition]}</dd>
              <dt className="text-on-surface-variant">น้ำแนะนำ</dt>
              <dd className="font-semibold">{sc.waterPerRaiM3.toLocaleString()} ลบ.ม./ไร่</dd>
              <dt className="text-on-surface-variant">ผลผลิตสด</dt>
              <dd className="font-semibold">{sc.freshYield.avgTonsPerRai} ตัน/ไร่</dd>
              <dt className="text-on-surface-variant">แป้ง</dt>
              <dd className="font-semibold">{sc.freshYield.estimatedStarchPercent}%</dd>
              <dt className="text-on-surface-variant">เนื้อหา</dt>
              <dd>
                คำแนะนำ {sc.advice.length} ข้อ · ตารางน้ำ {sc.schedule.length} ระยะ
              </dd>
            </dl>
            {sc.isMockData && (
              <p className="mt-3 rounded-lg bg-warning/10 px-2.5 py-1 text-sm text-warning">
                ข้อมูลจำลอง รอผลจาก DSSAT จริง
              </p>
            )}
            <div className="mt-auto flex gap-2 pt-5">
              <button
                type="button"
                onClick={() => onEdit(sc)}
                aria-label={`แก้ไข ${sc.name}`}
                className="flex-1 cursor-pointer rounded-lg border-2 border-brand px-4 py-2 text-base font-semibold text-brand hover:bg-tint-sky hover:text-brand-hover"
              >
                แก้ไข
              </button>
              <button
                type="button"
                onClick={() => onDelete(sc)}
                aria-label={`ลบ ${sc.name}`}
                className="cursor-pointer rounded-lg px-4 py-2.5 text-base font-semibold text-danger hover:bg-danger/10"
              >
                ลบ
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

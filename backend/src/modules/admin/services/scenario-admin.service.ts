import { randomUUID } from 'crypto';
// จุดเดียวที่ Admin แตะ store ของ Output — ถ้าย้ายไป shared/store แก้แค่ 2 บรรทัดนี้
import { PREDEFINED_SCENARIOS } from '../../../shared/store/scenario.store.js';
import {
  ALL_KNOWN_CROPS,
  SUPPORTED_SEASONS,
  WATER_CONDITIONS,
  type Scenario,
} from '../../../shared/contracts/scenario.contracts.js';
import { AdminError } from '../types/admin.types.js';
import { readData, writeData } from './data-store.js';

const KEY = 'scenarios';
const RISKS = ['ต่ำ', 'ปานกลาง', 'สูง'];

/**
 * ช่วง ratio ต้องตรงกับเกณฑ์ที่ MatchingService ใช้เลือกสถานะน้ำ (1.0 และ 0.6)
 * จึงให้ระบบกำหนดจากสถานะน้ำ ไม่เปิดให้แก้เอง
 */
const RATIO_BY_CONDITION: Record<string, [number, number]> = {
  น้ำเพียงพอ: [1, 99],
  น้ำจำกัด: [0.6, 1],
  พึ่งพาน้ำฝน: [0, 0.6],
};

export type ScenarioInput = Omit<Scenario, 'id' | 'minRatio' | 'maxRatio'>;

const isNum = (v: unknown, min = 0) =>
  typeof v === 'number' && Number.isFinite(v) && v >= min;
const isStr = (v: unknown, max = 500) =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= max;

function validate(body: unknown): ScenarioInput {
  const b = (body ?? {}) as Record<string, any>;
  const y = (b.freshYield ?? {}) as Record<string, unknown>;
  const errors: string[] = [];

  if (!isStr(b.name, 200)) errors.push('กรุณากรอกชื่อข้อมูล');
  if (!(ALL_KNOWN_CROPS as readonly string[]).includes(b.crop)) {
    errors.push(`พันธุ์ต้องเป็น ${ALL_KNOWN_CROPS.join(' / ')}`);
  }
  if (!(SUPPORTED_SEASONS as readonly string[]).includes(b.plantingSeason)) {
    errors.push(`ฤดูปลูกต้องเป็น ${SUPPORTED_SEASONS.join(' / ')}`);
  }
  if (!(WATER_CONDITIONS as readonly string[]).includes(b.waterCondition)) {
    errors.push(`สถานะน้ำต้องเป็น ${WATER_CONDITIONS.join(' / ')}`);
  }
  if (!RISKS.includes(b.risk)) errors.push(`ความเสี่ยงต้องเป็น ${RISKS.join(' / ')}`);
  if (!isNum(b.waterPerRaiM3)) errors.push('น้ำที่จัดสรรต้องเป็นตัวเลขไม่ติดลบ');
  if (!isNum(b.waterRequirementM3) || b.waterRequirementM3 <= 0) {
    errors.push('ความต้องการน้ำของพันธุ์ต้องมากกว่า 0');
  }
  if (!isNum(b.dryYieldKgPerRai)) errors.push('ผลผลิตแห้งต้องเป็นตัวเลขไม่ติดลบ');
  if (!isNum(y.minKgPerRai) || !isNum(y.maxKgPerRai) || !isNum(y.avgTonsPerRai)) {
    errors.push('ผลผลิตสดต้องเป็นตัวเลขไม่ติดลบ');
  } else if (Number(y.minKgPerRai) > Number(y.maxKgPerRai)) {
    errors.push('ผลผลิตสดต่ำสุดต้องไม่มากกว่าสูงสุด');
  }
  if (
    !isNum(y.estimatedStarchPercent) ||
    Number(y.estimatedStarchPercent) > 100
  ) {
    errors.push('เปอร์เซ็นต์แป้งต้องอยู่ระหว่าง 0–100');
  }
  if (
    !Array.isArray(b.advice) ||
    b.advice.length > 30 ||
    !b.advice.every((a: unknown) => isStr(a))
  ) {
    errors.push('คำแนะนำต้องเป็นรายการข้อความ ไม่เกิน 30 ข้อ');
  }
  if (
    !Array.isArray(b.schedule) ||
    b.schedule.length === 0 ||
    b.schedule.length > 20 ||
    !b.schedule.every(
      (p: Record<string, unknown>) =>
        p &&
        isStr(p.phase, 200) &&
        typeof p.management === 'string' &&
        typeof p.freq === 'string' &&
        isNum(p.amountPerRaiM3),
    )
  ) {
    errors.push('ตารางการให้น้ำต้องมี 1–20 ระยะ และกรอกชื่อระยะกับปริมาณน้ำให้ครบ');
  }
  if (b.note != null && typeof b.note !== 'string') errors.push('หมายเหตุต้องเป็นข้อความ');
  if (errors.length) throw new AdminError(400, errors[0], errors);

  return {
    name: b.name.trim(),
    crop: b.crop,
    plantingSeason: b.plantingSeason,
    waterCondition: b.waterCondition,
    waterPerRaiM3: b.waterPerRaiM3,
    waterRequirementM3: b.waterRequirementM3,
    dryYieldKgPerRai: b.dryYieldKgPerRai,
    freshYield: {
      minKgPerRai: b.freshYield.minKgPerRai,
      maxKgPerRai: b.freshYield.maxKgPerRai,
      avgTonsPerRai: b.freshYield.avgTonsPerRai,
      estimatedStarchPercent: b.freshYield.estimatedStarchPercent,
    },
    risk: b.risk,
    advice: b.advice.map((a: string) => a.trim()),
    schedule: b.schedule.map((p: Scenario['schedule'][number]) => ({
      phase: p.phase.trim(),
      management: p.management.trim(),
      freq: p.freq.trim(),
      amountPerRaiM3: p.amountPerRaiM3,
    })),
    isMockData: b.isMockData !== false,
    note: b.note?.trim() || undefined,
  };
}

function assertUnique(s: ScenarioInput, exceptId?: string) {
  // MatchingService หยิบชุดแรกที่สถานะน้ำตรงกัน ชุดที่ซ้ำจึงจะไม่มีวันถูกใช้
  const dup = PREDEFINED_SCENARIOS.find(
    (o) =>
      o.id !== exceptId &&
      o.crop === s.crop &&
      o.plantingSeason === s.plantingSeason &&
      o.waterCondition === s.waterCondition,
  );
  if (dup) {
    throw new AdminError(
      409,
      `มีข้อมูล ${s.crop} ${s.plantingSeason} ${s.waterCondition} อยู่แล้ว (${dup.name})`,
    );
  }
}

/** MatchingService ใช้ waterRequirementM3 ของชุดแรก ทุกชุดในพันธุ์+ฤดูเดียวกันจึงต้องเท่ากัน */
const syncRequirement = (list: Scenario[], s: ScenarioInput) =>
  list.map((o) =>
    o.crop === s.crop && o.plantingSeason === s.plantingSeason
      ? { ...o, waterRequirementM3: s.waterRequirementM3 }
      : o,
  );

const withRatios = (s: ScenarioInput) => {
  const [minRatio, maxRatio] = RATIO_BY_CONDITION[s.waterCondition];
  return { ...s, minRatio, maxRatio };
};

// โหลดข้อมูลที่เคยแก้กลับเข้า store ของ Output (แก้ array ตัวเดิม Output จึงเห็นทันที)
// await ตอน import: เซิร์ฟเวอร์จะเริ่มรับ request หลังโหลดข้อมูลเสร็จเท่านั้น
const saved = await readData<Scenario[] | null>(KEY, null);
if (saved) PREDEFINED_SCENARIOS.splice(0, PREDEFINED_SCENARIOS.length, ...saved);

/** บันทึกก่อนแล้วค่อยเปลี่ยนข้อมูลที่ Output อ่าน — บันทึกไม่สำเร็จ ข้อมูลในระบบจะไม่เพี้ยน */
async function commit(next: Scenario[]) {
  await writeData(KEY, next);
  PREDEFINED_SCENARIOS.splice(0, PREDEFINED_SCENARIOS.length, ...next);
}

export const ScenarioAdminService = {
  list: () => [...PREDEFINED_SCENARIOS],

  options: () => ({
    crops: ALL_KNOWN_CROPS,
    seasons: SUPPORTED_SEASONS,
    waterConditions: WATER_CONDITIONS,
  }),

  async create(body: unknown): Promise<Scenario> {
    const input = validate(body);
    assertUnique(input);
    const scenario = {
      id: `SCN-${randomUUID().slice(0, 8)}`,
      ...withRatios(input),
    } as Scenario;
    await commit(syncRequirement([...PREDEFINED_SCENARIOS, scenario], input));
    return scenario;
  },

  async update(id: string, body: unknown): Promise<Scenario> {
    const index = PREDEFINED_SCENARIOS.findIndex((s) => s.id === id);
    if (index === -1) throw new AdminError(404, 'ไม่พบข้อมูลชุดนี้');
    const input = validate(body);
    assertUnique(input, id);
    const scenario = { id, ...withRatios(input) } as Scenario;
    const next = [...PREDEFINED_SCENARIOS];
    next[index] = scenario;
    await commit(syncRequirement(next, input));
    return scenario;
  },

  async remove(id: string): Promise<void> {
    if (!PREDEFINED_SCENARIOS.some((s) => s.id === id)) {
      throw new AdminError(404, 'ไม่พบข้อมูลชุดนี้');
    }
    await commit(PREDEFINED_SCENARIOS.filter((s) => s.id !== id));
  },
};

/**
 * WarMa Output Module — Data Contracts & Types (TypeScript)
 * 
 * ข้อมูลจำลองพืชอ้างอิงจาก:
 * 1. docs/web-app-projects-topics-2026 (1).pdf (รวมถึง Handwritten Notes ของอาจารย์)
 * 2. docs/EN813701-2026-wad-WAD26-1 (2).pdf (UI Mockups & Scenarios)
 * 3. docs/WAD26-01.md (Requirements Checkpoint & Finding 1-4)
 */

// 3 สายพันธุ์หลักที่เลือกตามบันทึกลายมือของอาจารย์ (วงกลม + เครื่องหมาย * ใน Fishbone diagram)
export const SUPPORTED_CROPS = [
  'เกษตรศาสตร์ 50',
  'ระยอง 9',
  'CMR38-125-77',
] as const;

// สายพันธุ์ที่ระบุในเอกสารแต่ขีดฆ่า/ยังไม่ Calibrate (สำหรับทดสอบ Boundary / นอกเหนือชุดข้อมูล)
export const UNCALIBRATED_CROPS = [
  'ห้วยบง 90',
  'ระยอง 72',
] as const;

export const ALL_KNOWN_CROPS = [
  ...SUPPORTED_CROPS,
  ...UNCALIBRATED_CROPS,
] as const;

export type SupportedCrop = (typeof SUPPORTED_CROPS)[number];
export type KnownCrop = (typeof ALL_KNOWN_CROPS)[number];

// ฤดูปลูกหลักที่รองรับในแบบจำลอง
export const SUPPORTED_SEASONS = [
  'ต้นฤดูฝน',
  'ปลายฤดูฝน',
] as const;

export type SupportedSeason = (typeof SUPPORTED_SEASONS)[number];

// สภาพการจัดการน้ำ
export const WATER_CONDITIONS = [
  'น้ำเพียงพอ',
  'น้ำจำกัด',
  'พึ่งพาน้ำฝน',
] as const;

export type WaterCondition = (typeof WATER_CONDITIONS)[number];

// ระดับความเสี่ยง
export type RiskLevel = 'ต่ำ' | 'ปานกลาง' | 'สูง';

/**
 * โครงสร้างตารางการให้น้ำรายระยะการเจริญเติบโต (Irrigation Phase Schedule)
 */
export interface IrrigationPhase {
  phase: string;          // เช่น 'ระยะงอกและตั้งตัว (1–30 วัน)'
  management: string;     // เช่น 'ให้น้ำชุ่มชื้นกระตุ้นราก'
  freq: string;           // เช่น 'ทุก 7–10 วัน'
  amountPerRaiM3: number; // ปริมาณน้ำ ลบ.ม./ไร่ ในระยะนั้น
}

/**
 * ข้อมูลผลผลิตสดคาดการณ์ (Fresh Yield Prediction)
 * หมายเหตุ: แบบจำลอง DSSAT ดั้งเดิมให้ผลลัพธ์เป็นน้ำหนักแห้ง (Dry Weight)
 * ระบบ Output ทำการแปลงเป็นน้ำหนักสด (Fresh Weight) เพื่อให้เกษตรกรนำไปใช้ได้จริง
 */
export interface FreshYieldEstimate {
  minKgPerRai: number;       // ผลผลิตสดขั้นต่ำ (กก./ไร่)
  maxKgPerRai: number;       // ผลผลิตสดขั้นสูง (กก./ไร่)
  avgTonsPerRai: number;     // ผลผลิตสดเฉลี่ย (ตัน/ไร่)
  estimatedStarchPercent: number; // เปอร์เซ็นต์แป้งคาดการณ์ (%)
}

/**
 * โครงสร้างชุดข้อมูลสถานการณ์จำลอง (Scenario Model)
 */
export interface Scenario {
  id: string;                    // รหัส Scenario เช่น 'SCN-KU50-EARLY-SUFFICIENT'
  name: string;                  // ชื่อสถานการณ์ เช่น 'มันสำปะหลังเกษตรศาสตร์ 50 ต้นฤดูฝน น้ำเพียงพอ'
  crop: SupportedCrop;           // สายพันธุ์
  plantingSeason: SupportedSeason; // ฤดูปลูก
  waterCondition: WaterCondition;// สถานะน้ำ
  waterPerRaiM3: number;         // ปริมาณน้ำที่จัดสรรตลอดฤดู (ลบ.ม./ไร่)
  waterRequirementM3: number;    // ความต้องการน้ำอ้างอิงของสายพันธุ์ (ลบ.ม./ไร่)
  minRatio: number;              // อัตราส่วนน้ำขั้นต่ำ (น้ำที่มี ÷ ความต้องการ)
  maxRatio: number;              // อัตราส่วนน้ำสูงสุด
  dryYieldKgPerRai: number;      // ผลผลิตน้ำหนักแห้งอ้างอิงจาก DSSAT (กก./ไร่)
  freshYield: FreshYieldEstimate;// ผลผลิตน้ำหนักสดที่คำนวณได้
  risk: RiskLevel;               // ระดับความเสี่ยง
  advice: string[];              // คำแนะนำการปฏิบัติ
  schedule: IrrigationPhase[];   // ตารางการให้น้ำรายระยะ
  isMockData: boolean;           // ระบุว่าเป็นข้อมูลจำลองสำหรับทดสอบ (รอ Data จริงจาก DSSAT)
  note?: string;                 // ข้อสังเกตเพิ่มเติม (TODO/Clarification)
}

/**
 * DTO สำหรับข้อมูลนำเข้าของผู้ใช้ (MatchInput DTO)
 * ส่งมาจากโมดูล Input หรือฟอร์มกรอกข้อมูล
 * รองรับทั้งชื่อตัวแปรทางการและ alias (เช่น crop/variety, areaRai/area, waterAvailableM3/waterAvailable)
 */
export interface MatchInputDto {
  crop?: string;                  // สายพันธุ์ที่เลือก (Primary)
  variety?: string;               // Alias สำหรับ crop
  plantingSeason?: string;        // ฤดูปลูก (Primary: 'ต้นฤดูฝน' | 'ปลายฤดูฝน')
  season?: string;                // Alias สำหรับ plantingSeason
  waterAvailableM3?: number;      // ปริมาณน้ำต้นทุนรวมที่มีในแปลง (ลบ.ม.)
  waterAvailable?: number;        // Alias สำหรับ waterAvailableM3
  areaRai?: number;               // ขนาดพื้นที่เพาะปลูก (ไร่)
  area?: number;                  // Alias สำหรับ areaRai
  soilSeries?: string;            // ชุดดิน (Optional)
  waterCondition?: WaterCondition;// ระดับน้ำ (Optional ถ้าต้องการระบุเจาะจง)
}

/**
 * สรุปผลการประเมินผลผลิตระดับแปลง (Farm Yield Summary)
 * รวมถึงการแปลงผลผลิตสดจากผลผลิตแห้ง DSSAT
 */
export interface FarmYieldSummary {
  freshYieldAvgTonsPerRai: number;        // ผลผลิตสดเฉลี่ยต่อไร่ (ตัน/ไร่)
  freshYieldMinKgPerRai: number;          // ผลผลิตสดขั้นต่ำ (กก./ไร่)
  freshYieldMaxKgPerRai: number;          // ผลผลิตสดขั้นสูง (กก./ไร่)
  totalFarmFreshYieldTons: number;        // ผลผลิตสดรวมทั้งแปลง (ตัน)
  totalFarmFreshYieldKg: number;          // ผลผลิตสดรวมทั้งแปลง (กก.)
  dryYieldPerRaiKg: number;               // ผลผลิตแห้ง DSSAT ต่อไร่ (กก./ไร่)
  totalFarmDryYieldKg: number;            // ผลผลิตแห้งรวมทั้งแปลง (กก.)
  theoreticalFreshYieldPerRaiKg: number;  // ผลผลิตสดทางทฤษฎีตามสูตรสัดส่วนความชื้น (กก./ไร่)
  estimatedStarchPercent: number;         // เปอร์เซ็นต์แป้งคาดการณ์ (%)
  totalStarchWeightKg: number;            // ปริมาณแป้งรวมทั้งแปลง (กก.)
  conversionFormulaUsed: string;          // สูตรการแปลงที่ใช้
  isMockConversion: boolean;              // สถานะข้อมูลจำลอง (รอ Calibrated DSSAT Data)
  note: string;                           // ข้อความบันทึก
}

/**
 * สรุปการจัดสรรน้ำ (Water Allocation Summary)
 */
export interface WaterAllocationSummary {
  waterAvailableTotalM3: number;          // น้ำต้นทุนรวมของผู้ใช้ (ลบ.ม.)
  waterPerRaiM3: number;                  // น้ำที่มีเฉลี่ยต่อไร่ (ลบ.ม./ไร่)
  scenarioRecommendedPerRaiM3: number;    // น้ำที่แนะนำตาม Scenario ต่อไร่ (ลบ.ม./ไร่)
  totalWaterAllocatedFarmM3: number;      // น้ำที่ควรจัดสรรรวมทั้งแปลง (ลบ.ม.)
  waterConditionDetermined: WaterCondition;// สถานะน้ำที่ระบบจัดกลุ่มให้
  waterRequirementM3: number;             // ความต้องการน้ำอ้างอิงของสายพันธุ์ (ลบ.ม./ไร่)
  waterRatio: number;                     // อัตราส่วนน้ำที่มี ÷ ความต้องการ
  waterSufficiencyPercent: number;        // เปอร์เซ็นต์ความเพียงพอ (%)
}

/**
 * DTO สำหรับผลลัพธ์การจับคู่ Scenario (MatchOutput DTO)
 * ส่งกลับไปแสดงผลบน Frontend และส่งต่อให้โมดูล Profit
 */
export interface MatchOutputDto {
  success: boolean;
  matchedScenario: Scenario | null;
  confidence: 'exact' | 'nearest' | 'out_of_bounds';
  inputSummary: {
    crop: string;
    plantingSeason: string;
    waterAvailableM3: number;
    areaRai: number;
    calculatedWaterPerRaiM3: number;
    waterRatio: number;
  };
  totalWaterAllocatedM3: number; // น้ำที่ควรจัดสรรรวมทั้งแปลง
  waterAllocation?: WaterAllocationSummary;
  farmYieldSummary?: FarmYieldSummary;
  comparisonCandidates: Scenario[]; // ชุด Scenario สำหรับนำไปเปรียบเทียบทางเลือก
  message?: string;              // ข้อความอธิบายหรือแจ้งเตือน
  error?: string;                // รหัส Error (กรณีไม่สำเร็จ)
  details?: string[];            // รายละเอียด Validation Errors (ถ้ามี)
}

import {
  MatchInputDto,
  MatchOutputDto,
  Scenario,
} from '../types/scenario.types';

export const MOCK_SCENARIOS_STORE: Scenario[] = [
  // KU50 - Early Rainy
  {
    id: 'SCN-KU50-EARLY-LIMITED',
    name: 'มันสำปะหลังเกษตรศาสตร์ 50 ต้นฤดูฝน (น้ำจำกัด / จัดการน้ำเสริม)',
    crop: 'เกษตรศาสตร์ 50',
    plantingSeason: 'ต้นฤดูฝน',
    waterCondition: 'น้ำจำกัด',
    waterPerRaiM3: 420,
    waterRequirementM3: 650,
    minRatio: 0.6,
    maxRatio: 1.0,
    dryYieldKgPerRai: 1720,
    freshYield: {
      minKgPerRai: 4500,
      maxKgPerRai: 5200,
      avgTonsPerRai: 4.8,
      estimatedStarchPercent: 24.5,
    },
    risk: 'ปานกลาง',
    advice: [
      'เน้นการให้น้ำช่วงตั้งตัว 30 วันแรก เพื่อให้อัตรารอดตายสูง',
      'ระยะ 31–90 วัน ให้น้ำเสริมเฉพาะช่วงฝนทิ้งช่วง',
      'คลุมแปลงด้วยเศษซากพืชเพื่อรักษาความชื้นในดิน',
    ],
    schedule: [
      { phase: 'ระยะงอกและตั้งตัว (1–30 วัน)', management: 'ให้น้ำชุ่มชื้นกระตุ้นราก', freq: 'ทุก 7–10 วัน', amountPerRaiM3: 56 },
      { phase: 'ระยะสร้างลำต้นและใบ (31–90 วัน)', management: 'ให้น้ำตามรอบเสริมน้ำฝน', freq: 'ทุก 10–14 วัน', amountPerRaiM3: 64 },
      { phase: 'ระยะสะสมแป้งขยายหัว (91 วันขึ้นไป)', management: 'อาศัยน้ำฝนธรรมชาติ ให้น้ำเฉพาะช่วงแล้งจัด', freq: 'ตามสภาพฝน', amountPerRaiM3: 300 },
      { phase: 'ก่อนเก็บเกี่ยว', management: 'งดให้น้ำก่อนขุด 1 เดือน เพื่อดึงเปอร์เซ็นต์แป้ง', freq: 'งดให้น้ำ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'Reference value from WAD26-01 Presentation Slide 10-11',
  },
  {
    id: 'SCN-KU50-EARLY-SUFFICIENT',
    name: 'มันสำปะหลังเกษตรศาสตร์ 50 ต้นฤดูฝน (น้ำเพียงพอ)',
    crop: 'เกษตรศาสตร์ 50',
    plantingSeason: 'ต้นฤดูฝน',
    waterCondition: 'น้ำเพียงพอ',
    waterPerRaiM3: 650,
    waterRequirementM3: 650,
    minRatio: 1.0,
    maxRatio: 99.0,
    dryYieldKgPerRai: 1950,
    freshYield: {
      minKgPerRai: 5000,
      maxKgPerRai: 5800,
      avgTonsPerRai: 5.4,
      estimatedStarchPercent: 26.0,
    },
    risk: 'ต่ำ',
    advice: [
      'ให้น้ำหยดตามรอบสม่ำเสมอโดยเฉพาะช่วงตั้งตัว 2 เดือนแรก',
      'ลดการให้น้ำเมื่อมีฝนตกชุกเพื่อป้องกันน้ำขังในแปลง',
      'งดการให้น้ำ 1–2 เดือนก่อนเก็บเกี่ยวเพื่อเพิ่มเปอร์เซ็นต์แป้ง',
    ],
    schedule: [
      { phase: 'ระยะงอกและตั้งตัว (1–30 วัน)', management: 'ให้น้ำชุ่มชื้นกระตุ้นรากสม่ำเสมอ', freq: 'ทุก 5–7 วัน', amountPerRaiM3: 80 },
      { phase: 'ระยะสร้างลำต้นและใบ (31–90 วัน)', management: 'ให้น้ำเต็มที่เสริมน้ำฝน', freq: 'ทุก 7–10 วัน', amountPerRaiM3: 250 },
      { phase: 'ระยะสะสมแป้งขยายหัว (91–240 วัน)', management: 'ให้น้ำหยดคุมความชื้นปานกลาง', freq: 'ทุก 10–14 วัน', amountPerRaiM3: 320 },
      { phase: 'ก่อนเก็บเกี่ยว', management: 'งดให้น้ำเด็ดขาดก่อนขุด', freq: 'งดให้น้ำ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'Optimal irrigation benchmark',
  },
  {
    id: 'SCN-KU50-EARLY-RAINFED',
    name: 'มันสำปะหลังเกษตรศาสตร์ 50 ต้นฤดูฝน (พึ่งพาน้ำฝนธรรมชาติ)',
    crop: 'เกษตรศาสตร์ 50',
    plantingSeason: 'ต้นฤดูฝน',
    waterCondition: 'พึ่งพาน้ำฝน',
    waterPerRaiM3: 280,
    waterRequirementM3: 650,
    minRatio: 0.0,
    maxRatio: 0.6,
    dryYieldKgPerRai: 1150,
    freshYield: {
      minKgPerRai: 2800,
      maxKgPerRai: 3500,
      avgTonsPerRai: 3.2,
      estimatedStarchPercent: 23.0,
    },
    risk: 'สูง',
    advice: [
      'อาศัยน้ำฝนธรรมชาติเป็นหลัก เสี่ยงต่อฝนทิ้งช่วงในเดือนมิถุนายน–กรกฎาคม',
      'ควรปักท่อนพันธุ์ให้ลึกขึ้นเล็กน้อย และคลุมดินเพื่อลดการระเหย',
    ],
    schedule: [
      { phase: 'ตลอดฤดูปลูก', management: 'อาศัยความชื้นในดินและน้ำฝนธรรมชาติ', freq: 'ตามสภาพฝน', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'Rainfed baseline benchmark',
  },

  // Rayong 9 - Early Rainy
  {
    id: 'SCN-R9-EARLY-SUFFICIENT',
    name: 'มันสำปะหลังระยอง 9 ต้นฤดูฝน (น้ำเพียงพอ)',
    crop: 'ระยอง 9',
    plantingSeason: 'ต้นฤดูฝน',
    waterCondition: 'น้ำเพียงพอ',
    waterPerRaiM3: 620,
    waterRequirementM3: 620,
    minRatio: 1.0,
    maxRatio: 99.0,
    dryYieldKgPerRai: 1900,
    freshYield: {
      minKgPerRai: 4800,
      maxKgPerRai: 5600,
      avgTonsPerRai: 5.2,
      estimatedStarchPercent: 28.5,
    },
    risk: 'ต่ำ',
    advice: [
      'ระยอง 9 โดดเด่นเรื่องเปอร์เซ็นต์แป้งสูง เหมาะสำหรับส่งโรงงานแป้งโดยเฉพาะ',
      'ระวังอย่าให้น้ำขังแฉะในแปลง เพราะระยอง 9 อ่อนแอกว่าต่อโรคหัวเน่า',
    ],
    schedule: [
      { phase: 'ระยะงอกและตั้งตัว (1–30 วัน)', management: 'ให้น้ำพอชื้น ระวังน้ำขัง', freq: 'ทุก 7 วัน', amountPerRaiM3: 70 },
      { phase: 'ระยะสร้างลำต้น (31–90 วัน)', management: 'ให้น้ำตามรอบปกติ', freq: 'ทุก 8–10 วัน', amountPerRaiM3: 240 },
      { phase: 'ระยะสะสมแป้ง (91–240 วัน)', management: 'ให้น้ำสม่ำเสมอเพื่อขยายขนาดหัว', freq: 'ทุก 12–14 วัน', amountPerRaiM3: 310 },
      { phase: 'ก่อนเก็บเกี่ยว', management: 'งดให้น้ำเด็ดขาดล่วงหน้า 2 เดือน เพื่อดึงแป้ง', freq: 'งดให้น้ำ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
  },
];

/**
 * Default mock output for initial render
 */
export const DEFAULT_MOCK_OUTPUT: MatchOutputDto = {
  success: true,
  matchedScenario: MOCK_SCENARIOS_STORE[0],
  confidence: 'exact',
  inputSummary: {
    crop: 'เกษตรศาสตร์ 50',
    plantingSeason: 'ต้นฤดูฝน',
    waterAvailableM3: 5000,
    areaRai: 10,
    calculatedWaterPerRaiM3: 500,
    waterRatio: 0.77,
  },
  totalWaterAllocatedM3: 4200,
  waterAllocation: {
    waterAvailableTotalM3: 5000,
    waterPerRaiM3: 500,
    scenarioRecommendedPerRaiM3: 420,
    totalWaterAllocatedFarmM3: 4200,
    waterConditionDetermined: 'น้ำจำกัด',
    waterRequirementM3: 650,
    waterRatio: 0.77,
    waterSufficiencyPercent: 77,
  },
  farmYieldSummary: {
    freshYieldAvgTonsPerRai: 4.8,
    freshYieldMinKgPerRai: 4500,
    freshYieldMaxKgPerRai: 5200,
    totalFarmFreshYieldTons: 48,
    totalFarmFreshYieldKg: 48000,
    dryYieldPerRaiKg: 1720,
    totalFarmDryYieldKg: 17200,
    theoreticalFreshYieldPerRaiKg: 4778,
    estimatedStarchPercent: 24.5,
    totalStarchWeightKg: 11760,
    conversionFormulaUsed: 'Y_fresh = W_dry / (1 - MoistureContent) [Moisture = 64%]',
    isMockConversion: true,
    note: 'Mock preview based on project design specification.',
  },
  comparisonCandidates: [
    MOCK_SCENARIOS_STORE[1], // Sufficient
    MOCK_SCENARIOS_STORE[2], // Rainfed
  ],
  message: 'Matched scenario: มันสำปะหลังเกษตรศาสตร์ 50 ต้นฤดูฝน (น้ำจำกัด / จัดการน้ำเสริม)',
};

/**
 * Mock generator for client-side testing in Phase 4 (no backend connected)
 */
export function generateMockOutputFromInput(input: MatchInputDto): MatchOutputDto {
  const crop = input.crop || 'เกษตรศาสตร์ 50';
  const plantingSeason = input.plantingSeason || 'ต้นฤดูฝน';
  const areaRai = Number(input.areaRai) || 10;
  const waterAvailableM3 = Number(input.waterAvailableM3) || 5000;

  const calculatedWaterPerRaiM3 = Math.round((waterAvailableM3 / areaRai) * 100) / 100;
  const waterRequirementM3 = 650;
  const waterRatio = Math.round((calculatedWaterPerRaiM3 / waterRequirementM3) * 100) / 100;

  let condition: 'น้ำเพียงพอ' | 'น้ำจำกัด' | 'พึ่งพาน้ำฝน';
  if (waterRatio >= 1.0) {
    condition = 'น้ำเพียงพอ';
  } else if (waterRatio >= 0.6) {
    condition = 'น้ำจำกัด';
  } else {
    condition = 'พึ่งพาน้ำฝน';
  }

  // Find or fallback to primary mock
  const matched =
    MOCK_SCENARIOS_STORE.find((s) => s.waterCondition === condition) ||
    MOCK_SCENARIOS_STORE[0];

  const avgTons = matched.freshYield.avgTonsPerRai;
  const totalFarmFreshYieldTons = Math.round(avgTons * areaRai * 100) / 100;
  const totalFarmFreshYieldKg = Math.round(totalFarmFreshYieldTons * 1000);
  const totalWaterAllocatedFarmM3 = Math.round(matched.waterPerRaiM3 * areaRai);

  return {
    success: true,
    matchedScenario: {
      ...matched,
      crop: crop as any,
      plantingSeason: plantingSeason as any,
    },
    confidence: 'exact',
    inputSummary: {
      crop,
      plantingSeason,
      waterAvailableM3,
      areaRai,
      calculatedWaterPerRaiM3,
      waterRatio,
    },
    totalWaterAllocatedM3: totalWaterAllocatedFarmM3,
    waterAllocation: {
      waterAvailableTotalM3: waterAvailableM3,
      waterPerRaiM3: calculatedWaterPerRaiM3,
      scenarioRecommendedPerRaiM3: matched.waterPerRaiM3,
      totalWaterAllocatedFarmM3,
      waterConditionDetermined: condition,
      waterRequirementM3,
      waterRatio,
      waterSufficiencyPercent: Math.min(Math.round(waterRatio * 100), 100),
    },
    farmYieldSummary: {
      freshYieldAvgTonsPerRai: avgTons,
      freshYieldMinKgPerRai: matched.freshYield.minKgPerRai,
      freshYieldMaxKgPerRai: matched.freshYield.maxKgPerRai,
      totalFarmFreshYieldTons,
      totalFarmFreshYieldKg,
      dryYieldPerRaiKg: matched.dryYieldKgPerRai,
      totalFarmDryYieldKg: Math.round(matched.dryYieldKgPerRai * areaRai),
      theoreticalFreshYieldPerRaiKg: Math.round(matched.dryYieldKgPerRai / (1 - 0.64)),
      estimatedStarchPercent: matched.freshYield.estimatedStarchPercent,
      totalStarchWeightKg: Math.round(totalFarmFreshYieldKg * (matched.freshYield.estimatedStarchPercent / 100)),
      conversionFormulaUsed: 'Y_fresh = W_dry / (1 - MoistureContent) [Moisture = 64%]',
      isMockConversion: true,
      note: 'Mock output generated for Phase 4 UI review (Backend offline).',
    },
    comparisonCandidates: MOCK_SCENARIOS_STORE.filter((s) => s.id !== matched.id),
    message: `Matched scenario: ${matched.name}`,
  };
}

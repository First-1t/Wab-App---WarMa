/**
 * WarMa Output Module — Shared Data Contracts & Types (Frontend)
 */

export const SUPPORTED_CROPS = [
  'เกษตรศาสตร์ 50',
  'ระยอง 9',
  'CMR38-125-77',
] as const;

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

export const SUPPORTED_SEASONS = [
  'ต้นฤดูฝน',
  'ปลายฤดูฝน',
] as const;

export type SupportedSeason = (typeof SUPPORTED_SEASONS)[number];

export const WATER_CONDITIONS = [
  'น้ำเพียงพอ',
  'น้ำจำกัด',
  'พึ่งพาน้ำฝน',
] as const;

export type WaterCondition = (typeof WATER_CONDITIONS)[number];

export type RiskLevel = 'ต่ำ' | 'ปานกลาง' | 'สูง';

export interface IrrigationPhase {
  phase: string;
  management: string;
  freq: string;
  amountPerRaiM3: number;
}

export interface FreshYieldEstimate {
  minKgPerRai: number;
  maxKgPerRai: number;
  avgTonsPerRai: number;
  estimatedStarchPercent: number;
}

export interface Scenario {
  id: string;
  name: string;
  crop: SupportedCrop;
  plantingSeason: SupportedSeason;
  waterCondition: WaterCondition;
  waterPerRaiM3: number;
  waterRequirementM3: number;
  minRatio: number;
  maxRatio: number;
  dryYieldKgPerRai: number;
  freshYield: FreshYieldEstimate;
  risk: RiskLevel;
  advice: string[];
  schedule: IrrigationPhase[];
  isMockData: boolean;
  note?: string;
}

export interface MatchInputDto {
  crop?: string;
  variety?: string;
  plantingSeason?: string;
  season?: string;
  waterAvailableM3?: number;
  waterAvailable?: number;
  areaRai?: number;
  area?: number;
  soilSeries?: string;
  waterCondition?: WaterCondition;
}

export interface FarmYieldSummary {
  freshYieldAvgTonsPerRai: number;
  freshYieldMinKgPerRai: number;
  freshYieldMaxKgPerRai: number;
  totalFarmFreshYieldTons: number;
  totalFarmFreshYieldKg: number;
  dryYieldPerRaiKg: number;
  totalFarmDryYieldKg: number;
  theoreticalFreshYieldPerRaiKg: number;
  estimatedStarchPercent: number;
  totalStarchWeightKg: number;
  conversionFormulaUsed: string;
  isMockConversion: boolean;
  note: string;
}

export interface WaterAllocationSummary {
  waterAvailableTotalM3: number;
  waterPerRaiM3: number;
  scenarioRecommendedPerRaiM3: number;
  totalWaterAllocatedFarmM3: number;
  waterConditionDetermined: WaterCondition;
  waterRequirementM3: number;
  waterRatio: number;
  waterSufficiencyPercent: number;
}

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
  totalWaterAllocatedM3: number;
  waterAllocation?: WaterAllocationSummary;
  farmYieldSummary?: FarmYieldSummary;
  comparisonCandidates: Scenario[];
  message?: string;
  error?: string;
  details?: string[];
}


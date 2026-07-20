export interface SchedulePhase {
  phase: string;
  freq: string;
  amount: number;
}

export class ScenarioDto {
  name: string;
  crop: string;
  season: string;
  level: string;
  waterPerRai: number;
  minRatio: number;
  maxRatio: number;
  expectedYield: string;
  risk: string;
  advice: string[];
  schedule: SchedulePhase[];
}

export class MatchRequestDto {
  crop: string;
  season: string;
  water: number; // ปริมาณน้ำต้นทุน (ลบ.ม.)
  area: number; // ขนาดพื้นที่ (ไร่)
}

export interface SchedulePhase {
  phase: string;
  freq: string;
  amount: number;
}

export interface Scenario {
  id: string;
  name: string;
  crop: string;
  season: string;
  level: "เพียงพอ" | "จำกัด" | "ขาดแคลน" | string;
  waterPerRai: number;
  minRatio: number;
  maxRatio: number;
  expectedYield: string;
  risk: string;
  advice: string[];
  schedule: SchedulePhase[];
}

export type ScenarioInput = Omit<Scenario, "id">;

export interface MatchInput {
  crop: string;
  season: string;
  water: number;
  area: number;
}

export interface MatchResult {
  input: MatchInput & { waterPerRai: number };
  ratio: number;
  matched: Scenario;
  totalAllocation: number;
  candidates: Scenario[];
}

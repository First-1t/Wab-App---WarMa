import {
  MatchInputDto,
  MatchOutputDto,
  Scenario,
  FarmYieldSummary,
  WaterAllocationSummary,
} from '../../../shared/contracts/scenario.contracts.js';

export interface OutputMatchPayload extends MatchInputDto {
  timestamp?: string;
}

export interface OutputMatchResponse extends MatchOutputDto {
  executionTimeMs?: number;
}

export type {
  Scenario,
  FarmYieldSummary,
  WaterAllocationSummary,
};

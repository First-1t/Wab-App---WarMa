import { ScenarioStore } from '../store/scenario.store.js';
import {
  MatchOutputDto,
  Scenario,
  WaterCondition,
} from '../types/scenario.types.js';
import { ValidatedMatchInput } from './validation.service.js';
import { YieldService } from './yield.service.js';

export interface MatchEngineResult {
  statusCode: number;
  output: MatchOutputDto;
}

export class MatchingService {
  /**
   * Core Scenario Matching Engine
   * 
   * Flow:
   * 1. Calculate waterPerRai = waterAvailable / areaRai
   * 2. Determine water condition (น้ำเพียงพอ / น้ำจำกัด / พึ่งพาน้ำฝน) based on water ratio
   * 3. Look up matching scenario from ScenarioStore
   * 4. If out of bounds, fail explicitly (Do not extrapolate or guess)
   * 5. If found, calculate farm-level fresh yield, water allocation, and extract comparison scenarios
   */
  static match(input: ValidatedMatchInput): MatchEngineResult {
    const { crop, plantingSeason, waterAvailableM3, areaRai } = input;

    // Step 1: Calculate water per rai
    const calculatedWaterPerRaiM3 = Math.round((waterAvailableM3 / areaRai) * 100) / 100;

    // Retrieve baseline scenarios for this crop and planting season
    const candidateScenarios = ScenarioStore.findScenarios({
      crop,
      plantingSeason,
    });

    // Step 2: Boundary check — if crop/season combination has no data in store
    if (candidateScenarios.length === 0) {
      return {
        statusCode: 404,
        output: {
          success: false,
          error: 'SCENARIO_NOT_FOUND',
          confidence: 'out_of_bounds',
          matchedScenario: null,
          inputSummary: {
            crop,
            plantingSeason,
            waterAvailableM3,
            areaRai,
            calculatedWaterPerRaiM3,
            waterRatio: 0,
          },
          totalWaterAllocatedM3: 0,
          comparisonCandidates: [],
          message: `No matching scenario found for cultivar '${crop}' in season '${plantingSeason}'. System cannot extrapolate beyond calibrated DSSAT scenarios.`,
        },
      };
    }

    // Step 3: Determine Water Condition
    // Benchmark requirement from the base scenario of this crop + season
    const waterRequirementM3 = candidateScenarios[0].waterRequirementM3;
    const waterRatio = Math.round((calculatedWaterPerRaiM3 / waterRequirementM3) * 100) / 100;

    let targetWaterCondition: WaterCondition;

    if (input.waterCondition) {
      // User explicitly requested a specific water condition
      targetWaterCondition = input.waterCondition;
    } else {
      // Determine automatically from water ratio
      if (waterRatio >= 1.0) {
        targetWaterCondition = 'น้ำเพียงพอ';
      } else if (waterRatio >= 0.6) {
        targetWaterCondition = 'น้ำจำกัด';
      } else {
        targetWaterCondition = 'พึ่งพาน้ำฝน';
      }
    }

    // Step 4: Find matching Scenario
    const matched = candidateScenarios.find(
      (s) => s.waterCondition === targetWaterCondition
    );

    if (!matched) {
      return {
        statusCode: 404,
        output: {
          success: false,
          error: 'SCENARIO_NOT_FOUND',
          confidence: 'out_of_bounds',
          matchedScenario: null,
          inputSummary: {
            crop,
            plantingSeason,
            waterAvailableM3,
            areaRai,
            calculatedWaterPerRaiM3,
            waterRatio,
          },
          totalWaterAllocatedM3: 0,
          comparisonCandidates: [],
          message: `No scenario calibrated for water condition '${targetWaterCondition}' under cultivar '${crop}' (${plantingSeason}).`,
        },
      };
    }

    // Step 5: Farm-level Calculations
    const farmYieldSummary = YieldService.calculateFarmYield(matched, areaRai);

    const scenarioRecommendedPerRaiM3 = matched.waterPerRaiM3;
    const totalWaterAllocatedFarmM3 = Math.round(scenarioRecommendedPerRaiM3 * areaRai * 100) / 100;
    const waterSufficiencyPercent = Math.min(Math.round(waterRatio * 100), 100);

    const waterAllocation = {
      waterAvailableTotalM3: waterAvailableM3,
      waterPerRaiM3: calculatedWaterPerRaiM3,
      scenarioRecommendedPerRaiM3,
      totalWaterAllocatedFarmM3,
      waterConditionDetermined: targetWaterCondition,
      waterRequirementM3,
      waterRatio,
      waterSufficiencyPercent,
    };

    // Step 6: Comparison scenarios (other alternatives for same crop & season)
    const comparisonCandidates: Scenario[] = candidateScenarios.filter(
      (s) => s.id !== matched.id
    );

    return {
      statusCode: 200,
      output: {
        success: true,
        matchedScenario: matched,
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
        waterAllocation,
        farmYieldSummary,
        comparisonCandidates,
        message: `Matched scenario: ${matched.name}`,
      },
    };
  }
}

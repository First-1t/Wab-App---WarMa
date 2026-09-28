import { FarmYieldSummary, Scenario } from '../types/scenario.types.js';

/**
 * Baseline moisture ratio for cassava root:
 * Based on docs/doc.md Section 5.2 (Moisture ~60%-65%, Dry Matter ~35%-40%).
 * 
 * TODO / NEED CLARIFICATION:
 * Actual moisture content and starch conversion equations vary by cultivar and harvest timing.
 * Formal calibration curves from the DSSAT model (Faculty of Agriculture, KKU) will replace
 * this baseline assumption.
 */
export const BASELINE_CASSAVA_MOISTURE_RATIO = 0.64;

export class YieldService {
  /**
   * Calculate fresh yield conversion and farm-level aggregate totals
   * 
   * @param scenario The matched scenario containing dry yield and fresh yield baseline
   * @param areaRai Cultivated land area in Rai
   */
  static calculateFarmYield(scenario: Scenario, areaRai: number): FarmYieldSummary {
    const avgTonsPerRai = scenario.freshYield.avgTonsPerRai;
    const minKgPerRai = scenario.freshYield.minKgPerRai;
    const maxKgPerRai = scenario.freshYield.maxKgPerRai;

    // Total farm fresh yield (Tons and Kg)
    const totalFarmFreshYieldTons = Math.round(avgTonsPerRai * areaRai * 100) / 100;
    const totalFarmFreshYieldKg = Math.round(totalFarmFreshYieldTons * 1000);

    // Dry yield (from DSSAT biomass)
    const dryYieldPerRaiKg = scenario.dryYieldKgPerRai;
    const totalFarmDryYieldKg = Math.round(dryYieldPerRaiKg * areaRai);

    // Theoretical fresh yield based on moisture formula: Y_fresh = W_dry / (1 - Moisture)
    const theoreticalFreshYieldPerRaiKg = Math.round(
      dryYieldPerRaiKg / (1 - BASELINE_CASSAVA_MOISTURE_RATIO)
    );

    // Starch calculation
    const estimatedStarchPercent = scenario.freshYield.estimatedStarchPercent;
    const totalStarchWeightKg = Math.round(
      totalFarmFreshYieldKg * (estimatedStarchPercent / 100)
    );

    return {
      freshYieldAvgTonsPerRai: avgTonsPerRai,
      freshYieldMinKgPerRai: minKgPerRai,
      freshYieldMaxKgPerRai: maxKgPerRai,
      totalFarmFreshYieldTons,
      totalFarmFreshYieldKg,
      dryYieldPerRaiKg,
      totalFarmDryYieldKg,
      theoreticalFreshYieldPerRaiKg,
      estimatedStarchPercent,
      totalStarchWeightKg,
      conversionFormulaUsed: `Y_fresh = W_dry / (1 - MoistureContent) [Moisture = ${BASELINE_CASSAVA_MOISTURE_RATIO * 100}%]`,
      isMockConversion: true,
      note: 'TODO: Moisture ratio is currently a baseline estimate (64%). Final formula pending calibrated DSSAT datasets from KKU Faculty of Agriculture.',
    };
  }
}

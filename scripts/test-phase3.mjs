/**
 * Phase 3 Verification Script
 * Tests POST /api/output/match against localhost:5000
 */

const BASE_URL = 'http://localhost:5000/api/output/match';

async function runTests() {
  console.log('====================================================');
  console.log(' WarMa Phase 3 — Core Matching Engine Test Suite');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  async function assertCase(name, payload, expectedStatus, validator) {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const statusMatches = response.status === expectedStatus;
      const validationPassed = validator ? validator(data, response.status) : true;

      if (statusMatches && validationPassed) {
        console.log(`[PASS] ${name}`);
        passedCount++;
      } else {
        console.error(`[FAIL] ${name}`);
        console.error(`       Expected HTTP ${expectedStatus}, got ${response.status}`);
        console.error(`       Response:`, JSON.stringify(data, null, 2));
        failedCount++;
      }
    } catch (err) {
      console.error(`[ERROR] ${name}:`, err.message);
      failedCount++;
    }
  }

  // --- Success Cases ---
  await assertCase(
    '1. Success: KU50, ต้นฤดูฝน, 10 rai, 5000 m3 -> Water Limited (น้ำจำกัด)',
    {
      crop: 'เกษตรศาสตร์ 50',
      plantingSeason: 'ต้นฤดูฝน',
      areaRai: 10,
      waterAvailableM3: 5000,
    },
    200,
    (data) => {
      return (
        data.success === true &&
        data.matchedScenario?.id === 'SCN-KU50-EARLY-LIMITED' &&
        data.matchedScenario?.waterCondition === 'น้ำจำกัด' &&
        data.inputSummary.calculatedWaterPerRaiM3 === 500 &&
        data.inputSummary.waterRatio === 0.77 &&
        data.farmYieldSummary.totalFarmFreshYieldTons === 48 &&
        data.comparisonCandidates.length === 2
      );
    }
  );

  await assertCase(
    '2. Success: ระยอง 9, ต้นฤดูฝน, 10 rai, 8000 m3 -> Water Sufficient (น้ำเพียงพอ)',
    {
      crop: 'ระยอง 9',
      plantingSeason: 'ต้นฤดูฝน',
      areaRai: 10,
      waterAvailableM3: 8000,
    },
    200,
    (data) => {
      return (
        data.success === true &&
        data.matchedScenario?.id === 'SCN-R9-EARLY-SUFFICIENT' &&
        data.matchedScenario?.waterCondition === 'น้ำเพียงพอ' &&
        data.matchedScenario?.freshYield.estimatedStarchPercent === 28.5 &&
        data.farmYieldSummary.totalFarmFreshYieldTons === 52 &&
        data.comparisonCandidates.length === 2
      );
    }
  );

  await assertCase(
    '3. Success: CMR38-125-77, ปลายฤดูฝน, 15 rai, 1500 m3 -> Rainfed (พึ่งพาน้ำฝน)',
    {
      crop: 'CMR38-125-77',
      plantingSeason: 'ปลายฤดูฝน',
      areaRai: 15,
      waterAvailableM3: 1500,
    },
    200,
    (data) => {
      return (
        data.success === true &&
        data.matchedScenario?.id === 'SCN-CMR38-LATE-RAINFED' &&
        data.matchedScenario?.waterCondition === 'พึ่งพาน้ำฝน' &&
        data.inputSummary.calculatedWaterPerRaiM3 === 100 &&
        data.waterAllocation.waterConditionDetermined === 'พึ่งพาน้ำฝน'
      );
    }
  );

  await assertCase(
    '4. Success: Alias Fields (variety, season, area, waterAvailable)',
    {
      variety: 'เกษตรศาสตร์ 50',
      season: 'ต้นฤดูฝน',
      area: 5,
      waterAvailable: 3500,
    },
    200,
    (data) => {
      return (
        data.success === true &&
        data.matchedScenario?.id === 'SCN-KU50-EARLY-SUFFICIENT' &&
        data.inputSummary.areaRai === 5 &&
        data.inputSummary.waterAvailableM3 === 3500
      );
    }
  );

  await assertCase(
    '5. Success: Yield Conversion and Starch Formula Verification',
    {
      crop: 'เกษตรศาสตร์ 50',
      plantingSeason: 'ต้นฤดูฝน',
      areaRai: 10,
      waterAvailableM3: 6500,
    },
    200,
    (data) => {
      const yieldSummary = data.farmYieldSummary;
      return (
        yieldSummary &&
        yieldSummary.conversionFormulaUsed.includes('Y_fresh = W_dry') &&
        yieldSummary.isMockConversion === true &&
        yieldSummary.totalStarchWeightKg > 0 &&
        yieldSummary.totalFarmDryYieldKg === 19500 &&
        yieldSummary.totalFarmFreshYieldTons === 54
      );
    }
  );

  // --- Validation Error Cases (400) ---
  await assertCase(
    '6. Error: Area <= 0 (negative area)',
    {
      crop: 'เกษตรศาสตร์ 50',
      plantingSeason: 'ต้นฤดูฝน',
      areaRai: -5,
      waterAvailableM3: 5000,
    },
    400,
    (data) => data.success === false && data.error === 'VALIDATION_ERROR'
  );

  await assertCase(
    '7. Error: Water Available <= 0 (zero water)',
    {
      crop: 'เกษตรศาสตร์ 50',
      plantingSeason: 'ต้นฤดูฝน',
      areaRai: 10,
      waterAvailableM3: 0,
    },
    400,
    (data) => data.success === false && data.error === 'VALIDATION_ERROR'
  );

  await assertCase(
    '8. Error: Unrecognized Variety (e.g. มันพันธุ์ผสม XYZ)',
    {
      crop: 'มันพันธุ์ผสม XYZ',
      plantingSeason: 'ต้นฤดูฝน',
      areaRai: 10,
      waterAvailableM3: 5000,
    },
    400,
    (data) => data.success === false && data.error === 'VALIDATION_ERROR'
  );

  await assertCase(
    '9. Error: Unsupported Season (e.g. ฤดูแล้ง)',
    {
      crop: 'เกษตรศาสตร์ 50',
      plantingSeason: 'ฤดูแล้ง',
      areaRai: 10,
      waterAvailableM3: 5000,
    },
    400,
    (data) => data.success === false && data.error === 'VALIDATION_ERROR'
  );

  await assertCase(
    '10. Error: Empty Body ({})',
    {},
    400,
    (data) => data.success === false && data.details && data.details.length >= 4
  );

  await assertCase(
    '11. Boundary Condition: Uncalibrated Cultivar (ห้วยบง 90 -> 404 Not Found, ไม่เดาผล)',
    {
      crop: 'ห้วยบง 90',
      plantingSeason: 'ต้นฤดูฝน',
      areaRai: 10,
      waterAvailableM3: 5000,
    },
    404,
    (data) =>
      data.success === false &&
      data.error === 'SCENARIO_NOT_FOUND' &&
      data.confidence === 'out_of_bounds' &&
      data.matchedScenario === null
  );

  console.log('\n====================================================');
  console.log(` Summary: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('====================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();

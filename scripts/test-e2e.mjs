/**
 * End-to-End Verification Test Script
 * Tests through Frontend Vite proxy (http://localhost:3000/api/...)
 * precisely mimicking browser calls
 */

const FRONTEND_PROXY_URL = 'http://localhost:3000/api';

async function runE2ETests() {
  console.log('====================================================');
  console.log(' WarMa Phase 5 — Full End-to-End Integration Tests');
  console.log(' Testing via Vite Proxy (http://localhost:3000/api)  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Proxy Health Check
  try {
    const res = await fetch(`${FRONTEND_PROXY_URL}/health`);
    const data = await res.json();
    if (res.status === 200 && data.status === 'ok' && data.scenarioCount === 18) {
      console.log('[PASS] 1. Vite Proxy Connection to Backend Health Check (200 OK)');
      passed++;
    } else {
      console.error('[FAIL] 1. Proxy Health Check Failed:', data);
      failed++;
    }
  } catch (err) {
    console.error('[ERROR] 1. Proxy Health Check Exception:', err.message);
    failed++;
  }

  // Test 2: End-to-End Success Case (KU50, ต้นฤดูฝน, 10 rai, 5000 m3)
  try {
    const res = await fetch(`${FRONTEND_PROXY_URL}/output/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crop: 'เกษตรศาสตร์ 50',
        plantingSeason: 'ต้นฤดูฝน',
        areaRai: 10,
        waterAvailableM3: 5000,
      }),
    });
    const data = await res.json();
    if (
      res.status === 200 &&
      data.success === true &&
      data.matchedScenario?.id === 'SCN-KU50-EARLY-LIMITED' &&
      data.farmYieldSummary?.freshYieldAvgTonsPerRai === 4.8 &&
      data.farmYieldSummary?.totalFarmFreshYieldTons === 48 &&
      data.comparisonCandidates?.length === 2
    ) {
      console.log('[PASS] 2. End-to-End Match Request (KU50 -> SCN-KU50-EARLY-LIMITED)');
      passed++;
    } else {
      console.error('[FAIL] 2. Match Request Failed:', res.status, data);
      failed++;
    }
  } catch (err) {
    console.error('[ERROR] 2. Match Request Exception:', err.message);
    failed++;
  }

  // Test 3: End-to-End Rayong 9 Sufficient (8000 m3 / 10 rai)
  try {
    const res = await fetch(`${FRONTEND_PROXY_URL}/output/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crop: 'ระยอง 9',
        plantingSeason: 'ต้นฤดูฝน',
        areaRai: 10,
        waterAvailableM3: 8000,
      }),
    });
    const data = await res.json();
    if (
      res.status === 200 &&
      data.success === true &&
      data.matchedScenario?.id === 'SCN-R9-EARLY-SUFFICIENT' &&
      data.matchedScenario?.freshYield.estimatedStarchPercent === 28.5
    ) {
      console.log('[PASS] 3. End-to-End Match Request (ระยอง 9 -> SCN-R9-EARLY-SUFFICIENT)');
      passed++;
    } else {
      console.error('[FAIL] 3. Match Request Failed:', res.status, data);
      failed++;
    }
  } catch (err) {
    console.error('[ERROR] 3. Match Request Exception:', err.message);
    failed++;
  }

  // Test 4: End-to-End Invalid Input Validation (Area = 0)
  try {
    const res = await fetch(`${FRONTEND_PROXY_URL}/output/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crop: 'เกษตรศาสตร์ 50',
        plantingSeason: 'ต้นฤดูฝน',
        areaRai: 0,
        waterAvailableM3: 5000,
      }),
    });
    const data = await res.json();
    if (
      res.status === 400 &&
      data.success === false &&
      data.error === 'VALIDATION_ERROR' &&
      Array.isArray(data.details)
    ) {
      console.log('[PASS] 4. End-to-End Validation Error Catch (Area=0 -> 400 VALIDATION_ERROR)');
      passed++;
    } else {
      console.error('[FAIL] 4. Validation Error Catch Failed:', res.status, data);
      failed++;
    }
  } catch (err) {
    console.error('[ERROR] 4. Validation Exception:', err.message);
    failed++;
  }

  // Test 5: End-to-End Unrecognized Variety (400 Bad Request)
  try {
    const res = await fetch(`${FRONTEND_PROXY_URL}/output/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crop: 'มันสำปะหลังสายพันธุ์ XYZ',
        plantingSeason: 'ต้นฤดูฝน',
        areaRai: 10,
        waterAvailableM3: 5000,
      }),
    });
    const data = await res.json();
    if (
      res.status === 400 &&
      data.success === false &&
      data.error === 'VALIDATION_ERROR'
    ) {
      console.log('[PASS] 5. End-to-End Unrecognized Crop Catch (XYZ -> 400 VALIDATION_ERROR)');
      passed++;
    } else {
      console.error('[FAIL] 5. Unrecognized Crop Failed:', res.status, data);
      failed++;
    }
  } catch (err) {
    console.error('[ERROR] 5. Unrecognized Crop Exception:', err.message);
    failed++;
  }

  // Test 6: End-to-End Boundary Condition (ห้วยบง 90 -> 404 No Matching Scenario)
  try {
    const res = await fetch(`${FRONTEND_PROXY_URL}/output/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crop: 'ห้วยบง 90',
        plantingSeason: 'ต้นฤดูฝน',
        areaRai: 10,
        waterAvailableM3: 5000,
      }),
    });
    const data = await res.json();
    if (
      res.status === 404 &&
      data.success === false &&
      data.error === 'SCENARIO_NOT_FOUND' &&
      data.confidence === 'out_of_bounds'
    ) {
      console.log('[PASS] 6. End-to-End Boundary Catch (ห้วยบง 90 -> 404 SCENARIO_NOT_FOUND / out_of_bounds)');
      passed++;
    } else {
      console.error('[FAIL] 6. Boundary Catch Failed:', res.status, data);
      failed++;
    }
  } catch (err) {
    console.error('[ERROR] 6. Boundary Catch Exception:', err.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(` End-to-End Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ETests();

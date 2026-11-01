import React from 'react';
import {
  MatchInputDto,
  MatchOutputDto,
  Scenario,
} from '../types/scenario.types';
import { YieldSummaryCard } from '../components/YieldSummaryCard';
import { WaterScheduleTable } from '../components/WaterScheduleTable';
import { ScenarioComparison } from '../components/ScenarioComparison';
import { MOCK_SCENARIOS_STORE } from '../data/mockOutput';

interface OutputV1PageProps {
  inputData: MatchInputDto;
  outputData: MatchOutputDto | null;
  onNavigateToInput: () => void;
  onNavigateToFinal: () => void;
}

/**
 * OutputV1Page: Initial AI-generated UI Prototype
 * Used for presentation and comparison with Final Refined UI (/output).
 * Reflects the initial layout, generic Tailwind styling, and card stack from Phase 4.
 */
export const OutputV1Page: React.FC<OutputV1PageProps> = ({
  inputData,
  outputData,
  onNavigateToInput,
  onNavigateToFinal,
}) => {
  // Scenario matching fallback if accessed directly
  const scenario: Scenario =
    outputData?.matchedScenario || MOCK_SCENARIOS_STORE[0];

  const areaRai =
    outputData?.inputSummary?.areaRai ?? inputData.areaRai ?? 10;
  const waterAvailableM3 =
    outputData?.inputSummary?.waterAvailableM3 ??
    inputData.waterAvailableM3 ??
    5000;
  const crop =
    outputData?.inputSummary?.crop ?? inputData.crop ?? 'เกษตรศาสตร์ 50';
  const plantingSeason =
    outputData?.inputSummary?.plantingSeason ??
    inputData.plantingSeason ??
    'ต้นฤดูฝน';

  const farmYield = outputData?.farmYieldSummary || {
    totalFarmFreshYieldTons:
      Math.round(scenario.freshYield.avgTonsPerRai * areaRai * 10) / 10,
    totalStarchWeightKg: Math.round(
      scenario.freshYield.avgTonsPerRai *
        areaRai *
        1000 *
        (scenario.freshYield.estimatedStarchPercent / 100)
    ),
  };

  const waterAlloc = outputData?.waterAllocation || {
    totalFarmAllocatedM3: scenario.waterPerRaiM3 * areaRai,
    totalFarmAvailableM3: waterAvailableM3,
    reserveWaterM3: Math.max(
      0,
      waterAvailableM3 - scenario.waterPerRaiM3 * areaRai
    ),
    waterSufficiencyPercent: Math.min(
      Math.round(
        (waterAvailableM3 /
          ((scenario.waterRequirementM3 || 650) * areaRai)) *
          100
      ),
      100
    ),
  };

  const comparisonCandidates =
    outputData?.comparisonCandidates &&
    outputData.comparisonCandidates.length > 0
      ? outputData.comparisonCandidates
      : [MOCK_SCENARIOS_STORE[2], MOCK_SCENARIOS_STORE[1]];

  return (
    <div className="w-full pt-[116px] sm:pt-[124px] md:pt-[100px] pb-16 bg-slate-100 min-h-screen text-slate-800 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Presentation Demo Banner */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl shrink-0">🤖</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                    Initial AI-Generated Version (v1)
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Route: /output-v1
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  หน้าผลลัพธ์เวอร์ชันแรก (ก่อนการปรับปรุง UI/UX)
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                  สร้างขึ้นสำหรับเปรียบเทียบใน Presentation: แสดงผลลัพธ์แรกที่ AI Gen ออกมา
                  (ใช้ Layout การ์ดมาตรฐาน, สี Slate/Tailwind ดั้งเดิม, Emoji icons)
                  ก่อนนำไป Review และพัฒนาต่อเป็น Final UI ใน <code className="font-mono font-semibold text-emerald-700">/output</code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onNavigateToFinal}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                type="button"
              >
                <span>ดู Final Refined UI (/output)</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top Navigation & Context Bar (Phase 4 Prototype Style) */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={onNavigateToInput}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-sky-600 hover:text-sky-800 transition cursor-pointer self-start sm:self-auto"
            type="button"
          >
            <span>←</span>
            <span>กลับไปแก้ไขข้อมูลแปลง (Input)</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium border border-slate-200">
              🌱 พันธุ์: <strong>{crop}</strong>
            </span>
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium border border-slate-200">
              📅 ฤดู: <strong>{plantingSeason}</strong>
            </span>
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium border border-slate-200">
              📐 พื้นที่: <strong>{areaRai} ไร่</strong>
            </span>
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium border border-slate-200">
              💧 น้ำ: <strong>{waterAvailableM3.toLocaleString()} ลบ.ม.</strong>
            </span>
          </div>
        </div>

        {/* Section Heading */}
        <div className="pb-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            ผลวิเคราะห์และคำแนะนำการจัดการน้ำ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cassava Biophysical Crop Simulation Model • Initial UI Prototype (Phase 4)
          </p>
        </div>

        {/* Component 1: Yield Summary Card (Phase 4) */}
        <YieldSummaryCard
          scenario={scenario}
          yieldSummary={farmYield}
          waterAllocation={waterAlloc}
          areaRai={areaRai}
        />

        {/* Component 2: Water Schedule Table (Phase 4) */}
        <WaterScheduleTable
          schedule={scenario.schedule}
          areaRai={areaRai}
        />

        {/* Component 3: Scenario Comparison (Phase 4) */}
        <ScenarioComparison
          currentScenario={scenario}
          comparisonCandidates={comparisonCandidates}
          areaRai={areaRai}
        />

        {/* Section 4: General Advice Box (Phase 4 Original) */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💡</span>
            <h3 className="text-base font-bold text-sky-950">
              แนวทางปฏิบัติแนะนำสำหรับการจัดการแปลง
            </h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-sky-900 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-sky-600 font-bold">•</span>
              <span>
                ให้น้ำอย่างสม่ำเสมอในช่วง 1–30 วันแรกหลังปลูก เพื่อให้อัตรารอดตายของท่อนพันธุ์สูงกว่า 95%
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-600 font-bold">•</span>
              <span>
                หากน้ำต้นทุนมีจำกัด ให้เน้นให้น้ำช่วงวิกฤต (31–90 วัน) ที่พืชกำลังสร้างหัวและรากดูดซับ
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-600 font-bold">•</span>
              <span>
                งดให้น้ำก่อนเก็บเกี่ยว 30–45 วัน เพื่อช่วยเพิ่มเปอร์เซ็นต์แป้งและลดการเน่าเสียของหัวมัน
              </span>
            </li>
          </ul>
        </div>

        {/* Comparison Footnote Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>📊</span>
            <span>จุดเปรียบเทียบระหว่าง Initial AI (v1) กับ Final Refined UI (/output)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-3 text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-800 block mb-1">1. Design System & Theme</span>
              <span>v1 ใช้ Tailwind Slate พื้นฐานทั่วไป เทียบกับ Final UI ที่ใช้ Google Stitch Token System ครบวงจร</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-800 block mb-1">2. Typography & Icons</span>
              <span>v1 ใช้ System font และ Emojis เทียบกับ Final UI ที่ใช้ Plus Jakarta Sans, Noto Sans Thai และ Material Symbols</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-800 block mb-1">3. Mobile UX & Single-line Header</span>
              <span>v1 จัดวางแบบ Column ยาว เทียบกับ Final UI ที่ทำ Responsive Header บรรทัดเดียวบน iPhone SE และมี Ambient Glow</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={onNavigateToFinal}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              type="button"
            >
              <span>สลับไปหน้า Final UI (/output) เพื่อดูความต่าง</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

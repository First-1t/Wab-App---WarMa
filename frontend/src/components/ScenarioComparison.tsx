import React from 'react';
import { RiskLevel, Scenario } from '../types/scenario.types';

interface ScenarioComparisonProps {
  currentScenario: Scenario;
  comparisonCandidates: Scenario[];
  areaRai: number;
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  currentScenario,
  comparisonCandidates,
  areaRai,
}) => {
  // Consolidate scenarios to display: Current Scenario + Comparison Candidates
  const allScenarios: Scenario[] = [currentScenario, ...comparisonCandidates];

  // Helper to determine role badge
  const getScenarioRole = (scenario: Scenario) => {
    if (scenario.id === currentScenario.id) {
      return {
        tag: 'Your Matched Plan (ทางเลือกของคุณ)',
        className: 'bg-sky-500 text-white font-bold',
        isCurrent: true,
      };
    }
    if (scenario.waterCondition === 'พึ่งพาน้ำฝน') {
      return {
        tag: 'Rainfed Baseline (พึ่งฝนธรรมชาติ)',
        className: 'bg-slate-100 text-slate-700 font-semibold',
        isCurrent: false,
      };
    }
    if (scenario.waterCondition === 'น้ำเพียงพอ') {
      return {
        tag: 'Optimal Irrigation (จัดการน้ำเต็มที่)',
        className: 'bg-emerald-100 text-emerald-800 font-semibold',
        isCurrent: false,
      };
    }
    return {
      tag: 'Alternative Scenario',
      className: 'bg-slate-100 text-slate-700 font-semibold',
      isCurrent: false,
    };
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'ต่ำ':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'ปานกลาง':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'สูง':
      default:
        return 'text-rose-700 bg-rose-50 border-rose-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>⚖️</span>
            <span>Scenario Comparison (เปรียบเทียบทางเลือกการจัดการน้ำ)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare yield outcomes, water requirements, and risk trade-offs
          </p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          3 Scenarios
        </span>
      </div>

      {/* Grid of Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {allScenarios.map((scn) => {
          const role = getScenarioRole(scn);
          const yieldDiff =
            Math.round((scn.freshYield.avgTonsPerRai - currentScenario.freshYield.avgTonsPerRai) * 10) / 10;
          const waterDiff = scn.waterPerRaiM3 - currentScenario.waterPerRaiM3;
          const farmTotalTons = Math.round(scn.freshYield.avgTonsPerRai * areaRai * 10) / 10;

          return (
            <div
              key={scn.id}
              className={`rounded-xl p-4 flex flex-col justify-between border transition-all ${
                role.isCurrent
                  ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                {/* Role Tag */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${role.className}`}>
                    {role.tag}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getRiskColor(
                      scn.risk
                    )}`}
                  >
                    Risk: {scn.risk}
                  </span>
                </div>

                {/* Scenario Name */}
                <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-2">
                  {scn.name}
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Condition: <strong className="text-slate-700">{scn.waterCondition}</strong>
                </p>

                {/* Key Metrics */}
                <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Fresh Yield (เฉลี่ย):</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {scn.freshYield.avgTonsPerRai} tons/rai
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Farm Total ({areaRai} rai):</span>
                    <span className="font-mono font-semibold text-emerald-800">
                      {farmTotalTons} tons
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Water Needed:</span>
                    <span className="font-mono font-semibold text-sky-800">
                      {scn.waterPerRaiM3} m³/rai
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Estimated Starch:</span>
                    <span className="font-mono font-semibold text-amber-800">
                      {scn.freshYield.estimatedStarchPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Delta Comparison from Current Scenario */}
              <div className="mt-3 pt-2 text-[11px]">
                {role.isCurrent ? (
                  <div className="text-sky-700 font-semibold text-center bg-sky-100/60 py-1.5 rounded-lg">
                    ★ Currently Selected Scenario
                  </div>
                ) : (
                  <div className="space-y-1 text-slate-600 bg-slate-50 p-2 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span>Yield Diff:</span>
                      <span
                        className={`font-mono font-bold ${
                          yieldDiff > 0
                            ? 'text-emerald-700'
                            : yieldDiff < 0
                            ? 'text-rose-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {yieldDiff > 0 ? `+${yieldDiff}` : yieldDiff} tons/rai
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Water Diff:</span>
                      <span className="font-mono text-slate-700">
                        {waterDiff > 0 ? `+${waterDiff}` : waterDiff} m³/rai
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

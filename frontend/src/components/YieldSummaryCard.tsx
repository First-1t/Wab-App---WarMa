import React from 'react';
import {
  FarmYieldSummary,
  RiskLevel,
  Scenario,
  WaterAllocationSummary,
} from '../types/scenario.types';

interface YieldSummaryCardProps {
  scenario: Scenario;
  yieldSummary?: FarmYieldSummary;
  waterAllocation?: WaterAllocationSummary;
  areaRai: number;
}

export const YieldSummaryCard: React.FC<YieldSummaryCardProps> = ({
  scenario,
  yieldSummary,
  waterAllocation,
  areaRai,
}) => {
  const avgTonsPerRai = scenario.freshYield.avgTonsPerRai;
  const totalFreshTons =
    yieldSummary?.totalFarmFreshYieldTons ??
    Math.round(avgTonsPerRai * areaRai * 100) / 100;
  const starchPercent = scenario.freshYield.estimatedStarchPercent;

  // Risk Badge Colors
  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'ต่ำ':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Low Risk (ความเสี่ยงต่ำ)',
        };
      case 'ปานกลาง':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Moderate Risk (ความเสี่ยงปานกลาง)',
        };
      case 'สูง':
      default:
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          label: 'High Risk (ความเสี่ยงสูง)',
        };
    }
  };

  const riskBadge = getRiskBadge(scenario.risk);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
            {scenario.waterCondition} ({scenario.plantingSeason})
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">
            {scenario.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Scenario ID: <span className="font-mono">{scenario.id}</span>
          </p>
        </div>

        {/* Risk Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${riskBadge.bg}`}
        >
          <span className={`w-2 h-2 rounded-full ${riskBadge.dot}`} />
          <span>{riskBadge.label}</span>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Metric 1: Fresh Yield */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/70 to-emerald-50/20 border border-emerald-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
            <span>Predicted Fresh Yield (ผลผลิตสด)</span>
            <span className="text-base">🥔</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-emerald-900 font-mono">
                {avgTonsPerRai.toFixed(1)}
              </span>
              <span className="text-sm font-medium text-emerald-700">tons/rai</span>
            </div>
            <p className="text-xs text-emerald-700 mt-1">
              Range: {scenario.freshYield.minKgPerRai.toLocaleString()} –{' '}
              {scenario.freshYield.maxKgPerRai.toLocaleString()} kg/rai
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-900 font-medium">
            <span>Farm Total ({areaRai} rai):</span>
            <span className="font-bold font-mono text-emerald-950">
              {totalFreshTons.toLocaleString()} tons
            </span>
          </div>
        </div>

        {/* Metric 2: Starch Content */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/70 to-amber-50/20 border border-amber-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">
            <span>Estimated Starch (เปอร์เซ็นต์แป้ง)</span>
            <span className="text-base">✨</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-amber-900 font-mono">
                {starchPercent.toFixed(1)}
              </span>
              <span className="text-sm font-medium text-amber-700">%</span>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              {scenario.crop === 'ระยอง 9'
                ? 'High starch cultivar suited for processing'
                : 'Commercial standard quality'}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-900 font-medium">
            <span>Total Starch Estimate:</span>
            <span className="font-bold font-mono text-amber-950">
              {yieldSummary?.totalStarchWeightKg
                ? `${(yieldSummary.totalStarchWeightKg / 1000).toFixed(1)} tons`
                : `${((totalFreshTons * 1000 * starchPercent) / 100000).toFixed(1)} tons`}
            </span>
          </div>
        </div>

        {/* Metric 3: Water Allocation */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50/70 to-sky-50/20 border border-sky-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-sky-800 uppercase tracking-wider mb-2">
            <span>Recommended Water (ปริมาณน้ำ)</span>
            <span className="text-base">💧</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-sky-900 font-mono">
                {scenario.waterPerRaiM3.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-sky-700">m³/rai</span>
            </div>
            <p className="text-xs text-sky-700 mt-1">
              Target requirement: {scenario.waterRequirementM3.toLocaleString()} m³/rai
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-sky-200/60 flex items-center justify-between text-xs text-sky-900 font-medium">
            <span>Farm Total ({areaRai} rai):</span>
            <span className="font-bold font-mono text-sky-950">
              {(scenario.waterPerRaiM3 * areaRai).toLocaleString()} m³
            </span>
          </div>
        </div>
      </div>

      {/* Yield Conversion Technical Note (DSSAT Biomass -> Fresh Root Weight) */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
          <span>ℹ️</span>
          <span>DSSAT Dry Yield to Fresh Yield Conversion:</span>
        </div>
        <p>
          DSSAT model predicts biomass dry root weight{' '}
          <span className="font-mono font-bold text-slate-700">
            ({scenario.dryYieldKgPerRai.toLocaleString()} kg/rai)
          </span>
          . Converted to fresh marketable root weight using formula{' '}
          <span className="font-mono font-medium text-sky-800">
            Y_fresh = W_dry / (1 - MoistureContent)
          </span>{' '}
          with baseline moisture at 64%.
        </p>
      </div>

      {/* Practical Advice List */}
      {scenario.advice && scenario.advice.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Key Agricultural Recommendations (คำแนะนำการปฏิบัติ)
          </h3>
          <ul className="space-y-1.5">
            {scenario.advice.map((item, index) => (
              <li
                key={index}
                className="text-xs text-slate-600 flex items-start gap-2"
              >
                <span className="text-emerald-500 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

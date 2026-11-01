import React from 'react';
import {
  FarmYieldSummary,
  RiskLevel,
  Scenario,
  WaterAllocationSummary,
} from '../../../shared/types/scenario.contracts';

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

  // Risk Badge Colors (Smart Water Status Standard with icon + text)
  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'ต่ำ':
        return {
          bg: 'bg-tint-mint text-success border-success/30',
          icon: 'check_circle',
          label: 'ความเสี่ยงต่ำ (Low Risk)',
        };
      case 'ปานกลาง':
        return {
          bg: 'bg-amber-50 text-warning border-warning/30',
          icon: 'warning',
          label: 'ความเสี่ยงปานกลาง (Moderate Risk)',
        };
      case 'สูง':
      default:
        return {
          bg: 'bg-rose-50 text-danger border-danger/30',
          icon: 'cancel',
          label: 'ความเสี่ยงสูง (High Risk)',
        };
    }
  };

  const riskBadge = getRiskBadge(scenario.risk);

  return (
    <div className="bg-surface rounded-xl shadow-xs border border-border p-6 transition-all font-body">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-border">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand bg-tint-sky px-2.5 py-1 rounded-md border border-border inline-block">
            {scenario.waterCondition} ({scenario.plantingSeason})
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-text mt-2 font-heading tracking-tight">
            {scenario.name}
          </h2>
          <p className="text-xs text-text-muted mt-0.5 font-body">
            Scenario ID: <span className="font-mono font-medium">{scenario.id}</span>
          </p>
        </div>

        {/* Risk Badge with Icon (accessible for red-green blindness) */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${riskBadge.bg}`}
        >
          <span className="material-symbols-outlined text-[16px]">{riskBadge.icon}</span>
          <span>{riskBadge.label}</span>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Metric 1: Fresh Yield */}
        <div className="p-4 rounded-lg bg-tint-mint border border-[#d2ebb8] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-text uppercase tracking-wider mb-2 font-heading">
            <span>ผลผลิตหัวสดคาดการณ์</span>
            <span className="material-symbols-outlined text-success text-[20px]">agriculture</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-text font-mono">
                {avgTonsPerRai.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-text-muted">ตัน/ไร่</span>
            </div>
            <p className="text-xs text-text-muted mt-1 font-body">
              ช่วงผลผลิต: {scenario.freshYield.minKgPerRai.toLocaleString()} –{' '}
              {scenario.freshYield.maxKgPerRai.toLocaleString()} กก./ไร่
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#cde8b3] flex items-center justify-between text-xs text-text font-medium font-body">
            <span>รวมทั้งแปลง ({areaRai} ไร่):</span>
            <span className="font-bold font-mono text-text">
              {totalFreshTons.toLocaleString()} ตัน
            </span>
          </div>
        </div>

        {/* Metric 2: Starch Content */}
        <div className="p-4 rounded-lg bg-surface-sunken border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-text uppercase tracking-wider mb-2 font-heading">
            <span>เปอร์เซ็นต์แป้งคาดการณ์</span>
            <span className="material-symbols-outlined text-warning text-[20px]">auto_awesome</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-warning font-mono">
                {starchPercent.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-text-muted">%</span>
            </div>
            <p className="text-xs text-text-muted mt-1 font-body">
              {scenario.crop === 'ระยอง 9'
                ? 'พันธุ์แป้งสูงพิเศษ เหมาะส่งโรงงานแป้ง'
                : 'มาตรฐานเชิงพาณิชย์สำหรับอุตสาหกรรม'}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs text-text font-medium font-body">
            <span>ปริมาณเนื้อแป้งรวม:</span>
            <span className="font-bold font-mono text-text">
              {yieldSummary?.totalStarchWeightKg
                ? `${(yieldSummary.totalStarchWeightKg / 1000).toFixed(1)} ตัน`
                : `${((totalFreshTons * 1000 * starchPercent) / 100000).toFixed(1)} ตัน`}
            </span>
          </div>
        </div>

        {/* Metric 3: Water Allocation */}
        <div className="p-4 rounded-lg bg-tint-sky border border-[#c1e2f9] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-brand uppercase tracking-wider mb-2 font-heading">
            <span>ปริมาณน้ำแนะนำ</span>
            <span className="material-symbols-outlined text-brand text-[20px]">water_drop</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-brand font-mono">
                {scenario.waterPerRaiM3.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-text-muted">ลบ.ม./ไร่</span>
            </div>
            <p className="text-xs text-text-muted mt-1 font-body">
              ความต้องการพืช: {scenario.waterRequirementM3.toLocaleString()} ลบ.ม./ไร่
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#b9dff8] flex items-center justify-between text-xs text-brand font-medium font-body">
            <span>รวมจัดสรร ({areaRai} ไร่):</span>
            <span className="font-bold font-mono text-brand">
              {(scenario.waterPerRaiM3 * areaRai).toLocaleString()} ลบ.ม.
            </span>
          </div>
        </div>
      </div>

      {/* Yield Conversion Technical Note (DSSAT Biomass -> Fresh Root Weight) */}
      <div className="p-3.5 rounded-lg bg-surface-sunken border border-border text-xs text-text-muted space-y-1 font-body">
        <div className="flex items-center gap-1.5 font-bold text-text">
          <span className="material-symbols-outlined text-[16px] text-brand">info</span>
          <span>การแปลงผลผลิตจากแบบจำลอง DSSAT (Dry Weight → Fresh Root Weight):</span>
        </div>
        <p className="leading-relaxed">
          แบบจำลองชีวฟิสิกส์ DSSAT ประเมินน้ำหนักแห้งหัวมันสำปะหลัง{' '}
          <span className="font-mono font-bold text-text">
            ({scenario.dryYieldKgPerRai.toLocaleString()} กก./ไร่)
          </span>{' '}
          แปลงเป็นน้ำหนักหัวสดที่ความชื้นมาตรฐาน 64% ตามสมการ{' '}
          <span className="font-mono font-bold text-brand">
            Y_fresh = W_dry / (1 - MoistureContent)
          </span>
        </p>
      </div>

      {/* Practical Advice List */}
      {scenario.advice && scenario.advice.length > 0 && (
        <div className="mt-5 pt-4 border-t border-border">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider mb-2.5 font-heading">
            คำแนะนำการปฏิบัติเฉพาะแปลง (Actionable Farm Practices)
          </h3>
          <ul className="space-y-2">
            {scenario.advice.map((item, index) => (
              <li
                key={index}
                className="text-sm text-text flex items-start gap-2.5 font-body"
              >
                <span className="w-5 h-5 rounded-full bg-tint-mint text-success flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

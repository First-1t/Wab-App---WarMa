import React from 'react';
import { RiskLevel, Scenario } from '../../../shared/types/scenario.contracts';

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
  const allScenarios: Scenario[] = [currentScenario, ...comparisonCandidates];

  const getScenarioRole = (scenario: Scenario) => {
    if (scenario.id === currentScenario.id) {
      return {
        tag: 'แผนการที่จัดสรรให้คุณ (Your Plan)',
        className: 'bg-brand text-white font-bold',
        isCurrent: true,
      };
    }
    if (scenario.waterCondition === 'พึ่งพาน้ำฝน') {
      return {
        tag: 'พึ่งฝนธรรมชาติ (Rainfed Baseline)',
        className: 'bg-surface-sunken text-text-muted border border-border font-semibold',
        isCurrent: false,
      };
    }
    if (scenario.waterCondition === 'น้ำเพียงพอ') {
      return {
        tag: 'จัดการน้ำเต็มที่ (Optimal Irrigation)',
        className: 'bg-tint-mint text-text border border-border font-bold',
        isCurrent: false,
      };
    }
    return {
      tag: 'ทางเลือกเพิ่มเติม (Alternative)',
      className: 'bg-surface-sunken text-text border border-border font-medium',
      isCurrent: false,
    };
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'ต่ำ':
        return 'text-success bg-tint-mint border-[#cde8b3]';
      case 'ปานกลาง':
        return 'text-warning bg-amber-50 border-warning/30';
      case 'สูง':
      default:
        return 'text-danger bg-rose-50 border-danger/30';
    }
  };

  return (
    <div className="bg-surface rounded-xl shadow-xs border border-border p-6 font-body transition-all">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-border">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-text flex items-center gap-2 font-heading">
            <span className="material-symbols-outlined text-brand text-[22px]">compare_arrows</span>
            <span>เปรียบเทียบทางเลือกการจัดการน้ำ (Scenario Trade-offs)</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            เปรียบเทียบผลผลิต ผลกระทบของน้ำ และระดับความเสี่ยงเพื่อประกอบการตัดสินใจ
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-surface-sunken text-text border border-border">
          {allScenarios.length} แผนทางเลือก
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
                  ? 'border-brand ring-2 ring-brand/20 bg-tint-sky/20 shadow-xs'
                  : 'border-border bg-surface hover:border-text-muted/40'
              }`}
            >
              <div>
                {/* Role Tag & Risk Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${role.className}`}>
                    {role.tag}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${getRiskBadge(
                      scn.risk
                    )}`}
                  >
                    เสี่ยง: {scn.risk}
                  </span>
                </div>

                {/* Scenario Name */}
                <h3 className="text-sm font-bold text-text mt-1 line-clamp-2 font-heading">
                  {scn.name}
                </h3>
                <p className="text-xs text-text-muted mb-3 font-body">
                  สถานะน้ำ: <strong className="text-text font-semibold">{scn.waterCondition}</strong>
                </p>

                {/* Key Metrics */}
                <div className="space-y-2 py-3 border-y border-border text-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="text-text-muted">ผลผลิตหัวสด:</span>
                    <span className="font-mono font-bold text-text text-sm">
                      {scn.freshYield.avgTonsPerRai} ตัน/ไร่
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-text-muted">ผลผลิตรวมแปลง ({areaRai} ไร่):</span>
                    <span className="font-mono font-bold text-text">
                      {farmTotalTons} ตัน
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-text-muted">น้ำที่ต้องใช้:</span>
                    <span className="font-mono font-bold text-brand">
                      {scn.waterPerRaiM3.toLocaleString()} ลบ.ม./ไร่
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-text-muted">เปอร์เซ็นต์แป้ง:</span>
                    <span className="font-mono font-bold text-warning">
                      {scn.freshYield.estimatedStarchPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Delta Comparison from Current Scenario */}
              <div className="mt-3 pt-2 text-xs">
                {role.isCurrent ? (
                  <div className="text-brand font-bold text-center bg-tint-sky py-1.5 rounded-lg border border-[#b9dff8]">
                    ★ แผนปัจจุบันที่เลือกไว้
                  </div>
                ) : (
                  <div className="space-y-1 text-text-muted bg-surface-sunken p-2.5 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <span>เทียบผลผลิต:</span>
                      <span
                        className={`font-mono font-bold ${
                          yieldDiff > 0
                            ? 'text-success'
                            : yieldDiff < 0
                            ? 'text-danger'
                            : 'text-text'
                        }`}
                      >
                        {yieldDiff > 0 ? `+${yieldDiff}` : yieldDiff} ตัน/ไร่
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>เทียบการใช้น้ำ:</span>
                      <span className="font-mono text-text font-semibold">
                        {waterDiff > 0 ? `+${waterDiff}` : waterDiff} ลบ.ม./ไร่
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

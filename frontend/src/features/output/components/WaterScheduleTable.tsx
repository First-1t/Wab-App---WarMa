import React from 'react';
import { IrrigationPhase } from '../../../shared/types/scenario.contracts';

interface WaterScheduleTableProps {
  schedule: IrrigationPhase[];
  areaRai: number;
}

export const WaterScheduleTable: React.FC<WaterScheduleTableProps> = ({
  schedule,
  areaRai,
}) => {
  const totalWaterPerRai = schedule.reduce(
    (sum, item) => sum + item.amountPerRaiM3,
    0
  );
  const totalWaterFarm = totalWaterPerRai * areaRai;

  return (
    <div className="bg-surface rounded-xl shadow-xs border border-border p-6 font-body transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-border">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-text flex items-center gap-2 font-heading">
            <span className="material-symbols-outlined text-brand text-[22px]">calendar_month</span>
            <span>ตารางการให้น้ำรายระยะการเจริญเติบโต (Irrigation Schedule)</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            แนวทางการจัดการน้ำเสริมตามแบบจำลอง DSSAT เพื่อผลผลิตและเปอร์เซ็นต์แป้งสูงสุด
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1 rounded-full bg-tint-sky text-brand border border-border">
          ขนาดแปลงเกษตรกร: <span className="font-mono">{areaRai} ไร่</span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-sunken text-text uppercase font-bold font-heading">
              <th className="py-3 px-3.5">ระยะการเจริญเติบโต (Phase)</th>
              <th className="py-3 px-3.5">แนวทางการจัดการน้ำ (Management Guideline)</th>
              <th className="py-3 px-3.5">ความถี่การให้น้ำ</th>
              <th className="py-3 px-3.5 text-right">ต่อไร่ (ลบ.ม.)</th>
              <th className="py-3 px-3.5 text-right">รวมทั้งแปลง ({areaRai} ไร่)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {schedule.map((item, index) => {
              const farmAmount = item.amountPerRaiM3 * areaRai;
              return (
                <tr key={index} className="hover:bg-surface-sunken/60 transition-colors">
                  <td className="py-3.5 px-3.5 font-bold text-text">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-tint-sky text-brand flex items-center justify-center text-[11px] font-bold shrink-0">
                        {index + 1}
                      </span>
                      <span>{item.phase}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3.5 text-text-muted max-w-xs">{item.management}</td>
                  <td className="py-3.5 px-3.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-surface-sunken text-text font-medium border border-border">
                      {item.freq}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-mono font-medium text-text">
                    {item.amountPerRaiM3 > 0 ? (
                      `${item.amountPerRaiM3.toLocaleString()} ลบ.ม.`
                    ) : (
                      <span className="text-text-muted">0 (งดให้น้ำ)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-mono font-bold text-brand">
                    {farmAmount > 0 ? `${farmAmount.toLocaleString()} ลบ.ม.` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-tint-sky/40 font-bold text-text">
              <td colSpan={3} className="py-3.5 px-3.5 font-heading">
                ปริมาณน้ำจัดสรรรวมตลอดฤดูปลูก (Total Recommended Water Allocation)
              </td>
              <td className="py-3.5 px-3.5 text-right font-mono text-brand font-bold">
                {totalWaterPerRai.toLocaleString()} ลบ.ม./ไร่
              </td>
              <td className="py-3.5 px-3.5 text-right font-mono text-brand font-bold">
                {totalWaterFarm.toLocaleString()} ลบ.ม.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="sm:hidden space-y-3">
        {schedule.map((item, index) => {
          const farmAmount = item.amountPerRaiM3 * areaRai;
          return (
            <div
              key={index}
              className="p-3.5 rounded-lg border border-border bg-surface-sunken text-xs space-y-2"
            >
              <div className="flex items-center justify-between font-bold text-text">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-tint-sky text-brand flex items-center justify-center text-[10px] font-bold">
                    {index + 1}
                  </span>
                  <span>{item.phase}</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-surface border border-border text-text text-[11px] font-medium">
                  {item.freq}
                </span>
              </div>
              <p className="text-text-muted pl-6 leading-relaxed">{item.management}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border text-text pl-6">
                <span>ต่อไร่: <strong className="font-mono text-text">{item.amountPerRaiM3} ลบ.ม.</strong></span>
                <span>รวมทั้งแปลง: <strong className="font-mono text-brand">{farmAmount.toLocaleString()} ลบ.ม.</strong></span>
              </div>
            </div>
          );
        })}

        {/* Mobile Total */}
        <div className="p-3.5 rounded-lg bg-tint-sky border border-[#b9dff8] text-xs font-bold text-brand flex items-center justify-between">
          <span>รวมจัดสรรทั้งสิ้น:</span>
          <span className="font-mono font-bold">
            {totalWaterPerRai.toLocaleString()} ลบ.ม./ไร่ ({totalWaterFarm.toLocaleString()} ลบ.ม.)
          </span>
        </div>
      </div>
    </div>
  );
};

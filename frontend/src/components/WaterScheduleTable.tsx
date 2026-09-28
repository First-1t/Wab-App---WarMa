import React from 'react';
import { IrrigationPhase } from '../types/scenario.types';

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>📅</span>
            <span>Irrigation Schedule (ตารางการให้น้ำรายระยะ)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage-by-stage water application guideline calibrated for cassava growth
          </p>
        </div>
        <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          Total Farm Area: <span className="font-bold">{areaRai} rai</span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
              <th className="py-3 px-3">Growth Phase (ช่วงอายุพืช)</th>
              <th className="py-3 px-3">Management Guideline (แนวทางการจัดการ)</th>
              <th className="py-3 px-3">Frequency (ความถี่)</th>
              <th className="py-3 px-3 text-right">Per Rai (ลบ.ม./ไร่)</th>
              <th className="py-3 px-3 text-right">Farm Total ({areaRai} ไร่)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schedule.map((item, index) => {
              const farmAmount = item.amountPerRaiM3 * areaRai;
              return (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-bold">
                        {index + 1}
                      </span>
                      <span>{item.phase}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs">{item.management}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {item.freq}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-slate-800">
                    {item.amountPerRaiM3 > 0 ? (
                      `${item.amountPerRaiM3.toLocaleString()} m³`
                    ) : (
                      <span className="text-slate-400">0 m³ (งดน้ำ)</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-sky-800">
                    {farmAmount > 0 ? `${farmAmount.toLocaleString()} m³` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-sky-50/50 font-bold text-slate-900">
              <td colSpan={3} className="py-3 px-3">
                Total Recommended Water Allocation (ปริมาณน้ำจัดสรรรวม)
              </td>
              <td className="py-3 px-3 text-right font-mono text-sky-900">
                {totalWaterPerRai.toLocaleString()} m³/rai
              </td>
              <td className="py-3 px-3 text-right font-mono text-sky-900">
                {totalWaterFarm.toLocaleString()} m³
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
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 text-xs space-y-2"
            >
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-bold">
                    {index + 1}
                  </span>
                  <span>{item.phase}</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 text-[11px]">
                  {item.freq}
                </span>
              </div>
              <p className="text-slate-600 pl-6">{item.management}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-slate-700 pl-6">
                <span>Per Rai: <strong className="font-mono text-slate-900">{item.amountPerRaiM3} m³</strong></span>
                <span>Farm Total: <strong className="font-mono text-sky-800">{farmAmount.toLocaleString()} m³</strong></span>
              </div>
            </div>
          );
        })}

        {/* Mobile Total */}
        <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-950 flex items-center justify-between">
          <span>Total Allocation:</span>
          <span className="font-mono font-bold text-sky-900">
            {totalWaterPerRai.toLocaleString()} m³/rai ({totalWaterFarm.toLocaleString()} m³)
          </span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  MatchInputDto,
  SUPPORTED_CROPS,
  SUPPORTED_SEASONS,
  SupportedCrop,
  SupportedSeason,
} from '../types/scenario.types';

interface InputSectionProps {
  onCalculate: (input: MatchInputDto) => void;
  isLoading?: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  onCalculate,
  isLoading = false,
}) => {
  const [crop, setCrop] = useState<string>('เกษตรศาสตร์ 50');
  const [plantingSeason, setPlantingSeason] = useState<SupportedSeason>('ต้นฤดูฝน');
  const [areaRai, setAreaRai] = useState<string>('10');
  const [waterAvailableM3, setWaterAvailableM3] = useState<string>('5000');

  const parsedArea = Number(areaRai);
  const parsedWater = Number(waterAvailableM3);
  const waterPerRai =
    parsedArea > 0 ? Math.round((parsedWater / parsedArea) * 100) / 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate({
      crop,
      plantingSeason,
      areaRai: parsedArea,
      waterAvailableM3: parsedWater,
    });
  };

  const applyPreset = (
    presetCrop: string,
    presetSeason: SupportedSeason,
    presetArea: string,
    presetWater: string
  ) => {
    setCrop(presetCrop);
    setPlantingSeason(presetSeason);
    setAreaRai(presetArea);
    setWaterAvailableM3(presetWater);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>🌱</span>
            <span>Input Parameters</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select cultivar, season, and farm water availability
          </p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
          Live Backend
        </span>
      </div>

      {/* Progress Demo Presets */}
      <div className="mb-4">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
          🎯 Progress Demo Test Cases:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => applyPreset('เกษตรศาสตร์ 50', 'ต้นฤดูฝน', '10', '5000')}
            className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-left font-medium transition cursor-pointer border border-sky-200/60"
          >
            <span className="font-bold">1. เกษตรกรทั่วไป:</span> KU50 น้ำจำกัด (4.8 ตัน/ไร่)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('เกษตรศาสตร์ 50', 'ต้นฤดูฝน', '10', '2000')}
            className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-left font-medium transition cursor-pointer border border-amber-200/60"
          >
            <span className="font-bold">2. เปรียบเทียบ:</span> KU50 พึ่งน้ำฝน (3.2 ตัน/ไร่)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('ระยอง 9', 'ต้นฤดูฝน', '10', '8000')}
            className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-left font-medium transition cursor-pointer border border-emerald-200/60"
          >
            <span className="font-bold">3. แป้งสูง:</span> ระยอง 9 น้ำเต็มที่ (5.2 ตัน, แป้ง 28.5%)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('ห้วยบง 90', 'ต้นฤดูฝน', '10', '5000')}
            className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-left font-medium transition cursor-pointer border border-purple-200/60"
          >
            <span className="font-bold">4. Boundary Test:</span> ห้วยบง 90 (ไม่เดาคำตอบ)
          </button>
        </div>
        <div className="mt-1.5">
          <button
            type="button"
            onClick={() => applyPreset('เกษตรศาสตร์ 50', 'ต้นฤดูฝน', '0', '5000')}
            className="w-full py-1 text-center rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-medium transition cursor-pointer"
          >
            ⚠️ ทดสอบ Validation Error (พื้นที่ = 0 ไร่)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cultivar / Variety */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Cassava Cultivar (สายพันธุ์มันสำปะหลัง)
          </label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition disabled:opacity-60"
          >
            <optgroup label="Calibrated DSSAT Cultivars (รองรับในระบบ)">
              {SUPPORTED_CROPS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
            <optgroup label="Uncalibrated Cultivars (สำหรับทดสอบ Boundary)">
              <option value="ห้วยบง 90">ห้วยบง 90 (Uncalibrated - นอกเหนือชุดข้อมูล)</option>
              <option value="ระยอง 72">ระยอง 72 (Uncalibrated - นอกเหนือชุดข้อมูล)</option>
            </optgroup>
          </select>
        </div>

        {/* Planting Season */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Planting Season (ช่วงเวลาปลูก)
          </label>
          <select
            value={plantingSeason}
            onChange={(e) => setPlantingSeason(e.target.value as SupportedSeason)}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition disabled:opacity-60"
          >
            {SUPPORTED_SEASONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Grid for Area & Water */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Farm Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Cultivated Area (ขนาดพื้นที่)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={areaRai}
                onChange={(e) => setAreaRai(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 pr-14 transition disabled:opacity-60"
                placeholder="10"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                Rai (ไร่)
              </span>
            </div>
          </div>

          {/* Water Availability */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Available Water (ปริมาณน้ำต้นทุน)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={waterAvailableM3}
                onChange={(e) => setWaterAvailableM3(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 pr-14 transition disabled:opacity-60"
                placeholder="5000"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                m³ (ลบ.ม.)
              </span>
            </div>
          </div>
        </div>

        {/* Calculated Water per Rai Badge */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <span className="text-slate-600 font-medium">Calculated Water Density:</span>
          <span className="font-mono font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded">
            {parsedArea > 0 ? `${waterPerRai.toLocaleString()} m³/rai` : '—'}
          </span>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Matching with DSSAT Engine...</span>
            </span>
          ) : (
            <>
              <span>⚡</span>
              <span>คำนวณและแสดงคำแนะนำ (Calculate & Show Advice)</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

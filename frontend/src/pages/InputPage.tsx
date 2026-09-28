import React, { useState, useMemo } from 'react';
import {
  MatchInputDto,
  SupportedSeason,
} from '../types/scenario.types';

interface InputPageProps {
  initialValues: MatchInputDto;
  onSubmit: (input: MatchInputDto) => void;
  isLoading: boolean;
  validationError?: string | null;
  onOpenGuide: () => void;
}

export const InputPage: React.FC<InputPageProps> = ({
  initialValues,
  onSubmit,
  isLoading,
  validationError,
  onOpenGuide,
}) => {
  const [crop, setCrop] = useState<string>(
    initialValues.crop || 'เกษตรศาสตร์ 50'
  );
  const [season, setSeason] = useState<SupportedSeason>(
    (initialValues.plantingSeason as SupportedSeason) || 'ต้นฤดูฝน'
  );
  const [areaRai, setAreaRai] = useState<number>(initialValues.areaRai ?? 10);
  const [waterAvailableM3, setWaterAvailableM3] = useState<number>(
    initialValues.waterAvailableM3 ?? 5000
  );
  const [activePreset, setActivePreset] = useState<string>('ku50-deficit');

  // Real-time calculations for preview
  const waterPerRai = useMemo(() => {
    if (areaRai <= 0) return 0;
    return Math.round(waterAvailableM3 / areaRai);
  }, [areaRai, waterAvailableM3]);

  const isBoundaryCrop = crop === 'ห้วยบง 90' || crop === 'ระยอง 72';

  // Real-time preview estimates
  const previewData = useMemo(() => {
    if (isBoundaryCrop) {
      return {
        suitability: 'ค่านอกแบบจำลอง',
        suitabilityColor: 'bg-error-container text-on-error-container',
        ratioPercent: 0,
        regimeTitle: 'แบบจำลองไม่รองรับ (Uncalibrated Cultivar)',
        regimeDesc:
          'พันธุ์นี้ยังไม่มีค่าสัมประสิทธิ์ทางพันธุกรรมใน DSSAT v4.8 ระบบไม่สามารถประเมินผลผลิตได้',
        predYield: '— ตัน/ไร่',
        predStarch: '— %',
      };
    }

    if (waterPerRai <= 250) {
      return {
        suitability: 'พึ่งพาน้ำฝน',
        suitabilityColor: 'bg-surface-container-high text-on-surface-variant',
        ratioPercent: Math.min(Math.round((waterPerRai / 800) * 100), 100),
        regimeTitle: 'การเพาะปลูกแบบพึ่งน้ำฝนตามธรรมชาติ (Rainfed)',
        regimeDesc:
          `ปริมาณน้ำ ${waterPerRai.toLocaleString()} ลบ.ม./ไร่ มีน้ำจำกัดมาก แนะนำสงวนน้ำไว้พยุงช่วงฝนทิ้งช่วง`,
        predYield: crop === 'ระยอง 9' ? '3.4 ตัน/ไร่' : '3.2 ตัน/ไร่',
        predStarch: crop === 'ระยอง 9' ? '25.0 %' : '23.0 %',
      };
    } else if (waterPerRai <= 600) {
      return {
        suitability: 'เหมาะสมสูง',
        suitabilityColor: 'bg-primary-fixed text-on-primary-fixed',
        ratioPercent: Math.min(Math.round((waterPerRai / 800) * 100), 100),
        regimeTitle: 'การจัดการน้ำแบบจำกัดช่วงวิกฤต (Deficit Irrigation)',
        regimeDesc:
          `ปริมาณน้ำ ${waterPerRai.toLocaleString()} ลบ.ม./ไร่ เพียงพอต่อการให้น้ำหยดเสริม 4 ครั้ง ในช่วง 1-3 เดือนแรก เพื่อสร้างรากและจำนวนหัวต่อกอ`,
        predYield: crop === 'ระยอง 9' ? '5.0 ตัน/ไร่' : '4.8 ตัน/ไร่',
        predStarch: crop === 'ระยอง 9' ? '27.5 %' : '24.5 %',
      };
    } else {
      return {
        suitability: 'จัดการน้ำเต็มที่',
        suitabilityColor: 'bg-secondary-fixed text-on-secondary-fixed',
        ratioPercent: 100,
        regimeTitle: 'การจัดการน้ำเต็มศักยภาพ (Full Irrigation)',
        regimeDesc:
          `ปริมาณน้ำ ${waterPerRai.toLocaleString()} ลบ.ม./ไร่ เพียงพอต่อการให้น้ำสม่ำเสมอทุกช่วงอายุพืช เพื่อเร่งผลผลิตสูงสุด`,
        predYield: crop === 'ระยอง 9' ? '5.4 ตัน/ไร่' : '5.2 ตัน/ไร่',
        predStarch: crop === 'ระยอง 9' ? '28.5 %' : '26.0 %',
      };
    }
  }, [crop, isBoundaryCrop, waterPerRai]);

  // Presets Handlers
  const applyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    switch (presetKey) {
      case 'ku50-deficit':
        setCrop('เกษตรศาสตร์ 50');
        setSeason('ต้นฤดูฝน');
        setAreaRai(10);
        setWaterAvailableM3(5000);
        break;
      case 'ku50-rain':
        setCrop('เกษตรศาสตร์ 50');
        setSeason('ต้นฤดูฝน');
        setAreaRai(10);
        setWaterAvailableM3(2000);
        break;
      case 'rayong9-full':
        setCrop('ระยอง 9');
        setSeason('ต้นฤดูฝน');
        setAreaRai(10);
        setWaterAvailableM3(8000);
        break;
      case 'out-of-bound':
        setCrop('ห้วยบง 90');
        setSeason('ต้นฤดูฝน');
        setAreaRai(10);
        setWaterAvailableM3(5000);
        break;
      case 'validation-error':
        setCrop('เกษตรศาสตร์ 50');
        setSeason('ต้นฤดูฝน');
        setAreaRai(0);
        setWaterAvailableM3(5000);
        break;
      default:
        break;
    }
  };

  const handleAreaAdjust = (delta: number) => {
    setAreaRai((prev) => Math.max(1, prev + delta));
    setActivePreset('custom');
  };

  const handleWaterSet = (value: number) => {
    setWaterAvailableM3(value);
    setActivePreset('custom');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      crop,
      plantingSeason: season,
      areaRai,
      waterAvailableM3,
    });
  };

  return (
    <div className="w-full pt-[116px] sm:pt-[124px] md:pt-[100px] pb-16 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-6 sm:gap-8">
        {/* Top Branding & Biophysical Simulation Engine Status */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-surface-container-lowest p-2 shadow-sm flex items-center justify-center shrink-0 border border-surface-container">
              <span className="material-symbols-outlined text-[30px] sm:text-[34px] text-primary">
                water_drop
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-sans text-xl sm:text-2xl font-bold text-primary tracking-tight">
                  WarMa
                </span>
                <span className="bg-primary-fixed text-on-primary-fixed text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  DSSAT v4.8
                </span>
                <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2.5 py-0.5 rounded-md hidden sm:inline-block">
                  Mock Input Screen
                </span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1 leading-normal">
                แบบจำลองชีวฟิสิกส์แนะนำการจัดการน้ำมันสำปะหลังแม่นยำสูง
              </p>
            </div>
          </div>

          {/* Engine Status Badge */}
          <div className="inline-flex items-center gap-2 bg-surface-container-lowest px-3.5 py-1.5 rounded-full shadow-xs self-start md:self-auto border border-surface-container">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
            <span className="text-xs text-on-surface font-semibold">
              ระบบจำลอง DSSAT v4.8 พร้อมเชื่อมต่อ
            </span>
          </div>
        </div>

        {/* Quick Preset Scenario Carousel / Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[18px]">
                bolt
              </span>
              <span>สถานการณ์จำลองตัวอย่าง (กดสลับค่าด่วนสำหรับ Progress Demo):</span>
            </label>
            <span className="text-xs text-on-surface-variant font-medium hidden sm:inline-block">
              4 รูปแบบแปลง + 1 Validation Test
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x -mx-1 px-1">
            <button
              type="button"
              onClick={() => applyPreset('ku50-deficit')}
              className={`snap-start shrink-0 inline-flex items-center gap-1.5 min-h-[42px] px-3.5 py-2 rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                activePreset === 'ku50-deficit'
                  ? 'bg-primary text-on-primary shadow-sm ring-2 ring-primary/30'
                  : 'bg-surface-container-lowest text-on-surface border border-surface-container hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">eco</span>
              <span>🌾 KU50 น้ำจำกัด (4.8 ตัน)</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('ku50-rain')}
              className={`snap-start shrink-0 inline-flex items-center gap-1.5 min-h-[42px] px-3.5 py-2 rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                activePreset === 'ku50-rain'
                  ? 'bg-primary text-on-primary shadow-sm ring-2 ring-primary/30'
                  : 'bg-surface-container-lowest text-on-surface border border-surface-container hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-secondary text-[18px]">
                cloud
              </span>
              <span>🌧️ KU50 พึ่งฝน (3.2 ตัน)</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('rayong9-full')}
              className={`snap-start shrink-0 inline-flex items-center gap-1.5 min-h-[42px] px-3.5 py-2 rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                activePreset === 'rayong9-full'
                  ? 'bg-primary text-on-primary shadow-sm ring-2 ring-primary/30'
                  : 'bg-surface-container-lowest text-on-surface border border-surface-container hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-secondary-container text-[18px]">
                water_drop
              </span>
              <span>💧 ระยอง 9 น้ำเต็มที่ (5.2 ตัน)</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('out-of-bound')}
              className={`snap-start shrink-0 inline-flex items-center gap-1.5 min-h-[42px] px-3.5 py-2 rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                activePreset === 'out-of-bound'
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed shadow-sm ring-2 ring-tertiary'
                  : 'bg-surface-container-lowest text-tertiary border border-surface-container hover:bg-tertiary-fixed/30'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>🚫 ทดสอบค่านอกแบบจำลอง (ห้วยบง 90)</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('validation-error')}
              className={`snap-start shrink-0 inline-flex items-center gap-1.5 min-h-[42px] px-3.5 py-2 rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                activePreset === 'validation-error'
                  ? 'bg-error text-on-error shadow-sm ring-2 ring-error/40'
                  : 'bg-surface-container-lowest text-error border border-surface-container hover:bg-error-container/40'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">rule</span>
              <span>⚠️ ทดสอบ Error (พื้นที่ = 0 ไร่)</span>
            </button>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-4 rounded-2xl bg-error-container text-on-error-container flex items-start gap-3 border border-error/30 shadow-xs animate-shake">
            <span className="material-symbols-outlined text-error text-[24px] shrink-0 mt-0.5">
              error
            </span>
            <div>
              <div className="font-bold text-sm">ข้อมูลนำเข้าไม่ถูกต้อง (Validation Error)</div>
              <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{validationError}</p>
            </div>
          </div>
        )}

        {/* Main Dynamic Layout: Form + Analytical Preview */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Primary Input Form Card (7 Cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-5 sm:p-7 shadow-sm border border-surface-container flex flex-col gap-6">
            {/* Field 1: Cassava Variety */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm sm:text-base font-bold text-on-surface inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">
                    psychiatry
                  </span>
                  <span>1. สายพันธุ์มันสำปะหลัง</span>
                </label>
                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">menu_book</span>
                  <span>ดูคู่มือพันธุ์</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* KU50 Card */}
                <div
                  onClick={() => {
                    setCrop('เกษตรศาสตร์ 50');
                    setActivePreset('custom');
                  }}
                  className={`cursor-pointer rounded-xl p-4 flex flex-col justify-between transition-all border ${
                    crop === 'เกษตรศาสตร์ 50'
                      ? 'border-primary bg-primary-fixed/20 shadow-xs ring-1 ring-primary'
                      : 'border-surface-container bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-on-surface">
                        เกษตรศาสตร์ 50 (KU50)
                      </div>
                      <span className="text-xs text-primary font-semibold block mt-0.5">
                        แนะนำสำหรับน้ำจำกัด
                      </span>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        crop === 'เกษตรศาสตร์ 50'
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {crop === 'เกษตรศาสตร์ 50' ? 'check' : 'circle'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    ทนแล้งสูง ให้เปอร์เซ็นต์แป้งสม่ำเสมอ ประสิทธิภาพการใช้น้ำ (WUE) ยอดเยี่ยม
                  </p>
                </div>

                {/* Rayong 9 Card */}
                <div
                  onClick={() => {
                    setCrop('ระยอง 9');
                    setActivePreset('custom');
                  }}
                  className={`cursor-pointer rounded-xl p-4 flex flex-col justify-between transition-all border ${
                    crop === 'ระยอง 9'
                      ? 'border-secondary bg-secondary-fixed/20 shadow-xs ring-1 ring-secondary'
                      : 'border-surface-container bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-on-surface">
                        ระยอง 9 (Rayong 9)
                      </div>
                      <span className="text-xs text-secondary font-semibold block mt-0.5">
                        ศักยภาพแป้งอุตสาหกรรม
                      </span>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        crop === 'ระยอง 9'
                          ? 'bg-secondary text-on-secondary'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {crop === 'ระยอง 9' ? 'check' : 'circle'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    ตอบสนองต่อน้ำและปุ๋ยได้ดีมาก ผลผลิตหัวสดและแป้งสูงเมื่อได้น้ำช่วงสะสมอาหาร
                  </p>
                </div>

                {/* CMR38-125-77 Card */}
                <div
                  onClick={() => {
                    setCrop('CMR38-125-77');
                    setActivePreset('custom');
                  }}
                  className={`cursor-pointer rounded-xl p-4 flex flex-col justify-between transition-all border ${
                    crop === 'CMR38-125-77'
                      ? 'border-tertiary bg-tertiary-fixed/20 shadow-xs ring-1 ring-tertiary'
                      : 'border-surface-container bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-on-surface">
                        CMR38-125-77
                      </div>
                      <span className="text-xs text-on-surface-variant font-semibold block mt-0.5">
                        สายพันธุ์ทนทานก้าวหน้า
                      </span>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        crop === 'CMR38-125-77'
                          ? 'bg-tertiary text-on-tertiary'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {crop === 'CMR38-125-77' ? 'check' : 'circle'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    ระบบรากหยั่งลึก เหมาะกับสภาพเนื้อดินร่วนทราย ระบายน้ำเร็ว
                  </p>
                </div>

                {/* Huay Bong 90 (Uncalibrated Boundary Case) */}
                <div
                  onClick={() => {
                    setCrop('ห้วยบง 90');
                    setActivePreset('custom');
                  }}
                  className={`cursor-pointer rounded-xl p-4 flex flex-col justify-between transition-all border ${
                    crop === 'ห้วยบง 90'
                      ? 'border-error bg-error-container/30 shadow-xs ring-1 ring-error'
                      : 'border-surface-container bg-surface-container-low hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-on-surface">
                        ห้วยบง 90
                      </div>
                      <span className="text-xs text-error font-semibold inline-flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        <span>อยู่นอกชุดพารามิเตอร์ DSSAT</span>
                      </span>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        crop === 'ห้วยบง 90'
                          ? 'bg-error text-on-error'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {crop === 'ห้วยบง 90' ? 'priority_high' : 'circle'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-error mt-2 bg-error-container/40 p-2 rounded-lg leading-relaxed">
                    ⚠️ ไม่พบค่าพันธุกรรม (Genetic Coefficients) ในฐานข้อมูลปัจจุบัน
                  </p>
                </div>
              </div>
            </div>

            {/* Field 2: Planting Season */}
            <div>
              <label className="text-sm sm:text-base font-bold text-on-surface inline-flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  calendar_month
                </span>
                <span>2. ช่วงเวลาปลูก (Crop Phenology Cycle)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSeason('ต้นฤดูฝน');
                    setActivePreset('custom');
                  }}
                  className={`min-h-[72px] flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl text-center transition-all cursor-pointer border ${
                    season === 'ต้นฤดูฝน'
                      ? 'bg-primary-fixed/20 border-primary shadow-xs ring-1 ring-primary'
                      : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                  }`}
                >
                  <span className="text-xl sm:text-2xl mb-1">🌱</span>
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      season === 'ต้นฤดูฝน' ? 'text-primary' : 'text-on-surface'
                    }`}
                  >
                    ต้นฤดูฝน
                  </span>
                  <span className="text-xs text-on-surface-variant mt-0.5">พฤษภาคม - มิถุนายน</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSeason('ปลายฤดูฝน');
                    setActivePreset('custom');
                  }}
                  className={`min-h-[72px] flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl text-center transition-all cursor-pointer border ${
                    season === 'ปลายฤดูฝน'
                      ? 'bg-primary-fixed/20 border-primary shadow-xs ring-1 ring-primary'
                      : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                  }`}
                >
                  <span className="text-xl sm:text-2xl mb-1">🍂</span>
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      season === 'ปลายฤดูฝน' ? 'text-primary' : 'text-on-surface'
                    }`}
                  >
                    ปลายฤดูฝน
                  </span>
                  <span className="text-xs text-on-surface-variant mt-0.5">ตุลาคม - พฤศจิกายน</span>
                </button>
              </div>
            </div>

            {/* Field 3: Cultivated Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm sm:text-base font-bold text-on-surface inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">
                    grid_goldenratio
                  </span>
                  <span>3. ขนาดพื้นที่เพาะปลูก</span>
                </label>
                <span className="text-xs text-on-surface-variant font-bold">หน่วย: ไร่</span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={areaRai}
                    onChange={(e) => {
                      setAreaRai(Number(e.target.value));
                      setActivePreset('custom');
                    }}
                    className="w-full text-right text-xl sm:text-2xl font-bold py-2.5 sm:py-3 pr-4 pl-28 rounded-xl bg-surface-container-low text-on-surface border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant bg-surface-container-lowest px-2.5 py-1 rounded-md shadow-2xs border border-surface-container pointer-events-none select-none">
                    ไร่ (Rai)
                  </span>
                </div>
                {/* Stepper Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => handleAreaAdjust(1)}
                    className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-primary hover:text-on-primary transition-colors cursor-pointer border border-surface-container-high"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAreaAdjust(5)}
                    className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-primary hover:text-on-primary transition-colors cursor-pointer border border-surface-container-high"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAreaAdjust(10)}
                    className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-primary hover:text-on-primary transition-colors cursor-pointer border border-surface-container-high"
                  >
                    +10
                  </button>
                </div>
              </div>
            </div>

            {/* Field 4: Water Availability */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm sm:text-base font-bold text-on-surface inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">
                    water
                  </span>
                  <span>4. ปริมาณน้ำต้นทุนที่จัดหาได้ทั้งฤดู</span>
                </label>
                <span className="text-xs text-secondary font-bold">หน่วย: ลบ.ม. (m³)</span>
              </div>
              <div className="relative mb-3">
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={waterAvailableM3}
                  onChange={(e) => {
                    setWaterAvailableM3(Number(e.target.value));
                    setActivePreset('custom');
                  }}
                  className="w-full text-right text-xl sm:text-2xl font-bold py-2.5 sm:py-3 pr-4 pl-32 rounded-xl bg-surface-container-low text-on-surface border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary bg-surface-container-lowest px-2.5 py-1 rounded-md shadow-2xs border border-surface-container pointer-events-none select-none">
                  ลบ.ม. (m³)
                </span>
              </div>
              {/* Quick Water Tier Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleWaterSet(2000)}
                  className={`min-h-[44px] py-2 px-2 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer border ${
                    waterAvailableM3 === 2000
                      ? 'bg-secondary text-on-secondary border-secondary shadow-xs'
                      : 'bg-surface-container text-on-surface border-surface-container hover:bg-secondary-fixed hover:text-on-secondary-fixed'
                  }`}
                >
                  2,000 m³ (จำกัด)
                </button>
                <button
                  type="button"
                  onClick={() => handleWaterSet(5000)}
                  className={`min-h-[44px] py-2 px-2 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer border ${
                    waterAvailableM3 === 5000
                      ? 'bg-secondary text-on-secondary border-secondary shadow-xs'
                      : 'bg-surface-container text-on-surface border-surface-container hover:bg-secondary-fixed hover:text-on-secondary-fixed'
                  }`}
                >
                  5,000 m³ (ปานกลาง)
                </button>
                <button
                  type="button"
                  onClick={() => handleWaterSet(8000)}
                  className={`min-h-[44px] py-2 px-2 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer border ${
                    waterAvailableM3 === 8000
                      ? 'bg-secondary text-on-secondary border-secondary shadow-xs'
                      : 'bg-surface-container text-on-surface border-surface-container hover:bg-secondary-fixed hover:text-on-secondary-fixed'
                  }`}
                >
                  8,000 m³ (สมบูรณ์)
                </button>
              </div>
            </div>
          </div>

          {/* Analytical Preview Column (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Live Biophysical Indicator Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-7 shadow-sm border border-surface-container flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      analytics
                    </span>
                    <span>ผลการคำนวณเบื้องต้น (Real-time)</span>
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${previewData.suitabilityColor}`}
                  >
                    {previewData.suitability}
                  </span>
                </div>

                {/* Big Metric Radial / Box */}
                <div className="bg-gradient-to-br from-surface-container-low via-surface-container-lowest to-surface-container p-5 sm:p-6 rounded-2xl flex flex-col items-center justify-center text-center my-2 shadow-inner border border-surface-container">
                  <div className="text-xs text-on-surface-variant font-bold mb-1">
                    สัดส่วนน้ำต้นทุนเฉลี่ยต่อพื้นที่
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-extrabold text-primary tracking-tight font-sans">
                      {waterPerRai.toLocaleString()}
                    </span>
                    <span className="text-sm text-on-surface-variant font-semibold">
                      ลบ.ม./ไร่
                    </span>
                  </div>
                  {/* Gauge Bar */}
                  <div className="w-full bg-surface-container-high h-2.5 rounded-full mt-4 overflow-hidden relative">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${previewData.ratioPercent}%` }}
                    />
                  </div>
                  <div className="w-full flex justify-between text-xs text-on-surface-variant mt-2 px-0.5 font-medium">
                    <span>0 (พึ่งฝน)</span>
                    <span>350 (วิกฤต)</span>
                    <span>800+ (เต็มรูป)</span>
                  </div>
                </div>

                {/* Model Strategy Recommendation Preview */}
                <div className="mt-4 p-4 rounded-xl bg-surface-container-low flex items-start gap-3 border border-surface-container">
                  <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">
                    verified
                  </span>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-on-surface">
                      {previewData.regimeTitle}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {previewData.regimeDesc}
                    </p>
                  </div>
                </div>

                {/* Projected Yield & Starch Estimate Mini Grid */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-surface-container-low p-3.5 rounded-xl text-center border border-surface-container">
                    <span className="text-xs text-on-surface-variant block">คาดการณ์ผลผลิตเฉลี่ย</span>
                    <div className="text-base sm:text-lg font-bold text-primary mt-1">
                      {previewData.predYield}
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-3.5 rounded-xl text-center border border-surface-container">
                    <span className="text-xs text-on-surface-variant block">เปอร์เซ็นต์แป้งหัวสด</span>
                    <div className="text-base sm:text-lg font-bold text-secondary mt-1">
                      {previewData.predStarch}
                    </div>
                  </div>
                </div>
              </div>

              {/* Boundary Condition Warning Banner */}
              {isBoundaryCrop && (
                <div className="mt-4 p-4 bg-tertiary-fixed text-on-tertiary-fixed rounded-xl flex items-start gap-3 border border-tertiary">
                  <span className="material-symbols-outlined text-tertiary text-[22px] shrink-0 mt-0.5">
                    warning
                  </span>
                  <div>
                    <div className="text-xs font-bold">
                      แจ้งเตือน: อยู่นอกช่วงการจำลอง (Out of Boundary)
                    </div>
                    <p className="text-xs mt-1 leading-relaxed">
                      พันธุ์ "{crop}" อยู่นอกฐานข้อมูลชีวฟิสิกส์ เมื่อกดส่ง ระบบจะแสดงหน้าจอแจ้งเตือนปฏิเสธการคาดเดาตามกติกาวิจัย
                    </p>
                  </div>
                </div>
              )}

              {/* Primary Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full group relative flex items-center justify-center p-4 min-h-[52px] sm:min-h-[56px] rounded-2xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.99] transition-all text-center cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="inline-flex items-center gap-2 text-sm sm:text-base">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>กำลังประมวลผลกับ DSSAT Engine...</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 text-sm sm:text-base">
                      <span>คำนวณและแสดงคำแนะนำการจัดการน้ำ</span>
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-[20px]">
                        arrow_forward
                      </span>
                    </div>
                  )}
                </button>
                <p className="text-xs text-on-surface-variant text-center mt-2.5 inline-flex items-center justify-center gap-1.5 w-full">
                  <span className="material-symbols-outlined text-[15px] text-primary">
                    verified_user
                  </span>
                  <span>อิงแบบจำลองชีวฟิสิกส์ DSSAT Cassava Crop Model สำหรับประเทศไทย</span>
                </p>
              </div>
            </div>

            {/* Demonstration Boundary Switch Quick Toggle Card */}
            <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface shrink-0">
                  <span className="material-symbols-outlined text-[20px]">science</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface">
                    จำลองกรณีค่านอกกรอบวิจัย
                  </div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    {isBoundaryCrop ? 'กำลังเลือกพันธุ์ห้วยบง 90' : 'ทดสอบ UI เมื่อแบบจำลองไม่รองรับ'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isBoundaryCrop) {
                    setCrop('เกษตรศาสตร์ 50');
                    setActivePreset('ku50-deficit');
                  } else {
                    setCrop('ห้วยบง 90');
                    setActivePreset('out-of-bound');
                  }
                }}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 border ${
                  isBoundaryCrop
                    ? 'bg-primary text-on-primary border-primary hover:bg-primary-container'
                    : 'bg-surface-container text-on-surface border-surface-container hover:bg-tertiary-fixed hover:text-on-tertiary-fixed'
                }`}
              >
                {isBoundaryCrop ? 'กลับสู่พันธุ์ปกติ' : 'ทดสอบสลับ'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

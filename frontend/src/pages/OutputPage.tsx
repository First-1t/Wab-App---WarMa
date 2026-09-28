import React, { useState } from 'react';
import {
  MatchInputDto,
  MatchOutputDto,
  RiskLevel,
} from '../types/scenario.types';

interface OutputPageProps {
  inputData: MatchInputDto;
  outputData: MatchOutputDto | null;
  error: {
    title: string;
    message: string;
    details?: string[];
    isNotFound?: boolean;
    isNetworkError?: boolean;
  } | null;
  onNavigateToInput: () => void;
  onSelectCalibratedVariety: (varietyName: string) => void;
}

export const OutputPage: React.FC<OutputPageProps> = ({
  inputData,
  outputData,
  error,
  onNavigateToInput,
  onSelectCalibratedVariety,
}) => {
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  const matched = outputData?.matchedScenario;
  const isBoundary =
    Boolean(error?.isNotFound) ||
    outputData?.confidence === 'out_of_bounds' ||
    inputData.crop === 'ห้วยบง 90' ||
    inputData.crop === 'ระยอง 72';

  const areaRai = outputData?.inputSummary?.areaRai ?? inputData.areaRai ?? 10;
  const waterAvailableM3 =
    outputData?.inputSummary?.waterAvailableM3 ??
    inputData.waterAvailableM3 ??
    5000;
  const crop = outputData?.inputSummary?.crop ?? inputData.crop ?? 'เกษตรศาสตร์ 50';

  // Handle Share micro-interaction
  const handleShare = async () => {
    const shareTitle = 'แผนจัดการน้ำมันสำปะหลัง WarMa';
    const shareText = matched
      ? `ผลวิเคราะห์คาดการณ์ผลผลิตมันสำปะหลัง: ${matched.freshYield.avgTonsPerRai} ตัน/ไร่ (แป้ง ${matched.freshYield.estimatedStarchPercent}%) ใช้น้ำ ${matched.waterPerRaiM3} ลบ.ม./ไร่ แปลง ${areaRai} ไร่`
      : 'ระบบแนะนำการจัดการน้ำมันสำปะหลัง WarMa';
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });
      } catch {
        // User dismissed share dialog
      }
    } else {
      await navigator.clipboard.writeText(`${shareTitle} - ${shareText} (${url})`);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }
  };

  // Helper for risk badge
  const getRiskPill = (risk: RiskLevel = 'ปานกลาง') => {
    switch (risk) {
      case 'ต่ำ':
        return {
          bg: 'bg-primary-fixed/30 text-on-primary-fixed-variant border-primary-fixed',
          icon: 'verified_user',
          text: 'ความเสี่ยง: ต่ำ (ปริมาณน้ำเพียงพอตลอดทุกระยะ)',
        };
      case 'สูง':
        return {
          bg: 'bg-error-container/40 text-on-error-container border-error/20',
          icon: 'warning',
          text: 'ความเสี่ยง: สูง (พึ่งพาฝนธรรมชาติ เสี่ยงขาดน้ำช่วงสะสมแป้ง)',
        };
      case 'ปานกลาง':
      default:
        return {
          bg: 'bg-tertiary-fixed/30 text-on-tertiary-fixed-variant border-tertiary-fixed',
          icon: 'verified_user',
          text: 'ความเสี่ยง: ปานกลาง (ควบคุมความชื้นช่วง 1-90 วันได้ดี)',
        };
    }
  };

  // Fallback if no data and no error yet
  if (!outputData && !error) {
    return (
      <div className="w-full pt-[116px] sm:pt-[124px] md:pt-[100px] pb-16 bg-surface min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6 sm:p-8 bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container mx-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[32px]">water_drop</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-on-surface mb-2">
            ยังไม่มีข้อมูลผลวิเคราะห์
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mb-6 leading-relaxed">
            กรุณากรอกข้อมูลแปลงและกด "คำนวณและแสดงคำแนะนำ" จากหน้าคำนวณการใช้น้ำ
          </p>
          <button
            onClick={onNavigateToInput}
            className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm hover:bg-primary-container transition cursor-pointer flex items-center justify-center gap-2"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>ไปที่หน้าคำนวณการใช้น้ำ</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 1: BOUNDARY CONDITION / OUT OF MODEL
  // ==========================================
  if (isBoundary || !matched) {
    return (
      <div className="w-full pt-[116px] sm:pt-[124px] md:pt-[100px] pb-16 bg-surface min-h-screen">
        <div className="max-w-4xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 flex flex-col gap-6 sm:gap-8">
          {/* Top Bar Navigation & Selection Chips */}
          <div className="flex items-center justify-between gap-2 bg-surface-container-lowest px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow-xs border border-surface-container w-full">
            <button
              onClick={onNavigateToInput}
              className="shrink-0 inline-flex items-center gap-1 text-primary font-bold text-xs sm:text-sm hover:text-primary-container transition-colors group cursor-pointer min-h-[36px] whitespace-nowrap"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[20px] transition-transform group-hover:-translate-x-1 shrink-0">
                arrow_back
              </span>
              <span className="hidden sm:inline">กลับไปปรับข้อมูลแปลง</span>
              <span className="sm:hidden">ปรับแปลง</span>
            </button>

            <div className="shrink min-w-0 inline-flex items-center gap-1.5 sm:gap-2 overflow-hidden">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] sm:text-xs font-semibold shadow-2xs border border-tertiary-fixed-dim whitespace-nowrap truncate">
                <span className="material-symbols-outlined text-[14px] text-tertiary shrink-0">
                  warning
                </span>
                <span className="truncate">พันธุ์: {crop}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0"></span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface text-xs font-medium whitespace-nowrap">
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                  grid_view
                </span>
                <span>{areaRai} ไร่</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface text-xs font-medium whitespace-nowrap">
                <span className="material-symbols-outlined text-[14px] text-secondary">
                  water_drop
                </span>
                <span>{waterAvailableM3.toLocaleString()} ลบ.ม.</span>
              </span>
            </div>
          </div>

          {/* Main Friendly Alert Card */}
          <div className="relative overflow-hidden bg-gradient-to-b from-tertiary-fixed/30 to-tertiary-fixed/60 rounded-2xl p-5 sm:p-8 md:p-10 shadow-md border border-tertiary/30 flex flex-col items-center text-center">
            {/* Top Decorative Ambient Glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-tertiary-fixed-dim/40 rounded-full blur-3xl pointer-events-none"></div>

            {/* Icon Graphic */}
            <div className="relative mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center border border-tertiary/20">
                <span className="material-symbols-outlined text-[36px] sm:text-[44px] text-tertiary">
                  shield_with_heart
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[16px]">
                  priority_high
                </span>
              </div>
            </div>

            {/* Alert Heading & Status */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs uppercase tracking-wide font-bold mb-3 border border-tertiary-fixed-dim">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse shrink-0"></span>
              <span>แบบจำลองไม่รองรับเงื่อนไขนี้ (Boundary Exception)</span>
            </div>

            <h1 className="text-lg sm:text-2xl font-bold text-on-surface max-w-xl mb-3 leading-snug">
              ไม่มีข้อมูลสถานการณ์จำลองที่ตรงกับเงื่อนไขในระบบ
            </h1>

            <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl mb-6 leading-relaxed">
              ระบบ WarMa คำนวณผลผลิตด้วยอัลกอริทึมชีวฟิสิกส์ชั้นสูง จึง<strong>ไม่สามารถคาดเดาผลลัพธ์ได้อย่างแม่นยำ</strong> นอกเหนือจากชุดข้อมูลของแบบจำลองวิทยาศาสตร์{' '}
              <strong className="text-on-surface">DSSAT Cassava Crop Model</strong> สำหรับพันธุ์{' '}
              <span className="text-tertiary font-bold underline decoration-tertiary/40">
                {crop}
              </span>{' '}
              ในขณะนี้ (อาจารย์กำชับ: นอกเหนือ ตอบไม่ได้ ห้ามเดาผลลัพธ์)
            </p>

            {/* Calibrated Varieties Guidance Box */}
            <div className="w-full max-w-2xl bg-surface-container-lowest/95 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm border border-surface-container text-left mb-6 sm:mb-8">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-on-surface mb-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  verified
                </span>
                <span>พันธุ์มาตรฐานที่ผ่านการสอบเทียบ (Calibrated) พร้อมใช้งานในระบบ:</span>
              </div>
              <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                ได้รับการรับรองค่าสัมประสิทธิ์พันธุกรรมร่วมกับแปลงวิจัย พร้อมให้คำแนะนำรอบการให้น้ำระดับแปลง:
              </p>

              {/* Variety Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Variety 1 */}
                <div
                  onClick={() => onSelectCalibratedVariety('เกษตรศาสตร์ 50')}
                  className="flex flex-col p-3.5 bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl group cursor-pointer border border-surface-container hover:border-primary"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-primary">1. เกษตรศาสตร์ 50</span>
                    <span className="material-symbols-outlined text-[16px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      arrow_forward
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-on-surface mb-1">KU50</span>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    ทนแล้งยอดเยี่ยม ปรับตัวได้กว้าง ประสิทธิภาพการใช้น้ำสูง
                  </p>
                </div>

                {/* Variety 2 */}
                <div
                  onClick={() => onSelectCalibratedVariety('ระยอง 9')}
                  className="flex flex-col p-3.5 bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl group cursor-pointer border border-surface-container hover:border-secondary"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-secondary">2. ระยอง 9</span>
                    <span className="material-symbols-outlined text-[16px] text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                      arrow_forward
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-on-surface mb-1">Rayong 9</span>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    ศักยภาพแป้งและผลผลิตสูงมากเมื่อมีระบบน้ำเสริมแปลง
                  </p>
                </div>

                {/* Variety 3 */}
                <div
                  onClick={() => onSelectCalibratedVariety('CMR38-125-77')}
                  className="flex flex-col p-3.5 bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl group cursor-pointer border border-surface-container hover:border-tertiary"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-tertiary">3. CMR38-125-77</span>
                    <span className="material-symbols-outlined text-[16px] text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">
                      arrow_forward
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-on-surface mb-1">CMR Series</span>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    รากหยั่งลึก ดูดซึมธาตุอาหารในดินร่วนปนทรายได้เสถียร
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-lg">
              <button
                onClick={() => onSelectCalibratedVariety('เกษตรศาสตร์ 50')}
                className="w-full sm:w-auto flex-1 min-h-[48px] px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-bold hover:bg-primary-container shadow-md inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">sync</span>
                <span>เปลี่ยนเป็นพันธุ์มาตรฐาน (KU50)</span>
              </button>
              <button
                onClick={onNavigateToInput}
                className="w-full sm:w-auto flex-1 min-h-[48px] px-6 py-2.5 rounded-xl bg-secondary-fixed text-on-secondary-fixed text-xs sm:text-sm font-bold hover:bg-secondary-fixed-dim shadow-xs inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer border border-secondary-fixed-dim"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
                <span>กลับไปปรับพารามิเตอร์</span>
              </button>
            </div>
          </div>

          {/* Supplementary Scientific Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl shadow-xs border border-surface-container flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">science</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-on-surface mb-1">
                  ทำไมต้องอิงตามแบบจำลอง?
                </span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  แบบจำลอง DSSAT ใช้ค่าพันธุกรรมจำเพาะ (Genetic Coefficients) เช่น อัตราการสะสมน้ำหนักหัวมัน อุณหภูมิวิกฤต และดัชนีพื้นที่ใบ หากใช้ข้อมูลพันธุ์ที่ยังไม่เทียบวัด ผลการประเมินน้ำอาจคลาดเคลื่อนจนกระทบต้นทุนเกษตรกร
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl shadow-xs border border-surface-container flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">contact_support</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-on-surface mb-1">
                  ต้องการเพิ่มพันธุ์ห้วยบง 90?
                </span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  คณะวิจัยกำลังอยู่ในขั้นตอนเก็บตัวอย่างสนามเพิ่มเติม หากแปลงของท่านเป็นแปลงทดลองและมีข้อมูลสภาพอากาศ สามารถประสานทีมงานเพื่อร่วมเป็นแปลงนำร่องได้
                </p>
              </div>
            </div>
          </div>

          {/* Support Footnote */}
          <div className="text-center pt-1 pb-2">
            <div className="inline-flex items-center gap-1.5 text-on-surface-variant text-xs font-medium">
              <span className="material-symbols-outlined text-[16px] text-outline">
                account_balance
              </span>
              <span>โครงการวิจัยการเพิ่มประสิทธิภาพการใช้น้ำในมันสำปะหลังด้วยแบบจำลอง DSSAT • มหาวิทยาลัยเกษตรศาสตร์ &amp; สวทช.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 2: SUCCESSFUL MATCHED SCENARIO DASHBOARD
  // ==========================================
  const farmYield = outputData.farmYieldSummary;
  const waterAlloc = outputData.waterAllocation;
  const avgYield = matched.freshYield.avgTonsPerRai;
  const totalFreshTons =
    farmYield?.totalFarmFreshYieldTons ??
    Math.round(avgYield * areaRai * 10) / 10;
  const starchPercent = matched.freshYield.estimatedStarchPercent;
  const totalStarchTons = farmYield?.totalStarchWeightKg
    ? Math.round((farmYield.totalStarchWeightKg / 1000) * 10) / 10
    : Math.round(((totalFreshTons * 1000 * starchPercent) / 100000) * 10) / 10;

  // Water allocation metrics
  const waterPerRai = matched.waterPerRaiM3;
  const totalFarmWaterAllocated = waterPerRai * areaRai;
  const waterSufficiency = waterAlloc?.waterSufficiencyPercent ?? (
    waterAvailableM3 > 0
      ? Math.min(Math.round((waterAvailableM3 / (matched.waterRequirementM3 * areaRai || 1)) * 100), 100)
      : 0
  );
  const reserveWater = Math.max(0, waterAvailableM3 - totalFarmWaterAllocated);

  const riskInfo = getRiskPill(matched.risk);

  return (
    <div className="w-full pt-[116px] sm:pt-[124px] md:pt-[100px] pb-16 bg-surface min-h-screen">
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 flex flex-col gap-6 sm:gap-8">
        {/* Top Bar Navigation / Field Metadata Context */}
        <div className="flex items-center justify-between gap-2 bg-surface-container-lowest px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow-xs border border-surface-container w-full">
          <button
            onClick={onNavigateToInput}
            className="shrink-0 inline-flex items-center gap-1 text-primary font-bold text-xs sm:text-sm hover:text-primary-container transition-colors group cursor-pointer min-h-[36px] whitespace-nowrap"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px] transition-transform group-hover:-translate-x-1 shrink-0">
              arrow_back
            </span>
            <span className="hidden sm:inline">แก้ไขข้อมูลแปลง</span>
            <span className="sm:hidden">แก้ไขแปลง</span>
          </button>

          {/* Active Field Chip */}
          <div className="shrink min-w-0 inline-flex items-center gap-1.5 bg-surface-container px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full shadow-2xs border border-surface-container-high/60 whitespace-nowrap overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0"></span>
            <span className="text-[11px] sm:text-xs font-semibold text-on-surface truncate">
              🌱 แปลง {areaRai} ไร่ • 💧 น้ำ {waterAvailableM3.toLocaleString()} ลบ.ม. • {crop}
            </span>
          </div>
        </div>

        {/* Section 1: Hero Prediction Card */}
        <div className="relative bg-surface-container-lowest rounded-2xl p-5 sm:p-7 md:p-8 shadow-md border border-surface-container overflow-hidden">
          {/* Glow ambient backdrop element */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-5 sm:gap-6">
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold border border-primary/20 shrink min-w-0">
                <span className="material-symbols-outlined text-[15px] sm:text-[16px] shrink-0">analytics</span>
                <span className="truncate">
                  ผลวิเคราะห์ AI ประจำแปลง <span className="hidden sm:inline">(DSSAT Engine)</span>
                </span>
              </div>
              <span className="text-[11px] sm:text-xs text-on-surface-variant font-medium shrink-0 whitespace-nowrap">
                Scenario: <strong className="text-on-surface font-mono">{matched.id}</strong>
              </span>
            </div>

            {/* Main Yield Figure */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-semibold text-on-surface-variant">
                  ผลผลิตสดคาดการณ์ (Predicted Fresh Yield)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-sans text-5xl sm:text-6xl md:text-7xl leading-none text-primary font-bold tracking-tight">
                    {avgYield.toFixed(1)}
                  </span>
                  <span className="text-lg sm:text-2xl text-on-surface font-semibold">
                    ตัน / ไร่
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-2 inline-flex items-center gap-1.5 font-medium flex-wrap">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    inventory_2
                  </span>
                  <span>
                    ผลผลิตสดรวมทั้งแปลง ({areaRai} ไร่):{' '}
                    <strong className="text-on-surface font-bold">
                      {totalFreshTons.toLocaleString()} ตัน
                    </strong>
                  </span>
                </p>
              </div>

              {/* Starch Content Badge Box */}
              <div className="bg-surface-container-low p-3.5 sm:p-4 rounded-xl flex items-center gap-3.5 border border-surface-container">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shrink-0">
                  <span className="material-symbols-outlined text-[26px]">star</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface-variant font-medium">
                    เกรดคุณภาพโรงงานแป้ง
                  </span>
                  <span className="text-base sm:text-lg font-bold text-tertiary">
                    แป้งคาดการณ์ {starchPercent.toFixed(1)}%
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium">
                    ผลผลิตแป้งรวม ~{totalStarchTons.toLocaleString()} ตัน
                  </span>
                </div>
              </div>
            </div>

            {/* Water & Risk Status Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-surface-container">
              <div className="flex items-center gap-2.5 bg-secondary-fixed/30 text-on-secondary-fixed-variant p-3 rounded-xl border border-secondary-fixed">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">
                  water_drop
                </span>
                <span className="text-xs font-semibold">
                  สถานะน้ำ: {matched.waterCondition} ({matched.plantingSeason})
                </span>
              </div>
              <div className={`flex items-center gap-2.5 p-3 rounded-xl border ${riskInfo.bg}`}>
                <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0">
                  {riskInfo.icon}
                </span>
                <span className="text-xs font-semibold">{riskInfo.text}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Water Allocation Card */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-7 md:p-8 shadow-sm border border-surface-container flex flex-col gap-5 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-[24px]">water_ph</span>
              </div>
              <div className="flex flex-col">
                <h2 className="text-base sm:text-lg font-bold text-on-surface">
                  การจัดสรรโควต้าน้ำทั้งฤดูปลูก
                </h2>
                <span className="text-xs text-on-surface-variant">
                  เปรียบเทียบน้ำต้นทุนสระกักเก็บ vs ปริมาณใช้น้ำจริง
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right mt-1 sm:mt-0">
              <span className="text-xs text-on-surface-variant block">ปริมาณน้ำที่ต้องใช้รวม</span>
              <span className="text-base sm:text-lg font-bold text-secondary">
                {totalFarmWaterAllocated.toLocaleString()} ลบ.ม.
              </span>
              <span className="text-xs text-on-surface-variant block">
                {waterPerRai.toLocaleString()} ลบ.ม./ไร่ (จากน้ำต้นทุน {waterAvailableM3.toLocaleString()} ลบ.ม.)
              </span>
            </div>
          </div>

          {/* Water Sufficiency Gauge / Progress Bar */}
          <div className="flex flex-col gap-2 bg-surface-container-low p-4 rounded-xl border border-surface-container">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-on-surface inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  waves
                </span>
                <span>ความเพียงพอของน้ำในการปลูก</span>
              </span>
              <span className="text-sm sm:text-base font-bold text-secondary">
                {waterSufficiency}%
              </span>
            </div>

            {/* Track & Fill Progress Bar */}
            <div className="w-full bg-surface-container-high h-3.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-secondary h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(waterSufficiency, 100)}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs pt-1 text-on-surface-variant gap-2">
              <span>ความต้องการระบบน้ำหยด: {totalFarmWaterAllocated.toLocaleString()} ลบ.ม.</span>
              <span className="text-primary font-semibold inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>
                  {reserveWater > 0
                    ? `เหลือน้ำสำรอง ${reserveWater.toLocaleString()} ลบ.ม. เผื่อภาวะฝนทิ้งช่วง`
                    : 'จัดสรรน้ำพอดีกับน้ำต้นทุนที่มี'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Irrigation Schedule (4 Timeline Phases) */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg font-bold text-on-surface">
              ตารางการให้น้ำอัจฉริยะรายระยะการเจริญเติบโต
            </h2>
            <span className="text-xs text-on-surface-variant">
              ปรับตามพฤติกรรมมันสำปะหลังเพื่อประสิทธิภาพการสะสมแป้งสูงสุด
            </span>
          </div>

          <div className="relative flex flex-col gap-4 pl-7 sm:pl-9 before:content-[''] before:absolute before:left-[13px] sm:before:left-[17px] before:top-4 before:bottom-4 before:w-0.5 before:bg-surface-container-highest">
            {matched.schedule && matched.schedule.length > 0 ? (
              matched.schedule.map((phase, idx) => (
                <div
                  key={idx}
                  className="relative flex flex-col sm:flex-row gap-3 sm:gap-4 bg-surface-container-lowest p-4 sm:p-5 rounded-xl shadow-xs border border-surface-container"
                >
                  <div className="absolute -left-[27px] sm:-left-[35px] top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold shadow-xs z-10">
                    {idx + 1}
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-on-surface">
                          {phase.phase}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-semibold">
                          {phase.freq}
                        </span>
                      </div>
                      <div className="bg-surface-container-high px-2.5 py-1 rounded-lg text-secondary text-xs font-bold">
                        {phase.amountPerRaiM3 > 0
                          ? `${phase.amountPerRaiM3} ลบ.ม./ไร่`
                          : '0 ลบ.ม. (งดให้น้ำ)'}
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {phase.management}
                    </p>
                    <div className="bg-surface-container-low px-3 py-1.5 rounded-lg inline-flex items-center gap-2 mt-1 border border-surface-container text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
                        eco
                      </span>
                      <span>
                        ยอดรวมแปลง {areaRai} ไร่: {(phase.amountPerRaiM3 * areaRai).toLocaleString()} ลบ.ม.
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-on-surface-variant">ไม่มีข้อมูลรอบการให้น้ำ</p>
            )}
          </div>
        </div>

        {/* Section 4: Scenario Comparison (3 comparative cards) */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg font-bold text-on-surface">
              เปรียบเทียบทางเลือกการจัดการน้ำ (Scenarios)
            </h2>
            <span className="text-xs text-on-surface-variant">
              ตัดสินใจเลือกแนวทางที่เหมาะสมกับสภาพแปลงและงบประมาณของคุณ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card A (Active / Recommended) */}
            <div className="relative bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-sm border-2 border-primary flex flex-col justify-between gap-4 bg-gradient-to-b from-primary/5 to-transparent">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary font-bold uppercase tracking-wider">
                    ทางเลือกปัจจุบัน
                  </span>
                  <span className="bg-primary text-on-primary text-[11px] font-bold px-2 py-0.5 rounded-full">
                    แนะนำคุ้มค่าสูงสุด 🏆
                  </span>
                </div>
                <h3 className="text-sm font-bold text-on-surface">
                  {matched.name}
                </h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-primary font-sans">
                    {matched.freshYield.avgTonsPerRai.toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold text-on-surface">ตัน / ไร่</span>
                </div>
                <div className="flex flex-col gap-1 text-on-surface-variant text-xs">
                  <div className="flex items-center justify-between">
                    <span>ปริมาณน้ำ:</span>
                    <span className="font-semibold text-on-surface">
                      {matched.waterPerRaiM3} ลบ.ม./ไร่
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ความคุ้มค่า:</span>
                    <span className="text-primary font-semibold">สูงสุด (ต้นทุนเหมาะสม)</span>
                  </div>
                </div>
              </div>
              <div className="bg-primary/10 text-primary p-2.5 rounded-lg text-center text-xs font-semibold border border-primary/20">
                สอดคล้องกับน้ำต้นทุน {waterAvailableM3.toLocaleString()} ลบ.ม.
              </div>
            </div>

            {/* Candidates comparison */}
            {outputData.comparisonCandidates && outputData.comparisonCandidates.length > 0 ? (
              outputData.comparisonCandidates.slice(0, 2).map((cand, idx) => {
                const yieldDelta =
                  Math.round((cand.freshYield.avgTonsPerRai - matched.freshYield.avgTonsPerRai) * 10) / 10;
                const isRainfed = cand.waterCondition === 'พึ่งพาน้ำฝน';

                return (
                  <div
                    key={cand.id || idx}
                    className="bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-xs border border-surface-container flex flex-col justify-between gap-4"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                          ทางเลือกที่ {idx + 2}
                        </span>
                        <span className="bg-surface-container-high text-on-surface-variant text-[11px] font-medium px-2 py-0.5 rounded-full">
                          {isRainfed ? 'ไม่ลงทุนระบบ' : 'ผลผลิตสูง'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-on-surface">
                        {cand.name}
                      </h3>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-on-surface font-sans">
                          {cand.freshYield.avgTonsPerRai.toFixed(1)}
                        </span>
                        <span className="text-xs font-semibold text-on-surface-variant">ตัน / ไร่</span>
                      </div>
                      <div className="flex flex-col gap-1 text-on-surface-variant text-xs">
                        <div className="flex items-center justify-between">
                          <span>ปริมาณน้ำ:</span>
                          <span className="font-semibold text-on-surface">
                            {cand.waterPerRaiM3} ลบ.ม./ไร่
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>เปรียบเทียบผลผลิต:</span>
                          <span
                            className={`font-semibold ${
                              yieldDelta >= 0 ? 'text-secondary' : 'text-error'
                            }`}
                          >
                            {yieldDelta > 0 ? `+${yieldDelta}` : yieldDelta} ตัน/ไร่
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-surface-container-low text-on-surface-variant p-2.5 rounded-lg text-center text-xs border border-surface-container">
                      {isRainfed
                        ? `สูญเสียโอกาสผลผลิต ~${Math.abs(yieldDelta)} ตัน/ไร่`
                        : `ใช้น้ำเพิ่ม ${Math.max(0, cand.waterPerRaiM3 - matched.waterPerRaiM3)} ลบ.ม./ไร่`}
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-xs border border-surface-container flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-on-surface-variant font-bold">ทางเลือกที่ 2</span>
                    <h3 className="text-sm font-bold text-on-surface">พึ่งพาน้ำฝนล้วน</h3>
                    <div className="text-2xl font-bold text-on-surface font-sans">3.2 ตัน/ไร่</div>
                    <span className="text-xs text-error font-medium">สูญเสียโอกาส: -1.6 ตัน/ไร่</span>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-xs border border-surface-container flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-on-surface-variant font-bold">ทางเลือกที่ 3</span>
                    <h3 className="text-sm font-bold text-on-surface">จัดการน้ำเต็มที่</h3>
                    <div className="text-2xl font-bold text-secondary font-sans">5.4 ตัน/ไร่</div>
                    <span className="text-xs text-secondary font-medium">ผลผลิตเพิ่ม +0.6 ตัน/ไร่</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 5: Actionable Advice List */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-7 md:p-8 shadow-sm border border-surface-container flex flex-col gap-5 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[24px]">task_alt</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-base sm:text-lg font-bold text-on-surface">
                ข้อแนะนำเชิงปฏิบัติจริงในแปลง
              </h2>
              <span className="text-xs text-on-surface-variant">
                แนวทางสำหรับคนเฝ้าแปลงเพื่อลดการสูญเสียน้ำและเพิ่มประสิทธิภาพปุ๋ย
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="flex items-start gap-3 bg-surface-container-low p-4 rounded-xl border border-surface-container">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[15px]">check</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-on-surface">
                  ติดตั้งระบบเทปน้ำหยด 1.0 - 1.2 ม.
                </span>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  วางแนวสายขนานไปกับร่องมันสำปะหลัง จัดตำแหน่งหัวหยดให้ใกล้แนวโคนต้น
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-surface-container-low p-4 rounded-xl border border-surface-container">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[15px]">check</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-on-surface">
                  ตรวจสอบดินลึก 15-20 ซม.
                </span>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  ใช้มือปั้นดินเป็นก้อนก่อนเปิดวาล์ว หากดินยังเกาะตัวเป็นก้อนชื้น ให้เลื่อนการให้น้ำออกไป
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-surface-container-low p-4 rounded-xl border border-surface-container">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[15px]">check</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-on-surface">
                  ให้น้ำช่วงเช้า 06:00 - 09:00 น.
                </span>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  ลดการระเหยของน้ำเนื่องจากแดดจัด และรากพืชสามารถนำน้ำไปใช้สังเคราะห์แสงได้ทันที
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-surface-container-low p-4 rounded-xl border border-surface-container">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[15px]">check</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-on-surface">
                  คลุมโคนด้วยเศษใบมันหรือฟาง
                </span>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  รักษาความชื้นผิวดินช่วง 60 วันแรก ช่วยคุมอุณหภูมิดินและยับยั้งการเจริญเติบโตของวัชพืช
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons & Export Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pb-6">
          <button
            onClick={() => window.print()}
            className="min-h-[48px] px-6 rounded-xl bg-surface-container-high text-on-surface text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-surface-variant active:scale-95 transition-all shadow-xs cursor-pointer border border-surface-container-highest"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">print</span>
            <span>พิมพ์คำแนะนำ / บันทึก PDF</span>
          </button>
          <button
            onClick={handleShare}
            className="min-h-[48px] px-7 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-primary-container active:scale-95 transition-all shadow-md cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {copyFeedback ? 'done' : 'share'}
            </span>
            <span>{copyFeedback ? 'คัดลอกลิงก์แล้ว!' : 'แชร์ให้กลุ่มเกษตรกร / LINE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

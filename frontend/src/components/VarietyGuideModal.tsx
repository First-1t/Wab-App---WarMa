import React from 'react';

interface VarietyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVariety?: (varietyName: string) => void;
}

export const VarietyGuideModal: React.FC<VarietyGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectVariety,
}) => {
  if (!isOpen) return null;

  const varieties = [
    {
      name: 'เกษตรศาสตร์ 50 (KU50)',
      id: 'เกษตรศาสตร์ 50',
      badge: 'แนะนำสำหรับน้ำจำกัด • ทนแล้งสูง',
      color: 'primary',
      description:
        'พันธุ์ยอดนิยมอันดับ 1 ของไทย ปรับตัวเข้ากับสภาพดินฟ้าอากาศได้ดีมาก ทนทานต่อความแห้งแล้ง ให้เปอร์เซ็นต์แป้งสม่ำเสมอ (24–28%) ระบบรากมีประสิทธิภาพในการดูดซับน้ำสูง (High WUE)',
      idealWater: '350 – 500 ลบ.ม./ไร่',
      expectedYield: '4.5 – 5.5 ตัน/ไร่',
      isCalibrated: true,
    },
    {
      name: 'ระยอง 9 (Rayong 9)',
      id: 'ระยอง 9',
      badge: 'ศักยภาพแป้งอุตสาหกรรม • ผลผลิตสูง',
      color: 'secondary',
      description:
        'พันธุ์มันสำปะหลังเพื่ออุตสาหกรรมแป้งและเอทานอล โดดเด่นด้านเปอร์เซ็นต์แป้งสูงมาก (27–32%) ตอบสนองต่อน้ำและปุ๋ยได้อย่างมีประสิทธิภาพสูงเมื่อได้รับน้ำเสริมในช่วงสะสมอาหาร',
      idealWater: '500 – 700 ลบ.ม./ไร่',
      expectedYield: '5.0 – 6.5 ตัน/ไร่',
      isCalibrated: true,
    },
    {
      name: 'CMR38-125-77',
      id: 'CMR38-125-77',
      badge: 'สายพันธุ์ทนทานก้าวหน้า • ดินร่วนทราย',
      color: 'tertiary',
      description:
        'สายพันธุ์คัดเลือกสำหรับการจัดการแม่นยำ มีลักษณะทรงต้นตั้งตรง ระบบรากลึก หาอาหารและน้ำในระดับดินชั้นล่างได้ดี เหมาะสำหรับพื้นที่ดินร่วนปนทรายที่มีการระบายน้ำเร็ว',
      idealWater: '400 – 600 ลบ.ม./ไร่',
      expectedYield: '4.2 – 5.2 ตัน/ไร่',
      isCalibrated: true,
    },
    {
      name: 'ห้วยบง 90 (Huay Bong 90)',
      id: 'ห้วยบง 90',
      badge: '⚠️ อยู่นอกแบบจำลอง DSSAT v4.8',
      color: 'error',
      description:
        'พันธุ์มันสำปะหลังหัวใหญ่ ต้นสูง ยังไม่มีชุดค่าพารามิเตอร์ทางพันธุกรรม (Genetic Coefficients) ในฐานข้อมูล DSSAT v4.8 ของโปรเจกต์นี้ ระบบจึงไม่สามารถคาดเดาผลลัพธ์ได้อย่างแม่นยำ',
      idealWater: 'ยังไม่มีผลวิจัย',
      expectedYield: 'อยู่นอกกรอบแบบจำลอง',
      isCalibrated: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-on-surface/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-xl border border-surface-container flex flex-col gap-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-surface-container pb-3">
          <div className="inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">
              menu_book
            </span>
            <h2 className="text-base sm:text-lg font-bold text-on-surface">
              คู่มือพันธุ์มันสำปะหลังและการตอบสนองต่อน้ำ
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition cursor-pointer shrink-0"
            type="button"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          แบบจำลองชีวฟิสิกส์ <strong>DSSAT Cassava Crop Model</strong> ใช้ค่าสัมประสิทธิ์ทางพันธุกรรมที่ผ่านการสอบเทียบจริงในแปลงทดลองของประเทศไทย เพื่อความแม่นยำสูงสุดในการจัดสรรน้ำ
        </p>

        {/* Variety Cards List */}
        <div className="space-y-3">
          {varieties.map((v) => (
            <div
              key={v.id}
              className={`p-4 rounded-xl border transition-all ${
                v.isCalibrated
                  ? 'border-surface-container bg-surface hover:border-primary/50'
                  : 'border-error/30 bg-error-container/20'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span className="text-sm sm:text-base font-bold text-on-surface">
                  {v.name}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    v.color === 'primary'
                      ? 'bg-primary-fixed text-on-primary-fixed border border-primary-fixed-dim'
                      : v.color === 'secondary'
                      ? 'bg-secondary-fixed text-on-secondary-fixed border border-secondary-fixed-dim'
                      : v.color === 'tertiary'
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary-fixed-dim'
                      : 'bg-error-container text-on-error-container border border-error/30'
                  }`}
                >
                  {v.badge}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
                {v.description}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-surface-container-high/60 text-xs">
                <div className="text-on-surface-variant">
                  <span>น้ำที่ต้องการ: </span>
                  <strong className="text-on-surface">{v.idealWater}</strong>
                  <span className="mx-2 hidden sm:inline">•</span>
                  <span className="block sm:inline mt-0.5 sm:mt-0">
                    ผลผลิตคาดหวัง:{' '}
                    <strong className="text-on-surface">{v.expectedYield}</strong>
                  </span>
                </div>
                {onSelectVariety && (
                  <button
                    onClick={() => {
                      onSelectVariety(v.id);
                      onClose();
                    }}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition inline-flex items-center justify-center gap-1 shrink-0 self-start sm:self-auto ${
                      v.isCalibrated
                        ? 'bg-primary text-on-primary hover:bg-primary-container shadow-xs'
                        : 'bg-surface-container text-error hover:bg-error-container border border-error/30'
                    }`}
                    type="button"
                  >
                    <span>{v.isCalibrated ? 'เลือกพันธุ์นี้' : 'ทดสอบนอกแบบจำลอง'}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition cursor-pointer border border-surface-container-high"
            type="button"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

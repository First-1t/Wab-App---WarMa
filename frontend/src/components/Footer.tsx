import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-low border-t border-surface-container mt-auto py-6 sm:py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        {/* Brand & Subtitle */}
        <div className="flex flex-col gap-1 max-w-xl">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            <span className="text-sm font-bold text-on-surface tracking-tight">
              WarMa — Water Resources Management Advisor
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed">
              Output Module
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            ระบบแนะนำการจัดการน้ำมันสำปะหลังอัจฉริยะเพื่อเกษตรกรไทย • อิงแบบจำลองชีวฟิสิกส์ DSSAT Cassava Crop Model
          </p>
        </div>

        {/* Copyright & Organization */}
        <div className="flex flex-col md:items-end text-xs text-on-surface-variant gap-1 shrink-0">
          <span className="font-medium text-on-surface">
            © 2026 WarMa. เพื่อการเกษตรแม่นยำและยั่งยืน.
          </span>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-1.5 text-xs text-outline">
            <span className="font-mono bg-surface-container px-2 py-0.5 rounded border border-surface-container-high">
              Branch: output-dev
            </span>
            <span>•</span>
            <span>มหาวิทยาลัยเกษตรศาสตร์ &amp; สวทช.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

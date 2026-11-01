import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface border-t border-border mt-auto py-6 sm:py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        {/* Brand & Subtitle */}
        <div className="flex flex-col gap-1 max-w-xl">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
            <span className="text-sm font-bold text-text font-sans tracking-tight">
              WarMa — Smart Water (EN813701 WAD26-02)
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-tint-mint text-text border border-border">
              Output Module
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed font-body">
            ระบบแนะนำการจัดการน้ำมันสำปะหลังอัจฉริยะ • อิงแบบจำลองชีวฟิสิกส์ DSSAT Cassava Crop Model
          </p>
        </div>

        {/* Copyright & Organization */}
        <div className="flex flex-col md:items-end text-xs text-text-muted gap-1 shrink-0 font-body">
          <span className="font-semibold text-text">
            © 2026 WarMa — Smart Water Advisor. All rights reserved.
          </span>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-1.5 text-xs text-text-muted">
            <span className="font-mono bg-surface-sunken px-2 py-0.5 rounded border border-border">
              Branch: output-dev
            </span>
            <span>•</span>
            <span>WCAG AA Accessible Palette</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

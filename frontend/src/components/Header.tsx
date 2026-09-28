import React from 'react';

interface HeaderProps {
  currentPath: '/input' | '/output';
  onNavigate: (path: '/input' | '/output') => void;
  onOpenGuide: () => void;
  isBackendOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  onOpenGuide,
  isBackendOnline = true,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-b border-surface-container shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all">
      {/* Top Navbar Row */}
      <div className="h-16 sm:h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Brand & Logo */}
        <button
          onClick={() => onNavigate('/input')}
          className="flex items-center gap-2.5 sm:gap-3.5 text-left cursor-pointer group focus:outline-none"
          type="button"
          aria-label="WarMa Home"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <span className="material-symbols-outlined text-[22px] sm:text-[26px]">water_drop</span>
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-lg sm:text-2xl font-bold text-primary tracking-tight leading-none">
                WarMa
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-on-surface text-[11px] font-bold leading-none">
                TH
              </span>
              {isBackendOnline ? (
                <span
                  title="Backend API Connected (Port 5000)"
                  className="flex h-2.5 w-2.5 relative ml-0.5"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
              ) : (
                <span
                  title="Backend Offline"
                  className="w-2.5 h-2.5 rounded-full bg-error ml-0.5"
                ></span>
              )}
            </div>
            <span className="text-xs text-on-surface-variant hidden sm:inline-block leading-normal mt-0.5">
              ระบบแนะนำการจัดการน้ำมันสำปะหลังอัจฉริยะ (DSSAT)
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-surface-container-lowest rounded-xl border border-surface-container shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <button
            onClick={() => onNavigate('/input')}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentPath === '/input'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>คำนวณการใช้น้ำ</span>
          </button>
          <button
            onClick={() => onNavigate('/output')}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentPath === '/output'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            <span>ผลวิเคราะห์และคำแนะนำ</span>
          </button>
          <button
            onClick={onOpenGuide}
            className="min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer flex items-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span>คู่มือพันธุ์</span>
          </button>
        </nav>

        {/* User / Branch Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-xs text-on-surface font-mono font-medium border border-surface-container-high">
            <span className="w-1.5 h-1.5 rounded-full bg-primary font-bold"></span>
            output-dev
          </span>
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary cursor-pointer shadow-xs hover:bg-primary/20 transition"
            title="WarMa Farm Advisor"
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[22px]">
              person
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Sub-bar */}
      <div className="md:hidden bg-surface-container-lowest border-t border-surface-container px-2 py-1.5 shadow-xs">
        <nav className="flex w-full items-center justify-between gap-1.5">
          <button
            onClick={() => onNavigate('/input')}
            className={`flex-1 min-h-[40px] flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentPath === '/input'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>คำนวณน้ำ</span>
          </button>
          <button
            onClick={() => onNavigate('/output')}
            className={`flex-1 min-h-[40px] flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentPath === '/output'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">analytics</span>
            <span>ผลวิเคราะห์</span>
          </button>
          <button
            onClick={onOpenGuide}
            className="flex-1 min-h-[40px] flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            <span>คู่มือพันธุ์</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

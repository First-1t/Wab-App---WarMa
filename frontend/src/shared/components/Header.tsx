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
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand text-white shadow-[0_2px_12px_rgba(29,116,184,0.18)] transition-all">
      {/* Top Navbar Row */}
      <div className="h-16 sm:h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Brand & Logo */}
        <button
          onClick={() => onNavigate('/input')}
          className="flex items-center gap-2.5 sm:gap-3.5 text-left cursor-pointer group focus:outline-none"
          type="button"
          aria-label="WarMa Smart Water Home"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <span className="material-symbols-outlined text-[24px] sm:text-[26px]">water_drop</span>
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="font-sans text-xl sm:text-2xl font-bold text-white tracking-tight leading-none">
                WarMa
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary text-text text-[11px] font-bold leading-none shadow-xs">
                Smart Water
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
                  className="w-2.5 h-2.5 rounded-full bg-danger ml-0.5"
                ></span>
              )}
            </div>
            <span className="text-xs text-white/80 hidden sm:inline-block leading-normal mt-0.5 font-body">
              ระบบแนะนำการจัดการน้ำมันสำปะหลัง (EN813701 WAD26-02)
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links (Smart Water Navbar Standard) */}
        <nav className="hidden md:flex items-center gap-3">
          <button
            onClick={() => onNavigate('/input')}
            className={`min-h-[44px] px-3.5 py-2 text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
              currentPath === '/input'
                ? 'border-white text-white font-bold'
                : 'border-transparent text-white/80 hover:text-white hover:border-white/40'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">tune</span>
            <span>คำนวณการใช้น้ำ</span>
          </button>
          <button
            onClick={() => onNavigate('/output')}
            className={`min-h-[44px] px-3.5 py-2 text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
              currentPath === '/output'
                ? 'border-white text-white font-bold'
                : 'border-transparent text-white/80 hover:text-white hover:border-white/40'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">analytics</span>
            <span>ผลวิเคราะห์</span>
          </button>
          <button
            onClick={onOpenGuide}
            className="min-h-[40px] px-3.5 py-1.5 rounded-lg text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/25 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span>คู่มือพันธุ์</span>
          </button>
        </nav>

        {/* User / Branch Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs text-white font-mono font-medium border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary font-bold"></span>
            output-dev
          </span>
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white cursor-pointer shadow-xs hover:bg-white/25 transition"
            title="Smart Water Farm Advisor"
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[22px]">
              person
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Sub-bar */}
      <div className="md:hidden bg-brand-hover border-t border-white/15 px-2 py-1 shadow-inner">
        <nav className="flex w-full items-center justify-between gap-1">
          <button
            onClick={() => onNavigate('/input')}
            className={`flex-1 min-h-[40px] flex items-center justify-center gap-1 py-1.5 px-1.5 text-xs font-bold transition-all cursor-pointer border-b-2 ${
              currentPath === '/input'
                ? 'border-white text-white font-bold'
                : 'border-transparent text-white/75 hover:text-white'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>คำนวณ</span>
          </button>
          <button
            onClick={() => onNavigate('/output')}
            className={`flex-1 min-h-[40px] flex items-center justify-center gap-1 py-1.5 px-1.5 text-xs font-bold transition-all cursor-pointer border-b-2 ${
              currentPath === '/output'
                ? 'border-white text-white font-bold'
                : 'border-transparent text-white/75 hover:text-white'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">analytics</span>
            <span>ผลวิเคราะห์</span>
          </button>
          <button
            onClick={onOpenGuide}
            className="flex-1 min-h-[40px] flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-xs font-bold text-white bg-white/10 border border-white/20 transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            <span>คู่มือ</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

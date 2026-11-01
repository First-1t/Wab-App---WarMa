import { useCallback, useEffect, useState } from 'react';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { adminApi, adminToken, guestMode, type AuthConfig } from '../services/admin-api.service';

const DOMAIN_LABELS: Record<string, string> = {
  'kku.ac.th': 'อาจารย์ / บุคลากร',
  'kkumail.com': 'นักศึกษา',
};

/** หน้าที่จะไปหลังล็อกอิน — รับเฉพาะ path ภายในเว็บ (กัน open redirect) */
function nextPath() {
  const next = new URLSearchParams(window.location.search).get('next') ?? '/admin';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/admin';
}

export function AdminLoginPage() {
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (adminToken.get()) {
          try {
            if (await adminApi.me()) return window.location.replace(nextPath());
          } catch {
            adminToken.clear();
          }
        }
        setConfig(await adminApi.authConfig());
      } catch (e) {
        setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
      }
    })();
  }, []);

  const handleCredential = useCallback(async (credential: string) => {
    setError('');
    setSigningIn(true);
    try {
      const { token } = await adminApi.login(credential);
      adminToken.set(token);
      guestMode.clear();
      window.location.replace(nextPath());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ล็อกอินไม่สำเร็จ');
      setSigningIn(false);
    }
  }, []);

  function enterAsGuest() {
    guestMode.set();
    window.location.assign('/input');
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <section className="relative h-80 overflow-hidden sm:h-96 lg:h-auto">
        <img
          src="/images/admin/login-field.jpg"
          alt="แปลงมันสำปะหลังในภาคตะวันออกของประเทศไทย"
          className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
        />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 via-black/25 to-transparent p-6 pb-14 text-white drop-shadow sm:p-8 sm:pb-16 lg:p-12">
          <h2 className="text-2xl leading-snug font-bold sm:text-3xl lg:text-4xl">
            ปลูกมันสำปะหลังให้ได้ผลดี
            <br className="hidden sm:block" /> ด้วยการจัดการน้ำที่พอดี
          </h2>
        </div>
        <a
          href="https://commons.wikimedia.org/wiki/File:Thailand_11_lo_(4039867686).jpg"
          target="_blank"
          rel="noreferrer"
          className="absolute right-2 bottom-2 rounded bg-black/55 px-2 py-0.5 text-xs text-white underline"
        >
          ภาพ: CIAT, CC BY-SA 2.0, ตัดขอบและย่อขนาด
        </a>
      </section>

      <section className="flex items-center justify-center bg-surface-sunken px-5 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-on-primary">
              <span className="material-symbols-outlined text-[28px]">water_drop</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand">WarMa</h1>
              <p className="text-sm text-on-surface-variant">ระบบแนะนำการจัดการน้ำมันสำปะหลัง</p>
            </div>
          </div>

          <h2 className="mt-8 text-xl font-bold">เข้าใช้งาน</h2>
          <div className="mt-3 rounded-2xl border border-border bg-surface p-6 shadow-xs">
            <button
              type="button"
              onClick={enterAsGuest}
              className="min-h-12 w-full cursor-pointer rounded-full bg-primary px-5 py-3 text-base font-bold text-on-primary hover:bg-primary-hover focus-visible:ring-4 focus-visible:ring-secondary focus-visible:outline-none"
            >
              เข้าใช้งานแบบทั่วไป
            </button>
            <p className="mt-2 text-center text-sm text-on-surface-variant">
              รับคำแนะนำการให้น้ำและให้คะแนนได้ทันที ไม่ต้องล็อกอิน
            </p>
          </div>

          <div className="my-5 flex items-center gap-3 text-sm text-on-surface-variant">
            <span className="h-px flex-1 bg-text-muted" />
            สำหรับผู้ดูแลข้อมูล
            <span className="h-px flex-1 bg-text-muted" />
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
            {!config && !error && (
              <p className="text-center text-sm text-on-surface-variant">กำลังโหลด…</p>
            )}
            {config?.enabled && (
              <div className={signingIn ? 'pointer-events-none opacity-50' : ''}>
                <GoogleSignInButton
                  clientId={config.clientId}
                  domains={config.domains}
                  onCredential={handleCredential}
                  onError={setError}
                />
              </div>
            )}
            {config && !config.enabled && (
              <>
                <a
                  href="/admin"
                  className="block rounded-full bg-secondary px-5 py-2.5 text-center font-semibold text-on-secondary"
                >
                  เข้าหน้าตั้งค่า (โหมดพัฒนา)
                </a>
                <p className="mt-2 text-center text-sm text-warning">
                  เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า GOOGLE_CLIENT_ID
                </p>
              </>
            )}
            {signingIn && (
              <p className="mt-3 text-center text-sm text-on-surface-variant">กำลังเข้าสู่ระบบ…</p>
            )}
            {error && (
              <p role="alert" className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
            {config?.enabled && (
              <ul className="mt-4 space-y-1.5 border-t border-border pt-4">
                {config.domains.map((d) => (
                  <li
                    key={d}
                    className="flex items-center justify-between gap-2 rounded-lg bg-surface-sunken px-3 py-1.5 text-sm"
                  >
                    <span className="font-mono">@{d}</span>
                    {DOMAIN_LABELS[d] && (
                      <span className="text-on-surface-variant">{DOMAIN_LABELS[d]}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

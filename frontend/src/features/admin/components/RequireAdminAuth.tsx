import { useEffect, useState, type ReactNode } from 'react';
import { adminApi, adminToken, type AdminUser } from '../services/admin-api.service';

export function loginUrl(next = window.location.pathname + window.location.search) {
  return `/login?next=${encodeURIComponent(next)}`;
}

export function logout() {
  adminToken.clear();
  window.location.assign('/login');
}

/**
 * ครอบหน้าที่ต้องล็อกอิน — ยังไม่ล็อกอินจะพาไป /login
 * user = null คือโหมดพัฒนา (เซิร์ฟเวอร์ยังไม่ตั้ง GOOGLE_CLIENT_ID)
 */
export function RequireAdminAuth({
  children,
}: {
  children: (user: AdminUser | null) => ReactNode;
}) {
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const config = await adminApi.authConfig();
        if (!config.enabled) return setUser(null);
        if (adminToken.get()) {
          try {
            const me = await adminApi.me();
            if (me) return setUser(me);
          } catch {
            adminToken.clear();
          }
        }
        window.location.replace(loginUrl());
      } catch (e) {
        setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p role="alert" className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      </div>
    );
  }
  if (user === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-on-surface-variant">
        กำลังตรวจสอบการเข้าสู่ระบบ…
      </div>
    );
  }
  return <>{children(user)}</>;
}

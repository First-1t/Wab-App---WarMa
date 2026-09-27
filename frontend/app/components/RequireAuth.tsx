"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { adminToken, api, type AdminUser, type AuthConfig } from "@/lib/api";
import { signOutGoogle } from "./GoogleSignInButton";

interface Session {
  /** null = โหมดพัฒนา (เซิร์ฟเวอร์ยังไม่ตั้ง GOOGLE_CLIENT_ID) */
  user: AdminUser | null;
  logout: () => void;
}

const SessionContext = createContext<Session | null>(null);

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession ต้องอยู่ภายใต้ <RequireAuth>");
  return session;
}

/** อ่านสถานะล็อกอินปัจจุบันจาก token ที่เก็บในเครื่อง (ตรวจกับ backend) */
export async function fetchSession(): Promise<{
  config: AuthConfig;
  user: AdminUser | null;
}> {
  const config = await api.authConfig();
  if (!config.enabled || !adminToken.get()) return { config, user: null };
  try {
    return { config, user: await api.me() };
  } catch {
    adminToken.clear();
    return { config, user: null };
  }
}

/** ครอบหน้าที่ต้องล็อกอินก่อน — ยังไม่ล็อกอินจะพาไปหน้า /login */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSession()
      .then(({ config, user }) => {
        if (config.enabled && !user) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        } else {
          setUser(user);
        }
      })
      .catch(() =>
        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบว่า backend ทำงานอยู่"),
      );
  }, [router, pathname]);

  const logout = useCallback(() => {
    adminToken.clear();
    signOutGoogle();
    router.replace("/login");
  }, [router]);

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (user === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-slate-400">
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
        กำลังตรวจสอบการเข้าสู่ระบบ…
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ user, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

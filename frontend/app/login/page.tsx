"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminToken, api, guestMode, type AuthConfig } from "@/lib/api";
import GoogleSignInButton from "../components/GoogleSignInButton";
import CassavaFarmIllustration from "../components/CassavaFarmIllustration";
import { fetchSession } from "../components/RequireAuth";

const DOMAIN_LABELS: Record<string, string> = {
  "kku.ac.th": "อาจารย์ / บุคลากร",
  "kkumail.com": "นักศึกษา",
};

/** หน้าที่จะไปหลังล็อกอิน — รับเฉพาะ path ภายในเว็บ (กัน open redirect) */
function nextPath() {
  const next = new URLSearchParams(window.location.search).get("next") ?? "/";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default function LoginPage() {
  const router = useRouter();
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    fetchSession()
      .then(({ config, user }) => {
        if (user) router.replace(nextPath());
        else setConfig(config);
      })
      .catch(() =>
        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบว่า backend ทำงานอยู่"),
      );
  }, [router]);

  const handleCredential = useCallback(
    async (credential: string) => {
      setError("");
      setSigningIn(true);
      try {
        const { token } = await api.loginWithGoogle(credential);
        adminToken.set(token);
        guestMode.clear();
        router.replace(nextPath());
      } catch (e) {
        setError(e instanceof Error ? e.message : "ล็อกอินไม่สำเร็จ");
        setSigningIn(false);
      }
    },
    [router],
  );

  function enterAsGuest() {
    guestMode.set();
    // ผู้ใช้ทั่วไปเข้าได้เฉพาะหน้าหลัก (หน้าตั้งค่าต้องล็อกอิน)
    const next = nextPath();
    router.replace(next.startsWith("/admin") ? "/" : next);
  }

  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-[1.1fr_1fr]">
      {/* ซ้าย: ภาพเกษตรกรในไร่มันสำปะหลัง (มือถือ = แถบภาพด้านบน) */}
      <section className="relative h-80 overflow-hidden sm:h-96 lg:h-auto">
        <CassavaFarmIllustration className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-sky-950/70 via-sky-950/30 to-transparent p-6 pb-14 text-white drop-shadow sm:p-8 sm:pb-16 lg:bg-none lg:p-12">
          <p className="text-xs font-semibold tracking-widest uppercase opacity-80">
            Water Resources Management Advisor
          </p>
          <h2 className="mt-1 text-2xl leading-snug font-bold sm:text-3xl lg:text-4xl">
            ปลูกมันสำปะหลังให้ได้ผลดี
            <br className="hidden sm:block" /> ด้วยการจัดการน้ำที่พอดี
          </h2>
          <p className="mt-2 hidden max-w-md text-sm opacity-85 sm:block">
            วางแผนการให้น้ำตามพันธุ์มันสำปะหลัง ฤดูกาล และปริมาณน้ำต้นทุน
            พร้อมข้อมูลฝนรายวันบนแผนที่
          </p>
        </div>
      </section>

      {/* ขวา: กล่องล็อกอิน */}
      <section className="flex items-center justify-center bg-gradient-to-b from-white to-sky-50 px-5 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-800 text-2xl shadow-md shadow-sky-900/20">
              💧
            </div>
            <div>
              <h1 className="text-2xl font-bold text-sky-900">WarMa</h1>
              <p className="text-xs text-slate-500">
                ระบบแนะนำการจัดการทรัพยากรน้ำเพื่อการเกษตร
              </p>
            </div>
          </div>

          <h2 className="mt-10 text-xl font-bold text-slate-800">เข้าใช้งาน</h2>

          {/* ผู้ใช้ทั่วไป — ไม่ต้องล็อกอิน */}
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <button
              onClick={enterAsGuest}
              className="w-full rounded-full bg-sky-700 px-5 py-3 text-base font-bold text-white shadow-sm hover:bg-sky-800 focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:outline-none"
            >
              👤 เข้าใช้งานแบบทั่วไป
            </button>
            <p className="mt-2 text-center text-sm text-slate-500">
              ดูแผนที่ฝน รับคำแนะนำการให้น้ำ และให้คะแนนได้ทันที ไม่ต้องล็อกอิน
            </p>
          </div>

          <div className="my-5 flex items-center gap-3 text-sm text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            หรือ สำหรับผู้ดูแลข้อมูล
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="mb-3 text-sm text-slate-600">
            ล็อกอินด้วยอีเมลมหาวิทยาลัยขอนแก่น เพื่อ<b>แก้ไขข้อมูลคำแนะนำ</b>และดูความคิดเห็นผู้ใช้
          </p>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {!config && !error && (
              <div className="flex h-11 items-center justify-center text-sm text-slate-400">
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
                กำลังโหลด…
              </div>
            )}

            {config?.enabled && (
              <div className={signingIn ? "pointer-events-none opacity-50" : ""}>
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
                <button
                  onClick={() => router.replace(nextPath())}
                  className="w-full rounded-full bg-sky-700 px-5 py-2.5 font-semibold text-white hover:bg-sky-800"
                >
                  เข้าใช้งาน (โหมดพัฒนา)
                </button>
                <p className="mt-2 text-center text-xs text-amber-700">
                  เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า GOOGLE_CLIENT_ID
                </p>
              </>
            )}

            {signingIn && (
              <p className="mt-3 text-center text-sm text-slate-500">
                กำลังเข้าสู่ระบบ…
              </p>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {config?.enabled && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500">
                  บัญชีที่ใช้ได้
                </p>
                <ul className="mt-2 space-y-1.5">
                  {config.domains.map((d) => (
                    <li
                      key={d}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm"
                    >
                      <span className="font-mono text-slate-700">@{d}</span>
                      {DOMAIN_LABELS[d] && (
                        <span className="text-xs text-slate-500">
                          {DOMAIN_LABELS[d]}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            คณะเกษตรศาสตร์ · มหาวิทยาลัยขอนแก่น
          </p>
        </div>
      </section>
    </div>
  );
}

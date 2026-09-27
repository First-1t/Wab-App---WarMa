"use client";

import { useEffect, useRef } from "react";

// ชนิดข้อมูลแบบย่อของ Google Identity Services (https://accounts.google.com/gsi/client)
interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (opts: {
        client_id: string;
        callback: (res: { credential: string }) => void;
        hd?: string;
        ux_mode?: "popup" | "redirect";
      }) => void;
      renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
      disableAutoSelect: () => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

const GSI_SRC = "https://accounts.google.com/gsi/client";

function loadGsi(): Promise<GoogleIdentity> {
  if (window.google) return Promise.resolve(window.google);
  return new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`,
    );
    if (!script) {
      script = document.createElement("script");
      script.src = GSI_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () =>
      window.google ? resolve(window.google) : reject(new Error("gsi")),
    );
    script.addEventListener("error", () => reject(new Error("gsi")));
  });
}

export function signOutGoogle() {
  window.google?.accounts.id.disableAutoSelect();
}

/** ปุ่ม "Sign in with Google" — ถ้ามีโดเมนเดียวจะจำกัดให้เลือกบัญชีในโดเมนนั้น */
export default function GoogleSignInButton({
  clientId,
  domains,
  onCredential,
  onError,
}: {
  clientId: string;
  domains: string[];
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // เก็บ callback ล่าสุดไว้ใน ref เพื่อไม่ต้อง render ปุ่มใหม่ทุกครั้ง
  const cb = useRef(onCredential);
  useEffect(() => {
    cb.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let cancelled = false;
    loadGsi()
      .then((google) => {
        if (cancelled || !ref.current) return;
        google.accounts.id.initialize({
          client_id: clientId,
          // hd รับได้โดเมนเดียว — หลายโดเมนใช้ "*" (บัญชี Workspace ใดก็ได้) แล้วให้ backend ตรวจ
          hd: domains.length === 1 ? domains[0] : "*",
          ux_mode: "popup",
          callback: (res) => cb.current(res.credential),
        });
        google.accounts.id.renderButton(ref.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "pill",
          locale: "th",
        });
      })
      .catch(() => onError("โหลดระบบล็อกอินของ Google ไม่สำเร็จ"));
    return () => {
      cancelled = true;
    };
  }, [clientId, domains, onError]);

  return <div ref={ref} className="flex min-h-11 justify-center" />;
}

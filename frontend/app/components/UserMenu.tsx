"use client";

import Link from "next/link";
import { useSession } from "./RequireAuth";

/** มุมขวาของ header: รูป/ชื่อผู้ใช้ + ปุ่มตั้งค่า + ออกจากระบบ */
export default function UserMenu({ showSettings = true }: { showSettings?: boolean }) {
  const { user, logout } = useSession();
  const btn =
    "rounded-full border border-white/50 px-3 py-1 text-xs whitespace-nowrap hover:bg-white/10";

  return (
    <div className="flex items-center gap-2">
      {user && (
        <div className="hidden items-center gap-2 sm:flex" title={user.email}>
          {user.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.picture}
              alt=""
              referrerPolicy="no-referrer"
              className="h-7 w-7 rounded-full ring-2 ring-white/60"
            />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
              {user.name.charAt(0)}
            </span>
          )}
          <span className="max-w-40 truncate text-xs opacity-90">{user.name}</span>
        </div>
      )}
      {showSettings && (
        <Link href="/admin" className={btn}>
          ⚙️ ตั้งค่า
        </Link>
      )}
      {user && (
        <button onClick={logout} className={btn}>
          ออกจากระบบ
        </button>
      )}
    </div>
  );
}

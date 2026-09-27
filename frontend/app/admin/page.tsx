"use client";

import RequireAuth from "../components/RequireAuth";
import AdminPanel from "./AdminPanel";

/** หน้าตั้งค่าข้อมูล scenario — ต้องล็อกอินด้วยอีเมลมหาวิทยาลัยก่อน */
export default function AdminPage() {
  return (
    <RequireAuth>
      <AdminPanel />
    </RequireAuth>
  );
}

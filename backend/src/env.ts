// โหลดค่าจาก backend/.env เข้า process.env (ต้อง import เป็นบรรทัดแรกของ main.ts)
try {
  process.loadEnvFile();
} catch {
  // ไม่มีไฟล์ .env (เช่นตอน deploy ที่ตั้ง env ผ่าน Azure) — ข้ามได้
}

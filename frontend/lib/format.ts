export const fmt = (n: number) =>
  n.toLocaleString("th-TH", { maximumFractionDigits: 0 });

export const levelColors: Record<
  string,
  { bg: string; border: string; badge: string; bar: string }
> = {
  เพียงพอ: {
    bg: "bg-green-50",
    border: "border-green-600",
    badge: "bg-green-600",
    bar: "bg-green-600",
  },
  จำกัด: {
    bg: "bg-amber-50",
    border: "border-amber-600",
    badge: "bg-amber-600",
    bar: "bg-amber-600",
  },
  ขาดแคลน: {
    bg: "bg-red-50",
    border: "border-red-600",
    badge: "bg-red-600",
    bar: "bg-red-600",
  },
};

export const colorsFor = (level: string) =>
  levelColors[level] ?? levelColors["จำกัด"];

/** สีตามปริมาณฝน 24 ชม. (มม.) อิงเกณฑ์แบบ ThaiWater */
export function rainColor(mm: number): string {
  if (mm >= 90) return "#c62828"; // แดง — ฝนหนักมาก
  if (mm >= 50) return "#ef6c00"; // ส้ม — ฝนหนัก
  if (mm >= 35) return "#f9a825"; // เหลือง — ฝนค่อนข้างหนัก
  if (mm >= 20) return "#2e7d32"; // เขียว — ฝนปานกลาง
  if (mm >= 10) return "#0288d1"; // น้ำเงิน — ฝนเล็กน้อย
  return "#4fc3f7"; // ฟ้าอ่อน — ฝนเบามาก
}

/** ป้ายสีสำหรับตัวเลขในตาราง (bg เข้ม + ตัวอักษรอ่านออก) */
export function rainBadgeClass(mm: number): string {
  if (mm >= 90) return "bg-red-600 text-white";
  if (mm >= 50) return "bg-orange-500 text-white";
  if (mm >= 35) return "bg-yellow-400 text-slate-900";
  if (mm >= 20) return "bg-green-600 text-white";
  if (mm >= 10) return "bg-sky-600 text-white";
  return "bg-sky-200 text-slate-800";
}

// คำนวณพื้นที่รูปหลายเหลี่ยมบนผิวโลก (geodesic) จากจุด [lat, lng]
// ใช้สูตร spherical excess — แม่นพอสำหรับแปลงเกษตรระดับไร่

const EARTH_RADIUS = 6378137; // เมตร
const toRad = (d: number) => (d * Math.PI) / 180;

/** พื้นที่เป็นตารางเมตร */
export function polygonAreaSqm(points: [number, number][]): number {
  const n = points.length;
  if (n < 3) return 0;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const [lat1, lon1] = points[i];
    const [lat2, lon2] = points[(i + 1) % n];
    area +=
      toRad(lon2 - lon1) *
      (2 + Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)));
  }
  return Math.abs((area * EARTH_RADIUS * EARTH_RADIUS) / 2);
}

// หน่วยไทย: 1 ไร่ = 1600 ตร.ม. = 4 งาน, 1 งาน = 100 ตร.วา, 1 ตร.วา = 4 ตร.ม.
export function sqmToRai(sqm: number): number {
  return sqm / 1600;
}

/** แปลงเป็นข้อความ ไร่-งาน-ตร.วา สำหรับแสดงผล */
export function formatRaiNganWa(sqm: number): string {
  const rai = Math.floor(sqm / 1600);
  const ngan = Math.floor((sqm % 1600) / 400);
  const wa = Math.round((sqm % 400) / 4);
  return `${rai} ไร่ ${ngan} งาน ${wa} ตร.วา`;
}

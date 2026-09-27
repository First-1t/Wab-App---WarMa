/**
 * ภาพประกอบบนการ์ดหน้าตั้งค่า (SVG ล้วน ไม่ต้องโหลดรูปภายนอก)
 * - VarietyArt: ต้นมันสำปะหลัง พื้นหลังคนละสีตามลำดับพันธุ์
 * - SeasonArt: ฉากตามฤดูปลูก (ต้นฝน / ปลายฝน / แล้ง)
 */

// ใบแฉกแบบฝ่ามือ 7 แฉก (โคนใบที่ 0,0)
function Leaf({ x, y, s = 1, r = 0, fill }: { x: number; y: number; s?: number; r?: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill={fill}>
      {[-120, -80, -40, 0, 40, 80, 120].map((a) => (
        <ellipse key={a} cx="0" cy="-9" rx="2.8" ry="9" transform={`rotate(${a})`} />
      ))}
    </g>
  );
}

// ต้นมันสำปะหลัง (โคนที่ x,y ขนาดตาม s)
function Plant({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M0 0 L0 -46 M0 -30 L-10 -40 M0 -24 L11 -34"
        stroke="#8a5a3b"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <Leaf x={-11} y={-41} s={0.8} r={-25} fill="#2f6e2c" />
      <Leaf x={12} y={-35} s={0.8} r={25} fill="#2f6e2c" />
      <Leaf x={0} y={-48} fill="#4a9a3f" />
      <Leaf x={-4} y={-54} s={0.55} r={-10} fill="#6bbf55" />
    </g>
  );
}

// หัวมันสำปะหลังยาวเรียว
function Root({ x, y, r = 0, s = 1 }: { x: number; y: number; r?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path
        d="M-24 0 C-18 -8 12 -8 26 -1 C28 0 28 1 26 1 C12 8 -18 8 -24 0 Z"
        fill="#8b5a2b"
        stroke="#5e3a17"
        strokeWidth="1.2"
      />
      <ellipse cx="-23" cy="0" rx="2.6" ry="5.5" fill="#f5efe0" stroke="#5e3a17" strokeWidth="1" />
    </g>
  );
}

const VARIETY_BG = [
  ["#dcfce7", "#bbf7d0"], // เขียว
  ["#e0f2fe", "#bae6fd"], // ฟ้า
  ["#fef3c7", "#fde68a"], // เหลือง
  ["#ede9fe", "#ddd6fe"], // ม่วง
  ["#ffe4e6", "#fecdd3"], // ชมพู
];

export function VarietyArt({ index, className = "" }: { index: number; className?: string }) {
  const [top, bottom] = VARIETY_BG[index % VARIETY_BG.length];
  return (
    <svg viewBox="0 0 200 110" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="110" fill={top} />
      <ellipse cx="100" cy="112" rx="130" ry="30" fill={bottom} />
      <path d="M0 92 Q100 80 200 92 V110 H0 Z" fill="#a16207" opacity="0.35" />
      <Plant x={70} y={92} s={1.25} />
      <Plant x={128} y={94} s={1.05} />
      <Root x={100} y={100} r={-6} s={0.9} />
      <Root x={150} y={101} r={10} s={0.7} />
    </svg>
  );
}

export function SeasonArt({ season, className = "" }: { season: string; className?: string }) {
  const ground = <path d="M0 90 Q100 82 200 90 V110 H0 Z" fill="#a16207" opacity="0.45" />;

  if (season.includes("ต้น")) {
    // ต้นฤดูฝน: เมฆฝน ฝนตก ต้นอ่อนเพิ่งปลูก
    return (
      <svg viewBox="0 0 200 110" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="110" fill="#cbd5e1" />
        <g fill="#94a3b8">
          <ellipse cx="60" cy="24" rx="40" ry="14" />
          <ellipse cx="85" cy="16" rx="26" ry="13" />
          <ellipse cx="150" cy="28" rx="36" ry="12" />
        </g>
        <g stroke="#0284c7" strokeWidth="2" strokeLinecap="round" opacity="0.7">
          {[30, 50, 70, 90, 110, 130, 150, 170].map((x, i) => (
            <line key={x} x1={x} y1={40 + (i % 2) * 8} x2={x - 5} y2={52 + (i % 2) * 8} />
          ))}
        </g>
        {ground}
        <Plant x={60} y={90} s={0.55} />
        <Plant x={100} y={91} s={0.6} />
        <Plant x={140} y={90} s={0.55} />
      </svg>
    );
  }

  if (season.includes("ปลาย")) {
    // ปลายฤดูฝน: ฟ้ายามเย็น เมฆบาง ต้นโตแล้ว
    return (
      <svg viewBox="0 0 200 110" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sa-dusk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" />
            <stop offset="1" stopColor="#fed7aa" />
          </linearGradient>
        </defs>
        <rect width="200" height="110" fill="url(#sa-dusk)" />
        <circle cx="160" cy="60" r="16" fill="#fdba74" />
        <g fill="#ffffff" opacity="0.8">
          <ellipse cx="50" cy="26" rx="30" ry="9" />
          <ellipse cx="70" cy="20" rx="18" ry="9" />
        </g>
        <g stroke="#0284c7" strokeWidth="2" strokeLinecap="round" opacity="0.5">
          <line x1="40" y1="38" x2="36" y2="48" />
          <line x1="60" y1="36" x2="56" y2="46" />
        </g>
        {ground}
        <Plant x={55} y={90} s={0.95} />
        <Plant x={105} y={91} s={1.05} />
        <Plant x={150} y={90} s={0.9} />
      </svg>
    );
  }

  if (season.includes("แล้ง")) {
    // ฤดูแล้ง: แดดจัด ดินแตก สายน้ำหยด
    return (
      <svg viewBox="0 0 200 110" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="110" fill="#fef3c7" />
        <circle cx="160" cy="28" r="16" fill="#facc15" />
        <g stroke="#facc15" strokeWidth="3" strokeLinecap="round">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="160" y1="4" x2="160" y2="-2" transform={`rotate(${a} 160 28)`} />
          ))}
        </g>
        <path d="M0 88 Q100 82 200 88 V110 H0 Z" fill="#d6a15c" />
        <g stroke="#92400e" strokeWidth="1.2" fill="none" opacity="0.7">
          <path d="M20 96 l8 5 l-3 6 M70 98 l6 -4 l7 5 M150 97 l-6 6 l5 4" />
        </g>
        {/* สายน้ำหยด + หยดน้ำ */}
        <path d="M0 91 H200" stroke="#1e293b" strokeWidth="2.5" />
        <g fill="#0284c7">
          <path d="M60 95 q-3 5 0 7 q3 -2 0 -7 Z" />
          <path d="M110 95 q-3 5 0 7 q3 -2 0 -7 Z" />
          <path d="M155 95 q-3 5 0 7 q3 -2 0 -7 Z" />
        </g>
        <Plant x={60} y={89} s={0.7} />
        <Plant x={110} y={89} s={0.75} />
        <Plant x={155} y={89} s={0.65} />
      </svg>
    );
  }

  // ฤดูอื่น ๆ ที่เพิ่มเอง
  return (
    <svg viewBox="0 0 200 110" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="110" fill="#e0f2fe" />
      {ground}
      <Plant x={80} y={90} s={0.9} />
      <Plant x={125} y={91} s={0.8} />
    </svg>
  );
}

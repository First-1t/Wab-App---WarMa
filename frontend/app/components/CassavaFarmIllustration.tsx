/**
 * ภาพประกอบหน้าล็อกอิน: เกษตรกรใส่งอบถือตะกร้าหัวมันสำปะหลัง ยืนกลางไร่ยามเช้า
 * วาดด้วย SVG ล้วน (ไม่ต้องโหลดรูปจากภายนอก) — ยืดเต็มกรอบ ยึดขอบล่างไว้ให้เห็นเกษตรกรเต็มตัว
 */

// แถวมันสำปะหลังแบบมีระยะลึก: ใกล้ขอบฟ้า = เล็ก/ถี่, ใกล้ตัว = ใหญ่/ห่าง
const HORIZON = 372;
const ROWS = Array.from({ length: 10 }, (_, i) => {
  const t = (i + 1) / 10;
  return {
    y: HORIZON + 450 * t ** 1.7,
    scale: 0.18 + 1.25 * t ** 1.5,
  };
});

function plantsInRow(row: { y: number; scale: number }, rowIndex: number) {
  const gap = 78 * row.scale;
  const offset = (rowIndex % 2) * (gap / 2);
  const items: { x: number; s: number; flip: boolean }[] = [];
  for (let x = -40 + offset, i = 0; x < 660; x += gap, i++) {
    // ขนาดต่างกันเล็กน้อยให้ดูเป็นธรรมชาติ (คำนวณแบบคงที่ ไม่ใช้ random)
    const jitter = 0.85 + (((i * 7 + rowIndex * 3) % 5) / 5) * 0.3;
    items.push({ x, s: row.scale * jitter, flip: (i + rowIndex) % 2 === 0 });
  }
  return items;
}

export default function CassavaFarmIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 600 800"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      role="img"
      aria-label="เกษตรกรถือตะกร้าหัวมันสำปะหลังยืนอยู่กลางไร่"
    >
      <defs>
        <linearGradient id="pf-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c4a6e" />
          <stop offset="0.45" stopColor="#38bdf8" />
          <stop offset="0.85" stopColor="#fde68a" />
          <stop offset="1" stopColor="#fdba74" />
        </linearGradient>
        <radialGradient id="pf-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="0.35" stopColor="#fde047" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fde047" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pf-soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a16207" />
          <stop offset="1" stopColor="#5b3413" />
        </linearGradient>
        <linearGradient id="pf-water" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="pf-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#082f49" stopOpacity="0.75" />
          <stop offset="0.35" stopColor="#0c4a6e" stopOpacity="0" />
        </linearGradient>
        <pattern id="pf-check" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#dc2626" />
          <rect width="5" height="10" fill="#1d4ed8" opacity="0.7" />
          <rect width="10" height="5" fill="#fbbf24" opacity="0.45" />
        </pattern>

        {/* ใบมันสำปะหลัง: ใบแฉกแบบฝ่ามือ 7 แฉก (โคนใบที่ 0,0) */}
        <g id="cv-leaf">
          {[-120, -80, -40, 0, 40, 80, 120].map((a) => (
            <ellipse key={a} cx="0" cy="-9" rx="2.8" ry="9" transform={`rotate(${a})`} />
          ))}
        </g>
        {/* ต้นมันสำปะหลัง 1 ต้น (โคนอยู่ที่ 0,0) — ลำต้นสูง ใบเป็นพุ่มด้านบน */}
        <g id="cv-plant">
          <path d="M0 0 L0 -46 M0 -30 L-10 -40 M0 -24 L11 -34" stroke="#8a5a3b" strokeWidth="3" strokeLinecap="round" fill="none" />
          <use href="#cv-leaf" transform="translate(-11 -41) scale(0.8) rotate(-25)" fill="#2f6e2c" />
          <use href="#cv-leaf" transform="translate(12 -35) scale(0.8) rotate(25)" fill="#2f6e2c" />
          <use href="#cv-leaf" transform="translate(0 -48)" fill="#4a9a3f" />
          <use href="#cv-leaf" transform="translate(-4 -54) scale(0.55) rotate(-10)" fill="#6bbf55" />
        </g>
        {/* หัวมันสำปะหลัง: ยาวเรียว ปลายแหลม เปลือกน้ำตาล รอยตัดสีขาว */}
        <g id="cv-root">
          <path d="M-24 0 C-18 -8 12 -8 26 -1 C28 0 28 1 26 1 C12 8 -18 8 -24 0 Z" fill="#8b5a2b" stroke="#5e3a17" strokeWidth="1.2" />
          <path d="M-14 -3 C-4 -5 8 -5 18 -2" stroke="#b07a45" strokeWidth="1.5" fill="none" opacity="0.8" />
          <ellipse cx="-23" cy="0" rx="2.6" ry="5.5" fill="#f5efe0" stroke="#5e3a17" strokeWidth="1" />
        </g>
      </defs>

      {/* ท้องฟ้า ดวงอาทิตย์ เมฆ นก */}
      <rect width="600" height="800" fill="url(#pf-sky)" />
      <circle cx="455" cy="300" r="120" fill="url(#pf-sun)" />
      <circle cx="455" cy="300" r="38" fill="#fef3c7" />
      <g fill="#ffffff" opacity="0.85">
        <ellipse cx="120" cy="150" rx="70" ry="18" />
        <ellipse cx="160" cy="138" rx="42" ry="20" />
        <ellipse cx="420" cy="95" rx="60" ry="14" opacity="0.7" />
        <ellipse cx="450" cy="86" rx="34" ry="15" opacity="0.7" />
      </g>
      <g fill="none" stroke="#0c4a6e" strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
        <path d="M300 210 q8 -8 16 0 q8 -8 16 0" />
        <path d="M345 240 q6 -6 12 0 q6 -6 12 0" />
      </g>

      {/* ภูเขาไกล ๆ และแนวต้นไม้ */}
      <path d="M0 340 C80 290 150 300 220 330 C300 280 380 270 470 320 C520 300 570 305 600 318 V380 H0 Z" fill="#7aa36b" opacity="0.8" />
      <path d="M0 360 C90 335 170 345 260 360 C350 340 450 338 600 352 V385 H0 Z" fill="#4d7c3f" />

      {/* ดินในแปลง */}
      <rect y={HORIZON} width="600" height={800 - HORIZON} fill="url(#pf-soil)" />

      {/* ร่องมันฝรั่ง + ต้น */}
      {ROWS.map((row, r) => (
        <g key={r}>
          <rect
            x="-20"
            y={row.y - 6 * row.scale}
            width="640"
            height={16 * row.scale}
            rx={8 * row.scale}
            fill="#7c4a1c"
          />
          <rect
            x="-20"
            y={row.y - 6 * row.scale}
            width="640"
            height={5 * row.scale}
            rx={3 * row.scale}
            fill="#b77a3a"
            opacity="0.6"
          />
          {plantsInRow(row, r).map((p, i) => (
            <g key={i} transform={`translate(${p.x} ${row.y}) scale(${p.s})`}>
              <use href="#cv-plant" transform={p.flip ? "scale(-1 1)" : undefined} />
            </g>
          ))}
        </g>
      ))}

      {/* คลองส่งน้ำ */}
      <path
        d="M318 374 C360 420 470 470 620 520 L620 585 C470 530 350 450 306 375 Z"
        fill="url(#pf-water)"
      />
      <path
        d="M330 390 C380 430 470 470 600 520"
        fill="none"
        stroke="#e0f2fe"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="18 22"
        opacity="0.8"
      />

      {/* หัวมันสำปะหลังที่ขุดขึ้นมากองบนดิน */}
      <use href="#cv-root" transform="translate(318 748) scale(1.4) rotate(-8)" />
      <use href="#cv-root" transform="translate(340 762) scale(1.2) rotate(12)" />
      <use href="#cv-root" transform="translate(305 770) scale(1.3) rotate(-20)" />

      {/* เกษตรกร */}
      <g transform="translate(0 10)">
        <ellipse cx="190" cy="768" rx="70" ry="10" fill="#3b2410" opacity="0.35" />
        {/* ขา + รองเท้าบูท */}
        <rect x="163" y="640" width="24" height="118" rx="8" fill="#374151" />
        <rect x="194" y="640" width="24" height="118" rx="8" fill="#374151" />
        <rect x="160" y="722" width="30" height="40" rx="7" fill="#1f2937" />
        <rect x="191" y="722" width="30" height="40" rx="7" fill="#1f2937" />
        {/* เสื้อม่อฮ่อม */}
        <path d="M148 552 Q150 528 175 524 L207 524 Q232 528 234 552 L240 652 L142 652 Z" fill="#1e3a8a" />
        <path d="M191 526 L191 652" stroke="#172554" strokeWidth="2" />
        <path d="M176 524 L191 546 L206 524" fill="#b7794a" />
        {/* ผ้าขาวม้าคาดเอว */}
        <rect x="140" y="640" width="102" height="16" rx="4" fill="url(#pf-check)" />
        <path d="M225 650 l10 30 l-14 -4 Z" fill="url(#pf-check)" />
        {/* แขน */}
        <path d="M156 548 Q140 590 168 612" fill="none" stroke="#1e3a8a" strokeWidth="22" strokeLinecap="round" />
        <path d="M226 548 Q242 590 214 612" fill="none" stroke="#1e3a8a" strokeWidth="22" strokeLinecap="round" />
        {/* ตะกร้า + หัวมันสำปะหลัง */}
        <use href="#cv-root" transform="translate(176 598) rotate(-35)" />
        <use href="#cv-root" transform="translate(200 594) rotate(-70)" />
        <use href="#cv-root" transform="translate(212 600) rotate(-120)" />
        <use href="#cv-root" transform="translate(188 606) rotate(-15)" />
        <path d="M146 610 L236 610 L224 666 L158 666 Z" fill="#a16207" />
        <g stroke="#78350f" strokeWidth="2" opacity="0.8">
          <path d="M150 624 H232 M153 638 H229 M156 652 H226" />
          <path d="M168 610 L172 666 M191 610 L191 666 M214 610 L210 666" />
        </g>
        <rect x="142" y="604" width="98" height="10" rx="5" fill="#854d0e" />
        {/* มือ */}
        <circle cx="163" cy="611" r="9" fill="#b7794a" />
        <circle cx="219" cy="611" r="9" fill="#b7794a" />
        {/* คอ + หัว */}
        <rect x="182" y="500" width="18" height="28" rx="6" fill="#a86b3f" />
        <circle cx="191" cy="492" r="25" fill="#b7794a" />
        <path d="M181 502 q10 7 20 0" fill="none" stroke="#7c4a2a" strokeWidth="2.5" strokeLinecap="round" />
        {/* งอบ */}
        <path d="M112 486 Q191 424 270 486 Q191 500 112 486 Z" fill="#e9c46a" />
        <path d="M112 486 Q191 500 270 486 Q191 508 112 486 Z" fill="#c9a043" />
        <g stroke="#b8892f" strokeWidth="1.5" fill="none" opacity="0.8">
          <path d="M191 448 L140 482 M191 448 L165 488 M191 448 L191 492 M191 448 L217 488 M191 448 L242 482" />
        </g>
        <circle cx="191" cy="448" r="4" fill="#b8892f" />
      </g>

      {/* ไล่เงาด้านบนให้ข้อความอ่านง่าย */}
      <rect width="600" height="800" fill="url(#pf-fade)" />
    </svg>
  );
}

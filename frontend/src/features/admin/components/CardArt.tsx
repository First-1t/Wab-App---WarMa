/**
 * รูปบนการ์ดหน้าตั้งค่า (เก็บใน public/images/admin)
 * - VarietyArt: ภาพมันสำปะหลังทั่วไป ไม่ได้แสดงลักษณะเฉพาะของแต่ละพันธุ์
 * - SeasonArt: ภาพแปลงตามฤดูปลูก
 */

const IMAGE_DIR = "/images/admin";

const VARIETY_PHOTOS = [
  { src: "variety-leaf.jpg", position: "object-center" },
  { src: "variety-farm.jpg", position: "object-center" },
  { src: "variety-root.jpg", position: "object-center" },
  { src: "variety-plant.jpg", position: "object-center" },
  { src: "variety-young-plant.jpg", position: "object-center" },
];

const SEASON_PHOTOS: Record<string, { src: string; position: string }> = {
  ต้นฤดูฝน: { src: "season-early-rain.jpg", position: "object-[center_42%]" },
  ปลายฤดูฝน: { src: "season-late-rain.jpg", position: "object-[center_5%]" },
};

/** แหล่งที่มาตามเงื่อนไขสัญญาอนุญาต — เพิ่มรูปใหม่ต้องเพิ่มตรงนี้ด้วย */
const PHOTO_CREDITS = [
  {
    title: "A cassava plant in a farm adjacent to maize field",
    author: "McOREAL",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:A_cassava_plant_in_a_farm_adjacent_to_maize_field.jpg",
  },
  {
    title: "Thailand 11",
    author: "CIAT",
    license: "CC BY-SA 2.0",
    url: "https://commons.wikimedia.org/wiki/File:Thailand_11_lo_(4039867686).jpg",
  },
  {
    title: "Thailand 16",
    author: "CIAT",
    license: "CC BY-SA 2.0",
    url: "https://commons.wikimedia.org/wiki/File:Thailand_16_lo_(4039874426).jpg",
  },
  {
    title: "Kerala Cassava plant 2",
    author: "Slashme",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Kerala_Cassava_plant_2.jpg",
  },
  {
    title: "Harvested cassava roots 06",
    author: "Denis kasozi",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Harvested_cassava_roots_06.jpg",
  },
  {
    title: "Cassava farm showing the leaves",
    author: "Officialben48",
    license: "CC BY 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Cassava_farm_showing_the_leaves.jpg",
  },
  {
    title: "Cassava plant leaf",
    author: "Manojkumar Subramani",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Cassava_plant_leaf.jpg",
  },
];

function Photo({
  src,
  position,
  className,
}: {
  src: string;
  position: string;
  className: string;
}) {
  // ชื่อพันธุ์และฤดูอยู่บนการ์ดแล้ว รูปจึงเป็นแค่ภาพตกแต่ง
  return (
    <img
      src={`${IMAGE_DIR}/${src}`}
      alt=""
      loading="lazy"
      className={`object-cover ${position} ${className}`}
    />
  );
}

export function VarietyArt({ index, className = "" }: { index: number; className?: string }) {
  return <Photo {...VARIETY_PHOTOS[index % VARIETY_PHOTOS.length]} className={className} />;
}

export function SeasonArt({ season, className = "" }: { season: string; className?: string }) {
  return <Photo {...(SEASON_PHOTOS[season] ?? SEASON_PHOTOS["ต้นฤดูฝน"])} className={className} />;
}

export function PhotoCredits() {
  return (
    <details className="mt-4 text-sm text-on-surface-variant">
      <summary className="cursor-pointer">
        ภาพประกอบทั่วไป ไม่ได้แสดงลักษณะเฉพาะของแต่ละพันธุ์ (ดูที่มาภาพ)
      </summary>
      <ul className="mt-2 space-y-1">
        {PHOTO_CREDITS.map((c) => (
          <li key={c.url}>
            <a href={c.url} target="_blank" rel="noreferrer" className="underline">
              {c.title}
            </a>{" "}
            โดย {c.author}, {c.license}, ตัดขอบและย่อขนาด
          </li>
        ))}
      </ul>
    </details>
  );
}

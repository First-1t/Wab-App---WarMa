"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { rainColor } from "@/lib/format";
import type { RainStation } from "@/lib/types";

// ใช้ plain Leaflet ผ่าน dynamic import ใน useEffect (ต้องมี window ก่อน)
// ปักหมุดด้วย circleMarker (vector) จึงไม่ต้องโหลดไฟล์รูป marker
export default function RainMap({ stations }: { stations: RainStation[] }) {
  const divRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerRef = useRef<any>(null);

  // สร้างแผนที่ครั้งเดียว
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !divRef.current || mapRef.current) return;

      const map = L.map(divRef.current, {
        center: [13.5, 100.9], // กลางประเทศไทย
        zoom: 5,
        scrollWheelZoom: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      renderMarkers(L);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // วาดหมุดใหม่เมื่อข้อมูลเปลี่ยน
  useEffect(() => {
    if (!mapRef.current) return;
    (async () => {
      const L = (await import("leaflet")).default;
      renderMarkers(L);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stations]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function renderMarkers(L: any) {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const s of stations) {
      const color = rainColor(s.rain24h);
      L.circleMarker([s.lat, s.long], {
        radius: Math.min(4 + s.rain24h / 12, 12),
        color,
        weight: 1,
        fillColor: color,
        fillOpacity: 0.75,
      })
        .bindPopup(
          `<b>${s.name}</b><br/>อ.${s.amphoe} จ.${s.province}<br/>` +
            `ฝน 24 ชม.: <b>${s.rain24h.toLocaleString("th-TH")} มม.</b>`,
        )
        .addTo(layer);
    }
  }

  return (
    <div
      ref={divRef}
      className="h-[320px] w-full rounded-lg sm:h-[420px]"
      style={{ background: "#e5eef3" }}
    />
  );
}

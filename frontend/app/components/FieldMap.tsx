"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { formatRaiNganWa, polygonAreaSqm, sqmToRai } from "@/lib/geo";

// แผนที่ดาวเทียม (Esri World Imagery — ใช้ฟรี ไม่ต้องมี API key)
// ผู้ใช้คลิกปักจุดทีละจุดเพื่อวาดขอบแปลง ระบบคำนวณพื้นที่เป็นไร่ให้อัตโนมัติ
export default function FieldMap({
  onAreaChange,
}: {
  onAreaChange: (rai: number) => void;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polyRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  const [points, setPoints] = useState<[number, number][]>([]);
  const [sqm, setSqm] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !divRef.current || mapRef.current) return;
      LRef.current = L;

      const map = L.map(divRef.current, {
        center: [15.87, 100.99], // กลางประเทศไทย
        zoom: 6,
      });
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Esri World Imagery", maxZoom: 19 },
      ).addTo(map);

      // คลิกเพื่อปักจุด
      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        setPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
      });

      mapRef.current = map;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // วาดจุด+รูปหลายเหลี่ยม และคำนวณพื้นที่ทุกครั้งที่จุดเปลี่ยน
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    if (polyRef.current) {
      map.removeLayer(polyRef.current);
      polyRef.current = null;
    }

    points.forEach(([lat, lng], i) => {
      const marker = L.circleMarker([lat, lng], {
        radius: 5,
        color: "#fff",
        weight: 2,
        fillColor: "#f97316",
        fillOpacity: 1,
      })
        .bindTooltip(String(i + 1), { permanent: false })
        .addTo(map);
      markersRef.current.push(marker);
    });

    if (points.length >= 2) {
      polyRef.current = L.polygon(points, {
        color: "#f97316",
        weight: 2,
        fillColor: "#f97316",
        fillOpacity: 0.25,
      }).addTo(map);
    }

    const area = points.length >= 3 ? polygonAreaSqm(points) : 0;
    setSqm(area);
    onAreaChange(area >= 1 ? +sqmToRai(area).toFixed(2) : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  function undo() {
    setPoints((prev) => prev.slice(0, -1));
  }
  function clear() {
    setPoints([]);
  }
  function locateMe() {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      mapRef.current.setView([pos.coords.latitude, pos.coords.longitude], 17);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={locateMe}
          className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold hover:bg-slate-200"
        >
          📍 ไปตำแหน่งของฉัน
        </button>
        <button
          type="button"
          onClick={undo}
          disabled={points.length === 0}
          className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold hover:bg-slate-200 disabled:opacity-40"
        >
          ↶ ย้อนจุด
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={points.length === 0}
          className="rounded-lg bg-red-50 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-100 disabled:opacity-40"
        >
          ล้าง
        </button>
      </div>

      <div
        ref={divRef}
        className="h-[300px] w-full rounded-lg sm:h-[360px]"
        style={{ background: "#1a1a1a" }}
      />

      <p className="text-xs text-slate-500">
        คลิกบนแผนที่เพื่อปักมุมแปลงทีละจุด (อย่างน้อย 3 จุด) ระบบจะคำนวณพื้นที่ให้เอง
      </p>

      {sqm > 0 && (
        <div className="rounded-lg bg-orange-50 px-4 py-2 text-sm">
          พื้นที่ที่วาด:{" "}
          <b className="text-orange-700">
            {sqmToRai(sqm).toLocaleString("th-TH", {
              maximumFractionDigits: 2,
            })}{" "}
            ไร่
          </b>{" "}
          <span className="text-slate-500">
            ({formatRaiNganWa(sqm)} · {Math.round(sqm).toLocaleString("th-TH")} ตร.ม.)
          </span>
        </div>
      )}
    </div>
  );
}

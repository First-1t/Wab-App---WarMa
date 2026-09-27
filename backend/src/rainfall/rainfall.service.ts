import { Injectable, ServiceUnavailableException } from '@nestjs/common';

export interface RainStation {
  id: number;
  name: string;
  lat: number;
  long: number;
  amphoe: string;
  province: string;
  rain24h: number;
  datetime: string;
}

const THAIWATER_URL =
  'https://api-v3.thaiwater.net/api/v1/thaiwater30/public/rain_24h';

/**
 * ดึงข้อมูลปริมาณฝน 24 ชม. ย้อนหลังจาก ThaiWater (คลังข้อมูลน้ำแห่งชาติ / สสน.)
 * เรียกผ่าน backend เพื่อเลี่ยง CORS และ cache ไว้ ~10 นาที ลดภาระ API ปลายทาง
 */
@Injectable()
export class RainfallService {
  private cache: { at: number; data: RainStation[] } | null = null;
  private readonly ttlMs = 10 * 60 * 1000;

  async get24h(): Promise<{
    updatedAt: string | null;
    stations: RainStation[];
  }> {
    if (this.cache && Date.now() - this.cache.at < this.ttlMs) {
      return this.toResult(this.cache.data);
    }

    let json: { data?: unknown[] };
    try {
      const res = await fetch(THAIWATER_URL, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      json = (await res.json()) as { data?: unknown[] };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new ServiceUnavailableException(
        `ดึงข้อมูลฝนจาก ThaiWater ไม่สำเร็จ: ${msg}`,
      );
    }

    const stations: RainStation[] = (json.data ?? [])
      .map((raw) => this.parse(raw as ThaiWaterRecord))
      .filter((s): s is RainStation => s !== null && s.rain24h > 0);

    this.cache = { at: Date.now(), data: stations };
    return this.toResult(stations);
  }

  private toResult(stations: RainStation[]) {
    const updatedAt = stations[0]?.datetime ?? null;
    // เรียงจากฝนมากไปน้อย เพื่อให้ตารางด้านซ้ายโชว์สถานีฝนหนักก่อน
    const sorted = [...stations].sort((a, b) => b.rain24h - a.rain24h);
    return { updatedAt, stations: sorted };
  }

  private parse(r: ThaiWaterRecord): RainStation | null {
    const lat = r.station?.tele_station_lat;
    const long = r.station?.tele_station_long;
    if (typeof lat !== 'number' || typeof long !== 'number') return null;
    return {
      id: r.id,
      name: r.station?.tele_station_name?.th ?? 'ไม่ระบุชื่อสถานี',
      lat,
      long,
      amphoe: r.geocode?.amphoe_name?.th ?? '',
      province: r.geocode?.province_name?.th ?? '',
      rain24h: r.rain_24h ?? 0,
      datetime: r.rainfall_datetime ?? '',
    };
  }
}

interface ThaiWaterRecord {
  id: number;
  rain_24h?: number;
  rainfall_datetime?: string;
  station?: {
    tele_station_name?: { th?: string };
    tele_station_lat?: number;
    tele_station_long?: number;
  };
  geocode?: {
    amphoe_name?: { th?: string };
    province_name?: { th?: string };
  };
}

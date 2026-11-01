// โหลด .env ตรงนี้ด้วย เพราะไฟล์นี้อ่านข้อมูลตอน import ซึ่งเกิดก่อน dotenv.config() ใน index.ts
import 'dotenv/config';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

/**
 * ที่เก็บข้อมูลของ Admin (scenarios, ความคิดเห็น, ผู้รับแจ้งเตือน)
 * - มี DATABASE_URL = เก็บใน PostgreSQL (ใช้ตอน deploy เพราะไฟล์บนเซิร์ฟเวอร์ฟรีหายตอนรีสตาร์ท)
 * - ไม่มี = เก็บเป็นไฟล์ JSON ที่ backend/data/ (พัฒนาในเครื่องได้โดยไม่ต้องมีฐานข้อมูล)
 */
const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl ? new pg.Pool({ connectionString: databaseUrl, max: 3 }) : null;
// ฐานข้อมูลฟรีตัดการเชื่อมต่อตอนหยุดพัก ต้องรับ error นี้ไว้ไม่ให้เซิร์ฟเวอร์ดับ
pool?.on('error', (e) => console.error('[Admin] การเชื่อมต่อฐานข้อมูลหลุด:', e.message));

let tableReady: Promise<unknown> | undefined;
const ensureTable = () =>
  (tableReady ??= pool!.query(`
    CREATE TABLE IF NOT EXISTS admin_store (
      key text PRIMARY KEY,
      value jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )`));

const dataDir = () =>
  process.env.DATA_DIR ||
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../data');
const filePath = (key: string) => path.join(dataDir(), `${key}.json`);

/** ยังไม่เคยบันทึก = คืน fallback, อ่านไม่ได้ = throw เพื่อไม่ให้เขียนทับข้อมูลเดิม */
export async function readData<T>(key: string, fallback: T): Promise<T> {
  if (pool) {
    await ensureTable();
    const { rows } = await pool.query('SELECT value FROM admin_store WHERE key = $1', [key]);
    return rows.length ? (rows[0].value as T) : fallback;
  }
  try {
    return JSON.parse(readFileSync(filePath(key), 'utf8')) as T;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return fallback;
    throw e;
  }
}

export async function writeData(key: string, data: unknown): Promise<void> {
  if (pool) {
    await ensureTable();
    await pool.query(
      `INSERT INTO admin_store (key, value, updated_at) VALUES ($1, $2::jsonb, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [key, JSON.stringify(data)],
    );
    return;
  }
  const target = filePath(key);
  mkdirSync(path.dirname(target), { recursive: true });
  // เขียนไฟล์ชั่วคราวก่อนแล้วเปลี่ยนชื่อ กันไฟล์เสียถ้าเซิร์ฟเวอร์ดับกลางคัน
  writeFileSync(`${target}.tmp`, JSON.stringify(data, null, 2), 'utf8');
  renameSync(`${target}.tmp`, target);
}

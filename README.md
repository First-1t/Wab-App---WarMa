# 💧 WarMa — Water Resources Management Advisor

Web Application แนะนำการจัดการทรัพยากรน้ำเพื่อการเกษตร สำหรับคณะเกษตรศาสตร์
ผู้ใช้กรอกปัจจัยนำเข้า (พันธุ์มันฝรั่ง ฤดูกาล ปริมาณน้ำต้นทุน ขนาดพื้นที่) → ระบบจับคู่ scenario
ที่เหมาะสม → แสดงคำแนะนำการให้น้ำ ตารางการให้น้ำ และกราฟเปรียบเทียบ พร้อม admin panel
ให้อาจารย์แก้ไขข้อมูลเองได้โดยไม่ต้องแก้โค้ด

## สถาปัตยกรรม

```
┌─────────────────┐  HTTP/JSON   ┌──────────────────┐   Prisma   ┌──────────────────────┐
│ frontend/        │ ───────────▶ │ backend/          │ ─────────▶ │ PostgreSQL            │
│ Next.js + Tailwind│              │ NestJS REST API   │            │ (Azure Database)      │
│ (Azure Static     │              │ + Claude AI       │            └──────────────────────┘
│  Web Apps)        │              │ (Azure Container  │
└─────────────────┘              │  Apps)            │
                                  └──────────────────┘
```

| โฟลเดอร์ | เทคโนโลยี | หน้าที่ |
|----------|-----------|---------|
| `frontend/` | Next.js 16 + TypeScript + Tailwind | หน้าผู้ใช้ (mobile-first) + หน้าอาจารย์ `/admin` |
| `backend/` | NestJS + Prisma + PostgreSQL | REST API: จับคู่ scenario, CRUD, AI อธิบายผล (Claude) |
| `prototype/` | HTML/CSS/JS ล้วน | ต้นแบบเวอร์ชันแรก (เก็บไว้อ้างอิง) |

## 🚀 วิธีเปิดเว็บ

**ทุกครั้งที่เปิดเครื่องใหม่ ต้องสั่งเปิดเองทั้งหมด** (ไม่มีตัวไหนเปิดอัตโนมัติ)
ใช้แค่ **Terminal 2 หน้าต่าง** ปล่อยค้างไว้ทั้งคู่ แล้วเปิดเบราว์เซอร์ที่ **http://localhost:3000**

**หน้าต่างที่ 1 — ฐานข้อมูล + Backend (คำสั่งเดียวจบ)**

```bash
cd backend
npm run dev
```
คำสั่งนี้ทำ 3 อย่างให้อัตโนมัติ: เปิดฐานข้อมูล → สร้างตาราง + ใส่ข้อมูล 24 scenario (มันฝรั่ง 3 พันธุ์ × 3 ฤดู) → เปิด API
ที่พอร์ต 3001

**หน้าต่างที่ 2 — Frontend**

```bash
cd frontend
npm run dev                    # เว็บที่ http://localhost:3000
```

เปิดเบราว์เซอร์ที่ **http://localhost:3000** ได้เลย · เลิกใช้งานกด Ctrl+C ทั้ง 2 หน้าต่าง

> ⚠️ **ข้อมูลในฐานข้อมูลหายเมื่อรีสตาร์ทเครื่อง** (เพราะ `prisma dev` เป็นฐานข้อมูลชั่วคราวสำหรับ
> พัฒนา) — ไม่ต้องกังวล เพราะ `npm run dev` จะสร้างตารางและใส่ข้อมูลใหม่ให้ทุกครั้งอยู่แล้ว
> แต่ถ้าเคยเพิ่ม scenario เองผ่านหน้าอาจารย์ ข้อมูลนั้นจะหายไปด้วย ให้กด "ส่งออก JSON" เก็บไว้ก่อน

## คำสั่งจัดการฐานข้อมูล (รันใน `backend/`)

| อยากทำอะไร | คำสั่ง |
|---|---|
| เปิดฐานข้อมูลอย่างเดียว | `npm run db:up` |
| ปิดฐานข้อมูล | `npm run db:stop` |
| สร้างตาราง + ใส่ข้อมูลใหม่ (ใช้เมื่อข้อมูลหาย) | `npm run db:reset` |
| **ลบข้อมูลทั้งหมด** แล้วใส่ข้อมูลตั้งต้นใหม่ | `npm run db:reseed` |
| ดูว่าเปิดอยู่ไหม | `npx prisma dev ls` |

> ปิดฐานข้อมูลด้วย `db:stop` ข้อมูลยังอยู่ · แต่ถ้า **รีสตาร์ทเครื่อง** ข้อมูลจะหาย
> (ให้รัน `npm run dev` หรือ `npm run db:reset` เพื่อสร้างใหม่)

## 🔧 แก้ปัญหา "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้"

ไล่ตามลำดับนี้ เกือบทุกครั้งจบที่ข้อ 1

1. **backend ไม่ได้เปิด** (สาเหตุที่พบบ่อยที่สุด — โดยเฉพาะหลังเปิดเครื่องใหม่)
   → `cd backend` แล้ว `npm run dev`
2. **ตารางในฐานข้อมูลหาย** (log ขึ้น `table public.Scenario does not exist`)
   → `cd backend` แล้ว `npm run db:reset`
3. **พอร์ตฐานข้อมูลไม่ตรง** → รัน `npx prisma dev ls` ดู URL ที่ได้ แล้วแก้บรรทัด `DATABASE_URL`
   ใน `backend/.env` ให้ตรง (ต่อท้ายด้วย `&pgbouncer=true` เสมอ)

เช็คว่า backend ทำงานจริงไหม: เปิดเบราว์เซอร์ไปที่ http://localhost:3001/scenarios/options
ถ้าเห็นรายชื่อพันธุ์มันฝรั่งแปลว่าปกติ

## การรันในเครื่อง (Development — รายละเอียดการติดตั้งครั้งแรก)

ต้องมี Node.js 20+ และ PostgreSQL — เลือกได้ 2 ทาง:
- มี Docker: `docker compose up -d`
- ไม่มี Docker: `cd backend && npx prisma dev -n warma --detach` (Postgres จำลองของ Prisma
  จะพิมพ์ connection string ออกมา ให้เอาไปใส่ `DATABASE_URL` แล้วต่อท้ายด้วย `&pgbouncer=true`)

**1. Backend**

```bash
cd backend
copy .env.example .env        # แล้วแก้ DATABASE_URL ให้ตรงกับเครื่อง
npm install
npx prisma db push            # สร้างตาราง
npx prisma db seed            # เติมข้อมูลจำลอง 24 scenario
npm run start:dev             # API ที่ http://localhost:3001
```

**2. Frontend**

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev                   # เว็บที่ http://localhost:3000
```

## API หลัก

📘 **เอกสาร API แบบกดทดลองเรียกได้ (Swagger):** http://localhost:3001/api/docs
(OpenAPI JSON: `/api/docs-json`) — endpoint ที่มีรูปกุญแจต้องล็อกอินก่อน

| Method | Path | คำอธิบาย |
|--------|------|----------|
| `GET` | `/scenarios` | รายการ scenario ทั้งหมด |
| `GET` | `/scenarios/options` | รายชื่อพันธุ์มันฝรั่ง/ฤดูกาลสำหรับฟอร์ม |
| `POST` | `/scenarios/match` | จับคู่ scenario จาก `{crop, season, water, area}` |
| `POST/PUT/DELETE` | `/scenarios[/:id]` | จัดการข้อมูล (ต้องส่ง header `Authorization: Bearer <token>`) |
| `GET` | `/auth/config` | ค่าสำหรับปุ่ม Sign in with Google (client ID, โดเมนที่อนุญาต) |
| `POST` | `/auth/google` | ส่ง Google ID token → ได้ session token (อายุ 8 ชม.) ถ้าเป็นอีเมลในโดเมนที่อนุญาต |
| `GET` | `/auth/me` | ข้อมูลอาจารย์ที่ล็อกอินอยู่ |
| `POST` | `/ai/explain` | ให้ Claude อธิบายผลแบบภาษาชาวบ้าน (ต้องตั้ง `ANTHROPIC_API_KEY`) |
| `GET` | `/rainfall` | ปริมาณฝน 24 ชม. รายสถานี (ดึงจาก ThaiWater API) |
| `POST` | `/feedback` | ส่งคะแนน 1–5 ดาว + ความคิดเห็น (ต้องล็อกอิน) |
| `GET` | `/feedback` | สรุปคะแนนเฉลี่ยและความคิดเห็นทั้งหมด (ต้องล็อกอิน) |

**การตรวจข้อมูลและความปลอดภัย**
- ทุก endpoint ตรวจข้อมูลนำเข้า — ข้อมูลผิดตอบ `400` พร้อมข้อความภาษาไทย, id ไม่มีอยู่ตอบ `404`
- จำกัดการเรียก (rate limit) 120 ครั้ง/นาที/IP — `/ai/explain` 5 ครั้ง/นาที, `/auth/google` 10 ครั้ง/นาที, `POST /feedback` 5 ครั้ง/นาที (เกินตอบ `429`)
- security headers ด้วย helmet, จำกัดขนาด request body 100 KB (เกินตอบ `413`)

## 🔐 ล็อกอินหน้าอาจารย์ด้วยอีเมลมหาวิทยาลัย (Google)

หน้า `/admin` ให้เข้าได้เฉพาะบัญชี Google ของมหาวิทยาลัย — อาจารย์ (`@kku.ac.th`) และนักศึกษา
(`@kkumail.com`) ระบบตรวจที่ backend ถ้าล็อกอินด้วย Gmail ส่วนตัว ระบบจะปฏิเสธ

**ตั้งค่าครั้งแรก**

1. เข้า [Google Cloud Console](https://console.cloud.google.com/) → สร้าง project
2. **APIs & Services → OAuth consent screen** → เลือก **External** แล้วกด **Publish app**
   (ต้องเป็น External เพราะ `kku.ac.th` กับ `kkumail.com` เป็นคนละ organization กัน
   ถ้าเลือก Internal จะใช้ได้แค่โดเมนเดียว)
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** → ชนิด **Web application**
   - Authorized JavaScript origins: `http://localhost:3000` และ URL จริงของ frontend ตอน deploy
4. คัดลอก Client ID ไปใส่ `backend/.env`

```
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
ALLOWED_EMAIL_DOMAIN=kku.ac.th,kkumail.com
AUTH_SECRET=<ข้อความสุ่มยาว ๆ>
```

5. รีสตาร์ท backend

> ถ้าไม่ตั้ง `GOOGLE_CLIENT_ID` ระบบจะอยู่ใน **โหมดพัฒนา**: เข้าหน้าอาจารย์ได้เลยโดยไม่ต้องล็อกอิน
> (หน้าเว็บจะแสดงแถบเตือนสีส้ม) ตอน deploy จริงต้องตั้งค่าทุกครั้ง

## การ Deploy บน Azure

| ส่วน | บริการ | วิธี |
|------|--------|------|
| Frontend | **Azure Static Web Apps** | ชี้ repo → app location `frontend` แล้วตั้ง env `NEXT_PUBLIC_API_URL` เป็น URL ของ backend |
| Backend | **Azure Container Apps** | build จาก `backend/Dockerfile` แล้วตั้ง env `DATABASE_URL`, `CORS_ORIGIN`, `GOOGLE_CLIENT_ID`, `ALLOWED_EMAIL_DOMAIN`, `AUTH_SECRET`, `ANTHROPIC_API_KEY` |
| Database | **Azure Database for PostgreSQL** (Flexible Server) | สร้างแล้วรัน `npx prisma db push && npx prisma db seed` โดยตั้ง `DATABASE_URL` ชี้ไปที่ DB นี้ |
| ไฟล์/รูป | **Azure Blob Storage** | (แผนอนาคต เช่น เก็บรูปแปลง/เอกสาร) |

## Git Workflow

ดู [WORKFLOW.md](WORKFLOW.md) — สรุป: ทำงานบน branch `develop` แล้วเปิด Pull Request รวมเข้า `main`

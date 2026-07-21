# 💧 WarMa — Water Resources Management Advisor

Web Application แนะนำการจัดการทรัพยากรน้ำเพื่อการเกษตร สำหรับคณะเกษตรศาสตร์
ผู้ใช้กรอกปัจจัยนำเข้า (ชนิดพืช ฤดูกาล ปริมาณน้ำต้นทุน ขนาดพื้นที่) → ระบบจับคู่ scenario
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
คำสั่งนี้ทำ 3 อย่างให้อัตโนมัติ: เปิดฐานข้อมูล → สร้างตาราง + ใส่ข้อมูล 14 scenario → เปิด API
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

## วิธีเปิด ปิด ฐานข้อมูล ##

**อยากทำอะไร	คำสั่ง**

npx prisma dev -n warma             # เปิด
npx prisma dev stop -n warma        # ปิด
npx prisma dev ls                   # ดูว่าเปิดอยู่ไหม
npx prisma dev rm -n warma          # ลบทิ้ง (ลบข้อมูลด้วย)	

## 🔧 แก้ปัญหา "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้"

ไล่ตามลำดับนี้ เกือบทุกครั้งจบที่ข้อ 1

1. **backend ไม่ได้เปิด** (สาเหตุที่พบบ่อยที่สุด — โดยเฉพาะหลังเปิดเครื่องใหม่)
   → `cd backend` แล้ว `npm run dev`
2. **ตารางในฐานข้อมูลหาย** (log ขึ้น `table public.Scenario does not exist`)
   → `cd backend` แล้ว `npm run db:reset`
3. **พอร์ตฐานข้อมูลไม่ตรง** → รัน `npx prisma dev ls` ดู URL ที่ได้ แล้วแก้บรรทัด `DATABASE_URL`
   ใน `backend/.env` ให้ตรง (ต่อท้ายด้วย `&pgbouncer=true` เสมอ)

เช็คว่า backend ทำงานจริงไหม: เปิดเบราว์เซอร์ไปที่ http://localhost:3001/scenarios/options
ถ้าเห็นรายชื่อพืชแปลว่าปกติ

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
npx prisma db seed            # เติมข้อมูลจำลอง 14 scenario
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

| Method | Path | คำอธิบาย |
|--------|------|----------|
| `GET` | `/scenarios` | รายการ scenario ทั้งหมด |
| `GET` | `/scenarios/options` | รายชื่อพืช/ฤดูกาลสำหรับฟอร์ม |
| `POST` | `/scenarios/match` | จับคู่ scenario จาก `{crop, season, water, area}` |
| `POST/PUT/DELETE` | `/scenarios[/:id]` | จัดการข้อมูล (ต้องส่ง header `x-admin-key`) |
| `POST` | `/ai/explain` | ให้ Claude อธิบายผลแบบภาษาชาวบ้าน (ต้องตั้ง `ANTHROPIC_API_KEY`) |

## การ Deploy บน Azure

| ส่วน | บริการ | วิธี |
|------|--------|------|
| Frontend | **Azure Static Web Apps** | ชี้ repo → app location `frontend` แล้วตั้ง env `NEXT_PUBLIC_API_URL` เป็น URL ของ backend |
| Backend | **Azure Container Apps** | build จาก `backend/Dockerfile` แล้วตั้ง env `DATABASE_URL`, `CORS_ORIGIN`, `ADMIN_KEY`, `ANTHROPIC_API_KEY` |
| Database | **Azure Database for PostgreSQL** (Flexible Server) | สร้างแล้วรัน `npx prisma db push && npx prisma db seed` โดยตั้ง `DATABASE_URL` ชี้ไปที่ DB นี้ |
| ไฟล์/รูป | **Azure Blob Storage** | (แผนอนาคต เช่น เก็บรูปแปลง/เอกสาร) |

## Git Workflow

ดู [WORKFLOW.md](WORKFLOW.md) — สรุป: ทำงานบน branch `develop` แล้วเปิด Pull Request รวมเข้า `main`

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

## การรันในเครื่อง (Development)

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

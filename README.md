# 💧 WarMa — Water Resources Management Advisor

Web Application แนะนำการจัดการทรัพยากรน้ำเพื่อการเกษตร สำหรับคณะเกษตรศาสตร์
ผู้ใช้กรอกปัจจัยนำเข้า (พันธุ์มันสำปะหลัง ฤดูกาล ปริมาณน้ำต้นทุน ขนาดพื้นที่) → ระบบจับคู่ scenario
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

**ต้องมี [Docker Desktop](https://www.docker.com/products/docker-desktop/)** (ฐานข้อมูล PostgreSQL รันใน Docker)
— ไม่ต้องเปิดเอง `npm run dev` จะเปิด Docker Desktop ให้ถ้ายังไม่ได้เปิด

ใช้แค่ **Terminal 2 หน้าต่าง** ปล่อยค้างไว้ทั้งคู่ แล้วเปิดเบราว์เซอร์ที่ **http://localhost:3000**

**หน้าต่างที่ 1 — ฐานข้อมูล + Backend (คำสั่งเดียวจบ)**

```bash
cd backend
npm run dev
```
คำสั่งนี้ทำ 3 อย่างให้อัตโนมัติ: เปิดฐานข้อมูล (Docker) → สร้างตาราง + ใส่ข้อมูลตั้งต้น 32 scenario
(มันสำปะหลัง 4 พันธุ์ × 3 ฤดูปลูก — ใส่เฉพาะครั้งแรกที่ยังไม่มีข้อมูล) → เปิด API ที่พอร์ต 3001

**หน้าต่างที่ 2 — Frontend**

```bash
cd frontend
npm run dev                    # เว็บที่ http://localhost:3000
```

เปิดเบราว์เซอร์ที่ **http://localhost:3000** ได้เลย · เลิกใช้งานกด Ctrl+C ทั้ง 2 หน้าต่าง

> ข้อมูลเก็บใน Docker volume `warma-pgdata` — **ไม่หาย** ตอนปิด backend, ปิด Docker หรือรีสตาร์ทเครื่อง
> (หายเฉพาะเมื่อสั่ง `docker compose down -v` หรือ `npm run db:reseed`)

## คำสั่งจัดการฐานข้อมูล (รันใน `backend/`)

| อยากทำอะไร | คำสั่ง |
|---|---|
| เปิดฐานข้อมูลอย่างเดียว | `npm run db:up` |
| ปิดฐานข้อมูล (ข้อมูลยังอยู่) | `npm run db:stop` |
| สร้างตาราง + ใส่ข้อมูลตั้งต้น (ถ้ายังไม่มี) | `npm run db:reset` |
| **ลบข้อมูลทั้งหมด** แล้วใส่ข้อมูลตั้งต้นใหม่ | `npm run db:reseed` |
| ดูว่าเปิดอยู่ไหม | `docker compose ps` (รันที่ root ของโปรเจกต์) |

## 🔧 แก้ปัญหา "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้"

ไล่ตามลำดับนี้ เกือบทุกครั้งจบที่ข้อ 1

1. **backend ไม่ได้เปิด** (สาเหตุที่พบบ่อยที่สุด — โดยเฉพาะหลังเปิดเครื่องใหม่)
   → `cd backend` แล้ว `npm run dev`
2. **Docker ไม่ได้เปิด / เปิดไม่ขึ้น** (log ขึ้น `[db] Docker ยังไม่พร้อม`)
   → เปิด Docker Desktop เอง รอจนมุมล่างซ้ายขึ้นว่า *Engine running* แล้วรัน `npm run dev` ใหม่
3. **ตารางในฐานข้อมูลหาย** (log ขึ้น `table public.Scenario does not exist`)
   → `cd backend` แล้ว `npm run db:reset`
4. **พอร์ต 5432 ถูกใช้อยู่** (มี PostgreSQL ตัวอื่นในเครื่อง) → ปิดตัวนั้น หรือแก้พอร์ตใน
   `docker-compose.yml` และ `DATABASE_URL` ใน `backend/.env` ให้ตรงกัน

เช็คว่า backend ทำงานจริงไหม: เปิดเบราว์เซอร์ไปที่ http://localhost:3001/scenarios/options
ถ้าเห็นรายชื่อพันธุ์มันสำปะหลังแปลว่าปกติ

## การรันในเครื่อง (Development — รายละเอียดการติดตั้งครั้งแรก)

ต้องมี Node.js 20+ และ Docker Desktop

**1. Backend**

```bash
cd backend
copy .env.example .env        # DATABASE_URL ค่าเริ่มต้นตรงกับ Docker อยู่แล้ว
npm install
npm run dev                   # เปิดฐานข้อมูล + สร้างตาราง + ใส่ข้อมูล + API ที่ http://localhost:3001
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
| `GET` | `/scenarios/options` | รายชื่อพันธุ์มันสำปะหลัง/ฤดูกาลสำหรับฟอร์ม |
| `POST` | `/scenarios/match` | จับคู่ scenario จาก `{crop, season, water, area}` |
| `POST/PUT/DELETE` | `/scenarios[/:id]` | จัดการข้อมูล (ต้องส่ง header `Authorization: Bearer <token>`) |
| `GET` | `/auth/config` | ค่าสำหรับปุ่ม Sign in with Google (client ID, โดเมนที่อนุญาต) |
| `POST` | `/auth/google` | ส่ง Google ID token → ได้ session token (อายุ 8 ชม.) ถ้าเป็นอีเมลในโดเมนที่อนุญาต |
| `GET` | `/auth/me` | ข้อมูลอาจารย์ที่ล็อกอินอยู่ |
| `POST` | `/ai/explain` | ให้ Claude อธิบายผลแบบภาษาชาวบ้าน (ต้องตั้ง `ANTHROPIC_API_KEY`) |
| `GET` | `/rainfall` | ปริมาณฝน 24 ชม. รายสถานี (ดึงจาก ThaiWater API) |
| `POST` | `/feedback` | ส่งคะแนน 1–5 ดาว + ความคิดเห็น (ต้องล็อกอิน) |
| `GET` | `/feedback` | สรุปคะแนนเฉลี่ยและความคิดเห็นทั้งหมด (ต้องล็อกอิน) |
| `GET/PUT` | `/feedback/notify` | ดู/เปิด/ปิดการแจ้งเตือนทางอีเมลของผู้ใช้ที่ล็อกอิน |
| `POST` | `/feedback/notify/test` | ส่งอีเมลทดสอบไปที่อีเมลที่ล็อกอิน |

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

## 🔔 แจ้งเตือนทางอีเมลเมื่อมีความคิดเห็นใหม่

ผู้ที่ล็อกอินเปิดรับแจ้งเตือนได้เองที่ **หน้าตั้งค่า → แท็บ “ความคิดเห็นผู้ใช้” → สวิตช์ “แจ้งเตือนทางอีเมล”**
ระบบจะส่งไปที่อีเมลที่ใช้ล็อกอิน ทุกครั้งที่มีคนให้คะแนน/แสดงความคิดเห็น (ไม่ส่งหาคนที่เขียนความคิดเห็นเอง)

ต้องตั้งค่าบัญชีที่ใช้ **ส่ง** อีเมลใน `backend/.env` ก่อน (ตัวอย่างใช้ Gmail):

1. ใช้บัญชี Gmail ที่จะเป็นผู้ส่ง → เปิด **2-Step Verification**
2. สร้าง **App Password** ที่ https://myaccount.google.com/apppasswords (ได้รหัส 16 ตัว)
3. ใส่ใน `backend/.env` แล้วรีสตาร์ท backend

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=บัญชี-gmail-ผู้ส่ง@gmail.com
SMTP_PASS=app-password-16-ตัว
MAIL_FROM="WarMa <บัญชี-gmail-ผู้ส่ง@gmail.com>"
APP_URL=http://localhost:3000
```

4. กดปุ่ม **“ส่งอีเมลทดสอบ”** ในหน้าตั้งค่าเพื่อเช็กว่าส่งได้จริง

> ถ้าไม่ตั้ง `SMTP_HOST` ระบบยังทำงานปกติ แต่จะไม่ส่งเมลจริง (พิมพ์ข้อความใน log ของ backend แทน)

## การ Deploy บน Azure

| ส่วน | บริการ | วิธี |
|------|--------|------|
| Frontend | **Azure Static Web Apps** | ชี้ repo → app location `frontend` แล้วตั้ง env `NEXT_PUBLIC_API_URL` เป็น URL ของ backend |
| Backend | **Azure Container Apps** | build จาก `backend/Dockerfile` แล้วตั้ง env `DATABASE_URL`, `CORS_ORIGIN`, `GOOGLE_CLIENT_ID`, `ALLOWED_EMAIL_DOMAIN`, `AUTH_SECRET`, `ANTHROPIC_API_KEY` |
| Database | **Azure Database for PostgreSQL** (Flexible Server) | สร้างแล้วรัน `npx prisma db push && npx prisma db seed` โดยตั้ง `DATABASE_URL` ชี้ไปที่ DB นี้ |
| ไฟล์/รูป | **Azure Blob Storage** | (แผนอนาคต เช่น เก็บรูปแปลง/เอกสาร) |

## Git Workflow

ดู [WORKFLOW.md](WORKFLOW.md) — สรุป: ทำงานบน branch `develop` แล้วเปิด Pull Request รวมเข้า `main`

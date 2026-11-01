# แผนการพัฒนาโครงการ WarMa — โมดูล Output (`todo.md`)
> **เอกสารวางแผนและติดตามความคืบหน้าการพัฒนา (Development & Progress Roadmap)**  
> **กลุ่มย่อย:** Output Development Team | **Branch:** `output-dev`  
> **วันที่จัดทำ:** 28 กันยายน 2026 | **สถานะโครงการ:** เตรียมเริ่มการพัฒนาจริง (Pre-Implementation / Progress Preparation)

---

## 1. บริบทโครงการ (Project Context)

* **ชื่อโครงการ:** WarMa (Water Resources Management Advisor — เว็บแอปพลิเคชันแนะนำการจัดการทรัพยากรน้ำเพื่อการเกษตร)
* **โครงสร้างทีม:** ทีมใหญ่ 4 คน แบ่งเป็น 2 กลุ่มย่อย (กลุ่มละ 2 คน) พัฒนาโปรเจกต์เดียวกัน โดยทุกคนต้องมีส่วนร่วมทั้ง **Frontend และ Backend (Full-Stack)**
* **การแบ่งความรับผิดชอบ 4 ด้าน:**
  1. `Admin`: จัดการฐานข้อมูล Scenario และการตั้งค่าระบบ
  2. `Input`: รับข้อมูลแปลงปลูก พิกัด แผนที่ และข้อมูลสภาพอากาศ
  3. `Output (ขอบเขตของฉัน)`: รับข้อมูลนำเข้า $\rightarrow$ ประมวลผลจับคู่ Scenario $\rightarrow$ แปลงผลผลิตสด $\rightarrow$ แสดงผลคำแนะนำตารางน้ำ
  4. `Profit`: คำนวณต้นทุน รายได้ และกำไรสุทธิทางเศรษฐศาสตร์
* **Tech Stack มาตรฐานที่ตกลงร่วมกัน:**
  * **Frontend:** React + Tailwind CSS
  * **Backend:** Node.js + Express.js
* **Git Branching Strategy:**
  * `output-dev`: Branch สำหรับพัฒนาโมดูล Output ของฉันโดยเฉพาะ (ทำงานบน Branch นี้เท่านั้น)
  * `develop`: Branch การทำงานของเพื่อนร่วมทีม (ใช้สำหรับอ้างอิง Context ห้ามแก้ไขหรือ Reset)

---

## 2. การวิเคราะห์กรอบเวลาและความพร้อม (Timeline Analysis)

### 2.1 ลำดับเวลาจริง (Actual Chronology)
* **ช่วงรับโจทย์และการสัมภาษณ์ล่าสุด:** ประมาณวันที่ 15–21 สิงหาคม 2026 (August 2026 Week 2–3) ซึ่งเป็นช่วงที่ได้พูดคุยกับอาจารย์คณะเกษตรศาสตร์และจดบันทึกลายมือในเอกสารโจทย์
* **วันที่ปัจจุบัน:** 28 กันยายน 2026 (September 2026 Week 4)
* **ระยะเวลาที่ล่วงเลยมา:** ประมาณ **5–6 สัปดาห์ (~38 วัน)**
* **เวลาที่เหลือจนถึงกำหนดส่งมอบ (Deadline):** ประมาณ **4 สัปดาห์** (สิ้นเดือนตุลาคม 2026 Week 4)

### 2.2 การประเมินสถานะในบริบทโครงงานนักศึกษา (Contextual Gap Analysis)
* **สิ่งที่ตามแผนงานเดิม (Planned Schedule) คาดหวัง ณ สิ้นเดือนกันยายน:** ตามแผนงานเดิมใน Proposal/Checkpoint ช่วงสิ้นเดือนกันยายนควรพัฒนา Core Matching, การคำนวณผลผลิต, และเริ่มเชื่อมต่อ Weather API แล้ว
* **ความเป็นจริงของโครงการ (Reality Check):** **ยังไม่ได้เริ่มเขียนโค้ด Implementation จริงบน `output-dev`** (ระบบเดิมใน Repo เป็นเพียงเอกสารและโค้ดทดลองของเพื่อนใน `develop`)
* **ผลกระทบ:** กำลังจะมีการตรวจ/นำเสนอ **Progress** หากไปนำเสนอแต่สไลด์หรือแบบร่าง UI จะไม่น่าเชื่อถือและเสี่ยงต่อการไม่ผ่านการประเมิน
* **สิ่งที่ต้องมีให้เห็นเป็นรูปธรรมในการนำเสนอ Progress:**
  * ต้องมี **Working Vertical Slice (End-to-End Walking Skeleton)** ที่รันได้จริง
  * แสดงให้เห็นทั้งฝั่ง **Backend (Express)** ที่มี Logic จับคู่และคำนวณผลผลิตจริง
  * แสดงให้เห็นฝั่ง **Frontend (React + Tailwind)** ที่สามารถเลือก Input $\rightarrow$ กดส่ง $\rightarrow$ แสดงผลลัพธ์คำแนะนำการให้น้ำและผลผลิตสดได้จริง
* **สิ่งที่ไม่จำเป็นต้องทำในรอบ Progress นี้ (ลด Scope เพื่อให้ทันเวลา):**
  * ยังไม่ต้องต่อฐานข้อมูลจริงขนาดใหญ่ (ใช้ In-memory / Mock Scenario Store ก่อนได้)
  * ยังไม่ต้องทำ Admin CRUD หรือระบบ Login/Auth
  * ยังไม่ต้องต่อ GISTDA / Live Weather API (ใช้ค่าจำลองสภาพอากาศ)
  * ยังไม่ต้องทำระบบคำนวณ Profit เต็มรูปแบบ (เตรียมเฉพาะ Data Handoff Contract)

---

## 3. เป้าหมายการนำเสนอความคืบหน้า (Recommended Progress Target)

เป้าหมายสูงสุดของการนำเสนอ Progress รอบนี้คือการสาธิต **"Core Output Working Flow"** แบบสด (Live Demo) บน Branch `output-dev` โดยมีองค์ประกอบครบทั้ง Frontend และ Backend:

$$\text{User Input (พันธุ์, วันปลูก, น้ำ)} \xrightarrow{\text{REST API}} \text{Express Backend (Matching Engine)} \xrightarrow{\text{DTO}} \text{React Frontend (Fresh Yield \& Schedule)}$$

### เกณฑ์ความสำเร็จของ Progress Demo (Demo Criteria):
1. **Frontend (React + Tailwind):** มีหน้าจอขนาดกะทัดรัด (Mobile-First) ที่ให้ผู้ใช้เลือก 3 สายพันธุ์หลัก (เกษตรศาสตร์ 50, ระยอง 9, CMR38-125-77), วันปลูก, และปริมาณน้ำ
2. **Backend (Node.js + Express):** มี Endpoint `POST /api/output/match` ทำหน้าที่ค้นหา Scenario ที่ตรงกันจากชุดข้อมูลจำลอง
3. **Core Output Logic:** 
   * คำนวณความเพียงพอของน้ำ (Water Ratio)
   * แปลงผลผลิตจากน้ำหนักแห้งของ DSSAT เป็น **น้ำหนักสด (ตัน/ไร่)**
   * สร้างตารางการจัดสรรน้ำตามช่วงอายุพืช
4. **Error/Boundary Handling:** แสดงข้อความชัดเจนเมื่อเลือกเงื่อนไขที่ไม่มีข้อมูล (`"นอกเหนือ ตอบไม่ได้"`) ตามคำสั่งของอาจารย์

---

## 4. ขอบเขตความรับผิดชอบ — โมดูล Output (Current Scope — Output)

### 4.1 ข้อมูลนำเข้าที่ต้องรับ (Input Contract):
* ชนิดพันธุ์มันสำปะหลัง: `เกษตรศาสตร์ 50`, `ระยอง 9`, `CMR38-125-77`
* วันปลูก / ฤดูปลูก: `ต้นฤดูฝน (พ.ค. - มิ.ย.)`, `ปลายฤดูฝน (ต.ค. - พ.ย.)`
* สภาพการให้น้ำ: `มีน้ำชลประทาน/น้ำหยด` หรือ `อาศัยน้ำฝนธรรมชาติ`
* ขนาดแปลงปลูก (ไร่) และปริมาณน้ำต้นทุนที่มี (ลบ.ม.)

### 4.2 กระบวนการประมวลผล (Processing Logic):
* ตรวจสอบว่าเงื่อนไขอยู่ในชุด Scenarios ที่รองรับหรือไม่
* คำนวณสัดส่วนน้ำ: $\text{waterPerRai} = \frac{\text{waterAvailable}}{\text{areaRai}}$
* จับคู่กับระดับสถานการณ์: **น้ำเพียงพอ**, **น้ำจำกัด**, หรือ **พึ่งพาน้ำฝน (ขาดแคลน)**
* แปลงผลผลิต Biomass/Dry Weight เป็น **Fresh Root Yield (ตัน/ไร่)** พร้อมประมาณการเปอร์เซ็นต์แป้ง
* ดึงตารางการจัดการน้ำรายช่วงอายุพืช (งอก $\rightarrow$ โต $\rightarrow$ ลงหัวสะสมแป้ง $\rightarrow$ ก่อนเก็บเกี่ยว)

### 4.3 ข้อมูลส่งออกและการแสดงผล (Output Display):
* **Summary Card:** ตัวเลขผลผลิตสดคาดการณ์ (ตัน/ไร่), เปอร์เซ็นต์แป้ง, และน้ำที่ต้องใช้
* **Schedule Table:** ตารางระบุช่วงอายุพืช ความถี่การให้น้ำ และปริมาณน้ำต่อไร่
* **Scenario Comparison:** บล็อกเปรียบเทียบผลผลิตระหว่าง "ทางเลือกของคุณ" vs "ทางเลือกพึ่งน้ำฝน" vs "ทางเลือกจัดการน้ำเต็มที่"

---

## 5. แผนการพัฒนารายระยะ (Development Phases)

---

### Phase 1 — Project Setup & Workspace Initialization (output-dev)
**เป้าหมาย:** สร้างโครงสร้างโปรเจกต์มาตรฐานบน Branch `output-dev` แยก Frontend (React + Tailwind CSS) และ Backend (Node.js + Express.js) ให้พร้อมรันได้ด้วยคำสั่งเดียว

* [x] ตรวจสอบความสะอาดของ Branch `output-dev` โดยไม่ยุ่งเกี่ยวกับไฟล์ของ Branch อื่น
* [x] สร้างโฟลเดอร์โครงสร้าง `backend/` สำหรับ Node.js + Express.js
  * [x] กำหนด `package.json`, ติดตั้ง `express`, `cors`, `dotenv`
  * [x] กำหนด Script รัน `npm run dev` (ใช้ Node native `--watch` สำหรับ Development mode)
* [x] สร้างโฟลเดอร์โครงสร้าง `frontend/` สำหรับ React
  * [x] สร้าง React App ด้วย Vite
  * [x] ติดตั้งและกำหนดค่า Tailwind CSS (Tailwind v4 with `@tailwindcss/vite`)
* [x] เขียน Script รันพร้อมกันทั้งคู่ (`scripts/dev.js` ผ่าน `npm run dev`)
* [x] ทดสอบรันเซิร์ฟเวอร์ Express (`GET /api/health`) และหน้าเว็บ React เชื่อมต่อสำเร็จจริง

* **Input:** คำสั่งสร้างโปรเจกต์และ Dependency packages
* **Processing:** Configuration & Dependency installation
* **Output:** Skeleton โครงสร้างโปรเจกต์ที่รัน Localhost ได้ทั้ง Frontend (Port 3000/5173) และ Backend (Port 4000/5000)
* **Definition of Done (DoD):** รันคำสั่งแล้วเปิดเบราว์เซอร์เห็นหน้า React และเรียก API Express คืนค่า `{ status: "ok" }` ได้
* **สิ่งที่นำไป Demo ได้:** Terminal 2 หน้าต่างที่รัน Service คู่กันอย่างเป็นระเบียบ

---

### Phase 2 — Data Contracts & Predefined Scenario Store
**เป้าหมาย:** ออกแบบ Data Structure (DTO) สำหรับ Input/Output และสร้างชุดข้อมูล Scenario เริ่มต้นตามที่อาจารย์ระบุในลายมือ

* [x] กำหนด TypeScript Interfaces / Data DTOs:
  * [x] `MatchInputDto`: โครงสร้างข้อมูลที่รับจากผู้ใช้ (พันธุ์, วันปลูก, ปริมาณน้ำ, ขนาดพื้นที่)
  * [x] `ScenarioData`: โครงสร้างชุดข้อมูล Scenario (ID, ชื่อ, พันธุ์, ฤดู, สถานะน้ำ, ผลผลิตแห้ง/สด, ตารางน้ำ)
  * [x] `MatchOutputResponseDto`: โครงสร้างข้อมูลผลลัพธ์ที่จะตอบกลับไปแสดงผล
* [x] สร้าง Predefined Scenario Dataset (`scenarios.json` หรือ `scenarios.data.ts`) ครอบคลุม:
  * [x] 3 สายพันธุ์หลัก: **เกษตรศาสตร์ 50**, **ระยอง 9**, และ **CMR38-125-77**
  * [x] 2 ช่วงเวลาปลูก: **ต้นฤดูฝน (พ.ค. - มิ.ย.)** และ **ปลายฤดูฝน (ต.ค. - พ.ย.)**
  * [x] 3 ระดับการจัดการน้ำ: **เพียงพอ**, **จำกัด**, และ **พึ่งพาน้ำฝน (ขาดแคลน)**
* [x] บันทึกข้อมูลตารางการให้น้ำ 3–4 ระยะ และข้อควรระวังเฉพาะพันธุ์ (เช่น ระยอง 9 งดน้ำก่อนขุดเพื่อเพิ่มแป้ง)

* **Input:** ข้อมูลสายพันธุ์และตัวเลขจำลองจากเอกสารโจทย์และลายมืออาจารย์
* **Processing:** การแปลงข้อมูลวิชาการเกษตรให้อยู่ในรูป JSON Schema ที่โปรแกรมอ่านได้
* **Output:** ไฟล์ Dataset จำลองสถานการณ์อย่างน้อย 9–18 สถานการณ์มาตรฐาน
* **Definition of Done (DoD):** Dataset มีข้อมูลครบถ้วน ถูกต้องตามข้อกำหนดของ 3 สายพันธุ์หลัก และมี Type Validation กำกับ
* **สิ่งที่นำไป Demo ได้:** โครงสร้างไฟล์ Data ที่พร้อมใช้งานใน Logic ของ Backend

---

### Phase 3 — Core Output Matching Engine (Express Backend)
**เป้าหมาย:** พัฒนาฟังก์ชันการจับคู่ Scenario และการแปลงหน่วยผลผลิตบน Express.js API

* [x] สร้าง Route และ Controller สำหรับโมดูล Output: `POST /api/output/match`
* [x] พัฒนา Service ตรวจสอบความถูกต้องของ Input (Validation):
  * [x] ตรวจสอบว่าพื้นที่และปริมาณน้ำ $> 0$
  * [x] ตรวจสอบว่าสายพันธุ์และวันปลูกเป็นค่าที่ระบบรองรับ
* [x] พัฒนา Matching Algorithm:
  * [x] คำนวณความต้องการน้ำต่อไร่ และสัดส่วน $\text{Water Ratio}$
  * [x] กรองและค้นหา Scenario ที่สอดคล้องที่สุด
  * [x] **จัดการเงื่อนไข Out-of-bounds:** หากไม่มีข้อมูลตรง ให้ส่ง Status `NOT_FOUND` พร้อมข้อความแจ้งเตือนชัดเจน (ตามคำสั่งอาจารย์: "นอกเหนือ ตอบไม่ได้")
* [x] พัฒนา Logic การแปลงผลผลิต:
  * [x] คำนวณน้ำหนักสด (ตัน/ไร่) จากสูตรสัดส่วนความชื้นมันสำปะหลัง
  * [x] คำนวณปริมาณน้ำจัดสรรรวมของแปลง ($\text{น้ำต่อไร่} \times \text{ขนาดพื้นที่}$)
* [x] พัฒนา Logic สร้างชุดข้อมูลเปรียบเทียบ (Scenario Comparison Candidates)

* **Input:** JSON Request Body ที่ส่งค่า `{ crop, plantingSeason, waterAvailable, areaRai }`
* **Processing:** Validation $\rightarrow$ Ratio Calculation $\rightarrow$ Lookup & Matching $\rightarrow$ Fresh Yield Conversion
* **Output:** JSON Response ครบถ้วนตาม `MatchOutputResponseDto`
* **Definition of Done (DoD):** ทดสอบยิง Request ด้วย Postman/Thunder Client แล้วได้รับผลลัพธ์ที่ถูกต้อง ทั้งกรณีจับคู่สำเร็จและกรณีไม่มีข้อมูล
* **สิ่งที่นำไป Demo ได้:** ผลการทดสอบยิง API ผ่าน Postman แสดงโครงสร้าง JSON ที่สมบูรณ์

---

### Phase 4 — Frontend Output Display Components (React + Tailwind CSS)
**เป้าหมาย:** สร้าง UI Components ฝั่ง React สำหรับแสดงผลลัพธ์คำแนะนำการให้น้ำและผลผลิตสด เน้นอ่านง่ายแบบ Mobile-First

* [x] พัฒนาฟอร์มจำลองการเลือก Input (Input Selector Bar):
  * [x] Dropdown เลือกสายพันธุ์ (เกษตรศาสตร์ 50, ระยอง 9, CMR38-125-77)
  * [x] Dropdown เลือกช่วงวันปลูก (ต้นฤดูฝน, ปลายฤดูฝน)
  * [x] ช่องระบุขนาดพื้นที่ (ไร่) และปริมาณน้ำต้นทุน (ลบ.ม.)
  * [x] ปุ่ม Action "คำนวณและแสดงคำแนะนำ"
* [x] พัฒนา Component แสดงผลลัพธ์หลัก:
  * [x] `YieldSummaryCard`: แสดงผลผลิตสดตัวเลขใหญ่ (เช่น `4.8 ตัน/ไร่`), แป้ง `%`, และระดับความเสี่ยง
  * [x] `WaterScheduleTable`: ตารางแสดงระยะเวลาการให้น้ำ ความถี่ และปริมาณน้ำต่อไร่
  * [x] `ScenarioComparison`: การ์ดเปรียบเทียบผลผลิตและปริมาณน้ำกับแนวทางทางเลือกอื่น
* [x] ตกแต่ง UI ด้วย Tailwind CSS ให้ตัวหนังสืออ่านง่าย สีสันสื่อความหมาย (ฟ้า=น้ำ, เขียว=ผลผลิต, ส้ม/แดง=ความเสี่ยง)

* **Input:** Props ข้อมูลผลลัพธ์จำลอง (Mock Output Data)
* **Processing:** React Component Rendering & Tailwind CSS Styling
* **Output:** หน้าจอเว็บแบบ Responsive ที่แสดงผลได้สวยงามทั้งบนมือถือและคอมพิวเตอร์
* **Definition of Done (DoD):** Component แสดงผลข้อมูลได้ถูกต้องตาม Props จัดวางสวยงาม รองรับมุมมองหน้าจอมือถือ
* **สิ่งที่นำไป Demo ได้:** หน้าเว็บ React ที่เปิดบน Browser พร้อม Component แสดงผลลัพธ์ที่จัดวางอย่างมืออาชีพ

---

### Phase 5 — End-to-End Integration (Connect Frontend & Backend)
**เป้าหมาย:** เชื่อมต่อ React Frontend เข้ากับ Express Backend ผ่าน HTTP Fetch ให้เกิดการทำงานจริงแบบครบวงจร

* [x] เขียนฟังก์ชัน API Client (`api.js` หรือ `api.ts`) ใน React ด้วย `fetch` หรือ `axios`
* [x] เชื่อม Event การกดปุ่มจากฟอร์มให้ส่ง Request ไปยัง `POST /api/output/match`
* [x] จัดการ State ใน React:
  * [x] `isLoading`: แสดงตัวหมุน/ข้อความกำลังประมวลผล
  * [x] `result`: จัดเก็บและส่งค่าผลลัพธ์ไปเรนเดอร์ใน Output Components
  * [x] `error`: แสดงข้อความแจ้งเตือนเมื่อเกิด Error หรือกรณีไม่มีข้อมูลตรง
* [x] ทดสอบ End-to-End Flow ทั้งหมดบน Localhost

* **Input:** การกดปุ่มส่งข้อมูลจากฟอร์มบนหน้าเว็บ
* **Processing:** HTTP Request $\rightarrow$ Backend Logic $\rightarrow$ HTTP Response $\rightarrow$ State Update
* **Output:** หน้าเว็บอัปเดตผลลัพธ์คำแนะนำและตารางน้ำทันทีตามค่าที่ผู้ใช้กรอก
* **Definition of Done (DoD):** กรอกข้อมูลบนหน้าเว็บ กดปุ่ม แล้วหน้าจอเปลี่ยนไปแสดงผลลัพธ์จริงที่คำนวณจาก Backend โดยไม่มี Error ใน Console
* **สิ่งที่นำไป Demo ได้:** **Live Working Demo** กดทดสอบสดบนหน้าเว็บให้กรรมการ/อาจารย์ดูได้ทันที

---

### Phase 6 — Progress Demo Rehearsal & Documentation
**เป้าหมาย:** ซักซ้อมสคริปต์การนำเสนอความคืบหน้า และเตรียมความพร้อมสำหรับการตอบคำถามของอาจารย์

* [x] เตรียม Scenario ตัวอย่างสำหรับนำเสนอ 3 กรณี:
  1. [x] *กรณีที่ 1 (ตัวแทนเกษตรกรทั่วไป):* มันสำปะหลังเกษตรศาสตร์ 50, ปลูกต้นฤดูฝน, น้ำจำกัด $\rightarrow$ แสดงผลผลิต 4.8 ตัน/ไร่ และตารางน้ำ
  2. [x] *กรณีที่ 2 (การเปรียบเทียบทางเลือก):* สลับเป็นพึ่งน้ำฝนธรรมชาติ $\rightarrow$ ผลผลิตลดเหลือ 3.2 ตัน/ไร่ เพื่อชี้ให้เห็นคุณค่าของการจัดการน้ำ
  3. [x] *กรณีที่ 3 (การทดสอบ Boundary):* ป้อนเงื่อนไขที่ไม่มีข้อมูล $\rightarrow$ ระบบแจ้งเตือนถูกต้องตามที่อาจารย์สั่ง ไม่เดาคำตอบ
* [x] เขียนบันทึกสรุปวิธีรันโปรเจกต์ (`RUN.md` หรือระบุในเอกสาร)
* [ ] บันทึกคลิปวิดีโอสั้นหรือภาพถ่ายหน้าจอสำรอง (Backup Screenshot/Video) กรณีเกิดปัญหาทางเทคนิคระหว่างนำเสนอ

* **Input:** ระบบที่รันได้สมบูรณ์จาก Phase 5
* **Processing:** การซักซ้อมและจัดลำดับเรื่องราวการนำเสนอ
* **Output:** ความพร้อมในการนำเสนอ Progress อย่างมั่นใจ
* **Definition of Done (DoD):** สามารถสาธิต Flow ทั้งหมดได้ราบรื่นภายในเวลา 3–5 นาที
* **สิ่งที่นำไป Demo ได้:** การนำเสนอ Progress ที่น่าประทับใจ มีของจริงให้ดู และตอบโจทย์ของอาจารย์ตรงจุด

---

### Phase 7 — Post-Progress: Integration & Future Expansion
**เป้าหมาย:** วางแนวทางการรวมโค้ดกับเพื่อนร่วมทีม (Merge to Main Project) และขยายฟีเจอร์ขั้นสูง

* [ ] ส่งมอบ Output DTO Specification ให้เพื่อนที่รับผิดชอบส่วน `Profit` เพื่อนำไปคำนวณต้นทุน/กำไร
* [ ] รับ Interface จากเพื่อนที่รับผิดชอบส่วน `Input` (ระบบพิกัดแปลง/สภาพอากาศ) มาเชื่อมต่อแทนฟอร์มจำลอง
* [ ] ประสานงานการรวม Git Branch (`output-dev` รวมกับงานของกลุ่มอื่น)
* [ ] วางแผนเชื่อมต่อ GISTDA API ร่วมกับทีม Input เมื่อได้รับ Credential จากอาจารย์

---

## 6. เป้าหมายการนำเสนอ Progress ที่ชัดเจน (Progress Presentation Target)

| องค์ประกอบที่ต้องแสดง (Artifact) | สิ่งที่จะแสดงในการนำเสนอ (What to Demo) | ความพร้อม |
|---|---|:---:|
| **1. React Web App** | เว็บแอปพลิเคชัน React + Tailwind CSS รันบน Browser หน้าตาแบบ Mobile-First | Target ต้องเสร็จ |
| **2. Express API Server** | เซิร์ฟเวอร์ Node.js + Express รันคู่กัน รับคำสั่งผ่าน Port 4000/5000 | Target ต้องเสร็จ |
| **3. Live Form Submission** | ผู้ใช้เลือกพันธุ์มันสำปะหลัง (KU50, ระยอง 9, CMR38), วันปลูก, ปริมาณน้ำ แล้วกด "วิเคราะห์" | Target ต้องเสร็จ |
| **4. Real Output Calculation** | Backend จับคู่ Scenario คำนวณแปลงน้ำหนักแห้งเป็น **น้ำหนักสด (ตัน/ไร่)** และคำนวณปริมาณน้ำ | Target ต้องเสร็จ |
| **5. Water Schedule Table** | แสดงตารางการให้น้ำรายช่วงอายุพืช (1–30 วัน, 31–90 วัน, 91 วันขึ้นไป) พร้อมความถี่ | Target ต้องเสร็จ |
| **6. Scenario Comparison** | แสดงการเปรียบเทียบผลผลิตระหว่างแนวทางของผู้ใช้กับทางเลือกอื่น (เช่น พึ่งน้ำฝน) | Target ต้องเสร็จ |
| **7. Boundary Constraint Handling** | สาธิตกรณีเลือกค่านอกขอบเขต แล้วระบบแสดงว่า "ไม่มีข้อมูลสถานการณ์ตรงกัน" ตามคำสั่งอาจารย์ | Target ต้องเสร็จ |

---

## 7. แผนงานระยะถัดไป (Future Work / Post-Merge)

1. **เชื่อมต่อโมดูล Profit:** นำค่าผลผลิตสด (ตัน/ไร่) และน้ำที่ใช้ ส่งต่อให้เพื่อนกลุ่ม Profit นำไปคูณราคาตลาดและหักลบต้นทุนท่อนพันธุ์/ปุ๋ย/สูบน้ำ
2. **เชื่อมต่อโมดูล Input แบบสมบูรณ์:** เปลี่ยนจาก Form ชั่วคราวไปรับค่าพิกัดแปลงจาก Leaflet Map และข้อมูลสภาพอากาศจริง
3. **การนำ GISTDA API มาใช้จริง:** ปรับปรุงตารางการให้น้ำแบบ Real-time ตามปริมาณฝนสะสมและฝนพยากรณ์จากดาวเทียม GISTDA
4. **การเชื่อมโยงกับ Admin Panel:** ย้ายจาก Predefined JSON File ไปอ่าน/เขียนข้อมูลผ่านฐานข้อมูลที่ Admin ควบคุมได้

---

## 8. ประเด็นที่รอความชัดเจนจากอาจารย์ (Open Questions / Need Clarification)

* `[TODO / NEED CLARIFICATION 1]`: **สูตรแปลงน้ำหนักแห้งเป็นน้ำหนักสด (Dry-to-Fresh Weight Formula):** ปัจจุบันใช้สัดส่วนความชื้นมาตรฐาน $62\%\text{--}65\%$ ต้องยืนยันกับอาจารย์ว่ามีสูตรจำเพาะของแต่ละสายพันธุ์ (KU50, ระยอง 9, CMR38) หรือไม่
* `[TODO / NEED CLARIFICATION 2]`: **สิทธิ์การเข้าถึง GISTDA API:** ขอรับ Endpoint และ API Key/Token ที่ถูกต้องสำหรับการดึงข้อมูลสภาพอากาศและแผนที่
* `[TODO / NEED CLARIFICATION 3]`: **ตารางราคาและต้นทุนสำหรับโมดูล Profit:** เพื่อเตรียม Data Contract ส่งให้เพื่อนกลุ่ม Profit ได้ถูกต้อง (เช่น ราคาหัวมันบาท/กก. ตาม % แป้ง, ต้นทุนค่าน้ำต่อ ลบ.ม.)

/**
 * WarMa Output Module — Predefined Scenario Store (In-Memory)
 * 
 * คลังข้อมูลสถานการณ์จำลองล่วงหน้า (DSSAT Predefined Scenarios)
 * 
 * ⚠️ หมายเหตุสำคัญด้านความถูกต้องของข้อมูล (Data Integrity Notice):
 * ตัวเลขผลผลิตและความต้องการน้ำในชุดข้อมูลนี้เป็น "Mock Values" ที่สังเคราะห์ขึ้น
 * จากตัวเลขตัวอย่างในเอกสารสไลด์นำเสนอ (UI Mockup) และเอกสารโจทย์
 * เพื่อใช้สำหรับการพัฒนาสถาปัตยกรรมระบบใน Phase 2 โดยยังไม่ใช่ค่า Calibrated ทางวิทยาศาสตร์
 * ต้องรอชุดข้อมูลจริงจากแบบจำลอง DSSAT ของคณะเกษตรศาสตร์ มหาวิทยาลัยขอนแก่น
 */

import {
  Scenario,
  SupportedCrop,
  SupportedSeason,
  WaterCondition,
  SUPPORTED_CROPS,
  SUPPORTED_SEASONS,
  WATER_CONDITIONS,
} from '../types/scenario.types.js';

/**
 * ฐานข้อมูลจำลอง Scenario เบื้องต้น 18 รายการ
 * (3 สายพันธุ์ × 2 ฤดูปลูก × 3 สถานะน้ำ)
 */
export const PREDEFINED_SCENARIOS: Scenario[] = [
  // ==========================================
  // 1. พันธุ์เกษตรศาสตร์ 50 (KU50) — ต้นฤดูฝน
  // ==========================================
  {
    id: 'SCN-KU50-EARLY-SUFFICIENT',
    name: 'มันสำปะหลังเกษตรศาสตร์ 50 ต้นฤดูฝน (น้ำเพียงพอ)',
    crop: 'เกษตรศาสตร์ 50',
    plantingSeason: 'ต้นฤดูฝน',
    waterCondition: 'น้ำเพียงพอ',
    waterPerRaiM3: 650,
    waterRequirementM3: 650,
    minRatio: 1.0,
    maxRatio: 99.0,
    dryYieldKgPerRai: 1950, // Mock: สมมติฐานแห้ง ~36% ของสด
    freshYield: {
      minKgPerRai: 5000,
      maxKgPerRai: 5800,
      avgTonsPerRai: 5.4,
      estimatedStarchPercent: 26.0,
    },
    risk: 'ต่ำ',
    advice: [
      'ให้น้ำหยดตามรอบสม่ำเสมอโดยเฉพาะช่วงตั้งตัว 2 เดือนแรก',
      'ลดการให้น้ำเมื่อมีฝนตกชุกเพื่อป้องกันน้ำขังในแปลง',
      'งดการให้น้ำ 1–2 เดือนก่อนเก็บเกี่ยวเพื่อเพิ่มเปอร์เซ็นต์แป้ง',
    ],
    schedule: [
      { phase: 'ระยะงอกและตั้งตัว (1–30 วัน)', management: 'ให้น้ำชุ่มชื้นกระตุ้นรากสม่ำเสมอ', freq: 'ทุก 5–7 วัน', amountPerRaiM3: 80 },
      { phase: 'ระยะสร้างลำต้นและใบ (31–90 วัน)', management: 'ให้น้ำเต็มที่เสริมน้ำฝน', freq: 'ทุก 7–10 วัน', amountPerRaiM3: 250 },
      { phase: 'ระยะสะสมแป้งขยายหัว (91–240 วัน)', management: 'ให้น้ำหยดคุมความชื้นปานกลาง', freq: 'ทุก 10–14 วัน', amountPerRaiM3: 320 },
      { phase: 'ก่อนเก็บเกี่ยว (241 วันขึ้นไป)', management: 'งดให้น้ำเด็ดขาดก่อนขุด', freq: 'งดให้น้ำ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'TODO: รอผลจำลอง DSSAT จริงกรณีน้ำเพียงพอจากคณะเกษตร',
  },
  {
    id: 'SCN-KU50-EARLY-LIMITED',
    name: 'มันสำปะหลังเกษตรศาสตร์ 50 ต้นฤดูฝน (น้ำจำกัด / จัดการน้ำเสริม)',
    crop: 'เกษตรศาสตร์ 50',
    plantingSeason: 'ต้นฤดูฝน',
    waterCondition: 'น้ำจำกัด',
    waterPerRaiM3: 420, // อ้างอิงตัวเลข Mockup ในสไลด์นำเสนอ (420 มม.)
    waterRequirementM3: 650,
    minRatio: 0.6,
    maxRatio: 1.0,
    dryYieldKgPerRai: 1720,
    freshYield: {
      minKgPerRai: 4500,
      maxKgPerRai: 5200,
      avgTonsPerRai: 4.8, // อ้างอิงตัวเลข Mockup ในสไลด์นำเสนอ (4.8 ตัน/ไร่)
      estimatedStarchPercent: 24.5, // อ้างอิง Mockup ในสไลด์ (24.5%)
    },
    risk: 'ปานกลาง',
    advice: [
      'เน้นการให้น้ำช่วงตั้งตัว 30 วันแรกเพื่อให้อัตรารอดตายสูง',
      'ระยะ 31–90 วัน ให้น้ำเสริมเฉพาะช่วงฝนทิ้งช่วง',
      'คลุมดินด้วยเศษซากพืชเพื่อรักษาความชื้นในดิน',
    ],
    schedule: [
      { phase: 'ระยะงอกและตั้งตัว (1–30 วัน)', management: 'ให้น้ำชุ่มชื้นกระตุ้นราก', freq: 'ทุก 7–10 วัน', amountPerRaiM3: 56 },
      { phase: 'ระยะสร้างลำต้นและใบ (31–90 วัน)', management: 'ให้น้ำตามรอบเสริมน้ำฝน', freq: 'ทุก 10–14 วัน', amountPerRaiM3: 64 },
      { phase: 'ระยะสะสมแป้งขยายหัว (91 วันขึ้นไป)', management: 'อาศัยน้ำฝนธรรมชาติ ให้น้ำเฉพาะแล้งจัด', freq: 'ตามสภาพฝน', amountPerRaiM3: 300 },
      { phase: 'ก่อนเก็บเกี่ยว', management: 'งดให้น้ำก่อนขุด 1 เดือน', freq: 'งดให้น้ำ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'ค่าตัวเลขอ้างอิงตรงจาก Mockup Slide 10-11 ของกลุ่ม WAD26-01',
  },
  {
    id: 'SCN-KU50-EARLY-RAINFED',
    name: 'มันสำปะหลังเกษตรศาสตร์ 50 ต้นฤดูฝน (พึ่งพาน้ำฝนธรรมชาติ)',
    crop: 'เกษตรศาสตร์ 50',
    plantingSeason: 'ต้นฤดูฝน',
    waterCondition: 'พึ่งพาน้ำฝน',
    waterPerRaiM3: 280, // อ้างอิงตัวเลข Mockup ในสไลด์ (280 มม.)
    waterRequirementM3: 650,
    minRatio: 0.0,
    maxRatio: 0.6,
    dryYieldKgPerRai: 1150,
    freshYield: {
      minKgPerRai: 2800,
      maxKgPerRai: 3500,
      avgTonsPerRai: 3.2, // อ้างอิงตัวเลข Mockup ในสไลด์ (3.2 ตัน/ไร่)
      estimatedStarchPercent: 23.0,
    },
    risk: 'สูง',
    advice: [
      'อาศัยน้ำฝนธรรมชาติเป็นหลัก เสี่ยงต่อฝนทิ้งช่วงในเดือนมิถุนายน–กรกฎาคม',
      'ควรปักท่อนพันธุ์ให้ลึกขึ้นเล็กน้อย และคลุมดินเพื่อลดการระเหย',
      'หากมีแหล่งน้ำสำรองเล็กน้อย ควรสงวนไว้หยอดเฉพาะช่วงแล้งจัด',
    ],
    schedule: [
      { phase: 'ระยะงอกและตั้งตัว (1–30 วัน)', management: 'อาศัยความชื้นจากฝนแรก', freq: 'ตามฝนธรรมชาติ', amountPerRaiM3: 0 },
      { phase: 'ระยะสร้างลำต้นและใบ (31–90 วัน)', management: 'อาศัยน้ำฝนธรรมชาติ', freq: 'ตามฝนธรรมชาติ', amountPerRaiM3: 0 },
      { phase: 'ระยะสะสมแป้ง (91 วันขึ้นไป)', management: 'อาศัยน้ำฝนธรรมชาติ', freq: 'ตามฝนธรรมชาติ', amountPerRaiM3: 0 },
      { phase: 'ก่อนเก็บเกี่ยว', management: 'งดให้น้ำตามธรรมชาติ', freq: 'งดให้น้ำ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'ค่าตัวเลขอ้างอิงตรงจาก Mockup Scenario เปรียบเทียบพึ่งน้ำฝน',
  },

  // ==========================================
  // 2. พันธุ์เกษตรศาสตร์ 50 (KU50) — ปลายฤดูฝน
  // ==========================================
  {
    id: 'SCN-KU50-LATE-SUFFICIENT',
    name: 'มันสำปะหลังเกษตรศาสตร์ 50 ปลายฤดูฝน (น้ำเพียงพอ)',
    crop: 'เกษตรศาสตร์ 50',
    plantingSeason: 'ปลายฤดูฝน',
    waterCondition: 'น้ำเพียงพอ',
    waterPerRaiM3: 600,
    waterRequirementM3: 600,
    minRatio: 1.0,
    maxRatio: 99.0,
    dryYieldKgPerRai: 1800,
    freshYield: {
      minKgPerRai: 4800,
      maxKgPerRai: 5500,
      avgTonsPerRai: 5.1,
      estimatedStarchPercent: 27.0, // ปลายฝนข้ามแล้งสะสมแป้งสูง
    },
    risk: 'ต่ำ',
    advice: [
      'ปลูกเดือน ต.ค.–พ.ย. ใช้ความชื้นปลายฝนช่วยให้ท่อนพันธุ์แตกราก',
      'เมื่อเข้าสู่หน้าแล้ง (ธ.ค.–เม.ย.) จำเป็นต้องให้น้ำหยดสม่ำเสมอ',
      'เมื่อเข้าฤดูฝนถัดไป ค่อยๆ ปรับลดการให้น้ำลงตามฝน',
    ],
    schedule: [
      { phase: 'ระยะงอกและตั้งตัว (1–60 วัน)', management: 'ใช้ความชื้นปลายฝน + ให้น้ำหยดเสริม', freq: 'ทุก 10 วัน', amountPerRaiM3: 120 },
      { phase: 'ระยะข้ามแล้ง (เดือนที่ 3–6)', management: 'ให้น้ำหยดรักษาความมีชีวิตของต้น', freq: 'ทุก 7–10 วัน', amountPerRaiM3: 300 },
      { phase: 'ระยะสะสมแป้งเข้าฝนใหม่ (เดือนที่ 7–10)', management: 'ให้น้ำตามรอบเสริมน้ำฝน', freq: 'ทุก 14 วัน', amountPerRaiM3: 180 },
      { phase: 'ก่อนเก็บเกี่ยว', management: 'งดให้น้ำ 1 เดือนก่อนขุด', freq: 'งดให้น้ำ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'TODO: รอข้อมูลจำลองรอบปลายฤดูฝนจาก DSSAT',
  },
  {
    id: 'SCN-KU50-LATE-LIMITED',
    name: 'มันสำปะหลังเกษตรศาสตร์ 50 ปลายฤดูฝน (น้ำจำกัด)',
    crop: 'เกษตรศาสตร์ 50',
    plantingSeason: 'ปลายฤดูฝน',
    waterCondition: 'น้ำจำกัด',
    waterPerRaiM3: 380,
    waterRequirementM3: 600,
    minRatio: 0.6,
    maxRatio: 1.0,
    dryYieldKgPerRai: 1500,
    freshYield: {
      minKgPerRai: 3800,
      maxKgPerRai: 4500,
      avgTonsPerRai: 4.1,
      estimatedStarchPercent: 25.5,
    },
    risk: 'ปานกลาง',
    advice: [
      'จำกัดการให้น้ำเฉพาะจุดสำคัญเพื่อประคองต้นให้ผ่านแล้ง',
      'คลุมโคนต้นด้วยเศษใบไม้หรือฟางเพื่อลดการคายน้ำ',
    ],
    schedule: [
      { phase: 'ระยะงอก (1–60 วัน)', management: 'ให้น้ำพยุงต้นช่วงปลายฝน', freq: 'ทุก 12–14 วัน', amountPerRaiM3: 90 },
      { phase: 'ระยะข้ามแล้ง (เดือนที่ 3–6)', management: 'ให้น้ำเฉพาะเมื่อใบเริ่มม้วนเหี่ยว', freq: 'ทุก 14–20 วัน', amountPerRaiM3: 200 },
      { phase: 'ระยะเข้าฝนใหม่ (เดือนที่ 7–10)', management: 'อาศัยน้ำฝนธรรมชาติเป็นหลัก', freq: 'ตามฝนธรรมชาติ', amountPerRaiM3: 90 },
      { phase: 'ก่อนเก็บเกี่ยว', management: 'งดให้น้ำ', freq: 'งดให้น้ำ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'TODO: ค่าประมาณการเบื้องต้น',
  },
  {
    id: 'SCN-KU50-LATE-RAINFED',
    name: 'มันสำปะหลังเกษตรศาสตร์ 50 ปลายฤดูฝน (พึ่งพาน้ำฝน)',
    crop: 'เกษตรศาสตร์ 50',
    plantingSeason: 'ปลายฤดูฝน',
    waterCondition: 'พึ่งพาน้ำฝน',
    waterPerRaiM3: 220,
    waterRequirementM3: 600,
    minRatio: 0.0,
    maxRatio: 0.6,
    dryYieldKgPerRai: 950,
    freshYield: {
      minKgPerRai: 2200,
      maxKgPerRai: 2900,
      avgTonsPerRai: 2.6,
      estimatedStarchPercent: 24.0,
    },
    risk: 'สูง',
    advice: [
      'การปลูกปลายฝนโดยไม่มีแหล่งน้ำมีความเสี่ยงสูงมาก ต้นอาจชะงักการโตช่วงแล้ง',
      'หากเลือกได้ ควรเลื่อนไปปลูกช่วงต้นฤดูฝนปีถัดไป',
    ],
    schedule: [
      { phase: 'ตลอดฤดูปลูก', management: 'อาศัยความชื้นในดินและฝนธรรมชาติล้วน', freq: 'ตามธรรมชาติ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'TODO: ค่าประมาณการสำหรับกรณีแล้งจัด',
  },

  // ==========================================
  // 3. พันธุ์ระยอง 9 (Rayong 9) — ต้นฤดูฝน
  // ==========================================
  {
    id: 'SCN-R9-EARLY-SUFFICIENT',
    name: 'มันสำปะหลังระยอง 9 ต้นฤดูฝน (น้ำเพียงพอ)',
    crop: 'ระยอง 9',
    plantingSeason: 'ต้นฤดูฝน',
    waterCondition: 'น้ำเพียงพอ',
    waterPerRaiM3: 620,
    waterRequirementM3: 620,
    minRatio: 1.0,
    maxRatio: 99.0,
    dryYieldKgPerRai: 1900,
    freshYield: {
      minKgPerRai: 4800,
      maxKgPerRai: 5600,
      avgTonsPerRai: 5.2,
      estimatedStarchPercent: 28.5, // ระยอง 9 เด่นเรื่องแป้งสูงมาก
    },
    risk: 'ต่ำ',
    advice: [
      'ระยอง 9 โดดเด่นเรื่องเปอร์เซ็นต์แป้งสูง เหมาะสำหรับส่งโรงงานแป้งโดยเฉพาะ',
      'ระวังอย่าให้น้ำขังแฉะในแปลง เพราะระยอง 9 อ่อนแอกว่าต่อโรคหัวเน่า',
      'งดน้ำก่อนเก็บเกี่ยวอย่างน้อย 45–60 วัน เพื่อดึงแป้งให้ได้สูงสุด',
    ],
    schedule: [
      { phase: 'ระยะงอกและตั้งตัว (1–30 วัน)', management: 'ให้น้ำพอชื้น ระวังน้ำขัง', freq: 'ทุก 7 วัน', amountPerRaiM3: 70 },
      { phase: 'ระยะสร้างลำต้น (31–90 วัน)', management: 'ให้น้ำตามรอบปกติ', freq: 'ทุก 8–10 วัน', amountPerRaiM3: 240 },
      { phase: 'ระยะสะสมแป้ง (91–240 วัน)', management: 'ให้น้ำสม่ำเสมอเพื่อขยายขนาดหัว', freq: 'ทุก 12–14 วัน', amountPerRaiM3: 310 },
      { phase: 'ก่อนเก็บเกี่ยว', management: 'งดให้น้ำเด็ดขาดล่วงหน้า 2 เดือน', freq: 'งดให้น้ำ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'อ้างอิงคุณสมบัติพันธุ์ระยอง 9 แป้งสูง อ่อนแอน้ำขัง',
  },
  {
    id: 'SCN-R9-EARLY-LIMITED',
    name: 'มันสำปะหลังระยอง 9 ต้นฤดูฝน (น้ำจำกัด)',
    crop: 'ระยอง 9',
    plantingSeason: 'ต้นฤดูฝน',
    waterCondition: 'น้ำจำกัด',
    waterPerRaiM3: 410,
    waterRequirementM3: 620,
    minRatio: 0.6,
    maxRatio: 1.0,
    dryYieldKgPerRai: 1650,
    freshYield: {
      minKgPerRai: 4200,
      maxKgPerRai: 4900,
      avgTonsPerRai: 4.5,
      estimatedStarchPercent: 27.0,
    },
    risk: 'ปานกลาง',
    advice: [
      'ให้น้ำเสริมช่วงตั้งตัว แล้วปล่อยให้อาศัยน้ำฝนเป็นหลัก',
      'หากมีฝนทิ้งช่วงเกิน 2 สัปดาห์ ให้กระตุ้นด้วยน้ำหยด',
    ],
    schedule: [
      { phase: 'ระยะงอก (1–30 วัน)', management: 'ให้น้ำชุ่มชื้นพอเหมาะ', freq: 'ทุก 8 วัน', amountPerRaiM3: 60 },
      { phase: 'ระยะเจริญเติบโต (31–90 วัน)', management: 'ให้น้ำเสริมเมื่อแล้ง', freq: 'ทุก 12–14 วัน', amountPerRaiM3: 150 },
      { phase: 'ระยะสะสมแป้ง (91 วันขึ้นไป)', management: 'อาศัยฝนธรรมชาติเป็นหลัก', freq: 'ตามฝนธรรมชาติ', amountPerRaiM3: 200 },
      { phase: 'ก่อนเก็บเกี่ยว', management: 'งดให้น้ำ', freq: 'งดให้น้ำ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'TODO: รอการทดสอบจากแปลงจริง',
  },
  {
    id: 'SCN-R9-EARLY-RAINFED',
    name: 'มันสำปะหลังระยอง 9 ต้นฤดูฝน (พึ่งพาน้ำฝน)',
    crop: 'ระยอง 9',
    plantingSeason: 'ต้นฤดูฝน',
    waterCondition: 'พึ่งพาน้ำฝน',
    waterPerRaiM3: 270,
    waterRequirementM3: 620,
    minRatio: 0.0,
    maxRatio: 0.6,
    dryYieldKgPerRai: 1100,
    freshYield: {
      minKgPerRai: 2700,
      maxKgPerRai: 3400,
      avgTonsPerRai: 3.0,
      estimatedStarchPercent: 25.5,
    },
    risk: 'สูง',
    advice: [
      'ปลูกต้นฝนอาศัยน้ำฝนธรรมชาติ ระวังเรื่องวัชพืชแย่งความชื้นในดิน',
    ],
    schedule: [
      { phase: 'ตลอดฤดู', management: 'อาศัยน้ำฝนธรรมชาติ', freq: 'ตามฝนธรรมชาติ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'TODO: ข้อมูลจำลองสำหรับกรณีพึ่งน้ำฝนล้วน',
  },

  // ==========================================
  // 4. พันธุ์ระยอง 9 (Rayong 9) — ปลายฤดูฝน
  // ==========================================
  {
    id: 'SCN-R9-LATE-SUFFICIENT',
    name: 'มันสำปะหลังระยอง 9 ปลายฤดูฝน (น้ำเพียงพอ)',
    crop: 'ระยอง 9',
    plantingSeason: 'ปลายฤดูฝน',
    waterCondition: 'น้ำเพียงพอ',
    waterPerRaiM3: 580,
    waterRequirementM3: 580,
    minRatio: 1.0,
    maxRatio: 99.0,
    dryYieldKgPerRai: 1750,
    freshYield: {
      minKgPerRai: 4600,
      maxKgPerRai: 5300,
      avgTonsPerRai: 4.9,
      estimatedStarchPercent: 29.0, // แป้งโดดเด่นมาก
    },
    risk: 'ต่ำ',
    advice: [
      'ปลูกปลายฝนใช้น้ำหยดช่วงหน้าแล้ง หัวมันจะมีคุณภาพแป้งสูงมาก',
    ],
    schedule: [
      { phase: 'ระยะตั้งตัว (เดือน 1–2)', management: 'ให้น้ำหยดพยุงต้น', freq: 'ทุก 8–10 วัน', amountPerRaiM3: 110 },
      { phase: 'ระยะหน้าแล้ง (เดือน 3–6)', management: 'ให้น้ำสม่ำเสมอ', freq: 'ทุก 8–10 วัน', amountPerRaiM3: 290 },
      { phase: 'ระยะเข้าฝน (เดือน 7–10)', management: 'ให้น้ำเสริมฝน', freq: 'ทุก 14 วัน', amountPerRaiM3: 180 },
      { phase: 'ก่อนเก็บเกี่ยว', management: 'งดให้น้ำ', freq: 'งดให้น้ำ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'TODO: Mock data สำหรับระยอง 9 ปลายฝน',
  },
  {
    id: 'SCN-R9-LATE-LIMITED',
    name: 'มันสำปะหลังระยอง 9 ปลายฤดูฝน (น้ำจำกัด)',
    crop: 'ระยอง 9',
    plantingSeason: 'ปลายฤดูฝน',
    waterCondition: 'น้ำจำกัด',
    waterPerRaiM3: 360,
    waterRequirementM3: 580,
    minRatio: 0.6,
    maxRatio: 1.0,
    dryYieldKgPerRai: 1400,
    freshYield: {
      minKgPerRai: 3500,
      maxKgPerRai: 4200,
      avgTonsPerRai: 3.8,
      estimatedStarchPercent: 27.5,
    },
    risk: 'ปานกลาง',
    advice: [
      'ให้น้ำหยดเฉพาะช่วงวิกฤตหน้าแล้ง ไม่ปล่อยให้ใบเหี่ยวแห้งร่วงหมด',
    ],
    schedule: [
      { phase: 'ระยะงอก', management: 'ให้น้ำพอพยุงต้น', freq: 'ทุก 12 วัน', amountPerRaiM3: 90 },
      { phase: 'ระยะหน้าแล้ง', management: 'ให้น้ำประคองชีพ', freq: 'ทุก 16 วัน', amountPerRaiM3: 180 },
      { phase: 'ระยะเข้าฝน', management: 'อาศัยฝน', freq: 'ตามฝน', amountPerRaiM3: 90 },
      { phase: 'ก่อนเก็บเกี่ยว', management: 'งดน้ำ', freq: 'งดน้ำ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'TODO: Mock data',
  },
  {
    id: 'SCN-R9-LATE-RAINFED',
    name: 'มันสำปะหลังระยอง 9 ปลายฤดูฝน (พึ่งพาน้ำฝน)',
    crop: 'ระยอง 9',
    plantingSeason: 'ปลายฤดูฝน',
    waterCondition: 'พึ่งพาน้ำฝน',
    waterPerRaiM3: 200,
    waterRequirementM3: 580,
    minRatio: 0.0,
    maxRatio: 0.6,
    dryYieldKgPerRai: 880,
    freshYield: {
      minKgPerRai: 2000,
      maxKgPerRai: 2700,
      avgTonsPerRai: 2.4,
      estimatedStarchPercent: 25.0,
    },
    risk: 'สูง',
    advice: ['ความเสี่ยงสูงมาก แนะนำเลี่ยงไปปลูกต้นฤดูฝน'],
    schedule: [{ phase: 'ตลอดฤดู', management: 'ตามธรรมชาติ', freq: 'ตามฝน', amountPerRaiM3: 0 }],
    isMockData: true,
    note: 'TODO: Mock data',
  },

  // ==========================================
  // 5. พันธุ์ CMR38-125-77 — ต้นฤดูฝน
  // ==========================================
  {
    id: 'SCN-CMR38-EARLY-SUFFICIENT',
    name: 'มันสำปะหลัง CMR38-125-77 ต้นฤดูฝน (น้ำเพียงพอ)',
    crop: 'CMR38-125-77',
    plantingSeason: 'ต้นฤดูฝน',
    waterCondition: 'น้ำเพียงพอ',
    waterPerRaiM3: 630,
    waterRequirementM3: 630,
    minRatio: 1.0,
    maxRatio: 99.0,
    dryYieldKgPerRai: 1980,
    freshYield: {
      minKgPerRai: 5100,
      maxKgPerRai: 5900,
      avgTonsPerRai: 5.5,
      estimatedStarchPercent: 26.5,
    },
    risk: 'ต่ำ',
    advice: [
      'สายพันธุ์ทดสอบ CMR38-125-77 ทนแล้งและปรับตัวกับสภาพดินอีสานได้ดีมาก',
      'หากให้น้ำเต็มที่ อัตราการสะสมน้ำหนักหัวจะสูงเป็นพิเศษ',
    ],
    schedule: [
      { phase: 'ระยะงอกและตั้งตัว (1–30 วัน)', management: 'ให้น้ำชุ่มชื้น', freq: 'ทุก 6–8 วัน', amountPerRaiM3: 75 },
      { phase: 'ระยะสร้างลำต้น (31–90 วัน)', management: 'ให้น้ำสม่ำเสมอ', freq: 'ทุก 8–10 วัน', amountPerRaiM3: 245 },
      { phase: 'ระยะสะสมแป้ง (91–240 วัน)', management: 'คุมน้ำพอดี', freq: 'ทุก 12 วัน', amountPerRaiM3: 310 },
      { phase: 'ก่อนเก็บเกี่ยว', management: 'งดให้น้ำก่อนขุด 1 เดือน', freq: 'งดให้น้ำ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'สายพันธุ์ที่ 3 ตามที่อาจารย์ระบุเครื่องหมาย * ในเอกสารโจทย์',
  },
  {
    id: 'SCN-CMR38-EARLY-LIMITED',
    name: 'มันสำปะหลัง CMR38-125-77 ต้นฤดูฝน (น้ำจำกัด)',
    crop: 'CMR38-125-77',
    plantingSeason: 'ต้นฤดูฝน',
    waterCondition: 'น้ำจำกัด',
    waterPerRaiM3: 430,
    waterRequirementM3: 630,
    minRatio: 0.6,
    maxRatio: 1.0,
    dryYieldKgPerRai: 1750,
    freshYield: {
      minKgPerRai: 4600,
      maxKgPerRai: 5300,
      avgTonsPerRai: 4.9,
      estimatedStarchPercent: 25.0,
    },
    risk: 'ปานกลาง',
    advice: [
      'ตอบสนองต่อสภาพน้ำจำกัดได้ดี ให้ผลผลิตสูงกว่าพันธุ์ทั่วไปเมื่อขาดน้ำเล็กน้อย',
    ],
    schedule: [
      { phase: 'ระยะงอก', management: 'ให้น้ำกระตุ้นราก', freq: 'ทุก 8 วัน', amountPerRaiM3: 65 },
      { phase: 'ระยะเจริญเติบโต', management: 'ให้น้ำเสริมฝน', freq: 'ทุก 12 วัน', amountPerRaiM3: 165 },
      { phase: 'ระยะสะสมแป้ง', management: 'อาศัยฝนตกเป็นหลัก', freq: 'ตามฝน', amountPerRaiM3: 200 },
      { phase: 'ก่อนเก็บเกี่ยว', management: 'งดให้น้ำ', freq: 'งดให้น้ำ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'TODO: รอผลเปรียบเทียบความทนแล้งจาก DSSAT',
  },
  {
    id: 'SCN-CMR38-EARLY-RAINFED',
    name: 'มันสำปะหลัง CMR38-125-77 ต้นฤดูฝน (พึ่งพาน้ำฝน)',
    crop: 'CMR38-125-77',
    plantingSeason: 'ต้นฤดูฝน',
    waterCondition: 'พึ่งพาน้ำฝน',
    waterPerRaiM3: 290,
    waterRequirementM3: 630,
    minRatio: 0.0,
    maxRatio: 0.6,
    dryYieldKgPerRai: 1220,
    freshYield: {
      minKgPerRai: 3000,
      maxKgPerRai: 3700,
      avgTonsPerRai: 3.4,
      estimatedStarchPercent: 24.0,
    },
    risk: 'ปานกลาง',
    advice: [
      'สายพันธุ์นี้ทนทานต่อการพึ่งน้ำฝนได้ค่อนข้างดี ผลผลิตลดลงน้อยกว่าพันธุ์อื่น',
    ],
    schedule: [
      { phase: 'ตลอดฤดู', management: 'อาศัยน้ำฝนธรรมชาติ', freq: 'ตามฝนธรรมชาติ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'TODO: Mock data',
  },

  // ==========================================
  // 6. พันธุ์ CMR38-125-77 — ปลายฤดูฝน
  // ==========================================
  {
    id: 'SCN-CMR38-LATE-SUFFICIENT',
    name: 'มันสำปะหลัง CMR38-125-77 ปลายฤดูฝน (น้ำเพียงพอ)',
    crop: 'CMR38-125-77',
    plantingSeason: 'ปลายฤดูฝน',
    waterCondition: 'น้ำเพียงพอ',
    waterPerRaiM3: 590,
    waterRequirementM3: 590,
    minRatio: 1.0,
    maxRatio: 99.0,
    dryYieldKgPerRai: 1850,
    freshYield: {
      minKgPerRai: 4900,
      maxKgPerRai: 5600,
      avgTonsPerRai: 5.2,
      estimatedStarchPercent: 27.5,
    },
    risk: 'ต่ำ',
    advice: ['ปลายฝนให้น้ำหยดควบคุมสม่ำเสมอ ได้ผลผลิตคุณภาพสูง'],
    schedule: [
      { phase: 'ระยะตั้งตัว', management: 'ให้น้ำเสริมปลายฝน', freq: 'ทุก 8 วัน', amountPerRaiM3: 110 },
      { phase: 'ระยะหน้าแล้ง', management: 'ให้น้ำหยดสม่ำเสมอ', freq: 'ทุก 8 วัน', amountPerRaiM3: 300 },
      { phase: 'ระยะเข้าฝน', management: 'เสริมฝน', freq: 'ทุก 14 วัน', amountPerRaiM3: 180 },
      { phase: 'ก่อนเก็บเกี่ยว', management: 'งดน้ำ', freq: 'งดน้ำ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'TODO: Mock data',
  },
  {
    id: 'SCN-CMR38-LATE-LIMITED',
    name: 'มันสำปะหลัง CMR38-125-77 ปลายฤดูฝน (น้ำจำกัด)',
    crop: 'CMR38-125-77',
    plantingSeason: 'ปลายฤดูฝน',
    waterCondition: 'น้ำจำกัด',
    waterPerRaiM3: 370,
    waterRequirementM3: 590,
    minRatio: 0.6,
    maxRatio: 1.0,
    dryYieldKgPerRai: 1550,
    freshYield: {
      minKgPerRai: 3900,
      maxKgPerRai: 4600,
      avgTonsPerRai: 4.2,
      estimatedStarchPercent: 26.0,
    },
    risk: 'ปานกลาง',
    advice: ['คุมน้ำหยดเฉพาะช่วงแล้งจัดเพื่อความคุ้มค่า'],
    schedule: [
      { phase: 'ระยะงอก', management: 'พยุงต้น', freq: 'ทุก 12 วัน', amountPerRaiM3: 90 },
      { phase: 'ระยะหน้าแล้ง', management: 'ให้น้ำประคอง', freq: 'ทุก 15 วัน', amountPerRaiM3: 190 },
      { phase: 'ระยะเข้าฝน', management: 'อาศัยฝน', freq: 'ตามฝน', amountPerRaiM3: 90 },
      { phase: 'ก่อนเก็บเกี่ยว', management: 'งดน้ำ', freq: 'งดน้ำ', amountPerRaiM3: 0 },
    ],
    isMockData: true,
    note: 'TODO: Mock data',
  },
  {
    id: 'SCN-CMR38-LATE-RAINFED',
    name: 'มันสำปะหลัง CMR38-125-77 ปลายฤดูฝน (พึ่งพาน้ำฝน)',
    crop: 'CMR38-125-77',
    plantingSeason: 'ปลายฤดูฝน',
    waterCondition: 'พึ่งพาน้ำฝน',
    waterPerRaiM3: 210,
    waterRequirementM3: 590,
    minRatio: 0.0,
    maxRatio: 0.6,
    dryYieldKgPerRai: 980,
    freshYield: {
      minKgPerRai: 2400,
      maxKgPerRai: 3100,
      avgTonsPerRai: 2.7,
      estimatedStarchPercent: 24.5,
    },
    risk: 'สูง',
    advice: ['ความเสี่ยงสูง ควรเตรียมแหล่งน้ำหยดสำรอง'],
    schedule: [{ phase: 'ตลอดฤดู', management: 'ตามธรรมชาติ', freq: 'ตามฝน', amountPerRaiM3: 0 }],
    isMockData: true,
    note: 'TODO: Mock data',
  },
];

/**
 * Helper Functions สำหรับเข้าถึงและจัดการ Predefined Scenario Store
 */
export class ScenarioStore {
  /**
   * ดึงรายการ Scenarios ทั้งหมดในระบบ
   */
  static getAllScenarios(): Scenario[] {
    return [...PREDEFINED_SCENARIOS];
  }

  /**
   * ค้นหา Scenario ด้วย ID
   */
  static getScenarioById(id: string): Scenario | undefined {
    return PREDEFINED_SCENARIOS.find((s) => s.id === id);
  }

  /**
   * ค้นหา Scenarios ตามเงื่อนไข พันธุ์, ฤดูกาล, หรือสถานะน้ำ
   */
  static findScenarios(filter: {
    crop?: string;
    plantingSeason?: string;
    waterCondition?: string;
  }): Scenario[] {
    return PREDEFINED_SCENARIOS.filter((s) => {
      if (filter.crop && s.crop !== filter.crop) return false;
      if (filter.plantingSeason && s.plantingSeason !== filter.plantingSeason) return false;
      if (filter.waterCondition && s.waterCondition !== filter.waterCondition) return false;
      return true;
    });
  }

  /**
   * ดึงรายการตัวเลือกที่รองรับในระบบ (สำหรับนำไปสร้าง Dropdown หรือตรวจสอบ Input)
   */
  static getAvailableOptions(): {
    crops: readonly string[];
    seasons: readonly string[];
    waterConditions: readonly string[];
  } {
    return {
      crops: SUPPORTED_CROPS,
      seasons: SUPPORTED_SEASONS,
      waterConditions: WATER_CONDITIONS,
    };
  }

  /**
   * ตรวจสอบว่าสายพันธุ์อยู่ใน 3 สายพันธุ์ที่รองรับหรือไม่
   */
  static isCropSupported(crop: string): crop is SupportedCrop {
    return (SUPPORTED_CROPS as readonly string[]).includes(crop);
  }

  /**
   * ตรวจสอบว่าฤดูกาลอยู่ในที่รองรับหรือไม่
   */
  static isSeasonSupported(season: string): season is SupportedSeason {
    return (SUPPORTED_SEASONS as readonly string[]).includes(season);
  }
}

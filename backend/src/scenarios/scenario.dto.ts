import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export const LEVELS = ['เพียงพอ', 'จำกัด', 'ขาดแคลน'];
export const RISKS = ['ต่ำ', 'ปานกลาง', 'สูง'];

// หมายเหตุ: class-validator ตรวจ decorator จากล่างขึ้นบน และ ValidationPipe ตั้ง stopAtFirstError
// จึงวางตัวตรวจพื้นฐาน (กรอกหรือยัง / ชนิดข้อมูล) ไว้ล่างสุด ให้ผู้ใช้เห็นข้อความที่ตรงปัญหาก่อน

export class SchedulePhaseDto {
  @ApiProperty({ example: 'หัวขยาย (วันที่ 44–81)' })
  @MaxLength(200, { message: 'ยาวเกิน 200 ตัวอักษร' })
  @IsString({ message: 'ชื่อระยะต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อระยะ' })
  phase: string;

  @ApiProperty({ example: 'ทุก 3–5 วัน ห้ามขาดน้ำ' })
  @MaxLength(200, { message: 'ยาวเกิน 200 ตัวอักษร' })
  @IsString({ message: 'ความถี่ต้องเป็นข้อความ' })
  freq: string;

  @ApiProperty({ example: 360, description: 'ปริมาณน้ำ (ลบ.ม./ไร่)' })
  @Min(0, { message: 'ปริมาณน้ำในตารางต้องไม่ติดลบ' })
  @IsNumber({}, { message: 'ปริมาณน้ำในตารางต้องเป็นตัวเลข' })
  amount: number;
}

export class ScenarioDto {
  @ApiProperty({ example: 'มันฝรั่งแอตแลนติก ฤดูหนาว น้ำเพียงพอ' })
  @MaxLength(200, { message: 'ยาวเกิน 200 ตัวอักษร' })
  @IsString({ message: 'ต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อ scenario' })
  name: string;

  @ApiProperty({ example: 'แอตแลนติก', description: 'พันธุ์มันฝรั่ง' })
  @MaxLength(100, { message: 'ยาวเกิน 100 ตัวอักษร' })
  @IsString({ message: 'ต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกพันธุ์มันฝรั่ง' })
  crop: string;

  @ApiProperty({ example: 'ฤดูหนาว' })
  @MaxLength(100, { message: 'ยาวเกิน 100 ตัวอักษร' })
  @IsString({ message: 'ต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกฤดูกาล' })
  season: string;

  @ApiProperty({ enum: LEVELS, example: 'เพียงพอ' })
  @IsIn(LEVELS, { message: `สถานะน้ำต้องเป็น ${LEVELS.join(' / ')}` })
  level: string;

  @ApiProperty({ example: 800, description: 'น้ำที่จัดสรร (ลบ.ม./ไร่)' })
  @Min(0, { message: 'น้ำจัดสรรต่อไร่ต้องไม่ติดลบ' })
  @IsNumber({}, { message: 'น้ำจัดสรรต่อไร่ต้องเป็นตัวเลข' })
  waterPerRai: number;

  @ApiProperty({
    example: 1.0,
    description: 'ratio ต่ำสุด (น้ำที่มี ÷ น้ำที่ต้องการ)',
  })
  @Min(0, { message: 'ratio ต่ำสุดต้องไม่ติดลบ' })
  @IsNumber({}, { message: 'ratio ต่ำสุดต้องเป็นตัวเลข' })
  minRatio: number;

  @ApiProperty({ example: 99, description: 'ratio สูงสุด (99 = ไม่จำกัด)' })
  @Min(0, { message: 'ratio สูงสุดต้องไม่ติดลบ' })
  @IsNumber({}, { message: 'ratio สูงสุดต้องเป็นตัวเลข' })
  maxRatio: number;

  @ApiProperty({ example: '2,500–3,000 กก./ไร่' })
  @MaxLength(100, { message: 'ยาวเกิน 100 ตัวอักษร' })
  @IsString({ message: 'ต้องเป็นข้อความ' })
  expectedYield: string;

  @ApiProperty({ enum: RISKS, example: 'ต่ำ' })
  @IsIn(RISKS, { message: `ระดับความเสี่ยงต้องเป็น ${RISKS.join(' / ')}` })
  risk: string;

  @ApiProperty({ type: [String], example: ['ให้น้ำแบบน้ำหยด'] })
  @MaxLength(500, {
    each: true,
    message: 'คำแนะนำแต่ละข้อยาวไม่เกิน 500 ตัวอักษร',
  })
  @IsString({ each: true, message: 'คำแนะนำแต่ละข้อต้องเป็นข้อความ' })
  @ArrayMaxSize(30, { message: 'คำแนะนำได้ไม่เกิน 30 ข้อ' })
  @IsArray({ message: 'คำแนะนำต้องเป็นรายการ' })
  advice: string[];

  @ApiProperty({ type: [SchedulePhaseDto] })
  @ValidateNested({ each: true })
  @ArrayMaxSize(20, { message: 'ตารางให้น้ำได้ไม่เกิน 20 ระยะ' })
  @IsArray({ message: 'ตารางการให้น้ำต้องเป็นรายการ' })
  @Type(() => SchedulePhaseDto)
  schedule: SchedulePhaseDto[];
}

export class MatchRequestDto {
  @ApiProperty({ example: 'แอตแลนติก', description: 'พันธุ์มันฝรั่ง' })
  @MaxLength(100, { message: 'ยาวเกิน 100 ตัวอักษร' })
  @IsString({ message: 'ต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณาเลือกพันธุ์มันฝรั่ง' })
  crop: string;

  @ApiProperty({ example: 'ฤดูหนาว' })
  @MaxLength(100, { message: 'ยาวเกิน 100 ตัวอักษร' })
  @IsString({ message: 'ต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณาเลือกฤดูกาล' })
  season: string;

  @ApiProperty({ example: 6000, description: 'ปริมาณน้ำต้นทุน (ลบ.ม.)' })
  @IsPositive({ message: 'ปริมาณน้ำต้นทุนต้องมากกว่า 0' })
  @IsNumber({}, { message: 'ปริมาณน้ำต้นทุนต้องเป็นตัวเลข' })
  water: number;

  @ApiProperty({ example: 10, description: 'ขนาดพื้นที่ (ไร่)' })
  @IsPositive({ message: 'ขนาดพื้นที่ต้องมากกว่า 0' })
  @IsNumber({}, { message: 'ขนาดพื้นที่ต้องเป็นตัวเลข' })
  area: number;
}

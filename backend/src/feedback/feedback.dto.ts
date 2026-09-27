import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// หมายเหตุ: class-validator ตรวจ decorator จากล่างขึ้นบน และ ValidationPipe ตั้ง stopAtFirstError
// จึงวางตัวตรวจพื้นฐาน (กรอกหรือยัง / ชนิดข้อมูล) ไว้ล่างสุด ให้ผู้ใช้เห็นข้อความที่ตรงปัญหาก่อน
export class FeedbackDto {
  @ApiProperty({
    minimum: 1,
    maximum: 5,
    example: 5,
    description: 'คะแนน 1–5 ดาว',
  })
  @Max(5, { message: 'คะแนนต้องอยู่ระหว่าง 1–5' })
  @Min(1, { message: 'คะแนนต้องอยู่ระหว่าง 1–5' })
  @IsInt({ message: 'คะแนนต้องเป็นจำนวนเต็ม' })
  rating: number;

  @ApiPropertyOptional({ example: 'ใช้ง่าย อยากให้มีแจ้งเตือนฝน' })
  @MaxLength(1000, { message: 'ความคิดเห็นยาวได้ไม่เกิน 1,000 ตัวอักษร' })
  @IsString({ message: 'ความคิดเห็นต้องเป็นข้อความ' })
  @IsOptional()
  comment?: string;

  @ApiPropertyOptional({ example: '/' })
  @MaxLength(200, { message: 'ยาวเกิน 200 ตัวอักษร' })
  @IsString({ message: 'ต้องเป็นข้อความ' })
  @IsOptional()
  page?: string;
}

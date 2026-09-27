import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';
import { MatchRequestDto, ScenarioDto } from '../scenarios/scenario.dto';

export class ExplainRequest {
  @ApiProperty({ type: MatchRequestDto })
  @ValidateNested()
  @IsObject({ message: 'ไม่พบข้อมูลที่กรอก (input)' })
  @Type(() => MatchRequestDto)
  input: MatchRequestDto;

  @ApiProperty({ type: ScenarioDto })
  @ValidateNested()
  @IsObject({ message: 'ไม่พบข้อมูล scenario' })
  @Type(() => ScenarioDto)
  scenario: ScenarioDto;
}

/**
 * ใช้ Claude แปลงผลการจับคู่ scenario เป็นคำอธิบายภาษาง่าย ๆ สำหรับเกษตรกร
 * ต้องตั้งค่า ANTHROPIC_API_KEY ใน environment ก่อนใช้งาน
 */
@Injectable()
export class AiService {
  private client: Anthropic | null = process.env.ANTHROPIC_API_KEY
    ? new Anthropic()
    : null;

  get enabled(): boolean {
    return this.client !== null;
  }

  async explain({
    input,
    scenario,
  }: ExplainRequest): Promise<{ explanation: string }> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY — ฟีเจอร์คำอธิบายจาก AI ปิดใช้งานอยู่',
      );
    }

    const response = await this.client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2048, // คำอธิบายสั้นสำหรับเกษตรกร — จงใจจำกัดความยาว
      thinking: { type: 'adaptive' },
      system:
        'คุณคือนักส่งเสริมการเกษตรที่อธิบายเรื่องการจัดการน้ำให้เกษตรกรไทยฟังเข้าใจง่าย ' +
        'ใช้ภาษาพูดเรียบง่าย ไม่ใช้ศัพท์เทคนิค ถ้าจำเป็นต้องใช้ให้อธิบายความหมายทันที ' +
        'ตอบสั้นกระชับไม่เกิน 5 ย่อหน้า และให้กำลังใจเกษตรกรอย่างจริงใจ ไม่สร้างข้อมูลตัวเลขใหม่นอกเหนือจากที่ให้มา',
      messages: [
        {
          role: 'user',
          content:
            `เกษตรกรปลูกมันสำปะหลังพันธุ์${input.crop}ใน${input.season} พื้นที่ ${input.area} ไร่ ` +
            `มีน้ำต้นทุน ${input.water} ลบ.ม.\n\n` +
            `ระบบแนะนำ scenario: ${JSON.stringify(scenario, null, 2)}\n\n` +
            'ช่วยอธิบายให้เกษตรกรฟังแบบง่าย ๆ ว่าสถานการณ์น้ำของเขาเป็นอย่างไร ' +
            'ควรให้น้ำอย่างไรในแต่ละช่วง และต้องระวังอะไรเป็นพิเศษ',
        },
      ],
    });

    const explanation = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    return { explanation };
  }
}

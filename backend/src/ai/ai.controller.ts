import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AiService, ExplainRequest } from './ai.service';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get('status')
  @ApiOperation({ summary: 'ฟีเจอร์ AI เปิดใช้งานอยู่หรือไม่' })
  status() {
    return { enabled: this.ai.enabled };
  }

  @Post('explain')
  // เรียก Claude มีค่าใช้จ่าย — จำกัด 5 ครั้ง/นาที ต่อ IP
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'ให้ Claude อธิบายผลการจับคู่เป็นภาษาง่าย ๆ สำหรับเกษตรกร',
  })
  explain(@Body() body: ExplainRequest) {
    return this.ai.explain(body);
  }
}

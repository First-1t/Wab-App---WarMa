import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RainfallService } from './rainfall.service';

@ApiTags('rainfall')
@Controller('rainfall')
export class RainfallController {
  constructor(private readonly rainfall: RainfallService) {}

  @Get()
  @ApiOperation({
    summary: 'ปริมาณฝน 24 ชม. ย้อนหลังรายสถานีทั่วประเทศ',
    description:
      'ดึงจาก ThaiWater API (api-v3.thaiwater.net/api/v1/thaiwater30/public/rain_24h) ผ่าน backend และ cache 10 นาที',
  })
  get24h() {
    return this.rainfall.get24h();
  }
}

import { Controller, Get } from '@nestjs/common';
import { RainfallService } from './rainfall.service';

@Controller('rainfall')
export class RainfallController {
  constructor(private readonly rainfall: RainfallService) {}

  @Get()
  get24h() {
    return this.rainfall.get24h();
  }
}

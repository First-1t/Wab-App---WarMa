import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiService, ExplainRequest } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get('status')
  status() {
    return { enabled: this.ai.enabled };
  }

  @Post('explain')
  explain(@Body() body: ExplainRequest) {
    return this.ai.explain(body);
  }
}

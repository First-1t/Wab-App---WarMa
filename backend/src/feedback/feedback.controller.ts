import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AdminGuard } from '../admin.guard';
import type { AdminRequest } from '../admin.guard';
import { FeedbackDto } from './feedback.dto';
import { FeedbackService } from './feedback.service';

@ApiTags('feedback')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'ส่งคะแนน/ความคิดเห็นการใช้งาน (ต้องล็อกอิน)' })
  create(@Body() body: FeedbackDto, @Req() req: AdminRequest) {
    return this.feedback.create(body, req.user?.email ?? null);
  }

  @Get()
  @ApiOperation({ summary: 'สรุปคะแนนและความคิดเห็นทั้งหมด (ต้องล็อกอิน)' })
  summary() {
    return this.feedback.summary();
  }
}

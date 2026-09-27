import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AdminGuard, OptionalAuthGuard } from '../admin.guard';
import type { AdminRequest } from '../admin.guard';
import { FeedbackDto, NotifyDto } from './feedback.dto';
import { FeedbackService } from './feedback.service';

@ApiTags('feedback')
@ApiBearerAuth()
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  @Post()
  @UseGuards(OptionalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'ส่งคะแนน/ความคิดเห็นการใช้งาน (คนทั่วไปส่งได้ ไม่ต้องล็อกอิน)',
  })
  create(@Body() body: FeedbackDto, @Req() req: AdminRequest) {
    return this.feedback.create(body, req.user?.email ?? null);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'สรุปคะแนนและความคิดเห็นทั้งหมด (ต้องล็อกอิน)' })
  summary() {
    return this.feedback.summary();
  }

  @Get('notify')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'สถานะการแจ้งเตือนทางอีเมลของผู้ใช้ที่ล็อกอิน' })
  notifyStatus(@Req() req: AdminRequest) {
    return this.feedback.notifyStatus(req.user?.email ?? null);
  }

  @Put('notify')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'เปิด/ปิดการแจ้งเตือนทางอีเมล (ส่งไปที่อีเมลที่ล็อกอิน)',
  })
  setNotify(@Body() body: NotifyDto, @Req() req: AdminRequest) {
    return this.feedback.setNotify(req.user?.email ?? null, body.subscribed);
  }

  @Post('notify/test')
  @UseGuards(AdminGuard)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'ส่งอีเมลทดสอบไปที่อีเมลที่ล็อกอิน' })
  sendTest(@Req() req: AdminRequest) {
    return this.feedback.sendTest(req.user?.email ?? null);
  }
}

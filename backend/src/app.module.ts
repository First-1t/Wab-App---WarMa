import { randomBytes } from 'crypto';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ScenariosController } from './scenarios/scenarios.controller';
import { ScenariosService } from './scenarios/scenarios.service';
import { AiController } from './ai/ai.controller';
import { AiService } from './ai/ai.service';
import { RainfallController } from './rainfall/rainfall.controller';
import { RainfallService } from './rainfall/rainfall.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { FeedbackController } from './feedback/feedback.controller';
import { FeedbackService } from './feedback/feedback.service';
import { MailService } from './mail/mail.service';

@Module({
  imports: [
    JwtModule.register({
      // ไม่ตั้ง AUTH_SECRET = สุ่มใหม่ทุกครั้งที่เปิดเซิร์ฟเวอร์ (อาจารย์ต้องล็อกอินใหม่)
      secret: process.env.AUTH_SECRET || randomBytes(32).toString('hex'),
      signOptions: { expiresIn: '8h' },
    }),
    // rate limit: ค่าเริ่มต้น 120 ครั้ง/นาที ต่อ IP (บาง endpoint ตั้งเข้มกว่านี้)
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
  ],
  controllers: [
    AppController,
    ScenariosController,
    AiController,
    RainfallController,
    AuthController,
    FeedbackController,
  ],
  providers: [
    AppService,
    PrismaService,
    ScenariosService,
    AiService,
    RainfallService,
    AuthService,
    FeedbackService,
    MailService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

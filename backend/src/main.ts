import './env';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // security headers (CSP ปิดไว้เพราะหน้า Swagger ใช้ inline script)
  app.use(helmet({ contentSecurityPolicy: false }));
  // จำกัดขนาด request body กันการส่งข้อมูลก้อนใหญ่ถล่มเซิร์ฟเวอร์
  app.use(json({ limit: '100kb' }));

  // อนุญาตให้ frontend (Next.js) เรียก API ข้าม origin ได้
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
  });

  // ตรวจข้อมูลนำเข้าทุก endpoint ตาม DTO — ผิดรูปแบบตอบ 400 พร้อมข้อความภาษาไทย
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ตัด field ที่ไม่ได้ประกาศใน DTO ทิ้ง
      transform: true,
      stopAtFirstError: true, // แสดงข้อผิดพลาดแรกของแต่ละช่องพอ ไม่ซ้ำซ้อน
      exceptionFactory: (errors) => {
        const messages = errors.flatMap(function collect(err): string[] {
          return [
            ...Object.values(err.constraints ?? {}),
            ...(err.children ?? []).flatMap(collect),
          ];
        });
        return new BadRequestException(messages);
      },
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());

  // เอกสาร API — เปิดดูและทดลองเรียกได้ที่ /api/docs (JSON: /api/docs-json)
  const config = new DocumentBuilder()
    .setTitle('WarMa API')
    .setDescription(
      'API ระบบแนะนำการจัดการน้ำสำหรับการปลูกมันสำปะหลัง — จับคู่ scenario การให้น้ำ, ' +
        'ข้อมูลฝน 24 ชม. (ThaiWater), คำอธิบายจาก AI (Claude) และ feedback ผู้ใช้\n\n' +
        'endpoint ที่มีรูปกุญแจต้องล็อกอิน: เรียก POST /auth/google แล้วนำ token มากดปุ่ม Authorize',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, config),
    {
      customSiteTitle: 'WarMa API Docs',
    },
  );

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();

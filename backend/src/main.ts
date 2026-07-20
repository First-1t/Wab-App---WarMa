import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // อนุญาตให้ frontend (Next.js) เรียก API ข้าม origin ได้
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

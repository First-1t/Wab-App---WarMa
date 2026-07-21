import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ScenariosController } from './scenarios/scenarios.controller';
import { ScenariosService } from './scenarios/scenarios.service';
import { AiController } from './ai/ai.controller';
import { AiService } from './ai/ai.service';
import { RainfallController } from './rainfall/rainfall.controller';
import { RainfallService } from './rainfall/rainfall.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    ScenariosController,
    AiController,
    RainfallController,
  ],
  providers: [
    AppService,
    PrismaService,
    ScenariosService,
    AiService,
    RainfallService,
  ],
})
export class AppModule {}

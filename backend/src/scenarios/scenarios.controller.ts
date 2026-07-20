import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { MatchRequestDto, ScenarioDto } from './scenario.dto';
import { ScenariosService } from './scenarios.service';

@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenarios: ScenariosService) {}

  @Get()
  findAll() {
    return this.scenarios.findAll();
  }

  @Get('options')
  options() {
    return this.scenarios.options();
  }

  @Post('match')
  match(@Body() body: MatchRequestDto) {
    return this.scenarios.match(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scenarios.findOne(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() body: ScenarioDto) {
    return this.scenarios.create(body);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() body: ScenarioDto) {
    return this.scenarios.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.scenarios.remove(id);
  }
}

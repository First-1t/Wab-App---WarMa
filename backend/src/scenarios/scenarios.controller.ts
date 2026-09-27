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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../admin.guard';
import { MatchRequestDto, ScenarioDto } from './scenario.dto';
import { ScenariosService } from './scenarios.service';

@ApiTags('scenarios')
@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenarios: ScenariosService) {}

  @Get()
  @ApiOperation({ summary: 'รายการ scenario ทั้งหมด' })
  findAll() {
    return this.scenarios.findAll();
  }

  @Get('options')
  @ApiOperation({ summary: 'รายชื่อพันธุ์มันสำปะหลังและฤดูกาลที่มีข้อมูล' })
  options() {
    return this.scenarios.options();
  }

  @Post('match')
  @ApiOperation({
    summary: 'จับคู่ scenario การให้น้ำ',
    description:
      'รับพันธุ์ ฤดู ปริมาณน้ำต้นทุน (ลบ.ม.) และพื้นที่ (ไร่) → คำนวณ ratio = น้ำต่อไร่ ÷ น้ำที่พันธุ์นั้นต้องการ ' +
      'แล้วคืน scenario ที่ตรงช่วง ratio พร้อมตารางให้น้ำและคำแนะนำ',
  })
  match(@Body() body: MatchRequestDto) {
    return this.scenarios.match(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดู scenario ตาม id' })
  findOne(@Param('id') id: string) {
    return this.scenarios.findOne(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'เพิ่ม scenario (ต้องล็อกอิน)' })
  create(@Body() body: ScenarioDto) {
    return this.scenarios.create(body);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'แก้ไข scenario (ต้องล็อกอิน)' })
  update(@Param('id') id: string, @Body() body: ScenarioDto) {
    return this.scenarios.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ลบ scenario (ต้องล็อกอิน)' })
  remove(@Param('id') id: string) {
    return this.scenarios.remove(id);
  }
}

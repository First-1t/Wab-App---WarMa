import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { MatchRequestDto, ScenarioDto } from './scenario.dto';

// ลำดับฤดูในตัวเลือก (ฤดูที่ไม่อยู่ในรายการจะต่อท้าย)
const SEASON_ORDER = ['ฤดูหนาว', 'ฤดูร้อน', 'ฤดูฝน'];
const seasonRank = (s: string) => {
  const i = SEASON_ORDER.indexOf(s);
  return i === -1 ? SEASON_ORDER.length : i;
};

@Injectable()
export class ScenariosService {
  constructor(private prisma: PrismaService) {}

  /** แปลง DTO ให้ field ประเภท Json ตรงกับที่ Prisma ต้องการ */
  private toData(dto: ScenarioDto) {
    return {
      ...dto,
      advice: dto.advice as unknown as Prisma.InputJsonValue,
      schedule: dto.schedule as unknown as Prisma.InputJsonValue,
    };
  }

  findAll() {
    return this.prisma.scenario.findMany({
      orderBy: [{ crop: 'asc' }, { season: 'asc' }, { minRatio: 'desc' }],
    });
  }

  async findOne(id: string) {
    const scenario = await this.prisma.scenario.findUnique({ where: { id } });
    if (!scenario) throw new NotFoundException('ไม่พบ scenario นี้');
    return scenario;
  }

  create(dto: ScenarioDto) {
    return this.prisma.scenario.create({ data: this.toData(dto) });
  }

  update(id: string, dto: ScenarioDto) {
    return this.prisma.scenario.update({
      where: { id },
      data: this.toData(dto),
    });
  }

  remove(id: string) {
    return this.prisma.scenario.delete({ where: { id } });
  }

  /** รายชื่อพันธุ์มันฝรั่งและฤดูกาลที่มีข้อมูล — ใช้เติมตัวเลือกในฟอร์มหน้าบ้าน */
  async options() {
    const rows = await this.prisma.scenario.findMany({
      select: { crop: true, season: true },
      distinct: ['crop', 'season'],
    });
    return {
      crops: [...new Set(rows.map((r) => r.crop))],
      seasons: [...new Set(rows.map((r) => r.season))].sort(
        (a, b) => seasonRank(a) - seasonRank(b),
      ),
    };
  }

  /**
   * จับคู่ scenario จากปัจจัยนำเข้า
   * ratio = น้ำต้นทุนต่อไร่ ÷ ความต้องการน้ำของพันธุ์นั้นในฤดูนั้น
   * (ความต้องการน้ำ = waterPerRai สูงสุดในกลุ่ม ซึ่งคือ scenario "น้ำเพียงพอ")
   */
  async match({ crop, season, water, area }: MatchRequestDto) {
    if (!water || !area || water <= 0 || area <= 0) {
      throw new BadRequestException('ปริมาณน้ำและขนาดพื้นที่ต้องมากกว่า 0');
    }

    const candidates = await this.prisma.scenario.findMany({
      where: { crop, season },
      orderBy: { waterPerRai: 'desc' },
    });
    if (candidates.length === 0) {
      throw new NotFoundException(
        `ยังไม่มีข้อมูล scenario สำหรับ ${crop} ใน${season}`,
      );
    }

    const need = Math.max(...candidates.map((s) => s.waterPerRai));
    const ratio = water / area / need;

    let matched = candidates.find(
      (s) => ratio >= s.minRatio && ratio < s.maxRatio,
    );
    if (!matched) {
      matched = [...candidates].sort(
        (a, b) =>
          Math.min(Math.abs(ratio - a.minRatio), Math.abs(ratio - a.maxRatio)) -
          Math.min(Math.abs(ratio - b.minRatio), Math.abs(ratio - b.maxRatio)),
      )[0];
    }

    return {
      input: { crop, season, water, area, waterPerRai: water / area },
      ratio,
      matched,
      totalAllocation: Math.min(matched.waterPerRai * area, water),
      candidates,
    };
  }
}

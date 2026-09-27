import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { FeedbackDto } from './feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  create(dto: FeedbackDto, email: string | null) {
    return this.prisma.feedback.create({
      data: {
        rating: dto.rating,
        comment: dto.comment?.trim() || null,
        page: dto.page ?? null,
        email,
      },
    });
  }

  /** สรุปคะแนน + รายการล่าสุด สำหรับหน้าตั้งค่า */
  async summary() {
    const [items, agg, groups] = await Promise.all([
      this.prisma.feedback.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      this.prisma.feedback.aggregate({
        _count: true,
        _avg: { rating: true },
      }),
      this.prisma.feedback.groupBy({ by: ['rating'], _count: true }),
    ]);
    const distribution = [1, 2, 3, 4, 5].map(
      (r) => groups.find((g) => g.rating === r)?._count ?? 0,
    );
    return {
      count: agg._count,
      average: agg._avg.rating,
      distribution, // จำนวนคนที่ให้ 1..5 ดาว
      items,
    };
  }
}

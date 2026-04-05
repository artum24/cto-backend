import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the report for a given jobId, or null if processing is still in progress.
   * Frontend polls this every 2-3 seconds until it gets a non-null result.
   */
  async findByJobId(jobId: string) {
    const report = await this.prisma.reports.findUnique({
      where: { job_id: jobId },
    });

    if (!report) return null;

    return bigintToString(report);
  }
}

import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the report for a given jobId if it belongs to the requesting company.
   * Returns null while processing is still in progress.
   */
  async findByJobId(jobId: string, companyId: bigint) {
    const report = await this.prisma.reports.findUnique({
      where: { job_id: jobId },
    });

    if (!report) return null;

    // Verify ownership — prevent cross-company data access
    // (company_id field added via migration; cast until `prisma generate` is run locally)
    const reportCompanyId = (report as any).company_id as bigint | null;
    if (reportCompanyId && reportCompanyId !== companyId) {
      throw new ForbiddenException('Access denied');
    }

    return bigintToString(report);
  }
}

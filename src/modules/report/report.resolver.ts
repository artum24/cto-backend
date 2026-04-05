import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { Report } from './models/report.model';
import { ReportService } from './report.service';

@Resolver(() => Report)
@UseGuards(SupabaseAuthGuard)
export class ReportResolver {
  constructor(private readonly reportService: ReportService) {}

  /**
   * Poll this query after uploading an XLSX file.
   * Returns null while processing is in progress.
   * Returns the report (with data_errors) when done.
   *
   * Example polling from frontend:
   *   every 2s → query dataErrors(jobId: "...") { data_errors }
   *   stop when result is not null
   */
  @Query(() => Report, { name: 'dataErrors', nullable: true })
  async getDataErrors(@Args('jobId') jobId: string) {
    return this.reportService.findByJobId(jobId);
  }
}

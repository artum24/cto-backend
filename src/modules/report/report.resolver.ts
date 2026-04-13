import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
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
   */
  @Query(() => Report, { name: 'dataErrors', nullable: true })
  async getDataErrors(
    @Args('jobId') jobId: string,
    @CurrentUser() user: AuthContextUser,
  ) {
    const u = user.user;
    if (!u?.company_id) throw new Error('User is not associated with a company');
    return this.reportService.findByJobId(jobId, BigInt(u.company_id));
  }
}

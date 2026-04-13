import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { Invoice } from './models/invoice.model';
import { InvoiceService } from './invoice.service';

@Resolver(() => Invoice)
@UseGuards(SupabaseAuthGuard)
export class InvoiceResolver {
  constructor(private readonly invoiceService: InvoiceService) {}

  private companyId(user: AuthContextUser): bigint {
    const u = user.user;
    if (!u?.company_id) throw new Error('User is not associated with a company');
    return BigInt(u.company_id);
  }

  @Query(() => Invoice, { name: 'invoice', nullable: true })
  async getInvoice(
    @Args('taskId', { type: () => ID }) taskId: string,
    @CurrentUser() user: AuthContextUser,
  ) {
    // findByTaskId verifies company ownership before returning
    return this.invoiceService.findByTaskId(BigInt(taskId), this.companyId(user));
  }

  @Mutation(() => Invoice, { name: 'generateInvoice' })
  async generateInvoice(
    @Args('taskId', { type: () => ID }) taskId: string,
    @CurrentUser() user: AuthContextUser,
  ) {
    return this.invoiceService.generate(BigInt(taskId), this.companyId(user));
  }
}

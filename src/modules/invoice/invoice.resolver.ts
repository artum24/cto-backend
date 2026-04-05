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

  @Query(() => Invoice, { name: 'invoice', nullable: true })
  async getInvoice(
    @Args('taskId', { type: () => ID }) taskId: string,
  ) {
    return this.invoiceService.findByTaskId(BigInt(taskId));
  }

  @Mutation(() => Invoice, { name: 'generateInvoice' })
  async generateInvoice(
    @Args('taskId', { type: () => ID }) taskId: string,
    @CurrentUser() user: AuthContextUser,
  ) {
    if (!user.user.company_id) {
      throw new Error('User is not associated with a company');
    }
    return this.invoiceService.generate(BigInt(taskId), BigInt(user.user.company_id));
  }
}

import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { AuthContextUser } from '@/auth/supabase-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { InvoiceService } from './invoice.service';

@Controller('invoices')
@UseGuards(SupabaseAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  /**
   * GET /invoices/:taskId/pdf
   * Returns the invoice PDF as a downloadable file.
   * Frontend can open this URL directly in a new tab or trigger download.
   */
  @Get(':taskId/pdf')
  async downloadPdf(
    @Param('taskId') taskId: string,
    @Res() res: Response,
    @CurrentUser() user: AuthContextUser,
  ) {
    if (!user.user.company_id) {
      res.status(403).json({ error: 'User is not associated with a company' });
      return;
    }

    const pdfBuffer = await this.invoiceService.getPdfBuffer(
      BigInt(taskId),
      BigInt(user.user.company_id),
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-task-${taskId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}

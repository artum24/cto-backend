import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { PdfGeneratorService } from './pdf-generator.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, PdfGeneratorService],
})
export class InvoiceModule {}

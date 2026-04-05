import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { InvoiceResolver } from './invoice.resolver';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { PdfGeneratorService } from './pdf-generator.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [InvoiceController],
  providers: [InvoiceResolver, InvoiceService, PdfGeneratorService],
})
export class InvoiceModule {}

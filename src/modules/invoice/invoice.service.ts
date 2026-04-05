import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { bigintToString } from '@/common/mappers/bigint.mapper';
import { PdfGeneratorService, InvoicePdfData, InvoiceLineItem } from './pdf-generator.service';

// Prisma client is not yet aware of the `invoices` model until `npx prisma generate` is run locally.
// Using a typed accessor to avoid TS errors until then.
type PrismaAny = PrismaService & { invoices: any };

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGenerator: PdfGeneratorService,
  ) {}

  private get db(): PrismaAny {
    return this.prisma as PrismaAny;
  }

  async findByTaskId(taskId: bigint, companyId: bigint) {
    // Verify task belongs to this company before returning invoice
    const task = await this.prisma.tasks.findUnique({
      where: { id: taskId },
      include: { vehicles: { include: { clients: true } } },
    });
    if (!task) return null;
    if (task.vehicles.clients.company_id !== companyId) {
      throw new ForbiddenException('Access denied');
    }
    const invoice = await this.db.invoices.findUnique({
      where: { task_id: taskId },
    });
    if (!invoice) return null;
    return bigintToString(invoice);
  }

  async generate(taskId: bigint, companyId: bigint) {
    // Check if invoice already exists
    const existing = await this.db.invoices.findUnique({
      where: { task_id: taskId },
    });
    if (existing) {
      return bigintToString(existing);
    }

    // Load task with all relations needed for invoice
    const task = await this.prisma.tasks.findUnique({
      where: { id: taskId },
      include: {
        vehicles: {
          include: {
            clients: true,
            vehicle_makes: true,
            vehicle_models: true,
          },
        },
        vehicle_histories: {
          include: { services: true },
        },
        detail_histories: {
          include: { details: true },
          where: { action_type: 2 }, // 2 = withdrawal/use
        },
      },
    });

    if (!task) throw new NotFoundException(`Task #${taskId} not found`);

    // Verify task belongs to this company via vehicle → client
    const client = task.vehicles.clients;
    if (client.company_id && BigInt(client.company_id) !== companyId) {
      throw new BadRequestException('Task does not belong to your company');
    }

    // Load company info for PDF header
    const company = await this.prisma.companies.findUnique({
      where: { id: companyId },
    });

    // Build service line items
    const services: InvoiceLineItem[] = task.vehicle_histories
      .filter((vh: any) => vh.services)
      .map((vh: any): InvoiceLineItem => ({
        name: vh.services.title || 'Послуга',
        quantity: 1,
        unitPrice: vh.services.price ? Number(vh.services.price) : 0,
      }));

    // Build parts line items (detail_histories with count_diff < 0 = used/withdrawn)
    const parts: InvoiceLineItem[] = task.detail_histories
      .filter((dh: any) => dh.details && dh.count_diff && dh.count_diff < 0)
      .map((dh: any): InvoiceLineItem => ({
        name: dh.details.name || 'Запчастина',
        quantity: Math.abs(dh.count_diff!),
        unitPrice: dh.details.sell_price ? Number(dh.details.sell_price) : 0,
      }));

    const totalAmount =
      services.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0) +
      parts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);

    const vehicle = task.vehicles;
    const invoiceId = `${taskId}`;

    const pdfData: InvoicePdfData = {
      invoiceId,
      createdAt: new Date(),
      company: {
        title: company?.title || 'СТО',
        address: company?.address,
        city: company?.city,
      },
      client: {
        name: client.name || '—',
        phone: client.phone,
      },
      vehicle: {
        makeName: vehicle.vehicle_make_name || vehicle.vehicle_makes?.vehicle_make_name,
        modelName: vehicle.vehicle_model_name || vehicle.vehicle_models?.vehicle_model_name,
        year: vehicle.vehicle_year,
        number: vehicle.vehicle_number,
      },
      taskTitle: task.title,
      services,
      parts,
      totalAmount,
    };

    // Generate PDF bytes
    const pdfBuffer = await this.pdfGenerator.generateInvoicePdf(pdfData);

    // Store invoice record in DB (pdf_url = null for now, PDF served via REST)
    const invoice = await this.db.invoices.create({
      data: {
        task_id: taskId,
        total_amount: totalAmount,
        pdf_url: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Cache PDF buffer on the instance for immediate download after mutation
    this._pdfCache.set(String(taskId), pdfBuffer);
    setTimeout(() => this._pdfCache.delete(String(taskId)), 5 * 60 * 1000); // 5 min TTL

    return bigintToString(invoice);
  }

  /** Generates PDF bytes for a given taskId — used by the REST endpoint */
  async getPdfBuffer(taskId: bigint, companyId: bigint): Promise<Buffer> {
    // Check cached buffer first
    const cached = this._pdfCache.get(String(taskId));
    if (cached) return cached;

    // Regenerate from DB data
    const invoice = await this.findByTaskId(taskId, companyId);
    if (!invoice) throw new NotFoundException(`Invoice for task #${taskId} not found`);

    // Re-run generate logic to rebuild PDF (reuses same data loading)
    // We delete the existing record temporarily to allow re-generation
    // Better: just rebuild the PDF data without touching DB
    return this.rebuildPdfBuffer(taskId, companyId);
  }

  private async rebuildPdfBuffer(taskId: bigint, companyId: bigint): Promise<Buffer> {
    const task = await this.prisma.tasks.findUnique({
      where: { id: taskId },
      include: {
        vehicles: {
          include: { clients: true, vehicle_makes: true, vehicle_models: true },
        },
        vehicle_histories: { include: { services: true } },
        detail_histories: {
          include: { details: true },
          where: { action_type: 2 },
        },
      },
    });
    if (!task) throw new NotFoundException(`Task #${taskId} not found`);

    const company = await this.prisma.companies.findUnique({ where: { id: companyId } });
    const client = task.vehicles.clients;
    const vehicle = task.vehicles;

    const services: InvoiceLineItem[] = task.vehicle_histories
      .filter((vh: any) => vh.services)
      .map((vh: any): InvoiceLineItem => ({
        name: vh.services.title || 'Послуга',
        quantity: 1,
        unitPrice: vh.services.price ? Number(vh.services.price) : 0,
      }));

    const parts: InvoiceLineItem[] = task.detail_histories
      .filter((dh: any) => dh.details && dh.count_diff && dh.count_diff < 0)
      .map((dh: any): InvoiceLineItem => ({
        name: dh.details.name || 'Запчастина',
        quantity: Math.abs(dh.count_diff!),
        unitPrice: dh.details.sell_price ? Number(dh.details.sell_price) : 0,
      }));

    const totalAmount =
      services.reduce((sum: number, s: InvoiceLineItem) => sum + s.quantity * s.unitPrice, 0) +
      parts.reduce((sum: number, p: InvoiceLineItem) => sum + p.quantity * p.unitPrice, 0);

    return this.pdfGenerator.generateInvoicePdf({
      invoiceId: String(taskId),
      createdAt: new Date(),
      company: { title: company?.title || 'СТО', address: company?.address, city: company?.city },
      client: { name: client.name || '—', phone: client.phone },
      vehicle: {
        makeName: vehicle.vehicle_make_name || vehicle.vehicle_makes?.vehicle_make_name,
        modelName: vehicle.vehicle_model_name || vehicle.vehicle_models?.vehicle_model_name,
        year: vehicle.vehicle_year,
        number: vehicle.vehicle_number,
      },
      taskTitle: task.title,
      services,
      parts,
      totalAmount,
    });
  }

  // In-memory short-lived PDF cache (avoids re-generation on immediate download)
  private readonly _pdfCache = new Map<string, Buffer>();
}

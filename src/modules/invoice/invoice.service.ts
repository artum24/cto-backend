import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PdfGeneratorService, InvoicePdfData } from '@/modules/invoice/pdf-generator.service';

@Injectable()
export class InvoiceService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly pdfGenerator: PdfGeneratorService,
    ) {}

    async generatePDF(taskId: string, companyId: bigint): Promise<Buffer> {
        const task = await this.prisma.tasks.findUnique({
            where: { id: BigInt(taskId) },
            include: {
                vehicles: {
                    include: {
                        clients: { include: { companies: true } },
                        vehicle_makes: true,
                        vehicle_models: true,
                    },
                },
                vehicle_histories: { include: { services: true } },
                detail_histories: {
                    where: { count_diff: { lt: 0 } },
                    include: { details: true },
                },
            },
        });

        if (!task) throw new NotFoundException(`Task #${taskId} not found`);

        if (task.vehicles.clients.company_id !== companyId) {
            throw new ForbiddenException('Access denied');
        }

        const client = task.vehicles.clients;
        const company = client.companies;
        const vehicle = task.vehicles;

        const data: InvoicePdfData = {
            invoiceId: taskId,
            createdAt: new Date(),
            company: {
                title: company?.title ?? 'СТО',
                city: company?.city,
                address: company?.address,
            },
            client: {
                name: client.name ?? '—',
                phone: client.phone,
            },
            vehicle: {
                makeName: vehicle.vehicle_makes?.vehicle_make_name,
                modelName: vehicle.vehicle_models?.vehicle_model_name,
                year: vehicle.vehicle_year ?? 0,
                number: vehicle.vehicle_number,
            },
            taskTitle: task.title,
            services: task.vehicle_histories.map((vh: any) => ({
                name: vh.services?.title ?? 'Послуга',
                quantity: 1,
                unitPrice: Number(vh.price ?? vh.services?.price ?? 0),
            })),
            parts: task.detail_histories.map((dh: any) => ({
                name: dh.details?.name ?? 'Запчастина',
                quantity: Math.abs(dh.count_diff ?? 1),
                unitPrice: Number(dh.price ?? dh.details?.sell_price ?? 0),
            })),
            totalAmount: 0,
        };

        data.totalAmount =
            data.services.reduce((s, i) => s + i.quantity * i.unitPrice, 0) +
            data.parts.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

        return this.pdfGenerator.generateInvoicePdf(data);
    }
}
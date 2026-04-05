import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface InvoiceLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoicePdfData {
  invoiceId: string;
  createdAt: Date;
  company: {
    title: string;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
  };
  client: {
    name: string;
    phone?: string | null;
  };
  vehicle: {
    makeName?: string | null;
    modelName?: string | null;
    year: number;
    number?: string | null;
  };
  taskTitle?: string | null;
  services: InvoiceLineItem[];
  parts: InvoiceLineItem[];
  totalAmount: number;
}

const COL = {
  margin: 50,
  right: 545,
  nameX: 50,
  qtyX: 370,
  priceX: 430,
  totalX: 490,
};

@Injectable()
export class PdfGeneratorService {
  async generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]); // A4
    const { height } = page.getSize();

    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

    const black = rgb(0, 0, 0);
    const gray = rgb(0.5, 0.5, 0.5);
    const lightGray = rgb(0.92, 0.92, 0.92);
    const accent = rgb(0.13, 0.47, 0.71);

    let y = height - 50;

    // ── Header ──────────────────────────────────────────────────────────────
    page.drawText(data.company.title || 'СТО', {
      x: COL.margin, y,
      size: 20, font: fontBold, color: accent,
    });

    const dateStr = data.createdAt.toLocaleDateString('uk-UA');
    page.drawText(`Рахунок #${data.invoiceId}  ·  ${dateStr}`, {
      x: COL.margin, y: y - 22,
      size: 10, font: fontRegular, color: gray,
    });

    if (data.company.city || data.company.address) {
      const addr = [data.company.city, data.company.address].filter(Boolean).join(', ');
      page.drawText(addr, {
        x: COL.margin, y: y - 36,
        size: 9, font: fontRegular, color: gray,
      });
    }

    y -= 70;
    page.drawLine({ start: { x: COL.margin, y }, end: { x: COL.right, y }, thickness: 1, color: lightGray });
    y -= 20;

    // ── Client + Vehicle info ────────────────────────────────────────────────
    page.drawText('Клієнт', { x: COL.margin, y, size: 9, font: fontBold, color: gray });
    page.drawText('Автомобіль', { x: 300, y, size: 9, font: fontBold, color: gray });
    y -= 14;

    page.drawText(data.client.name || '—', { x: COL.margin, y, size: 11, font: fontBold, color: black });

    const vehicleName = [data.vehicle.makeName, data.vehicle.modelName].filter(Boolean).join(' ')
      || 'Невідомий автомобіль';
    page.drawText(vehicleName, { x: 300, y, size: 11, font: fontBold, color: black });
    y -= 14;

    if (data.client.phone) {
      page.drawText(data.client.phone, { x: COL.margin, y, size: 9, font: fontRegular, color: gray });
    }

    const vehicleDetails = [
      data.vehicle.year ? `${data.vehicle.year} р.` : null,
      data.vehicle.number,
    ].filter(Boolean).join(' · ');
    if (vehicleDetails) {
      page.drawText(vehicleDetails, { x: 300, y, size: 9, font: fontRegular, color: gray });
    }

    y -= 30;

    if (data.taskTitle) {
      page.drawText(`Задача: ${data.taskTitle}`, { x: COL.margin, y, size: 9, font: fontRegular, color: gray });
      y -= 20;
    }

    // ── Table header ─────────────────────────────────────────────────────────
    page.drawRectangle({ x: COL.margin, y: y - 4, width: COL.right - COL.margin, height: 20, color: accent });
    page.drawText('Найменування', { x: COL.nameX, y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('К-сть', { x: COL.qtyX, y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('Ціна', { x: COL.priceX, y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('Сума', { x: COL.totalX, y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    y -= 20;

    const drawRow = (item: InvoiceLineItem, index: number) => {
      if (index % 2 === 0) {
        page.drawRectangle({ x: COL.margin, y: y - 4, width: COL.right - COL.margin, height: 18, color: lightGray });
      }
      const lineTotal = item.quantity * item.unitPrice;
      page.drawText(item.name, { x: COL.nameX, y, size: 9, font: fontRegular, color: black });
      page.drawText(String(item.quantity), { x: COL.qtyX, y, size: 9, font: fontRegular, color: black });
      page.drawText(this.formatMoney(item.unitPrice), { x: COL.priceX, y, size: 9, font: fontRegular, color: black });
      page.drawText(this.formatMoney(lineTotal), { x: COL.totalX, y, size: 9, font: fontBold, color: black });
      y -= 18;
    };

    // ── Services section ──────────────────────────────────────────────────────
    if (data.services.length > 0) {
      page.drawText('ПОСЛУГИ', { x: COL.nameX, y, size: 8, font: fontBold, color: accent });
      y -= 16;
      data.services.forEach((s, i) => drawRow(s, i));
    }

    // ── Parts section ─────────────────────────────────────────────────────────
    if (data.parts.length > 0) {
      y -= 6;
      page.drawText('ЗАПЧАСТИНИ', { x: COL.nameX, y, size: 8, font: fontBold, color: accent });
      y -= 16;
      data.parts.forEach((p, i) => drawRow(p, i));
    }

    // ── Total ─────────────────────────────────────────────────────────────────
    y -= 10;
    page.drawLine({ start: { x: COL.margin, y }, end: { x: COL.right, y }, thickness: 1, color: lightGray });
    y -= 20;

    page.drawText('РАЗОМ ДО ОПЛАТИ:', { x: COL.margin, y, size: 12, font: fontBold, color: black });
    page.drawText(`${this.formatMoney(data.totalAmount)} грн`, {
      x: COL.totalX - 20, y,
      size: 14, font: fontBold, color: accent,
    });

    // ── Footer ────────────────────────────────────────────────────────────────
    page.drawText('Дякуємо за звернення!', {
      x: COL.margin, y: 40,
      size: 9, font: fontRegular, color: gray,
    });

    const pdfBytes = await doc.save();
    return Buffer.from(pdfBytes);
  }

  private formatMoney(amount: number): string {
    return amount.toFixed(2);
  }
}

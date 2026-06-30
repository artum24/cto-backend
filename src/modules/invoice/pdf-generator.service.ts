import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { PDFDocument, rgb, RGB } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

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
  accentColor?: string;
  footerNote?: string;
  logoUrl?: string;
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return rgb(r, g, b);
}

@Injectable()
export class PdfGeneratorService {
  async generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
    const accentHex = data.accentColor ?? '#2563eb';
    const accent = hexToRgb(accentHex);
    const gray = rgb(0.42, 0.44, 0.50);
    const lightGray = rgb(0.97, 0.98, 0.99);
    const darkText = rgb(0.06, 0.09, 0.16);
    const white = rgb(1, 1, 1);
    const borderGray = rgb(0.9, 0.91, 0.93);

    const footerNote = data.footerNote ?? 'Дякуємо за довіру!';
    const dateStr = data.createdAt.toLocaleDateString('uk-UA');

    const fontsDir = path.join(__dirname, '..', '..', 'assets', 'fonts');
    const regularBytes = fs.readFileSync(path.join(fontsDir, 'Montserrat.ttf'));
    const boldBytes = fs.readFileSync(path.join(fontsDir, 'Montserrat-Bold.ttf'));

    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);
    const regularFont = await doc.embedFont(regularBytes);
    const boldFont = await doc.embedFont(boldBytes);

    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 32;
    const contentWidth = pageWidth - margin * 2;

    const page = doc.addPage([pageWidth, pageHeight]);
    let y = pageHeight;

    const drawRect = (px: number, py: number, w: number, h: number, color: RGB) => {
      page.drawRectangle({ x: px, y: py, width: w, height: h, color });
    };

    const drawLine = (x1: number, y1: number, x2: number, y2: number, color: RGB = borderGray) => {
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 0.5, color });
    };

    type DrawTextOpts = {
      size?: number;
      font?: typeof regularFont;
      color?: RGB;
      align?: 'left' | 'right' | 'center';
      maxWidth?: number;
    };

    const drawText = (text: string, x: number, py: number, opts: DrawTextOpts = {}) => {
      const size = opts.size ?? 10;
      const font = opts.font ?? regularFont;
      const color = opts.color ?? darkText;
      let str = String(text ?? '');

      if (opts.maxWidth) {
        while (str.length > 0 && font.widthOfTextAtSize(str, size) > opts.maxWidth) {
          str = str.slice(0, -1);
        }
        if (str !== String(text ?? '')) str = str.slice(0, -1) + '…';
      }

      let dx = x;
      if (opts.align === 'right') dx = x - font.widthOfTextAtSize(str, size);
      else if (opts.align === 'center') dx = x - font.widthOfTextAtSize(str, size) / 2;

      page.drawText(str, { x: dx, y: py, size, font, color });
    };

    // ── HEADER ─────────────────────────────────────────────────────────────
    const headerH = 64;
    drawRect(0, pageHeight - headerH, pageWidth, headerH, accent);
    y = pageHeight - headerH;

    drawText(data.company.title || 'Замовлення-наряд', margin, y + 38, {
      size: 16, font: boldFont, color: white,
    });

    const addrParts = [data.company.city, data.company.address].filter(Boolean) as string[];
    if (addrParts.length) {
      drawText(addrParts.join(', '), margin, y + 22, { size: 9, color: rgb(0.85, 0.90, 1) });
    }
    if (data.company.phone) {
      drawText(data.company.phone, margin, y + 12, { size: 9, color: rgb(0.85, 0.90, 1) });
    }

    drawText(`№ ZN-${data.invoiceId}`, pageWidth - margin, y + 38, {
      size: 11, font: boldFont, color: white, align: 'right',
    });
    drawText(`від ${dateStr}`, pageWidth - margin, y + 24, {
      size: 9, color: rgb(0.85, 0.90, 1), align: 'right',
    });

    y -= 16;

    // ── CLIENT / VEHICLE ────────────────────────────────────────────────────
    const halfW = (contentWidth - 16) / 2;

    drawText('Клієнт', margin, y, { size: 8, font: boldFont, color: gray });
    y -= 14;
    drawText(data.client.name, margin, y, { size: 11, font: boldFont, maxWidth: halfW });
    y -= 13;
    if (data.client.phone) {
      drawText(data.client.phone, margin, y, { size: 9, color: gray });
      y -= 12;
    }

    const vehicleParts = [data.vehicle.makeName, data.vehicle.modelName, data.vehicle.year]
      .filter(Boolean)
      .join(' ');
    const col2x = margin + halfW + 16;
    let col2y = y + (data.client.phone ? 39 : 27);
    drawText('Авто', col2x, col2y, { size: 8, font: boldFont, color: gray });
    col2y -= 14;
    drawText(vehicleParts || '—', col2x, col2y, { size: 11, font: boldFont, maxWidth: halfW });
    col2y -= 13;
    if (data.vehicle.number) {
      drawText(data.vehicle.number, col2x, col2y, { size: 9, color: gray });
    }

    y -= 10;
    drawLine(margin, y, pageWidth - margin, y, borderGray);
    y -= 14;

    if (data.taskTitle) {
      drawText(`Наряд: ${data.taskTitle}`, margin, y, { size: 9, color: gray });
      y -= 16;
    }

    // ── TABLE HEADER ────────────────────────────────────────────────────────
    const col = {
      name: { x: margin, w: contentWidth - 160 },
      qty:  { x: margin + contentWidth - 160, w: 40 },
      price: { x: margin + contentWidth - 120, w: 60 },
      total: { x: margin + contentWidth - 60, w: 60 },
    };

    drawRect(margin, y - 4, contentWidth, 20, accent);
    drawText('Найменування', col.name.x + 4, y + 3, { size: 8, font: boldFont, color: white });
    drawText('К-сть', col.qty.x + col.qty.w / 2, y + 3, { size: 8, font: boldFont, color: white, align: 'center' });
    drawText('Ціна', col.price.x + col.price.w, y + 3, { size: 8, font: boldFont, color: white, align: 'right' });
    drawText('Сума', col.total.x + col.total.w, y + 3, { size: 8, font: boldFont, color: white, align: 'right' });
    y -= 18;

    const drawGroupLabel = (label: string, py: number) => {
      drawText(label, col.name.x + 4, py, { size: 7.5, font: boldFont, color: accent });
    };

    const drawRow = (item: InvoiceLineItem, py: number, even: boolean) => {
      if (even) drawRect(margin, py - 4, contentWidth, 18, lightGray);
      drawText(item.name, col.name.x + 4, py + 2, { size: 9, maxWidth: col.name.w - 8 });
      drawText(String(item.quantity), col.qty.x + col.qty.w / 2, py + 2, { size: 9, align: 'center' });
      drawText(`${this.fmt(item.unitPrice)} ₴`, col.price.x + col.price.w, py + 2, { size: 9, align: 'right' });
      drawText(`${this.fmt(item.quantity * item.unitPrice)} ₴`, col.total.x + col.total.w, py + 2, {
        size: 9, font: boldFont, align: 'right',
      });
      drawLine(margin, py - 4, pageWidth - margin, py - 4, borderGray);
    };

    let rowIdx = 0;

    if (data.services.length > 0) {
      drawGroupLabel('ПОСЛУГИ', y);
      y -= 16;
      for (const item of data.services) {
        drawRow(item, y, rowIdx % 2 === 0);
        y -= 18;
        rowIdx++;
      }
    }

    if (data.parts.length > 0) {
      drawGroupLabel('ЗАПЧАСТИНИ', y);
      y -= 16;
      for (const item of data.parts) {
        drawRow(item, y, rowIdx % 2 === 0);
        y -= 18;
        rowIdx++;
      }
    }

    // ── TOTAL ───────────────────────────────────────────────────────────────
    y -= 4;
    drawLine(margin, y, pageWidth - margin, y, borderGray);
    y -= 18;
    drawText('Разом до сплати', margin, y, { size: 12, font: boldFont });
    drawText(`${this.fmt(data.totalAmount)} ₴`, pageWidth - margin, y, {
      size: 14, font: boldFont, color: accent, align: 'right',
    });

    // ── FOOTER ──────────────────────────────────────────────────────────────
    drawRect(0, 0, pageWidth, 30, lightGray);
    drawLine(0, 30, pageWidth, 30, borderGray);
    drawText(footerNote, margin, 10, { size: 9, color: gray });

    const pdfBytes = await doc.save();
    return Buffer.from(pdfBytes);
  }

  private fmt(amount: number): string {
    return amount.toFixed(2);
  }
}

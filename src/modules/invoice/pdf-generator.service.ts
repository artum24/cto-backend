import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

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

@Injectable()
export class PdfGeneratorService {
  async generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
    const accent = data.accentColor ?? '#2563eb';
    const footerNote = data.footerNote ?? 'Дякуємо за довіру!';
    const dateStr = data.createdAt.toLocaleDateString('uk-UA');

    const vehicleStr = [data.vehicle.makeName, data.vehicle.modelName, data.vehicle.year]
      .filter(Boolean)
      .join(' ');

    const addr = [data.company.city, data.company.address].filter(Boolean).join(', ');

    const renderRows = (items: InvoiceLineItem[]) =>
      items
        .map(
          (item, i) => `
          <tr class="${i % 2 === 0 ? 'row-even' : ''}">
            <td>${item.name}</td>
            <td class="center">${item.quantity}</td>
            <td class="right">${this.fmt(item.unitPrice)} ₴</td>
            <td class="right bold">${this.fmt(item.quantity * item.unitPrice)} ₴</td>
          </tr>`,
        )
        .join('');

    const html = `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8" />
  <style>
    @page { margin: 0; size: A4; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background: #f8fafc; color: #0f172a; font-size: 13px; }

    .card { background: #fff; min-height: 100vh; }

    .header { padding: 20px 24px; background-color: ${accent}; color: #fff; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .logo { height: 36px; width: auto; padding: 4px; background: rgba(255,255,255,0.12); border-radius: 6px; }
    .header-title { font-size: 18px; font-weight: 700; }
    .header-right { text-align: right; font-size: 12px; opacity: 0.92; }

    .divider { margin: 0 24px; height: 1px; background: #e5e7eb; }

    .section { padding: 14px 24px; }
    .section-title { font-weight: 700; margin-bottom: 6px; font-size: 13px; }
    .muted { color: #6b7280; font-size: 12px; }

    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background-color: ${accent}; color: #fff; padding: 7px 8px; text-align: left; font-weight: 600; font-size: 11px; }
    th.right, td.right { text-align: right; }
    th.center, td.center { text-align: center; }
    td { padding: 7px 8px; }
    tr.row-even td { background: #f9fafb; }
    .bold { font-weight: 700; }

    .group-label { font-size: 10px; font-weight: 700; color: ${accent}; padding: 6px 8px 3px; letter-spacing: 0.05em; }

    .total-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 24px; font-weight: 700; font-size: 15px; }
    .total-amount { color: ${accent}; font-size: 17px; }

    .company-info { font-size: 11px; color: #6b7280; margin-top: 3px; }

    .footer { padding: 12px 24px; background: #f8fafc; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
<div class="card">

  <div class="header">
    <div class="header-left">
      ${data.logoUrl ? `<img src="${data.logoUrl}" alt="Logo" class="logo" />` : ''}
      <div>
        <div class="header-title">${data.company.title || 'Замовлення-наряд'}</div>
        ${addr ? `<div class="company-info" style="color:rgba(255,255,255,0.8)">${addr}</div>` : ''}
        ${data.company.phone ? `<div class="company-info" style="color:rgba(255,255,255,0.8)">${data.company.phone}</div>` : ''}
      </div>
    </div>
    <div class="header-right">
      <div>№ ZN-${data.invoiceId}</div>
      <div>від ${dateStr}</div>
    </div>
  </div>

  <div class="section two-col">
    <div>
      <div class="section-title">Клієнт</div>
      <div>${data.client.name}</div>
      ${data.client.phone ? `<div class="muted">${data.client.phone}</div>` : ''}
    </div>
    <div>
      <div class="section-title">Авто</div>
      <div>${vehicleStr || '—'}</div>
      ${data.vehicle.number ? `<div class="muted">${data.vehicle.number}</div>` : ''}
    </div>
  </div>

  <div class="divider"></div>

  <div class="section">
    ${data.taskTitle ? `<div class="muted" style="margin-bottom:10px">Наряд: ${data.taskTitle}</div>` : ''}

    <table>
      <thead>
        <tr>
          <th>Найменування</th>
          <th class="center" style="width:50px">К-сть</th>
          <th class="right" style="width:90px">Ціна</th>
          <th class="right" style="width:90px">Сума</th>
        </tr>
      </thead>
      <tbody>
        ${
          data.services.length > 0
            ? `<tr><td colspan="4" class="group-label">ПОСЛУГИ</td></tr>${renderRows(data.services)}`
            : ''
        }
        ${
          data.parts.length > 0
            ? `<tr><td colspan="4" class="group-label">ЗАПЧАСТИНИ</td></tr>${renderRows(data.parts)}`
            : ''
        }
      </tbody>
    </table>
  </div>

  <div class="divider"></div>

  <div class="total-row">
    <span>Разом до сплати</span>
    <span class="total-amount">${this.fmt(data.totalAmount)} ₴</span>
  </div>

  <div class="footer">${footerNote}</div>

</div>
</body>
</html>`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      const pdf = await page.pdf({ format: 'A4', printBackground: true });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private fmt(amount: number): string {
    return amount.toFixed(2);
  }
}

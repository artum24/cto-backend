import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { XlsxProcessorService } from './xlsx-processor.service';

@Injectable()
export class UploadService {
  constructor(private readonly xlsxProcessor: XlsxProcessorService) {}

  /**
   * Import runs in the same request; report is written before return (dataErrors(jobId) is ready immediately).
   */
  async importXlsxClients(
    fileBuffer: Buffer,
    companyId: bigint,
  ): Promise<{ jobId: string; errorCount: number }> {
    const jobId = randomUUID();
    const { errorCount } = await this.xlsxProcessor.processImport(
      jobId,
      fileBuffer,
      companyId,
    );
    return { jobId, errorCount };
  }
}

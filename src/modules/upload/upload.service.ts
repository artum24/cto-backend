import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';

export const XLSX_IMPORT_EVENT = 'xlsx.import';

export interface XlsxImportPayload {
  jobId: string;
  fileBuffer: Buffer;
  companyId: bigint;
}

@Injectable()
export class UploadService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async enqueueXlsxImport(fileBuffer: Buffer, companyId: bigint): Promise<string> {
    const jobId = randomUUID();

    // Emit async — processing happens in background, request returns immediately
    this.eventEmitter.emit(XLSX_IMPORT_EVENT, {
      jobId,
      fileBuffer,
      companyId,
    } satisfies XlsxImportPayload);

    return jobId;
  }
}

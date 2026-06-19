import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NhtsaSyncService } from './nhtsa-sync.service';

@Injectable()
export class NhtsaSyncJob {
  private readonly logger = new Logger(NhtsaSyncJob.name);
  private running = false;

  constructor(private readonly syncService: NhtsaSyncService) {}

  // Every Sunday at 03:00 UTC
  @Cron('0 3 * * 0')
  async handleCron() {
    if (this.running) {
      this.logger.warn('NHTSA sync already in progress, skipping');
      return;
    }
    this.running = true;
    try {
      await this.syncService.syncAll();
    } catch (err) {
      this.logger.error('NHTSA sync failed', err);
    } finally {
      this.running = false;
    }
  }
}

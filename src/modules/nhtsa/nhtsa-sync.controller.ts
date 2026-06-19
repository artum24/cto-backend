import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { NhtsaSyncService } from './nhtsa-sync.service';

/**
 * Manual trigger for the NHTSA sync job.
 * Protect this endpoint with IP allowlist or API key at the infra level
 * (Railway/nginx/Vercel) — it's not authenticated via Supabase JWT.
 */
@Controller('admin/nhtsa')
export class NhtsaSyncController {
  constructor(private readonly syncService: NhtsaSyncService) {}

  @Post('sync')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerSync() {
    // Fire and forget — sync can take minutes
    void this.syncService.syncAll();
    return { message: 'NHTSA sync started' };
  }
}

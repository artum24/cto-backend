import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * `createClient` appends `/auth/v1`, `/rest/v1`, etc. If env already includes a
 * service suffix, requests become `.../auth/v1/auth/v1/...` and responses are often
 * non-JSON → `Unexpected non-whitespace character after JSON`.
 */
export function normalizeSupabaseProjectUrl(raw: string): string {
  let u = raw.trim().replace(/\/+$/, '');
  const suffixes = [
    '/auth/v1',
    '/rest/v1',
    '/storage/v1',
    '/realtime/v1',
    '/functions/v1',
  ];
  for (const s of suffixes) {
    if (u.toLowerCase().endsWith(s.toLowerCase())) {
      u = u.slice(0, -s.length).replace(/\/+$/, '');
    }
  }
  return u;
}

@Injectable()
export class SupabaseAdminClient {
  private static readonly logger = new Logger(SupabaseAdminClient.name);
  client: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    const rawUrl = this.config.get<string>('SUPABASE_URL');
    const serviceRole = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!rawUrl || !serviceRole) {
      throw new Error('Supabase admin credentials are not configured');
    }

    const url = normalizeSupabaseProjectUrl(rawUrl);
    if (url !== rawUrl.trim().replace(/\/+$/, '')) {
      SupabaseAdminClient.logger.warn(
        `SUPABASE_URL was normalized to project root "${url}" (remove /auth/v1, /rest/v1, etc. from env to avoid duplicate path segments).`,
      );
    }

    this.client = createClient(url, serviceRole, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }) as SupabaseClient;
  }
}

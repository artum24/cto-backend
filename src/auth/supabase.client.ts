import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseAdminClient {
  client: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const serviceRole = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !serviceRole) {
      throw new Error('Supabase admin credentials are not configured');
    }

    this.client = createClient(url, serviceRole, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }) as SupabaseClient;
  }
}

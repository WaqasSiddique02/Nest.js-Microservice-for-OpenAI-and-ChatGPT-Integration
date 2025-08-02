import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabaseClient: SupabaseClient;

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase URL or Key not defined in environment variables.',
      );
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  async getAllFromTable(table: string) {
    const { data, error } = await this.supabaseClient.from(table).select('*');
    if (error) {
      throw new Error('Eror fetching data from table: ' + error.message);
    }
    return data;
  }

  async insertIntoTable(table: string, payload: Record<string, any>) {
    const { data, error } = await this.supabaseClient
      .from(table)
      .insert([payload]);
    if (error) {
      throw new Error(`Supabase insert error: ${error.message}`);
    }
    return data;
  }
}

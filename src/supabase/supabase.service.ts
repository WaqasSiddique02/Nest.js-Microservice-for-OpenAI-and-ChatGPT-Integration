import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

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

  async uploadAudio(userId: number, buffer: Buffer): Promise<string> {
    const filename = `${userId}/${uuidv4()}.mp3`;

    const { error } = await this.supabaseClient.storage
      .from('audios')
      .upload(filename, buffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (error) {
      throw new Error('Failed to upload audio: ' + error.message);
    }

    return filename;
  }

  async getUrl(bucket: string, path: string): Promise<string> {
    const { data } = this.supabaseClient.storage
      .from(bucket)
      .getPublicUrl(path);

    if (!data.publicUrl) {
      throw new Error('Failed to generate public URL');
    }

    return data.publicUrl;
  }
}

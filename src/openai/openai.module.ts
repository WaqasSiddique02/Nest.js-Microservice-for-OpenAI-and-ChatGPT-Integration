import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { OpenaiController } from './openai.controller';
import OpenAI from 'openai';

@Module({
  providers: [
    OpenaiService,
    SupabaseService,
    {
      provide: OpenAI,
      useFactory: () => {
        return new OpenAI({
          apiKey: process.env.OPEN_AI_SECRET_KEY,
        });
      },
    },
  ],
  exports: [OpenaiService],
  controllers: [OpenaiController],
})
export class OpenaiModule {}

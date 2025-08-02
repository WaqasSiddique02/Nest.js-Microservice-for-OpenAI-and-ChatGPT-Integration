import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import OpenAIApi from 'openai';
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources';

type Message = {
  text: string;
  ai?: boolean;
};

@Injectable()
export class OpenaiService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly openai: OpenAIApi,
  ) {
    this.openai = new OpenAIApi({
      apiKey: process.env.OPEN_AI_SECRET_KEY,
    });
  }

  async chatGptResponse(prompt: string, messages: Message[]): Promise<string> {
    try {
      const history = messages.map(
        (message): ChatCompletionMessageParam => ({
          role: message.ai ? 'assistant' : 'user',
          content: message.text,
        }),
      );

      // Make a request to the ChatGPT model
      const completion: ChatCompletion =
        await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: prompt,
            },
            ...history,
          ],
          temperature: 0.5,
          max_tokens: 1000,
        });

      const [content] = completion.choices.map(
        (choice) => choice.message.content ?? '',
      );

      return content;
    } catch (e) {
      // Log and propagate the error
      console.error(e);
      throw new ServiceUnavailableException('Failed request to ChatGPT');
    }
  }
}

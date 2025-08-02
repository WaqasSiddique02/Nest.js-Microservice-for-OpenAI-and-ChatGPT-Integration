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
          model: 'gpt-3.5-turbo',
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

  async synthesizeSpeech(userId: number, text: string): Promise<string> {
    try {
      // 1. Call OpenAI TTS API
      const ttsResponse = await this.openai.audio.speech.create({
        input: text,
        model: 'tts-1-hd',
        voice: 'alloy',
      });

      // 2. Convert response to array buffer
      const arrayBuffer = await ttsResponse.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      // 3. Upload to Supabase
      const filename = await this.supabaseService.uploadAudio(
        userId,
        audioBuffer,
      );

      // 4. Get public URL from Supabase
      const audioUrl = await this.supabaseService.getUrl('audios', filename);

      return audioUrl;
    } catch (e) {
      console.error(e);
      throw new ServiceUnavailableException('Failed to synthesize speech');
    }
  }

  async transcribeAudio(
    audioBuffer: Buffer,
    language: string,
  ): Promise<string> {
    // Convert the audio buffer to a file object
    const blob = new Blob([audioBuffer], {
      type: 'audio/wav',
    });
    const file = new File([blob], 'input.wav', { type: 'audio/wav' });

    try {
      // Make a request to the Whisper model for audio transcription
      const whisperResponse = await this.openai.audio.transcriptions.create({
        model: 'whisper-1',
        language,
        file,
        response_format: 'json',
      });

      // Return the transcribed text
      return whisperResponse.text;
    } catch (e) {
      // Log and propagate the error
      console.error(e);
      throw new ServiceUnavailableException('Failed to transcribe audio');
    }
  }

  async chatGptVision(text: string, url: string): Promise<string> {
    try {
      // Make a request to the ChatGPT Vision model
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text },
              { type: 'image_url', image_url: { url, detail: 'high' } },
            ],
          },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      });

      // Extract the content from the response
      const [content] = completion.choices.map(
        (choice) => choice.message.content ?? '',
      );

      return content;
    } catch (e) {
      // Log and propagate the error
      console.error(e);
      throw new ServiceUnavailableException('Unable to recognize image');
    }
  }

  async generateImage(text: string): Promise<string> {
    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: text,
        response_format: 'url',
      });

      const data = response?.data;
      const imageUrl = data?.[0]?.url;

      if (!imageUrl) {
        throw new Error('Image URL is undefined');
      }

      return imageUrl;
    } catch (e) {
      console.error(e);
      throw new ServiceUnavailableException('Failed to generate image');
    }
  }
}

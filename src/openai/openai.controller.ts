import { Body, Controller, Post } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('OpenAI')
@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Get ChatGPT response' })
  @ApiBody({
    schema: {
      example: {
        prompt: 'You are a helpful assistant.',
        messages: [
          { text: 'Hello', ai: false },
          { text: 'Hi there! How can I help?', ai: true },
        ],
      },
    },
  })
  async chat(
    @Body()
    body: {
      prompt: string;
      messages: { text: string; ai?: boolean }[];
    },
  ) {
    return this.openaiService.chatGptResponse(body.prompt, body.messages);
  }

  @Post('speech')
  @ApiOperation({ summary: 'Convert text to speech and upload to Supabase' })
  @ApiBody({
    schema: {
      example: {
        userId: 123,
        text: 'Hello, this is a test of the speech synthesizer.',
      },
    },
  })
  async synthesize(@Body() body: { userId: number; text: string }) {
    return this.openaiService.synthesizeSpeech(body.userId, body.text);
  }

  @Post('vision')
  @ApiOperation({ summary: 'Use GPT-4 Vision to analyze an image' })
  @ApiBody({
    schema: {
      example: {
        text: 'Describe what you see in this image.',
        url: 'https://example.com/image.png',
      },
    },
  })
  async vision(@Body() body: { text: string; url: string }) {
    return this.openaiService.chatGptVision(body.text, body.url);
  }

  @Post('image')
  @ApiOperation({ summary: 'Generate an image using DALL·E 3' })
  @ApiBody({
    schema: {
      example: {
        prompt: 'A futuristic city with flying cars',
      },
    },
  })
  async generate(@Body() body: { prompt: string }) {
    return this.openaiService.generateImage(body.prompt);
  }
}

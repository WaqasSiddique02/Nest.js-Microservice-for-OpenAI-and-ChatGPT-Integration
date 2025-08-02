import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const corsOptions: CorsOptions = {
    origin: 'http://localhost:3000', // Specify the front-end URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    maxAge: 24 * 60 * 60 * 5, // Set the maximum age of preflight requests to 5 days
  };

  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('OpenAI API')
    .setDescription('API for GPT, Vision, TTS, and Image Gen')
    .setVersion('1.0')
    .addTag('OpenAI')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.enableCors(corsOptions);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000).then(() => {
    console.log('Server running on http://localhost:3000');
  });
}
bootstrap();

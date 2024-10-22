// src/main.ts
import * as dotenv from 'dotenv'; // Ensure dotenv is imported first
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  dotenv.config();

  console.log('MONGODB_URI:', process.env.MONGODB_URI);

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT || 3000);
}

bootstrap();

import {
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
  );

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin:
      process.env.FRONTEND_URL ||
      'http://localhost:3000',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = Number(
    process.env.PORT || 3001,
  );

  await app.listen(port);

  console.log(
    `Application is running on: ${await app.getUrl()}`,
  );
}

void bootstrap();

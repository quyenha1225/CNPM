import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function normalizeOrigin(value: string) {
  return value.trim().replace(/\/+$/, '');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const expressApp = app.getHttpAdapter().getInstance();

  if (parseBoolean(process.env.TRUST_PROXY, process.env.NODE_ENV === 'production')) {
    expressApp.set('trust proxy', 1);
  }

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

  const configuredOrigins = (
    process.env.FRONTEND_URLS ||
    process.env.FRONTEND_URL ||
    'http://localhost:3000'
  )
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      // Cho phép Postman, curl và server-to-server không gửi Origin.
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalized = normalizeOrigin(origin);

      if (configuredOrigins.includes(normalized)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS không cho phép origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  const apiPrefix = String(process.env.API_PREFIX || 'api')
    .trim()
    .replace(/^\/+|\/+$/g, '');

  app.setGlobalPrefix(apiPrefix);

  const port = Number(process.env.PORT || 3001);
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);

  const publicUrl =
    process.env.PUBLIC_BACKEND_URL || `http://localhost:${port}`;

  console.log(
    `Application is running on: ${publicUrl.replace(/\/+$/, '')}/${apiPrefix}`,
  );
}

bootstrap().catch((error) => {
  console.error('Không thể khởi động backend:', error);
  process.exit(1);
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật CORS cho phép Frontend kết nối
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });

  // Chạy backend ở port 3001 để tránh trùng với ReactJS
  app.setGlobalPrefix('api');
  await app.listen(3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

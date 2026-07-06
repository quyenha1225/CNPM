import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesController } from './categories/categories.controller';
import { AiController } from './ai/ai.controller';

@Module({
  imports: [
    // 1. Cấu hình để NestJS có thể đọc được các biến từ file .env
    ConfigModule.forRoot({
      isGlobal: true, // Để tất cả các module khác trong dự án đều dùng được file .env
    }),
    // 2. Cấu hình kết nối cơ sở dữ liệu MySQL bằng TypeORM
    TypeOrmModule.forRoot({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '', 10) || 3306,

  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true, 
}),

    UsersModule,
    AuthModule,
    ProductsModule,
  ],
  controllers: [AppController, CategoriesController, AiController],
  providers: [AppService],
})
export class AppModule {}
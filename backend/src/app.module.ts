import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
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
      port: parseInt(process.env.DB_PORT || '3306', 10), // Đã sửa lỗi TypeScript tại đây bằng cách thêm fallback string
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,

      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Lưu ý: Tự động đồng bộ cấu trúc bảng từ Entity vào DB (chế độ Dev)
    }),

    UsersModule,
    AuthModule,
    ProductsModule,
    CartModule,
  ],
  controllers: [AppController, CategoriesController, AiController],
  providers: [AppService],
})
export class AppModule {}
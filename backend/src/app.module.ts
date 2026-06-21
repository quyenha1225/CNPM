import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

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
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      
      // Tự động quét và tìm các file cấu hình bảng dữ liệu (.entity.ts)
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      
      // synchronize: true giúp tự động tạo bảng trong MySQL dựa vào code Entity khi bạn code. 
      // (Tính năng này rất tiện khi đang học/phát triển dự án)
      synchronize: true, 
    }),

    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
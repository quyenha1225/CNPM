import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { CategoriesModule } from './categories/categories.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,

      entities: [__dirname + '/**/*.entity{.ts,.js}'],

      /*
       * Database đã được tạo bằng SQL thủ công.
       * Tắt synchronize để TypeORM không tự ý sửa cấu trúc bảng.
       */
      synchronize: false,
    }),

    UsersModule,
    AuthModule,
    ProductsModule,
    CartModule,
    CategoriesModule,
    AiModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}
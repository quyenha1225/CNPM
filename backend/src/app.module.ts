import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { StaffModule } from './staff/staff.module';
import { UsersModule } from './users/users.module';

// Import 2 module mới tạo
import { PaymentModule } from './payment/payment.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: Number.parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'electroshop_db',

      entities: [`${__dirname}/**/*.entity{.ts,.js}`],

      /*
       * Database được quản lý bằng SQL thủ công.
       * Không bật synchronize để tránh TypeORM tự sửa/xóa bảng.
       */
      synchronize: false,

      retryAttempts: 5,
      retryDelay: 3000,
      charset: 'utf8mb4',
      logging: false,
    }),

    UsersModule,
    AuthModule,
    ProductsModule,
    CartModule,
    CategoriesModule,
    AiModule,

    // Đăng ký 2 module mới vào hệ thống
    PaymentModule,
    OrdersModule,

    /*
     * STAFF và ADMIN là hai module độc lập.
     */
    StaffModule,
    AdminModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}

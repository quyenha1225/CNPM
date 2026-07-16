import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CartService {
  constructor(private dataSource: DataSource) {}

  async saveCart(userId: number, cartItems: any[]) {
    // Save cart items logic - có thể lưu vào session hoặc DB
    // Hiện tại frontend lưu ở localStorage nên API này chỉ log
    return {
      success: true,
      message: 'Cart saved successfully',
      userId,
      itemsCount: cartItems.length,
    };
  }

  async getCart(userId: number) {
    // Retrieve cart - hiện tại frontend quản lý localStorage
    return {
      success: true,
      items: [],
    };
  }
}

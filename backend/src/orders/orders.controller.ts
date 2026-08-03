import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('user/:userId')
  async getUserOrders(@Param('userId', ParseIntPipe) userId: number) {
    return this.ordersService.getUserOrders(userId);
  }

  @Get(':orderCode')
  async getOrderDetail(@Param('orderCode') orderCode: string) {
    return this.ordersService.getOrderDetail(orderCode);
  }
}
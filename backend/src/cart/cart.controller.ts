import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async saveCart(
    @Body() body: { userId: number; items: any[] }
  ) {
    return await this.cartService.saveCart(body.userId, body.items);
  }

  @Get(':userId')
  async getCart(@Request() req: any) {
    const userId = req.params.userId;
    return await this.cartService.getCart(userId);
  }
}

import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getAllProducts() {
    return await this.productsService.findAll();
  }

  // THÊM API GHI NHẬT KÝ XEM
  @Post('log-view')
  async logProductView(@Body() body: { userId: number; productId: number }) {
    return await this.productsService.logView(body.userId, body.productId);
  }

  @Get('recommend/:id')
  async getRecommendations(@Param('id') id: string) {
    return await this.productsService.getRecommendedProducts(Number(id));
  }
}
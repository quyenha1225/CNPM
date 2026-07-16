import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getAllProducts() {
    return await this.productsService.findAll();
  }

  // Chi tiet 1 san pham - ProductDetail.jsx goi endpoint nay
  @Get(':id')
  async getProductDetail(@Param('id') id: string) {
    return await this.productsService.findOne(Number(id));
  }

  // GHI NHAT KY XEM
  @Post('log-view')
  async logProductView(@Body() body: { userId: number; productId: number }) {
    return await this.productsService.logView(body.userId, body.productId);
  }

  @Get('recommend/:id')
  async getRecommendations(@Param('id') id: string) {
    return await this.productsService.getRecommendedProducts(Number(id));
  }

  // ===================== REVIEWS =====================

  @Get(':id/reviews')
  async getProductReviews(@Param('id') id: string) {
    return await this.productsService.getReviews(Number(id));
  }

  // TODO: khi ban gan JWT auth guard vao du an, thay body.userId bang
  // userId lay tu @Req() req.user.userId de tranh client tu xung la ai cung duoc.
  @Post(':id/reviews')
  async createProductReview(
    @Param('id') id: string,
    @Body()
    body: {
      userId: number;
      rating: number;
      title?: string;
      content?: string;
      orderId?: number;
    },
  ) {
    return await this.productsService.createReview(
      Number(id),
      body.userId,
      body.rating,
      body.title ?? '',
      body.content ?? '',
      body.orderId ?? null,
    );
  }
}
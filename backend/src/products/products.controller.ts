import { Controller, Get } from '@nestjs/common';
@Controller('products')
export class ProductsController {
  @Get('test')
  testProducts() {
    return { message: 'Products API is working!' };
  }
}
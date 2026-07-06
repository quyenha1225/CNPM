import { Controller, Get } from '@nestjs/common';
@Controller('categories')
export class CategoriesController {
  @Get('test')
  testCategories() {
    return { message: 'Categories API is working!' };
  }
}
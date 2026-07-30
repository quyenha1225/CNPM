import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { ProductCatalogService } from './product-catalog.service';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productCatalogService: ProductCatalogService,
  ) {}

  // Giữ endpoint cũ để Landing và các màn hình hiện tại không bị hỏng.
  @Get()
  async getAllProducts() {
    return this.productsService.findAll();
  }

  // Phân trang/lọc/sắp xếp tại backend.
  // GET /api/products/catalog?page=1&limit=12&category=laptop
  @Get('catalog')
  async getCatalog(@Query() query: CatalogQueryDto) {
    return this.productCatalogService.findCatalog(query);
  }

  // Top bán chạy thật, chỉ tính đơn DELIVERED.
  // Phải đặt trước @Get(':id').
  @Get('top-selling')
  async getTopSellingProducts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number,
  ) {
    return this.productCatalogService.getTopSelling(limit);
  }

  @Get('recommend/:id')
  async getRecommendations(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.getRecommendedProducts(id);
  }

  @Get(':id/reviews')
  async getProductReviews(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.getReviews(id);
  }

  // Route động luôn để sau các route GET cụ thể.
  @Get(':id')
  async getProductDetail(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.findOne(id);
  }

  @Post('log-view')
  async logProductView(
    @Body() body: { userId: number; productId: number },
  ) {
    return this.productsService.logView(
      Number(body.userId),
      Number(body.productId),
    );
  }

  @Post(':id/reviews')
  async createProductReview(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      userId: number;
      rating: number;
      title?: string;
      content?: string;
      orderId?: number;
    },
  ) {
    return this.productsService.createReview(
      id,
      Number(body.userId),
      Number(body.rating),
      body.title?.trim() ?? '',
      body.content?.trim() ?? '',
      body.orderId ? Number(body.orderId) : null,
    );
  }
}

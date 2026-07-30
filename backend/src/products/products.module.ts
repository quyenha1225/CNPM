import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductCatalogService } from './product-catalog.service';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductCatalogService],
  exports: [ProductsService, ProductCatalogService],
})
export class ProductsModule {}

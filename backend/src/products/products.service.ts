import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(private dataSource: DataSource) {}

  async findAll() {
    // Viết câu lệnh SQL Join các bảng products, categories, brands, và product_images
    // Cấu trúc cột trả ra (id, name, price, category, brand, image_url) được thiết kế để khớp 100% với Frontend của bạn
    const query = `
      SELECT 
        p.product_id AS id, 
        p.product_name AS name, 
        p.base_price AS price, 
        c.category_slug AS category, 
        b.brand_name AS brand, 
        pi.image_url,
        0 AS percent_off 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN (
        SELECT product_id, MIN(image_url) AS image_url
        FROM product_images
        WHERE is_thumbnail = TRUE
        GROUP BY product_id
      ) pi ON p.product_id = pi.product_id
      WHERE p.product_status = 'ACTIVE'
    `;
    
    const products = await this.dataSource.query(query);
    return products;
  }
}

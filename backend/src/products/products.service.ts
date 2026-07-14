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
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = TRUE
      WHERE p.product_status = 'ACTIVE'
    `;

    const products = await this.dataSource.query(query);
    return products;
  }

  // Thêm hàm này vào class ProductsService
  async getRecommendedProducts(productId: number) {
    return await this.dataSource.query(
      `
      SELECT p.product_id AS id, p.product_name AS name, p.base_price AS price, pi.image_url
      FROM products p
      JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = TRUE
      WHERE p.product_id IN (
        SELECT DISTINCT product_id 
        FROM user_view_history 
        WHERE user_id IN (
          SELECT user_id FROM user_view_history WHERE product_id = ?
        ) 
        AND product_id != ?
      )
      LIMIT 4; -- Lấy tối đa 4 sản phẩm gợi ý
    `,
      [productId, productId],
    );
  }

  async logView(userId: number, productId: number) {
    return await this.dataSource.query(
      `INSERT INTO user_view_history (user_id, product_id) VALUES (?, ?)`,
      [userId, productId],
    );
  }
}
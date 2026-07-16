import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(private dataSource: DataSource) {}

  async findAll() {
    // Da them p.average_rating va p.review_count de Product.jsx hien thi sao + so danh gia.
    const query = `
      SELECT 
        p.product_id AS id, 
        p.product_name AS name, 
        p.base_price AS price, 
        c.category_slug AS category, 
        b.brand_name AS brand, 
        pi.image_url,
        0 AS percent_off,
        p.average_rating AS rating,
        p.review_count AS reviewCount
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = TRUE
      WHERE p.product_status = 'ACTIVE'
    `;

    const products = await this.dataSource.query(query);
    return products;
  }

  // Chi tiet 1 san pham - dung cho ProductDetail.jsx (them rating/reviewCount)
  async findOne(productId: number) {
    const rows = await this.dataSource.query(
      `
      SELECT 
        p.product_id AS id, 
        p.product_name AS name, 
        p.product_description AS description,
        p.base_price AS price, 
        p.warranty_months AS warrantyMonths,
        c.category_slug AS category, 
        b.brand_name AS brand, 
        pi.image_url,
        p.average_rating AS rating,
        p.review_count AS reviewCount
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = TRUE
      WHERE p.product_id = ? AND p.product_status = 'ACTIVE'
      LIMIT 1
      `,
      [productId],
    );
    return rows[0] ?? null;
  }

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
      LIMIT 4; -- Lay toi da 4 san pham goi y
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

  // ===================== REVIEWS =====================

  // Danh sach danh gia cua 1 san pham - dung cho ReviewList.jsx
  async getReviews(productId: number) {
    return await this.dataSource.query(
      `
      SELECT
        r.review_id AS id,
        r.rating,
        r.review_title AS title,
        r.review_content AS content,
        r.is_verified_purchase AS isVerifiedPurchase,
        r.helpful_count AS helpfulCount,
        r.created_at AS createdAt,
        u.user_full_name AS userName
      FROM product_reviews r
      JOIN users u ON u.user_id = r.user_id
      WHERE r.product_id = ? AND r.review_status = 'APPROVED'
      ORDER BY r.created_at DESC
      `,
      [productId],
    );
  }

  // Tao danh gia moi - dung cho ReviewForm.jsx
  // userId lay tu JWT o controller, KHONG nhan truc tiep tu body cua client
  async createReview(
    productId: number,
    userId: number,
    rating: number,
    title: string,
    content: string,
    orderId: number | null = null,
  ) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('rating phai tu 1 den 5');
    }

    const result = await this.dataSource.query(
      `
      INSERT INTO product_reviews
        (product_id, user_id, order_id, rating, review_title, review_content, is_verified_purchase, review_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
      `,
      [productId, userId, orderId, rating, title, content, orderId !== null],
    );

    // review_status mac dinh la PENDING (trigger o DB se cong vao average_rating/review_count
    // khi review duoc duyet sang APPROVED, xem file trigger.sql)
    return { insertId: result.insertId };
  }
}
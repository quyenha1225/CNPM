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
// Chi tiet 1 san pham - dung cho ProductDetail.jsx (them rating/reviewCount, specifications, variants)
  async findOne(productId: number) {
    // 1. Lấy thông tin cơ bản của sản phẩm (Kèm theo Tổng tồn kho từ View)
    const rows = await this.dataSource.query(
      `
      SELECT 
        p.product_id AS id, 
        p.product_name AS name, 
        p.product_description AS description,
        p.base_price AS price, 
        p.warranty_months AS warrantyMonths,
        c.category_name AS category, 
        b.brand_name AS brand, 
        pi.image_url,
        p.average_rating AS rating,
        p.review_count AS reviewCount,
        0 AS percent_off,
        COALESCE(vs.current_stock, 0) AS stock_quantity
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_thumbnail = TRUE
      LEFT JOIN vw_product_stock vs ON p.product_id = vs.product_id
      WHERE p.product_id = ? AND p.product_status = 'ACTIVE'
      LIMIT 1
      `,
      [productId],
    );

    const product = rows[0];
    if (!product) return null; // Trả về null nếu không tìm thấy

    // 2. Lấy danh sách Thông số kỹ thuật (Specifications)
    const specifications = await this.dataSource.query(
      `
      SELECT 
        pa.attribute_id, 
        pa.attribute_name, 
        pa.attribute_unit, 
        pa.spec_group, 
        pa.display_order, 
        pa.is_highlight, 
        pav.attribute_value
      FROM product_attribute_values pav
      JOIN product_attributes pa ON pav.attribute_id = pa.attribute_id
      WHERE pav.product_id = ?
      ORDER BY pa.display_order ASC
      `,
      [productId],
    );

    // 3. Lấy danh sách Cấu hình/Phiên bản (Variants kèm theo Tồn kho của từng bản)
    const variants = await this.dataSource.query(
      `
      SELECT 
        pv.variant_id, 
        pv.variant_name, 
        pv.sku, 
        pv.color, 
        pv.ram_size, 
        pv.storage_size, 
        pv.gpu_option, 
        pv.cpu_option, 
        pv.additional_price, 
        pv.is_default,
        COALESCE(vi.stock_quantity, 0) AS stock_quantity
      FROM product_variants pv
      LEFT JOIN variant_inventory vi ON pv.variant_id = vi.variant_id
      WHERE pv.product_id = ? AND pv.variant_status = 'ACTIVE'
      `,
      [productId],
    );

    // 4. Nhồi 2 mảng vừa lấy được vào trong object product ban đầu
    product.specifications = specifications;
    product.variants = variants;

    // Trả về dữ liệu hoàn chỉnh (Fulfilled object) cho Frontend
    return product;
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
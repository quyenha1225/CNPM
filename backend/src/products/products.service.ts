import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll() {
    const query = `
      SELECT
        p.product_id AS id,
        p.product_name AS name,
        p.product_slug AS slug,
        p.base_price AS price,

        c.category_slug AS category,
        b.brand_name AS brand,

        (
          SELECT pi_sub.image_url
          FROM product_images pi_sub
          WHERE pi_sub.product_id = p.product_id
            AND pi_sub.is_thumbnail = TRUE
          LIMIT 1
        ) AS image_url,

        0 AS percent_off,

        p.average_rating AS rating,
        p.review_count AS reviewCount,

        COALESCE(vps.current_stock, 0)
          AS stock_quantity

      FROM products p

      LEFT JOIN categories c
        ON c.category_id = p.category_id

      LEFT JOIN brands b
        ON b.brand_id = p.brand_id

      LEFT JOIN vw_product_stock vps
        ON vps.product_id = p.product_id

      WHERE p.product_status = 'ACTIVE'

      ORDER BY p.product_id ASC
    `;

    const products = await this.dataSource.query(query);

    return products.map((product: any) => ({
      ...product,
      id: Number(product.id),
      price: Number(product.price ?? 0),
      percent_off: Number(product.percent_off ?? 0),
      rating: Number(product.rating ?? 0),
      reviewCount: Number(product.reviewCount ?? 0),
      stock_quantity: Number(
        product.stock_quantity ?? 0,
      ),
    }));
  }

  async findOne(productId: number) {
    const rows = await this.dataSource.query(
      `
      SELECT
        p.product_id AS id,
        p.product_name AS name,
        p.product_slug AS slug,
        p.product_description AS description,
        p.base_price AS price,
        p.warranty_months AS warrantyMonths,

        c.category_name AS category,
        c.category_slug AS categorySlug,

        b.brand_name AS brand,

        (
          SELECT pi_sub.image_url
          FROM product_images pi_sub
          WHERE pi_sub.product_id = p.product_id
            AND pi_sub.is_thumbnail = TRUE
          LIMIT 1
        ) AS image_url,

        p.average_rating AS rating,
        p.review_count AS reviewCount,

        0 AS percent_off,

        COALESCE(vps.current_stock, 0)
          AS stock_quantity

      FROM products p

      LEFT JOIN categories c
        ON c.category_id = p.category_id

      LEFT JOIN brands b
        ON b.brand_id = p.brand_id

      LEFT JOIN vw_product_stock vps
        ON vps.product_id = p.product_id

      WHERE p.product_id = ?
        AND p.product_status = 'ACTIVE'

      LIMIT 1
      `,
      [productId],
    );

    const product = rows[0];

    if (!product) {
      return null;
    }

    product.id = Number(product.id);
    product.price = Number(product.price ?? 0);
    product.rating = Number(product.rating ?? 0);
    product.reviewCount = Number(
      product.reviewCount ?? 0,
    );
    product.percent_off = Number(
      product.percent_off ?? 0,
    );
    product.stock_quantity = Number(
      product.stock_quantity ?? 0,
    );

    const specifications =
      await this.dataSource.query(
        `
        SELECT
          pa.attribute_id,
          pa.attribute_code,
          pa.attribute_name,
          pa.attribute_unit,
          pa.spec_group,
          pa.display_order,
          pa.is_highlight,

          pav.attribute_value,
          pav.numeric_value,
          pav.boolean_value,
          pav.normalized_value

        FROM product_attribute_values pav

        JOIN product_attributes pa
          ON pa.attribute_id = pav.attribute_id

        WHERE pav.product_id = ?

        ORDER BY
          pa.spec_group ASC,
          pa.display_order ASC,
          pa.attribute_id ASC
        `,
        [productId],
      );

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

        COALESCE(
          vi.stock_quantity,
          0
        ) AS stock_quantity,

        COALESCE(
          vi.reserved_quantity,
          0
        ) AS reserved_quantity,

        GREATEST(
          COALESCE(vi.stock_quantity, 0)
          -
          COALESCE(vi.reserved_quantity, 0),
          0
        ) AS available_quantity

      FROM product_variants pv

      LEFT JOIN variant_inventory vi
        ON vi.variant_id = pv.variant_id

      WHERE pv.product_id = ?
        AND pv.variant_status = 'ACTIVE'

      ORDER BY
        pv.is_default DESC,
        pv.variant_id ASC
      `,
      [productId],
    );

    product.specifications = specifications;

    product.variants = variants.map(
      (variant: any) => ({
        ...variant,
        variant_id: Number(variant.variant_id),
        additional_price: Number(
          variant.additional_price ?? 0,
        ),
        stock_quantity: Number(
          variant.stock_quantity ?? 0,
        ),
        reserved_quantity: Number(
          variant.reserved_quantity ?? 0,
        ),
        available_quantity: Number(
          variant.available_quantity ?? 0,
        ),
      }),
    );

    return product;
  }

  async getRecommendedProducts(
    productId: number,
  ) {
    const products = await this.dataSource.query(
      `
      SELECT
        p.product_id AS id,
        p.product_name AS name,
        p.product_slug AS slug,
        p.base_price AS price,

        (
          SELECT pi_sub.image_url
          FROM product_images pi_sub
          WHERE pi_sub.product_id = p.product_id
            AND pi_sub.is_thumbnail = TRUE
          LIMIT 1
        ) AS image_url,

        COALESCE(vps.current_stock, 0)
          AS stock_quantity

      FROM products p

      LEFT JOIN vw_product_stock vps
        ON vps.product_id = p.product_id

      WHERE p.product_status = 'ACTIVE'
        AND p.product_id IN (
          SELECT DISTINCT uvh.product_id
          FROM user_view_history uvh

          WHERE uvh.user_id IN (
            SELECT uvh2.user_id
            FROM user_view_history uvh2
            WHERE uvh2.product_id = ?
          )

          AND uvh.product_id != ?
        )

      ORDER BY
        CASE
          WHEN COALESCE(
            vps.current_stock,
            0
          ) > 0
            THEN 0
          ELSE 1
        END ASC,

        p.average_rating DESC,
        p.product_id ASC

      LIMIT 4
      `,
      [productId, productId],
    );

    return products.map((product: any) => ({
      ...product,
      id: Number(product.id),
      price: Number(product.price ?? 0),
      stock_quantity: Number(
        product.stock_quantity ?? 0,
      ),
    }));
  }

  async logView(
    userId: number,
    productId: number,
  ) {
    return this.dataSource.query(
      `
      INSERT INTO user_view_history (
        user_id,
        product_id
      )
      VALUES (?, ?)
      `,
      [userId, productId],
    );
  }

  async getReviews(productId: number) {
    return this.dataSource.query(
      `
      SELECT
        r.review_id AS id,
        r.rating,
        r.review_title AS title,
        r.review_content AS content,
        r.is_verified_purchase
          AS isVerifiedPurchase,
        r.helpful_count AS helpfulCount,
        r.created_at AS createdAt,
        u.user_full_name AS userName

      FROM product_reviews r

      JOIN users u
        ON u.user_id = r.user_id

      WHERE r.product_id = ?
        AND r.review_status = 'APPROVED'

      ORDER BY r.created_at DESC
      `,
      [productId],
    );
  }

  async createReview(
    productId: number,
    userId: number,
    rating: number,
    title: string,
    content: string,
    orderId: number | null = null,
  ) {
    if (!Number.isInteger(rating)) {
      throw new BadRequestException(
        'rating phải là số nguyên.',
      );
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestException(
        'rating phải từ 1 đến 5.',
      );
    }

    const result = await this.dataSource.query(
      `
      INSERT INTO product_reviews (
        product_id,
        user_id,
        order_id,
        rating,
        review_title,
        review_content,
        is_verified_purchase,
        review_status
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, 'PENDING'
      )
      `,
      [
        productId,
        userId,
        orderId,
        rating,
        title,
        content,
        orderId !== null,
      ],
    );

    return {
      insertId: Number(result.insertId),
    };
  }
}
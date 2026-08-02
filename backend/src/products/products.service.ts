import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductCatalogService } from './product-catalog.service';


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

      COALESCE(b.brand_name, 'Gearxin') AS brand,

      COALESCE(
        (
          SELECT pi_thumbnail.image_url
          FROM product_images pi_thumbnail
          WHERE pi_thumbnail.product_id = p.product_id
            AND pi_thumbnail.is_thumbnail = TRUE
          ORDER BY
            pi_thumbnail.sort_order ASC,
            pi_thumbnail.image_id ASC
          LIMIT 1
        ),
        (
          SELECT pi_first.image_url
          FROM product_images pi_first
          WHERE pi_first.product_id = p.product_id
          ORDER BY
            pi_first.sort_order ASC,
            pi_first.image_id ASC
          LIMIT 1
        ),
        ''
      ) AS image_url,

      COALESCE(p.average_rating, 0) AS rating,
      COALESCE(p.average_rating, 0) AS average_rating,

      COALESCE(p.review_count, 0) AS reviewCount,
      COALESCE(p.review_count, 0) AS review_count,

      0 AS percent_off,

      COALESCE(vps.current_stock, 0) AS stock_quantity

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

  if (!rows.length) {
    return null;
  }

  const product = rows[0];

  /*
   * Database hiện tại chỉ có:
   * - pav.attribute_value
   *
   * Không có:
   * - pav.numeric_value
   * - pav.boolean_value
   * - pav.normalized_value
   * - pa.attribute_code
   */
  const specificationRows = await this.dataSource.query(
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

    INNER JOIN product_attributes pa
      ON pa.attribute_id = pav.attribute_id

    WHERE pav.product_id = ?

    ORDER BY
      COALESCE(pa.spec_group, 'Thông số khác') ASC,
      pa.display_order ASC,
      pa.attribute_id ASC
    `,
    [productId],
  );

  const variantRows = await this.dataSource.query(
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
        - COALESCE(vi.reserved_quantity, 0),
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

  return {
    ...product,

    id: Number(product.id),
    price: Number(product.price ?? 0),
    warrantyMonths: Number(product.warrantyMonths ?? 0),

    rating: Number(product.rating ?? 0),
    average_rating: Number(product.average_rating ?? 0),

    reviewCount: Number(product.reviewCount ?? 0),
    review_count: Number(product.review_count ?? 0),

    percent_off: Number(product.percent_off ?? 0),
    stock_quantity: Number(product.stock_quantity ?? 0),

    specifications: specificationRows.map(
      (specification: any) => ({
        ...specification,

        attribute_id: Number(
          specification.attribute_id,
        ),

        display_order: Number(
          specification.display_order ?? 0,
        ),

        is_highlight: Boolean(
          Number(specification.is_highlight ?? 0),
        ),
      }),
    ),

    variants: variantRows.map((variant: any) => ({
      ...variant,

      variant_id: Number(variant.variant_id),

      additional_price: Number(
        variant.additional_price ?? 0,
      ),

      is_default: Boolean(
        Number(variant.is_default ?? 0),
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
    })),
  };
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
    async getTopSelling(limit = 10) {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 20);

    const rows = await this.dataSource.query(`
      SELECT
        p.product_id AS id,
        p.product_name AS name,
        p.product_slug AS slug,
        p.product_description AS description,
        p.base_price AS price,
        c.category_slug AS category,
        c.category_name AS categoryName,
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
        COALESCE(vps.current_stock, 0) AS stock_quantity,
        COALESCE(
          SUM(
            CASE
              WHEN oi.order_id IS NOT NULL
                AND UPPER(os.order_status_code) NOT IN (
                  'CANCELLED',
                  'CANCELED',
                  'REFUNDED',
                  'FAILED'
                )
              THEN oi.ordered_quantity
              ELSE 0
            END
          ),
          0
        ) AS sold_count
      FROM products p
      LEFT JOIN categories c
        ON c.category_id = p.category_id
      LEFT JOIN brands b
        ON b.brand_id = p.brand_id
      LEFT JOIN vw_product_stock vps
        ON vps.product_id = p.product_id
      LEFT JOIN order_items oi
        ON oi.product_id = p.product_id
      LEFT JOIN orders o
        ON o.order_id = oi.order_id
      LEFT JOIN order_statuses os
        ON os.order_status_id = o.order_status_id
      WHERE p.product_status = 'ACTIVE'
      GROUP BY
        p.product_id,
        p.product_name,
        p.product_slug,
        p.product_description,
        p.base_price,
        c.category_slug,
        c.category_name,
        b.brand_name,
        p.average_rating,
        p.review_count,
        vps.current_stock
      ORDER BY
        sold_count DESC,
        p.average_rating DESC,
        p.product_id DESC
      LIMIT ${safeLimit}
    `);

    return rows.map((product: any) => ({
      ...product,
      id: Number(product.id),
      price: Number(product.price ?? 0),
      rating: Number(product.rating ?? 0),
      reviewCount: Number(product.reviewCount ?? 0),
      stock_quantity: Number(product.stock_quantity ?? 0),
      sold_count: Number(product.sold_count ?? 0),
    }));
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
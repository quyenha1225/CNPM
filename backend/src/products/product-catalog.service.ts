import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CatalogQueryDto } from './dto/catalog-query.dto';

type SqlParam = string | number;

type RawProductRow = {
  id: string | number;
  name: string;
  slug: string;
  description: string | null;
  price: string | number;
  rating: string | number | null;
  reviewCount: string | number | null;
  categoryName: string;
  category: string;
  brand: string | null;
  image_url: string | null;
  stock_quantity: string | number | null;
  totalSold: string | number | null;
};

@Injectable()
export class ProductCatalogService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * GET /api/products/catalog
   *
   * Hỗ trợ:
   * - page
   * - limit
   * - category
   * - brand
   * - search
   * - minPrice
   * - maxPrice
   * - sort
   */
  async findCatalog(query: CatalogQueryDto) {
    const requestedPage = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(query.limit) || 12, 1),
      48,
    );

    const whereConditions: string[] = [
      `p.product_status = 'ACTIVE'`,
      `c.category_status = 'ACTIVE'`,
    ];

    const params: SqlParam[] = [];

    const category = query.category?.trim();
    const brand = query.brand?.trim();
    const search = query.search?.trim();

    if (category) {
      whereConditions.push('c.category_slug = ?');
      params.push(category);
    }

    if (brand) {
      whereConditions.push(
        'LOWER(TRIM(b.brand_name)) = LOWER(TRIM(?))',
      );
      params.push(brand);
    }

    if (search) {
      const keyword = `%${search}%`;

      whereConditions.push(`
        (
          p.product_name LIKE ?
          OR p.product_slug LIKE ?
          OR COALESCE(p.product_description, '') LIKE ?
          OR COALESCE(b.brand_name, '') LIKE ?
          OR c.category_name LIKE ?
        )
      `);

      params.push(
        keyword,
        keyword,
        keyword,
        keyword,
        keyword,
      );
    }

    let minPrice =
      query.minPrice !== undefined
        ? Number(query.minPrice)
        : undefined;

    let maxPrice =
      query.maxPrice !== undefined
        ? Number(query.maxPrice)
        : undefined;

    if (
      minPrice !== undefined &&
      Number.isFinite(minPrice)
    ) {
      minPrice = Math.max(minPrice, 0);
    } else {
      minPrice = undefined;
    }

    if (
      maxPrice !== undefined &&
      Number.isFinite(maxPrice)
    ) {
      maxPrice = Math.max(maxPrice, 0);
    } else {
      maxPrice = undefined;
    }

    // Nếu frontend gửi min lớn hơn max thì tự đổi lại.
    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      [minPrice, maxPrice] = [maxPrice, minPrice];
    }

    if (minPrice !== undefined) {
      whereConditions.push('p.base_price >= ?');
      params.push(minPrice);
    }

    if (maxPrice !== undefined) {
      whereConditions.push('p.base_price <= ?');
      params.push(maxPrice);
    }

    const whereSql = `
      WHERE ${whereConditions.join(' AND ')}
    `;

    const sortMap: Record<string, string> = {
      newest: `
        p.created_at DESC,
        p.product_id DESC
      `,

      bestSelling: `
        COALESCE(sales.total_sold, 0) DESC,
        p.created_at DESC,
        p.product_id DESC
      `,

      rating: `
        COALESCE(p.average_rating, 0) DESC,
        COALESCE(p.review_count, 0) DESC,
        p.product_id DESC
      `,

      reviews: `
        COALESCE(p.review_count, 0) DESC,
        COALESCE(p.average_rating, 0) DESC,
        p.product_id DESC
      `,

      priceAsc: `
        p.base_price ASC,
        p.product_id DESC
      `,

      priceDesc: `
        p.base_price DESC,
        p.product_id DESC
      `,
    };

    const sortKey = query.sort || 'newest';
    const orderSql =
      sortMap[sortKey] || sortMap.newest;

    /*
     * Đếm tổng số sản phẩm sau khi lọc.
     */
    const countRows: Array<{ total: string | number }> =
      await this.dataSource.query(
        `
        SELECT
          COUNT(DISTINCT p.product_id) AS total
        FROM products p
        INNER JOIN categories c
          ON c.category_id = p.category_id
        LEFT JOIN brands b
          ON b.brand_id = p.brand_id
        ${whereSql}
        `,
        params,
      );

    const total = Number(countRows?.[0]?.total || 0);

    const totalPages = Math.max(
      Math.ceil(total / limit),
      1,
    );

    // Nếu page vượt quá tổng số trang, tự quay về trang cuối.
    const page = Math.min(requestedPage, totalPages);
    const offset = (page - 1) * limit;

    /*
     * Truy vấn danh sách sản phẩm.
     *
     * image_row:
     * - Ưu tiên ảnh thumbnail.
     * - Nếu không có thumbnail thì lấy một ảnh bất kỳ.
     *
     * stock_row:
     * - Tồn khả dụng = stock_quantity - reserved_quantity.
     *
     * sales:
     * - Chỉ tính các đơn DELIVERED.
     */
    const rows: RawProductRow[] =
      await this.dataSource.query(
        `
        SELECT
          p.product_id AS id,
          p.product_name AS name,
          p.product_slug AS slug,

          COALESCE(
            p.product_description,
            ''
          ) AS description,

          p.base_price AS price,

          COALESCE(
            p.average_rating,
            0
          ) AS rating,

          COALESCE(
            p.review_count,
            0
          ) AS reviewCount,

          c.category_name AS categoryName,
          c.category_slug AS category,

          COALESCE(
            b.brand_name,
            'Gearxin'
          ) AS brand,

          COALESCE(
            image_row.image_url,
            ''
          ) AS image_url,

          COALESCE(
            stock_row.stock_quantity,
            0
          ) AS stock_quantity,

          COALESCE(
            sales.total_sold,
            0
          ) AS totalSold

        FROM products p

        INNER JOIN categories c
          ON c.category_id = p.category_id

        LEFT JOIN brands b
          ON b.brand_id = p.brand_id
         AND b.brand_status = 'ACTIVE'

        LEFT JOIN (
          SELECT
            pi.product_id,

            COALESCE(
              MAX(
                CASE
                  WHEN pi.is_thumbnail = 1
                  THEN pi.image_url
                  ELSE NULL
                END
              ),
              MIN(pi.image_url)
            ) AS image_url

          FROM product_images pi

          GROUP BY
            pi.product_id
        ) image_row
          ON image_row.product_id = p.product_id

        LEFT JOIN (
          SELECT
            pv.product_id,

            SUM(
              GREATEST(
                COALESCE(vi.stock_quantity, 0)
                - COALESCE(vi.reserved_quantity, 0),
                0
              )
            ) AS stock_quantity

          FROM product_variants pv

          LEFT JOIN variant_inventory vi
            ON vi.variant_id = pv.variant_id

          WHERE pv.variant_status = 'ACTIVE'

          GROUP BY
            pv.product_id
        ) stock_row
          ON stock_row.product_id = p.product_id

        LEFT JOIN (
          SELECT
            oi.product_id,
            SUM(oi.ordered_quantity) AS total_sold

          FROM order_items oi

          INNER JOIN orders o
            ON o.order_id = oi.order_id

          INNER JOIN order_statuses os
            ON os.order_status_id = o.order_status_id

          WHERE os.order_status_code = 'DELIVERED'

          GROUP BY
            oi.product_id
        ) sales
          ON sales.product_id = p.product_id

        ${whereSql}

        ORDER BY
          ${orderSql}

        LIMIT ? OFFSET ?
        `,
        [...params, limit, offset],
      );

    /*
     * Dữ liệu sidebar:
     * - Danh mục và số sản phẩm.
     * - Thương hiệu và số sản phẩm.
     * - Tổng sản phẩm ACTIVE.
     */
    const [
      categoryRows,
      brandRows,
      totalProductRows,
    ] = await Promise.all([
      this.dataSource.query(
        `
        SELECT
          c.category_id AS id,
          c.category_name AS name,
          c.category_slug AS slug,

          COUNT(
            DISTINCT CASE
              WHEN p.product_status = 'ACTIVE'
              THEN p.product_id
              ELSE NULL
            END
          ) AS productCount

        FROM categories c

        LEFT JOIN products p
          ON p.category_id = c.category_id

        WHERE c.category_status = 'ACTIVE'

        GROUP BY
          c.category_id,
          c.category_name,
          c.category_slug

        ORDER BY
          c.category_name ASC
        `,
      ),

      this.dataSource.query(
        `
        SELECT
          b.brand_id AS id,
          b.brand_name AS name,

          COUNT(
            DISTINCT CASE
              WHEN p.product_status = 'ACTIVE'
              THEN p.product_id
              ELSE NULL
            END
          ) AS productCount

        FROM brands b

        LEFT JOIN products p
          ON p.brand_id = b.brand_id

        WHERE b.brand_status = 'ACTIVE'

        GROUP BY
          b.brand_id,
          b.brand_name

        HAVING productCount > 0

        ORDER BY
          b.brand_name ASC
        `,
      ),

      this.dataSource.query(
        `
        SELECT
          COUNT(*) AS total
        FROM products
        WHERE product_status = 'ACTIVE'
        `,
      ),
    ]);

    return {
      data: rows.map((row) =>
        this.normalizeProductRow(row),
      ),

      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },

      facets: {
        totalProducts: Number(
          totalProductRows?.[0]?.total || 0,
        ),

        categories: categoryRows.map(
          (row: {
            id: string | number;
            name: string;
            slug: string;
            productCount: string | number;
          }) => ({
            id: Number(row.id),
            name: row.name,
            slug: row.slug,
            productCount: Number(
              row.productCount || 0,
            ),
          }),
        ),

        brands: brandRows.map(
          (row: {
            id: string | number;
            name: string;
            productCount: string | number;
          }) => ({
            id: Number(row.id),
            name: row.name,
            productCount: Number(
              row.productCount || 0,
            ),
          }),
        ),
      },
    };
  }

  /**
   * GET /api/products/top-selling?limit=10
   *
   * Sản phẩm có lượt bán sẽ đứng trước.
   * Nếu chưa có đơn DELIVERED, API vẫn trả sản phẩm ACTIVE
   * với totalSold = 0 để Landing không bị trống.
   */
  async getTopSelling(limit = 10) {
    const safeLimit = Math.min(
      Math.max(Number(limit) || 10, 1),
      20,
    );

    const rows: RawProductRow[] =
      await this.dataSource.query(
        `
        SELECT
          p.product_id AS id,
          p.product_name AS name,
          p.product_slug AS slug,

          COALESCE(
            p.product_description,
            ''
          ) AS description,

          p.base_price AS price,

          COALESCE(
            p.average_rating,
            0
          ) AS rating,

          COALESCE(
            p.review_count,
            0
          ) AS reviewCount,

          c.category_name AS categoryName,
          c.category_slug AS category,

          COALESCE(
            b.brand_name,
            'Gearxin'
          ) AS brand,

          COALESCE(
            image_row.image_url,
            ''
          ) AS image_url,

          COALESCE(
            stock_row.stock_quantity,
            0
          ) AS stock_quantity,

          COALESCE(
            sales.total_sold,
            0
          ) AS totalSold

        FROM products p

        INNER JOIN categories c
          ON c.category_id = p.category_id
         AND c.category_status = 'ACTIVE'

        LEFT JOIN brands b
          ON b.brand_id = p.brand_id
         AND b.brand_status = 'ACTIVE'

        LEFT JOIN (
          SELECT
            pi.product_id,

            COALESCE(
              MAX(
                CASE
                  WHEN pi.is_thumbnail = 1
                  THEN pi.image_url
                  ELSE NULL
                END
              ),
              MIN(pi.image_url)
            ) AS image_url

          FROM product_images pi

          GROUP BY
            pi.product_id
        ) image_row
          ON image_row.product_id = p.product_id

        LEFT JOIN (
          SELECT
            pv.product_id,

            SUM(
              GREATEST(
                COALESCE(vi.stock_quantity, 0)
                - COALESCE(vi.reserved_quantity, 0),
                0
              )
            ) AS stock_quantity

          FROM product_variants pv

          LEFT JOIN variant_inventory vi
            ON vi.variant_id = pv.variant_id

          WHERE pv.variant_status = 'ACTIVE'

          GROUP BY
            pv.product_id
        ) stock_row
          ON stock_row.product_id = p.product_id

        LEFT JOIN (
          SELECT
            oi.product_id,
            SUM(oi.ordered_quantity) AS total_sold

          FROM order_items oi

          INNER JOIN orders o
            ON o.order_id = oi.order_id

          INNER JOIN order_statuses os
            ON os.order_status_id = o.order_status_id

          WHERE os.order_status_code = 'DELIVERED'

          GROUP BY
            oi.product_id
        ) sales
          ON sales.product_id = p.product_id

        WHERE p.product_status = 'ACTIVE'

        ORDER BY
          COALESCE(sales.total_sold, 0) DESC,
          COALESCE(p.average_rating, 0) DESC,
          COALESCE(p.review_count, 0) DESC,
          p.created_at DESC,
          p.product_id DESC

        LIMIT ?
        `,
        [safeLimit],
      );

    return rows.map((row) =>
      this.normalizeProductRow(row),
    );
  }

  /**
   * Chuẩn hóa kiểu dữ liệu MySQL trả về.
   * Decimal và BIGINT thường được mysql2 trả dưới dạng string.
   */
  private normalizeProductRow(row: RawProductRow) {
    const id = Number(row.id || 0);
    const price = Number(row.price || 0);
    const rating = Number(row.rating || 0);
    const reviewCount = Number(
      row.reviewCount || 0,
    );
    const stockQuantity = Number(
      row.stock_quantity || 0,
    );
    const totalSold = Number(
      row.totalSold || 0,
    );
    const image = row.image_url || '';

    return {
      id,
      product_id: id,

      name: row.name,
      product_name: row.name,

      slug: row.slug,
      product_slug: row.slug,

      description: row.description || '',
      product_description:
        row.description || '',

      price,
      base_price: price,

      rating,
      average_rating: rating,

      reviewCount,
      review_count: reviewCount,

      categoryName: row.categoryName,
      category_name: row.categoryName,
      category: row.category,

      brand: row.brand || 'Gearxin',
      brand_name: row.brand || 'Gearxin',

      image,
      image_url: image,

      stock_quantity: stockQuantity,
      stockQuantity,

      totalSold,
      total_sold: totalSold,
      sold_count: totalSold,
    };
  }
}
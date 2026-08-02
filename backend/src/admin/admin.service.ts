import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource, QueryRunner } from 'typeorm';
import {
  AdminListQueryDto,
  CreateInventoryTransactionDto,
  CreateProductDto,
  CreateProductImageDto,
  CreatePromotionDto,
  CreateStaffDto,
  CreateVariantDto,
  ModerateReviewDto,
  ReplaceProductSpecificationsDto,
  ReplyReviewDto,
  ResetUserPasswordDto,
  UpdateAdminUserDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
  UpdateProductDto,
  UpdatePromotionDto,
  UpdateStatusDto,
  UpdateSystemSettingDto,
  UpdateVariantDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly dataSource: DataSource) {}

  private page(query: AdminListQueryDto) {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
    return { page, limit, offset: (page - 1) * limit };
  }

  private normalizePhone(value: string) {
    return value.replace(/[\s.-]/g, '').replace(/^\+84/, '0');
  }

  private normalizeCode(value: string) {
    return value.trim().toUpperCase();
  }

  private async audit(
    actorUserId: number,
    actionName: string,
    tableName: string,
    recordId: number | null,
    description: string,
    queryRunner?: QueryRunner,
  ) {
    const executor = queryRunner || this.dataSource;
    await executor.query(
      `
      INSERT INTO audit_logs (
        actor_user_id,
        action_name,
        affected_table_name,
        affected_record_id,
        action_description
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [actorUserId, actionName, tableName, recordId, description],
    );
  }

  private async requireRow(
    tableName: string,
    idColumn: string,
    id: number,
  ) {
    const allowed: Record<string, string> = {
      users: 'user_id',
      products: 'product_id',
      product_variants: 'variant_id',
      orders: 'order_id',
      payments: 'payment_id',
      product_reviews: 'review_id',
      promotions: 'promotion_id',
    };

    if (allowed[tableName] !== idColumn) {
      throw new BadRequestException('Bảng dữ liệu không hợp lệ');
    }

    const rows = await this.dataSource.query(
      `SELECT * FROM ${tableName} WHERE ${idColumn} = ? LIMIT 1`,
      [id],
    );

    if (!rows.length) {
      throw new NotFoundException('Không tìm thấy dữ liệu');
    }

    return rows[0];
  }

  async getLookups() {
    const [roles, categories, brands, orderStatuses, paymentStatuses, inventoryTypes, attributes] =
      await Promise.all([
        this.dataSource.query(
          `SELECT role_id AS id, role_code AS code, role_name AS name FROM roles ORDER BY role_id`,
        ),
        this.dataSource.query(
          `SELECT category_id AS id, category_name AS name, category_slug AS slug, category_status AS status FROM categories ORDER BY category_name`,
        ),
        this.dataSource.query(
          `SELECT brand_id AS id, brand_name AS name, brand_status AS status FROM brands ORDER BY brand_name`,
        ),
        this.dataSource.query(
          `SELECT order_status_id AS id, order_status_code AS code, order_status_name AS name FROM order_statuses ORDER BY order_status_id`,
        ),
        this.dataSource.query(
          `SELECT payment_status_id AS id, payment_status_code AS code, payment_status_name AS name FROM payment_statuses ORDER BY payment_status_id`,
        ),
        this.dataSource.query(
          `SELECT inventory_type_id AS id, inventory_type_code AS code, inventory_type_name AS name FROM inventory_transaction_types ORDER BY inventory_type_id`,
        ),
        this.dataSource.query(
          `
          SELECT
            attribute_id AS id,
            attribute_name AS name,
            attribute_unit AS unit,
            spec_group AS specGroup,
            display_order AS displayOrder,
            is_highlight AS isHighlight
          FROM product_attributes
          ORDER BY spec_group, display_order, attribute_name
          `,
        ),
      ]);

    return {
      roles,
      categories,
      brands,
      orderStatuses,
      paymentStatuses,
      inventoryTypes,
      attributes,
    };
  }

  async getDashboard() {
    const [summaryRows, recentOrders, revenueByMonth, lowStock, pendingReviews] =
      await Promise.all([
        this.dataSource.query(`
          SELECT
            COALESCE((
              SELECT SUM(vot.total_amount)
              FROM orders o
              JOIN order_statuses os ON os.order_status_id = o.order_status_id
              JOIN vw_order_totals vot ON vot.order_id = o.order_id
              WHERE os.order_status_code = 'DELIVERED'
                AND DATE(o.order_created_at) = CURDATE()
            ), 0) AS todayRevenue,
            (SELECT COUNT(*) FROM orders o JOIN order_statuses os ON os.order_status_id = o.order_status_id WHERE os.order_status_code IN ('PENDING','CONFIRMED','PROCESSING')) AS pendingOrders,
            (SELECT COUNT(*) FROM products WHERE product_status = 'ACTIVE') AS activeProducts,
            (SELECT COUNT(*) FROM users u JOIN roles r ON r.role_id = u.role_id WHERE r.role_code = 'STAFF' AND u.account_status = 'ACTIVE') AS activeStaff,
            (SELECT COUNT(*) FROM users u JOIN roles r ON r.role_id = u.role_id WHERE r.role_code = 'CUSTOMER' AND u.account_status = 'ACTIVE') AS activeCustomers,
            (SELECT COUNT(*) FROM product_reviews WHERE review_status = 'PENDING') AS pendingReviews,
            (SELECT COUNT(*) FROM ai_search_logs WHERE DATE(searched_at) = CURDATE()) AS todayAiSearches
        `),
        this.dataSource.query(`
          SELECT
            o.order_id AS id,
            o.order_code AS code,
            u.user_full_name AS customerName,
            os.order_status_code AS statusCode,
            os.order_status_name AS statusName,
            COALESCE(vot.total_amount, 0) AS totalAmount,
            o.order_created_at AS createdAt
          FROM orders o
          JOIN users u ON u.user_id = o.customer_id
          JOIN order_statuses os ON os.order_status_id = o.order_status_id
          LEFT JOIN vw_order_totals vot ON vot.order_id = o.order_id
          ORDER BY o.order_created_at DESC
          LIMIT 8
        `),
        this.dataSource.query(`
          SELECT
            DATE_FORMAT(o.order_created_at, '%Y-%m') AS month,
            COALESCE(SUM(vot.total_amount), 0) AS revenue
          FROM orders o
          JOIN order_statuses os ON os.order_status_id = o.order_status_id
          JOIN vw_order_totals vot ON vot.order_id = o.order_id
          WHERE os.order_status_code = 'DELIVERED'
            AND o.order_created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
          GROUP BY DATE_FORMAT(o.order_created_at, '%Y-%m')
          ORDER BY month
        `),
        this.dataSource.query(`
          SELECT
            p.product_id AS productId,
            p.product_name AS productName,
            pv.variant_id AS variantId,
            pv.variant_name AS variantName,
            COALESCE(vi.stock_quantity, 0) AS stockQuantity,
            COALESCE(vi.reserved_quantity, 0) AS reservedQuantity,
            GREATEST(COALESCE(vi.stock_quantity, 0) - COALESCE(vi.reserved_quantity, 0), 0) AS availableQuantity
          FROM product_variants pv
          JOIN products p ON p.product_id = pv.product_id
          LEFT JOIN variant_inventory vi ON vi.variant_id = pv.variant_id
          WHERE pv.variant_status = 'ACTIVE'
            AND GREATEST(COALESCE(vi.stock_quantity, 0) - COALESCE(vi.reserved_quantity, 0), 0) <= 5
          ORDER BY availableQuantity ASC, p.product_name
          LIMIT 10
        `),
        this.dataSource.query(`
          SELECT
            r.review_id AS id,
            r.rating,
            r.review_title AS title,
            u.user_full_name AS customerName,
            p.product_name AS productName,
            r.created_at AS createdAt
          FROM product_reviews r
          JOIN users u ON u.user_id = r.user_id
          JOIN products p ON p.product_id = r.product_id
          WHERE r.review_status = 'PENDING'
          ORDER BY r.created_at DESC
          LIMIT 6
        `),
      ]);

    const summary = summaryRows[0] || {};
    return {
      summary: {
        todayRevenue: Number(summary.todayRevenue || 0),
        pendingOrders: Number(summary.pendingOrders || 0),
        activeProducts: Number(summary.activeProducts || 0),
        activeStaff: Number(summary.activeStaff || 0),
        activeCustomers: Number(summary.activeCustomers || 0),
        pendingReviews: Number(summary.pendingReviews || 0),
        todayAiSearches: Number(summary.todayAiSearches || 0),
      },
      recentOrders: recentOrders.map((row: any) => ({
        ...row,
        id: Number(row.id),
        totalAmount: Number(row.totalAmount || 0),
      })),
      revenueByMonth: revenueByMonth.map((row: any) => ({
        month: row.month,
        revenue: Number(row.revenue || 0),
      })),
      lowStock: lowStock.map((row: any) => ({
        ...row,
        productId: Number(row.productId),
        variantId: Number(row.variantId),
        stockQuantity: Number(row.stockQuantity || 0),
        reservedQuantity: Number(row.reservedQuantity || 0),
        availableQuantity: Number(row.availableQuantity || 0),
      })),
      pendingReviews,
    };
  }

  async listUsers(query: AdminListQueryDto) {
    const { page, limit, offset } = this.page(query);
    const conditions: string[] = [];
    const params: any[] = [];

    if (query.search?.trim()) {
      conditions.push(`(u.user_full_name LIKE ? OR u.user_email LIKE ? OR u.user_phone LIKE ?)`);
      const keyword = `%${query.search.trim()}%`;
      params.push(keyword, keyword, keyword);
    }
    if (query.status) {
      conditions.push(`u.account_status = ?`);
      params.push(this.normalizeCode(query.status));
    }
    if (query.role) {
      conditions.push(`r.role_code = ?`);
      params.push(this.normalizeCode(query.role));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRows = await this.dataSource.query(
      `SELECT COUNT(*) AS total FROM users u JOIN roles r ON r.role_id = u.role_id ${where}`,
      params,
    );
    const rows = await this.dataSource.query(
      `
      SELECT
        u.user_id AS id,
        u.user_full_name AS name,
        u.user_email AS email,
        u.user_phone AS phone,
        u.account_status AS status,
        u.created_at AS createdAt,
        u.updated_at AS updatedAt,
        r.role_id AS roleId,
        r.role_code AS roleCode,
        r.role_name AS roleName
      FROM users u
      JOIN roles r ON r.role_id = u.role_id
      ${where}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );

    return {
      items: rows.map((row: any) => ({
        ...row,
        id: Number(row.id),
        roleId: Number(row.roleId),
      })),
      pagination: {
        page,
        limit,
        total: Number(countRows[0]?.total || 0),
        totalPages: Math.ceil(Number(countRows[0]?.total || 0) / limit),
      },
    };
  }

  async createStaff(dto: CreateStaffDto, actorId: number) {
    const email = dto.email.trim().toLowerCase();
    const phone = this.normalizePhone(dto.phone);
    const duplicates = await this.dataSource.query(
      `SELECT user_id FROM users WHERE LOWER(user_email) = LOWER(?) OR user_phone = ? LIMIT 1`,
      [email, phone],
    );
    if (duplicates.length) {
      throw new BadRequestException('Email hoặc số điện thoại đã tồn tại');
    }

    const roleRows = await this.dataSource.query(
      `SELECT role_id FROM roles WHERE role_code = 'STAFF' LIMIT 1`,
    );
    if (!roleRows.length) {
      throw new BadRequestException('Database chưa có vai trò STAFF');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const result = await this.dataSource.query(
      `
      INSERT INTO users (
        role_id, user_full_name, user_email, user_phone, password_hash, account_status
      ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        roleRows[0].role_id,
        dto.name.trim(),
        email,
        phone,
        passwordHash,
        dto.status,
      ],
    );

    const id = Number(result.insertId);
    await this.audit(actorId, 'CREATE_STAFF', 'users', id, `Tạo tài khoản nhân viên ${email}`);
    return { success: true, message: 'Tạo nhân viên thành công', id };
  }

  async updateUser(id: number, dto: UpdateAdminUserDto, actorId: number) {
    const oldUser = await this.requireRow('users', 'user_id', id);
    if (id === actorId && dto.status && dto.status !== 'ACTIVE') {
      throw new BadRequestException('Không thể tự khóa tài khoản đang đăng nhập');
    }
    if (id === actorId && dto.roleCode && dto.roleCode !== 'ADMIN') {
      throw new BadRequestException('Không thể tự hạ quyền ADMIN của tài khoản đang đăng nhập');
    }

    const fields: string[] = [];
    const params: any[] = [];

    if (dto.name !== undefined) {
      fields.push('user_full_name = ?');
      params.push(dto.name.trim());
    }
    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      const duplicate = await this.dataSource.query(
        `SELECT user_id FROM users WHERE LOWER(user_email) = LOWER(?) AND user_id <> ? LIMIT 1`,
        [email, id],
      );
      if (duplicate.length) throw new BadRequestException('Email đã tồn tại');
      fields.push('user_email = ?');
      params.push(email);
    }
    if (dto.phone !== undefined) {
      const phone = this.normalizePhone(dto.phone);
      const duplicate = await this.dataSource.query(
        `SELECT user_id FROM users WHERE user_phone = ? AND user_id <> ? LIMIT 1`,
        [phone, id],
      );
      if (duplicate.length) throw new BadRequestException('Số điện thoại đã tồn tại');
      fields.push('user_phone = ?');
      params.push(phone);
    }
    if (dto.status !== undefined) {
      fields.push('account_status = ?');
      params.push(dto.status);
    }
    if (dto.roleCode !== undefined) {
      const roleRows = await this.dataSource.query(
        `SELECT role_id FROM roles WHERE role_code = ? LIMIT 1`,
        [dto.roleCode],
      );
      if (!roleRows.length) throw new BadRequestException('Vai trò không tồn tại');
      fields.push('role_id = ?');
      params.push(roleRows[0].role_id);
    }

    if (!fields.length) {
      return { success: true, message: 'Không có dữ liệu thay đổi' };
    }

    await this.dataSource.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = ?`,
      [...params, id],
    );
    await this.audit(
      actorId,
      'UPDATE_USER',
      'users',
      id,
      `Cập nhật tài khoản ${oldUser.user_email}`,
    );
    return { success: true, message: 'Cập nhật người dùng thành công' };
  }

  async resetUserPassword(id: number, dto: ResetUserPasswordDto, actorId: number) {
    const user = await this.requireRow('users', 'user_id', id);
    const hash = await bcrypt.hash(dto.password, 12);
    await this.dataSource.query(
      `UPDATE users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?`,
      [hash, id],
    );
    await this.audit(
      actorId,
      'RESET_USER_PASSWORD',
      'users',
      id,
      `Đặt lại mật khẩu tài khoản ${user.user_email}`,
    );
    return { success: true, message: 'Đặt lại mật khẩu thành công' };
  }

  async deactivateUser(id: number, actorId: number) {
    if (id === actorId) {
      throw new BadRequestException('Không thể tự vô hiệu hóa tài khoản đang đăng nhập');
    }
    const user = await this.requireRow('users', 'user_id', id);
    await this.dataSource.query(
      `UPDATE users SET account_status = 'INACTIVE', updated_at = NOW() WHERE user_id = ?`,
      [id],
    );
    await this.audit(actorId, 'DEACTIVATE_USER', 'users', id, `Vô hiệu hóa ${user.user_email}`);
    return { success: true, message: 'Đã vô hiệu hóa tài khoản' };
  }

  async listProducts(query: AdminListQueryDto) {
    const { page, limit, offset } = this.page(query);
    const conditions: string[] = [];
    const params: any[] = [];

    if (query.search?.trim()) {
      conditions.push(`(p.product_name LIKE ? OR p.product_slug LIKE ? OR p.sku LIKE ?)`);
      const keyword = `%${query.search.trim()}%`;
      params.push(keyword, keyword, keyword);
    }
    if (query.status) {
      conditions.push(`p.product_status = ?`);
      params.push(this.normalizeCode(query.status));
    }
    if (query.categoryId) {
      conditions.push(`p.category_id = ?`);
      params.push(query.categoryId);
    }
    if (query.brandId) {
      conditions.push(`p.brand_id = ?`);
      params.push(query.brandId);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRows = await this.dataSource.query(
      `SELECT COUNT(*) AS total FROM products p ${where}`,
      params,
    );
    const rows = await this.dataSource.query(
      `
      SELECT
        p.product_id AS id,
        p.product_name AS name,
        p.product_slug AS slug,
        p.sku,
        p.base_price AS price,
        p.product_status AS status,
        p.average_rating AS rating,
        p.review_count AS reviewCount,
        p.created_at AS createdAt,
        p.updated_at AS updatedAt,
        c.category_id AS categoryId,
        c.category_name AS categoryName,
        b.brand_id AS brandId,
        b.brand_name AS brandName,
        COALESCE(vps.current_stock, 0) AS stockQuantity,
        COALESCE(vb.total_sold, 0) AS totalSold,
        (
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.product_id
          ORDER BY pi.is_thumbnail DESC, pi.sort_order ASC, pi.image_id ASC
          LIMIT 1
        ) AS imageUrl
      FROM products p
      JOIN categories c ON c.category_id = p.category_id
      LEFT JOIN brands b ON b.brand_id = p.brand_id
      LEFT JOIN vw_product_stock vps ON vps.product_id = p.product_id
      LEFT JOIN vw_best_selling_products vb ON vb.product_id = p.product_id
      ${where}
      ORDER BY p.updated_at DESC, p.product_id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );

    return {
      items: rows.map((row: any) => ({
        ...row,
        id: Number(row.id),
        categoryId: Number(row.categoryId),
        brandId: row.brandId === null ? null : Number(row.brandId),
        price: Number(row.price || 0),
        rating: Number(row.rating || 0),
        reviewCount: Number(row.reviewCount || 0),
        stockQuantity: Number(row.stockQuantity || 0),
        totalSold: Number(row.totalSold || 0),
      })),
      pagination: {
        page,
        limit,
        total: Number(countRows[0]?.total || 0),
        totalPages: Math.ceil(Number(countRows[0]?.total || 0) / limit),
      },
    };
  }

  async getProductDetail(id: number) {
    await this.requireRow('products', 'product_id', id);
    const productRows = await this.dataSource.query(
      `
      SELECT
        p.*,
        c.category_name,
        b.brand_name,
        COALESCE(vps.current_stock, 0) AS current_stock
      FROM products p
      JOIN categories c ON c.category_id = p.category_id
      LEFT JOIN brands b ON b.brand_id = p.brand_id
      LEFT JOIN vw_product_stock vps ON vps.product_id = p.product_id
      WHERE p.product_id = ?
      LIMIT 1
      `,
      [id],
    );
    const [images, variants, specifications] = await Promise.all([
      this.dataSource.query(
        `SELECT image_id AS id, image_url AS imageUrl, is_thumbnail AS isThumbnail, sort_order AS sortOrder FROM product_images WHERE product_id = ? ORDER BY is_thumbnail DESC, sort_order, image_id`,
        [id],
      ),
      this.dataSource.query(
        `
        SELECT
          pv.*,
          COALESCE(vi.stock_quantity, 0) AS stock_quantity,
          COALESCE(vi.reserved_quantity, 0) AS reserved_quantity,
          GREATEST(COALESCE(vi.stock_quantity, 0) - COALESCE(vi.reserved_quantity, 0), 0) AS available_quantity
        FROM product_variants pv
        LEFT JOIN variant_inventory vi ON vi.variant_id = pv.variant_id
        WHERE pv.product_id = ?
        ORDER BY pv.is_default DESC, pv.variant_id
        `,
        [id],
      ),
      this.dataSource.query(
        `
        SELECT
          pa.attribute_id AS attributeId,
          pa.attribute_name AS attributeName,
          pa.attribute_unit AS unit,
          pa.spec_group AS specGroup,
          pa.display_order AS displayOrder,
          pa.is_highlight AS isHighlight,
          pav.attribute_value AS value,
          pav.numeric_value AS numericValue,
          pav.boolean_value AS booleanValue,
          pav.normalized_value AS normalizedValue
        FROM product_attribute_values pav
        JOIN product_attributes pa ON pa.attribute_id = pav.attribute_id
        WHERE pav.product_id = ?
        ORDER BY pa.spec_group, pa.display_order, pa.attribute_id
        `,
        [id],
      ),
    ]);

    return {
      ...productRows[0],
      product_id: Number(productRows[0].product_id),
      base_price: Number(productRows[0].base_price || 0),
      current_stock: Number(productRows[0].current_stock || 0),
      images,
      variants: variants.map((row: any) => ({
        ...row,
        variant_id: Number(row.variant_id),
        additional_price: Number(row.additional_price || 0),
        stock_quantity: Number(row.stock_quantity || 0),
        reserved_quantity: Number(row.reserved_quantity || 0),
        available_quantity: Number(row.available_quantity || 0),
      })),
      specifications,
    };
  }

  async createProduct(dto: CreateProductDto, actorId: number) {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const duplicate = await runner.query(
        `SELECT product_id FROM products WHERE product_slug = ? OR (? IS NOT NULL AND sku = ?) LIMIT 1`,
        [dto.slug.trim(), dto.sku || null, dto.sku || null],
      );
      if (duplicate.length) {
        throw new BadRequestException('Slug hoặc SKU đã tồn tại');
      }

      const result = await runner.query(
        `
        INSERT INTO products (
          category_id, brand_id, product_name, product_slug, sku, barcode,
          manufacturer_part_number, release_year, origin_country,
          product_description, base_price, warranty_months, product_status,
          created_by_user_id, updated_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          dto.categoryId,
          dto.brandId || null,
          dto.name.trim(),
          dto.slug.trim(),
          dto.sku || null,
          dto.barcode || null,
          dto.manufacturerPartNumber || null,
          dto.releaseYear || null,
          dto.originCountry || null,
          dto.description || null,
          dto.price,
          dto.warrantyMonths,
          dto.status,
          actorId,
          actorId,
        ],
      );
      const id = Number(result.insertId);

      if (dto.thumbnailUrl) {
        await runner.query(
          `INSERT INTO product_images (product_id, image_url, is_thumbnail, sort_order) VALUES (?, ?, TRUE, 0)`,
          [id, dto.thumbnailUrl],
        );
      }

      await runner.query(
        `
        INSERT INTO product_logs (product_id, changed_by_user_id, product_action, old_data, new_data)
        VALUES (?, ?, 'CREATE', NULL, ?)
        `,
        [id, actorId, JSON.stringify(dto)],
      );
      await this.audit(actorId, 'CREATE_PRODUCT', 'products', id, `Tạo sản phẩm ${dto.name}`, runner);
      await runner.commitTransaction();
      return { success: true, message: 'Tạo sản phẩm thành công', id };
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async updateProduct(id: number, dto: UpdateProductDto, actorId: number) {
    const oldProduct = await this.requireRow('products', 'product_id', id);
    const fieldMap: Array<[keyof UpdateProductDto, string, (value: any) => any]> = [
      ['categoryId', 'category_id', Number],
      ['brandId', 'brand_id', (value) => value || null],
      ['name', 'product_name', (value) => String(value).trim()],
      ['slug', 'product_slug', (value) => String(value).trim()],
      ['sku', 'sku', (value) => value || null],
      ['barcode', 'barcode', (value) => value || null],
      ['manufacturerPartNumber', 'manufacturer_part_number', (value) => value || null],
      ['releaseYear', 'release_year', (value) => value || null],
      ['originCountry', 'origin_country', (value) => value || null],
      ['description', 'product_description', (value) => value || null],
      ['price', 'base_price', Number],
      ['warrantyMonths', 'warranty_months', Number],
      ['status', 'product_status', String],
    ];

    const fields: string[] = [];
    const params: any[] = [];
    for (const [key, column, transform] of fieldMap) {
      if (dto[key] !== undefined) {
        fields.push(`${column} = ?`);
        params.push(transform(dto[key]));
      }
    }

    if (!fields.length && !dto.thumbnailUrl) {
      return { success: true, message: 'Không có dữ liệu thay đổi' };
    }

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      if (fields.length) {
        await runner.query(
          `UPDATE products SET ${fields.join(', ')}, updated_by_user_id = ?, updated_at = NOW() WHERE product_id = ?`,
          [...params, actorId, id],
        );
      }

      if (dto.thumbnailUrl) {
        await runner.query(`UPDATE product_images SET is_thumbnail = FALSE WHERE product_id = ?`, [id]);
        await runner.query(
          `INSERT INTO product_images (product_id, image_url, is_thumbnail, sort_order) VALUES (?, ?, TRUE, 0)`,
          [id, dto.thumbnailUrl],
        );
      }

      await runner.query(
        `
        INSERT INTO product_logs (product_id, changed_by_user_id, product_action, old_data, new_data)
        VALUES (?, ?, 'UPDATE', ?, ?)
        `,
        [id, actorId, JSON.stringify(oldProduct), JSON.stringify(dto)],
      );
      await this.audit(actorId, 'UPDATE_PRODUCT', 'products', id, `Cập nhật sản phẩm #${id}`, runner);
      await runner.commitTransaction();
      return { success: true, message: 'Cập nhật sản phẩm thành công' };
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async updateProductStatus(id: number, dto: UpdateStatusDto, actorId: number) {
    await this.requireRow('products', 'product_id', id);
    const status = this.normalizeCode(dto.status);
    if (!['ACTIVE', 'INACTIVE', 'DRAFT', 'DELETED'].includes(status)) {
      throw new BadRequestException('Trạng thái sản phẩm không hợp lệ');
    }
    await this.dataSource.query(
      `UPDATE products SET product_status = ?, updated_by_user_id = ?, updated_at = NOW() WHERE product_id = ?`,
      [status, actorId, id],
    );
    await this.audit(actorId, 'UPDATE_PRODUCT_STATUS', 'products', id, `Đổi trạng thái sản phẩm thành ${status}`);
    return { success: true, message: 'Cập nhật trạng thái sản phẩm thành công' };
  }

  async addProductImage(productId: number, dto: CreateProductImageDto, actorId: number) {
    await this.requireRow('products', 'product_id', productId);
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      if (dto.isThumbnail) {
        await runner.query(`UPDATE product_images SET is_thumbnail = FALSE WHERE product_id = ?`, [productId]);
      }
      const result = await runner.query(
        `INSERT INTO product_images (product_id, image_url, is_thumbnail, sort_order) VALUES (?, ?, ?, ?)`,
        [productId, dto.imageUrl, dto.isThumbnail, dto.sortOrder],
      );
      const id = Number(result.insertId);
      await this.audit(actorId, 'ADD_PRODUCT_IMAGE', 'product_images', id, `Thêm ảnh cho sản phẩm #${productId}`, runner);
      await runner.commitTransaction();
      return { success: true, message: 'Thêm ảnh thành công', id };
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async deleteProductImage(imageId: number, actorId: number) {
    const rows = await this.dataSource.query(`SELECT * FROM product_images WHERE image_id = ? LIMIT 1`, [imageId]);
    if (!rows.length) throw new NotFoundException('Không tìm thấy ảnh');
    await this.dataSource.query(`DELETE FROM product_images WHERE image_id = ?`, [imageId]);
    await this.audit(actorId, 'DELETE_PRODUCT_IMAGE', 'product_images', imageId, `Xóa ảnh sản phẩm #${rows[0].product_id}`);
    return { success: true, message: 'Xóa ảnh thành công' };
  }

  async createVariant(productId: number, dto: CreateVariantDto, actorId: number) {
    await this.requireRow('products', 'product_id', productId);
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const duplicate = await runner.query(`SELECT variant_id FROM product_variants WHERE sku = ? LIMIT 1`, [dto.sku]);
      if (duplicate.length) throw new BadRequestException('SKU biến thể đã tồn tại');
      if (dto.isDefault) {
        await runner.query(`UPDATE product_variants SET is_default = FALSE WHERE product_id = ?`, [productId]);
      }
      const result = await runner.query(
        `
        INSERT INTO product_variants (
          product_id, variant_name, sku, color, ram_size, storage_size,
          gpu_option, cpu_option, additional_price, variant_status, is_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          productId,
          dto.name || null,
          dto.sku,
          dto.color || null,
          dto.ramSize || null,
          dto.storageSize || null,
          dto.gpuOption || null,
          dto.cpuOption || null,
          dto.additionalPrice,
          dto.status,
          dto.isDefault,
        ],
      );
      const variantId = Number(result.insertId);
      await runner.query(
        `INSERT INTO variant_inventory (variant_id, stock_quantity, reserved_quantity) VALUES (?, ?, 0)`,
        [variantId, dto.initialStock],
      );

      if (dto.initialStock > 0) {
        const inTypeRows = await runner.query(
          `SELECT inventory_type_id FROM inventory_transaction_types WHERE inventory_type_code = 'IN' LIMIT 1`,
        );

        if (inTypeRows.length) {
          await runner.query(
            `
            INSERT INTO inventory_transactions (
              product_id, variant_id, staff_user_id, inventory_type_id,
              transaction_quantity, transaction_note
            ) VALUES (?, ?, ?, ?, ?, 'Tồn kho khởi tạo khi tạo biến thể')
            `,
            [
              productId,
              variantId,
              actorId,
              inTypeRows[0].inventory_type_id,
              dto.initialStock,
            ],
          );
        }
      }

      await this.audit(actorId, 'CREATE_VARIANT', 'product_variants', variantId, `Tạo biến thể cho sản phẩm #${productId}`, runner);
      await runner.commitTransaction();
      return { success: true, message: 'Tạo biến thể thành công', id: variantId };
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async updateVariant(variantId: number, dto: UpdateVariantDto, actorId: number) {
    const variant = await this.requireRow('product_variants', 'variant_id', variantId);
    const map: Array<[keyof UpdateVariantDto, string, (value: any) => any]> = [
      ['name', 'variant_name', (v) => v || null],
      ['sku', 'sku', String],
      ['color', 'color', (v) => v || null],
      ['ramSize', 'ram_size', (v) => v || null],
      ['storageSize', 'storage_size', (v) => v || null],
      ['gpuOption', 'gpu_option', (v) => v || null],
      ['cpuOption', 'cpu_option', (v) => v || null],
      ['additionalPrice', 'additional_price', Number],
      ['status', 'variant_status', String],
      ['isDefault', 'is_default', Boolean],
    ];
    const fields: string[] = [];
    const params: any[] = [];
    for (const [key, column, transform] of map) {
      if (dto[key] !== undefined) {
        fields.push(`${column} = ?`);
        params.push(transform(dto[key]));
      }
    }
    if (!fields.length) return { success: true, message: 'Không có dữ liệu thay đổi' };

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      if (dto.isDefault) {
        await runner.query(`UPDATE product_variants SET is_default = FALSE WHERE product_id = ?`, [variant.product_id]);
      }
      await runner.query(`UPDATE product_variants SET ${fields.join(', ')} WHERE variant_id = ?`, [...params, variantId]);
      await this.audit(actorId, 'UPDATE_VARIANT', 'product_variants', variantId, `Cập nhật biến thể #${variantId}`, runner);
      await runner.commitTransaction();
      return { success: true, message: 'Cập nhật biến thể thành công' };
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async deactivateVariant(variantId: number, actorId: number) {
    await this.requireRow('product_variants', 'variant_id', variantId);
    await this.dataSource.query(`UPDATE product_variants SET variant_status = 'INACTIVE', is_default = FALSE WHERE variant_id = ?`, [variantId]);
    await this.audit(actorId, 'DEACTIVATE_VARIANT', 'product_variants', variantId, `Vô hiệu hóa biến thể #${variantId}`);
    return { success: true, message: 'Đã vô hiệu hóa biến thể' };
  }

  async replaceProductSpecifications(
    productId: number,
    dto: ReplaceProductSpecificationsDto,
    actorId: number,
  ) {
    await this.requireRow('products', 'product_id', productId);
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      await runner.query(`DELETE FROM product_attribute_values WHERE product_id = ?`, [productId]);
      for (const item of dto.specifications) {
        const attributeRows = await runner.query(
          `SELECT attribute_id FROM product_attributes WHERE attribute_id = ? LIMIT 1`,
          [item.attributeId],
        );
        if (!attributeRows.length) {
          throw new BadRequestException(`Thuộc tính #${item.attributeId} không tồn tại`);
        }
        await runner.query(
          `
          INSERT INTO product_attribute_values (
            product_id, attribute_id, attribute_value, numeric_value,
            boolean_value, normalized_value
          ) VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            productId,
            item.attributeId,
            item.value,
            item.numericValue ?? null,
            item.booleanValue ?? null,
            item.normalizedValue || item.value.trim().toLowerCase().slice(0, 255),
          ],
        );
      }
      await this.audit(actorId, 'REPLACE_PRODUCT_SPECS', 'product_attribute_values', productId, `Cập nhật thông số sản phẩm #${productId}`, runner);
      await runner.commitTransaction();
      return { success: true, message: 'Cập nhật thông số kỹ thuật thành công' };
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async listInventory(query: AdminListQueryDto) {
    const { page, limit, offset } = this.page(query);
    const conditions: string[] = [];
    const params: any[] = [];
    if (query.search?.trim()) {
      conditions.push(`(p.product_name LIKE ? OR pv.variant_name LIKE ? OR pv.sku LIKE ?)`);
      const keyword = `%${query.search.trim()}%`;
      params.push(keyword, keyword, keyword);
    }
    if (query.status) {
      conditions.push(`pv.variant_status = ?`);
      params.push(this.normalizeCode(query.status));
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRows = await this.dataSource.query(
      `SELECT COUNT(*) AS total FROM product_variants pv JOIN products p ON p.product_id = pv.product_id ${where}`,
      params,
    );
    const rows = await this.dataSource.query(
      `
      SELECT
        p.product_id AS productId,
        p.product_name AS productName,
        pv.variant_id AS variantId,
        pv.variant_name AS variantName,
        pv.sku,
        pv.variant_status AS status,
        COALESCE(vi.stock_quantity, 0) AS stockQuantity,
        COALESCE(vi.reserved_quantity, 0) AS reservedQuantity,
        GREATEST(COALESCE(vi.stock_quantity, 0) - COALESCE(vi.reserved_quantity, 0), 0) AS availableQuantity,
        vi.updated_at AS updatedAt
      FROM product_variants pv
      JOIN products p ON p.product_id = pv.product_id
      LEFT JOIN variant_inventory vi ON vi.variant_id = pv.variant_id
      ${where}
      ORDER BY availableQuantity ASC, p.product_name, pv.variant_id
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );
    return {
      items: rows.map((row: any) => ({
        ...row,
        productId: Number(row.productId),
        variantId: Number(row.variantId),
        stockQuantity: Number(row.stockQuantity || 0),
        reservedQuantity: Number(row.reservedQuantity || 0),
        availableQuantity: Number(row.availableQuantity || 0),
      })),
      pagination: {
        page,
        limit,
        total: Number(countRows[0]?.total || 0),
        totalPages: Math.ceil(Number(countRows[0]?.total || 0) / limit),
      },
    };
  }

  async createInventoryTransaction(dto: CreateInventoryTransactionDto, actorId: number) {
    if (!Number.isInteger(dto.quantity) || dto.quantity === 0) {
      throw new BadRequestException('Số lượng phải là số nguyên khác 0');
    }
    if ((dto.typeCode === 'IN' || dto.typeCode === 'OUT') && dto.quantity < 0) {
      throw new BadRequestException('IN/OUT phải dùng số lượng dương');
    }

    await this.requireRow('products', 'product_id', dto.productId);
    if (dto.variantId) {
      const variants = await this.dataSource.query(
        `SELECT variant_id FROM product_variants WHERE variant_id = ? AND product_id = ? LIMIT 1`,
        [dto.variantId, dto.productId],
      );
      if (!variants.length) throw new BadRequestException('Biến thể không thuộc sản phẩm đã chọn');
    }

    const typeRows = await this.dataSource.query(
      `SELECT inventory_type_id FROM inventory_transaction_types WHERE inventory_type_code = ? LIMIT 1`,
      [dto.typeCode],
    );
    if (!typeRows.length) throw new BadRequestException('Loại giao dịch kho chưa tồn tại');

    let delta = dto.quantity;
    if (dto.typeCode === 'OUT') delta = -Math.abs(dto.quantity);
    if (dto.typeCode === 'IN') delta = Math.abs(dto.quantity);

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      if (dto.variantId) {
        const stockRows = await runner.query(
          `
          SELECT
            COALESCE(stock_quantity, 0) AS stock_quantity,
            COALESCE(reserved_quantity, 0) AS reserved_quantity
          FROM variant_inventory
          WHERE variant_id = ?
          FOR UPDATE
          `,
          [dto.variantId],
        );
        const stock = Number(stockRows[0]?.stock_quantity || 0);
        const reserved = Number(stockRows[0]?.reserved_quantity || 0);
        if (stock + delta < reserved || stock + delta < 0) {
          throw new BadRequestException('Không đủ tồn kho khả dụng để xuất/điều chỉnh');
        }
        await runner.query(
          `
          INSERT INTO variant_inventory (variant_id, stock_quantity, reserved_quantity)
          VALUES (?, ?, 0)
          ON DUPLICATE KEY UPDATE stock_quantity = stock_quantity + VALUES(stock_quantity)
          `,
          [dto.variantId, delta],
        );
      } else if (delta < 0) {
        const stockRows = await runner.query(`SELECT current_stock FROM vw_product_stock WHERE product_id = ? LIMIT 1`, [dto.productId]);
        if (Number(stockRows[0]?.current_stock || 0) + delta < 0) {
          throw new BadRequestException('Không đủ tồn kho để xuất');
        }
      }

      const storedQuantity = dto.typeCode === 'OUT' ? Math.abs(dto.quantity) : dto.quantity;
      const result = await runner.query(
        `
        INSERT INTO inventory_transactions (
          product_id, variant_id, supplier_id, staff_user_id, inventory_type_id,
          transaction_quantity, unit_cost, transaction_note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          dto.productId,
          dto.variantId || null,
          dto.supplierId || null,
          actorId,
          typeRows[0].inventory_type_id,
          storedQuantity,
          dto.unitCost ?? null,
          dto.note || null,
        ],
      );
      const id = Number(result.insertId);
      await this.audit(actorId, 'CREATE_INVENTORY_TRANSACTION', 'inventory_transactions', id, `${dto.typeCode} ${dto.quantity} sản phẩm #${dto.productId}`, runner);
      await runner.commitTransaction();
      return { success: true, message: 'Cập nhật kho thành công', id };
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async listInventoryTransactions(query: AdminListQueryDto) {
    const { page, limit, offset } = this.page(query);
    const rows = await this.dataSource.query(
      `
      SELECT
        it.inventory_transaction_id AS id,
        p.product_name AS productName,
        pv.variant_name AS variantName,
        itt.inventory_type_code AS typeCode,
        itt.inventory_type_name AS typeName,
        it.transaction_quantity AS quantity,
        it.unit_cost AS unitCost,
        it.transaction_note AS note,
        u.user_full_name AS staffName,
        s.supplier_name AS supplierName,
        it.transaction_at AS createdAt
      FROM inventory_transactions it
      JOIN products p ON p.product_id = it.product_id
      LEFT JOIN product_variants pv ON pv.variant_id = it.variant_id
      JOIN inventory_transaction_types itt ON itt.inventory_type_id = it.inventory_type_id
      LEFT JOIN users u ON u.user_id = it.staff_user_id
      LEFT JOIN suppliers s ON s.supplier_id = it.supplier_id
      ORDER BY it.transaction_at DESC
      LIMIT ? OFFSET ?
      `,
      [limit, offset],
    );
    const countRows = await this.dataSource.query(`SELECT COUNT(*) AS total FROM inventory_transactions`);
    return {
      items: rows.map((row: any) => ({
        ...row,
        id: Number(row.id),
        quantity: Number(row.quantity),
        unitCost: row.unitCost === null ? null : Number(row.unitCost),
      })),
      pagination: {
        page,
        limit,
        total: Number(countRows[0]?.total || 0),
        totalPages: Math.ceil(Number(countRows[0]?.total || 0) / limit),
      },
    };
  }

  async listOrders(query: AdminListQueryDto) {
    const { page, limit, offset } = this.page(query);
    const conditions: string[] = [];
    const params: any[] = [];
    if (query.search?.trim()) {
      conditions.push(`(o.order_code LIKE ? OR u.user_full_name LIKE ? OR u.user_email LIKE ?)`);
      const keyword = `%${query.search.trim()}%`;
      params.push(keyword, keyword, keyword);
    }
    if (query.status) {
      conditions.push(`os.order_status_code = ?`);
      params.push(this.normalizeCode(query.status));
    }
    if (query.from) {
      conditions.push(`o.order_created_at >= ?`);
      params.push(query.from);
    }
    if (query.to) {
      conditions.push(`o.order_created_at < DATE_ADD(?, INTERVAL 1 DAY)`);
      params.push(query.to);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRows = await this.dataSource.query(
      `SELECT COUNT(*) AS total FROM orders o JOIN users u ON u.user_id = o.customer_id JOIN order_statuses os ON os.order_status_id = o.order_status_id ${where}`,
      params,
    );
    const rows = await this.dataSource.query(
      `
      SELECT
        o.order_id AS id,
        o.order_code AS code,
        o.order_note AS note,
        o.order_created_at AS createdAt,
        o.order_updated_at AS updatedAt,
        u.user_id AS customerId,
        u.user_full_name AS customerName,
        u.user_email AS customerEmail,
        u.user_phone AS customerPhone,
        os.order_status_code AS statusCode,
        os.order_status_name AS statusName,
        COALESCE(vot.total_amount, 0) AS totalAmount,
        ps.payment_status_code AS paymentStatusCode,
        pm.payment_method_code AS paymentMethodCode
      FROM orders o
      JOIN users u ON u.user_id = o.customer_id
      JOIN order_statuses os ON os.order_status_id = o.order_status_id
      LEFT JOIN vw_order_totals vot ON vot.order_id = o.order_id
      LEFT JOIN payments pay ON pay.order_id = o.order_id
      LEFT JOIN payment_statuses ps ON ps.payment_status_id = pay.payment_status_id
      LEFT JOIN payment_methods pm ON pm.payment_method_id = pay.payment_method_id
      ${where}
      ORDER BY o.order_created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );
    return {
      items: rows.map((row: any) => ({
        ...row,
        id: Number(row.id),
        customerId: Number(row.customerId),
        totalAmount: Number(row.totalAmount || 0),
      })),
      pagination: {
        page,
        limit,
        total: Number(countRows[0]?.total || 0),
        totalPages: Math.ceil(Number(countRows[0]?.total || 0) / limit),
      },
    };
  }

  async getOrderDetail(id: number) {
    await this.requireRow('orders', 'order_id', id);
    const orderRows = await this.dataSource.query(
      `
      SELECT
        o.*,
        u.user_full_name,
        u.user_email,
        u.user_phone,
        os.order_status_code,
        os.order_status_name,
        COALESCE(vot.total_amount, 0) AS total_amount,
        osa.receiver_name,
        osa.receiver_phone,
        osa.shipping_province,
        osa.shipping_district,
        osa.shipping_ward,
        osa.shipping_street
      FROM orders o
      JOIN users u ON u.user_id = o.customer_id
      JOIN order_statuses os ON os.order_status_id = o.order_status_id
      LEFT JOIN vw_order_totals vot ON vot.order_id = o.order_id
      LEFT JOIN order_shipping_addresses osa ON osa.order_id = o.order_id
      WHERE o.order_id = ?
      LIMIT 1
      `,
      [id],
    );
    const [items, statusLogs, payments] = await Promise.all([
      this.dataSource.query(
        `
        SELECT
          oi.product_id AS productId,
          p.product_name AS productName,
          oi.variant_id AS variantId,
          pv.variant_name AS variantName,
          oi.ordered_quantity AS quantity,
          oi.unit_price_at_order AS unitPrice,
          oi.ordered_quantity * oi.unit_price_at_order AS lineTotal
        FROM order_items oi
        JOIN products p ON p.product_id = oi.product_id
        LEFT JOIN product_variants pv ON pv.variant_id = oi.variant_id
        WHERE oi.order_id = ?
        `,
        [id],
      ),
      this.dataSource.query(
        `
        SELECT
          osl.order_status_log_id AS id,
          old_os.order_status_code AS oldStatus,
          new_os.order_status_code AS newStatus,
          osl.status_note AS note,
          u.user_full_name AS changedBy,
          osl.changed_at AS changedAt
        FROM order_status_logs osl
        LEFT JOIN order_statuses old_os ON old_os.order_status_id = osl.old_order_status_id
        JOIN order_statuses new_os ON new_os.order_status_id = osl.new_order_status_id
        LEFT JOIN users u ON u.user_id = osl.changed_by_user_id
        WHERE osl.order_id = ?
        ORDER BY osl.changed_at DESC
        `,
        [id],
      ),
      this.dataSource.query(
        `
        SELECT
          pay.payment_id AS id,
          pm.payment_method_code AS methodCode,
          ps.payment_status_code AS statusCode,
          pay.payment_code AS code,
          pay.payment_amount AS amount,
          pay.transaction_code AS transactionCode,
          pay.paid_at AS paidAt,
          pay.created_at AS createdAt
        FROM payments pay
        JOIN payment_methods pm ON pm.payment_method_id = pay.payment_method_id
        JOIN payment_statuses ps ON ps.payment_status_id = pay.payment_status_id
        WHERE pay.order_id = ?
        ORDER BY pay.created_at DESC
        `,
        [id],
      ),
    ]);
    return {
      ...orderRows[0],
      order_id: Number(orderRows[0].order_id),
      total_amount: Number(orderRows[0].total_amount || 0),
      items: items.map((row: any) => ({
        ...row,
        productId: Number(row.productId),
        variantId: row.variantId === null ? null : Number(row.variantId),
        quantity: Number(row.quantity),
        unitPrice: Number(row.unitPrice),
        lineTotal: Number(row.lineTotal),
      })),
      statusLogs,
      payments: payments.map((row: any) => ({
        ...row,
        id: Number(row.id),
        amount: Number(row.amount || 0),
      })),
    };
  }

  async updateOrderStatus(id: number, dto: UpdateOrderStatusDto, actorId: number) {
    const order = await this.requireRow('orders', 'order_id', id);
    const statusCode = this.normalizeCode(dto.statusCode);
    const statusRows = await this.dataSource.query(
      `SELECT order_status_id FROM order_statuses WHERE order_status_code = ? LIMIT 1`,
      [statusCode],
    );
    if (!statusRows.length) throw new BadRequestException('Trạng thái đơn hàng không tồn tại');
    const newStatusId = Number(statusRows[0].order_status_id);
    if (newStatusId === Number(order.order_status_id)) {
      return { success: true, message: 'Đơn hàng đã ở trạng thái này' };
    }

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      await runner.query(`UPDATE orders SET order_status_id = ?, order_updated_at = NOW() WHERE order_id = ?`, [newStatusId, id]);
      await runner.query(
        `
        INSERT INTO order_status_logs (
          order_id, old_order_status_id, new_order_status_id, changed_by_user_id, status_note
        ) VALUES (?, ?, ?, ?, ?)
        `,
        [id, order.order_status_id, newStatusId, actorId, dto.note || null],
      );
      await this.audit(actorId, 'UPDATE_ORDER_STATUS', 'orders', id, `Đổi trạng thái đơn ${order.order_code} thành ${statusCode}`, runner);
      await runner.commitTransaction();
      return { success: true, message: 'Cập nhật trạng thái đơn hàng thành công' };
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async listPayments(query: AdminListQueryDto) {
    const { page, limit, offset } = this.page(query);
    const conditions: string[] = [];
    const params: any[] = [];
    if (query.search?.trim()) {
      conditions.push(`(pay.payment_code LIKE ? OR pay.transaction_code LIKE ? OR o.order_code LIKE ?)`);
      const keyword = `%${query.search.trim()}%`;
      params.push(keyword, keyword, keyword);
    }
    if (query.status) {
      conditions.push(`ps.payment_status_code = ?`);
      params.push(this.normalizeCode(query.status));
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRows = await this.dataSource.query(
      `SELECT COUNT(*) AS total FROM payments pay JOIN orders o ON o.order_id = pay.order_id JOIN payment_statuses ps ON ps.payment_status_id = pay.payment_status_id ${where}`,
      params,
    );
    const rows = await this.dataSource.query(
      `
      SELECT
        pay.payment_id AS id,
        pay.payment_code AS code,
        pay.payment_amount AS amount,
        pay.transaction_code AS transactionCode,
        pay.paid_at AS paidAt,
        pay.created_at AS createdAt,
        o.order_id AS orderId,
        o.order_code AS orderCode,
        u.user_full_name AS customerName,
        pm.payment_method_code AS methodCode,
        pm.payment_method_name AS methodName,
        ps.payment_status_code AS statusCode,
        ps.payment_status_name AS statusName
      FROM payments pay
      JOIN orders o ON o.order_id = pay.order_id
      JOIN users u ON u.user_id = o.customer_id
      JOIN payment_methods pm ON pm.payment_method_id = pay.payment_method_id
      JOIN payment_statuses ps ON ps.payment_status_id = pay.payment_status_id
      ${where}
      ORDER BY pay.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );
    return {
      items: rows.map((row: any) => ({
        ...row,
        id: Number(row.id),
        orderId: Number(row.orderId),
        amount: Number(row.amount || 0),
      })),
      pagination: {
        page,
        limit,
        total: Number(countRows[0]?.total || 0),
        totalPages: Math.ceil(Number(countRows[0]?.total || 0) / limit),
      },
    };
  }

  async updatePaymentStatus(id: number, dto: UpdatePaymentStatusDto, actorId: number) {
    const payment = await this.requireRow('payments', 'payment_id', id);
    const statusCode = this.normalizeCode(dto.statusCode);
    const statusRows = await this.dataSource.query(
      `SELECT payment_status_id FROM payment_statuses WHERE payment_status_code = ? LIMIT 1`,
      [statusCode],
    );
    if (!statusRows.length) throw new BadRequestException('Trạng thái thanh toán không tồn tại');
    await this.dataSource.query(
      `
      UPDATE payments
      SET payment_status_id = ?, transaction_code = COALESCE(?, transaction_code),
          paid_at = CASE WHEN ? = 'PAID' THEN COALESCE(paid_at, NOW()) ELSE paid_at END
      WHERE payment_id = ?
      `,
      [statusRows[0].payment_status_id, dto.transactionCode || null, statusCode, id],
    );
    await this.audit(actorId, 'UPDATE_PAYMENT_STATUS', 'payments', id, `Đổi thanh toán ${payment.payment_code} thành ${statusCode}`);
    return { success: true, message: 'Cập nhật thanh toán thành công' };
  }

  async listReviews(query: AdminListQueryDto) {
    const { page, limit, offset } = this.page(query);
    const conditions: string[] = [];
    const params: any[] = [];
    if (query.search?.trim()) {
      conditions.push(`(p.product_name LIKE ? OR u.user_full_name LIKE ? OR r.review_title LIKE ?)`);
      const keyword = `%${query.search.trim()}%`;
      params.push(keyword, keyword, keyword);
    }
    if (query.status) {
      conditions.push(`r.review_status = ?`);
      params.push(this.normalizeCode(query.status));
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRows = await this.dataSource.query(
      `SELECT COUNT(*) AS total FROM product_reviews r JOIN products p ON p.product_id = r.product_id JOIN users u ON u.user_id = r.user_id ${where}`,
      params,
    );
    const rows = await this.dataSource.query(
      `
      SELECT
        r.review_id AS id,
        r.rating,
        r.review_title AS title,
        r.review_content AS content,
        r.review_status AS status,
        r.is_verified_purchase AS verifiedPurchase,
        r.helpful_count AS helpfulCount,
        r.created_at AS createdAt,
        p.product_id AS productId,
        p.product_name AS productName,
        u.user_id AS userId,
        u.user_full_name AS userName,
        u.user_email AS userEmail,
        (SELECT COUNT(*) FROM product_review_replies prr WHERE prr.review_id = r.review_id) AS replyCount
      FROM product_reviews r
      JOIN products p ON p.product_id = r.product_id
      JOIN users u ON u.user_id = r.user_id
      ${where}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );
    return {
      items: rows.map((row: any) => ({
        ...row,
        id: Number(row.id),
        rating: Number(row.rating),
        helpfulCount: Number(row.helpfulCount || 0),
        productId: Number(row.productId),
        userId: Number(row.userId),
        replyCount: Number(row.replyCount || 0),
      })),
      pagination: {
        page,
        limit,
        total: Number(countRows[0]?.total || 0),
        totalPages: Math.ceil(Number(countRows[0]?.total || 0) / limit),
      },
    };
  }

  async moderateReview(id: number, dto: ModerateReviewDto, actorId: number) {
    await this.requireRow('product_reviews', 'review_id', id);
    await this.dataSource.query(`UPDATE product_reviews SET review_status = ?, updated_at = NOW() WHERE review_id = ?`, [dto.status, id]);
    await this.audit(actorId, 'MODERATE_REVIEW', 'product_reviews', id, `Đổi trạng thái đánh giá thành ${dto.status}`);
    return { success: true, message: 'Cập nhật đánh giá thành công' };
  }

  async replyReview(id: number, dto: ReplyReviewDto, actorId: number) {
    await this.requireRow('product_reviews', 'review_id', id);
    const result = await this.dataSource.query(
      `INSERT INTO product_review_replies (review_id, staff_user_id, reply_content) VALUES (?, ?, ?)`,
      [id, actorId, dto.content.trim()],
    );
    const replyId = Number(result.insertId);
    await this.audit(actorId, 'REPLY_REVIEW', 'product_review_replies', replyId, `Phản hồi đánh giá #${id}`);
    return { success: true, message: 'Phản hồi đánh giá thành công', id: replyId };
  }

  async deleteReview(id: number, actorId: number) {
    await this.requireRow('product_reviews', 'review_id', id);
    await this.dataSource.query(`DELETE FROM product_reviews WHERE review_id = ?`, [id]);
    await this.audit(actorId, 'DELETE_REVIEW', 'product_reviews', id, `Xóa đánh giá #${id}`);
    return { success: true, message: 'Xóa đánh giá thành công' };
  }

  async listPromotions(query: AdminListQueryDto) {
    const { page, limit, offset } = this.page(query);
    const conditions: string[] = [];
    const params: any[] = [];
    if (query.search?.trim()) {
      conditions.push(`(promotion_code LIKE ? OR promotion_name LIKE ?)`);
      const keyword = `%${query.search.trim()}%`;
      params.push(keyword, keyword);
    }
    if (query.status) {
      conditions.push(`promotion_status = ?`);
      params.push(this.normalizeCode(query.status));
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRows = await this.dataSource.query(`SELECT COUNT(*) AS total FROM promotions ${where}`, params);
    const rows = await this.dataSource.query(
      `
      SELECT
        p.*,
        u.user_full_name AS created_by_name,
        (SELECT COUNT(*) FROM promotion_products pp WHERE pp.promotion_id = p.promotion_id) AS product_count
      FROM promotions p
      LEFT JOIN users u ON u.user_id = p.created_by_user_id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );
    return {
      items: rows.map((row: any) => ({
        ...row,
        promotion_id: Number(row.promotion_id),
        discount_value: Number(row.discount_value || 0),
        min_order_value: Number(row.min_order_value || 0),
        max_discount_value: row.max_discount_value === null ? null : Number(row.max_discount_value),
        usage_limit: row.usage_limit === null ? null : Number(row.usage_limit),
        used_count: Number(row.used_count || 0),
        product_count: Number(row.product_count || 0),
      })),
      pagination: {
        page,
        limit,
        total: Number(countRows[0]?.total || 0),
        totalPages: Math.ceil(Number(countRows[0]?.total || 0) / limit),
      },
    };
  }

  async createPromotion(dto: CreatePromotionDto, actorId: number) {
    if (new Date(dto.endAt).getTime() <= new Date(dto.startAt).getTime()) {
      throw new BadRequestException('Thời gian kết thúc phải sau thời gian bắt đầu');
    }
    if (dto.discountType === 'PERCENT' && dto.discountValue > 100) {
      throw new BadRequestException('Giảm phần trăm không được vượt quá 100');
    }

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const result = await runner.query(
        `
        INSERT INTO promotions (
          promotion_code, promotion_name, promotion_description, discount_type,
          discount_value, min_order_value, max_discount_value, start_at, end_at,
          usage_limit, promotion_status, created_by_user_id, updated_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          this.normalizeCode(dto.code),
          dto.name.trim(),
          dto.description || null,
          dto.discountType,
          dto.discountValue,
          dto.minOrderValue,
          dto.maxDiscountValue ?? null,
          dto.startAt,
          dto.endAt,
          dto.usageLimit ?? null,
          dto.status,
          actorId,
          actorId,
        ],
      );
      const id = Number(result.insertId);
      for (const productId of dto.productIds || []) {
        await runner.query(`INSERT IGNORE INTO promotion_products (promotion_id, product_id) VALUES (?, ?)`, [id, Number(productId)]);
      }
      await this.audit(actorId, 'CREATE_PROMOTION', 'promotions', id, `Tạo khuyến mãi ${dto.code}`, runner);
      await runner.commitTransaction();
      return { success: true, message: 'Tạo khuyến mãi thành công', id };
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async updatePromotion(id: number, dto: UpdatePromotionDto, actorId: number) {
    await this.requireRow('promotions', 'promotion_id', id);
    const map: Array<[keyof UpdatePromotionDto, string, (value: any) => any]> = [
      ['code', 'promotion_code', (v) => this.normalizeCode(String(v))],
      ['name', 'promotion_name', (v) => String(v).trim()],
      ['description', 'promotion_description', (v) => v || null],
      ['discountType', 'discount_type', String],
      ['discountValue', 'discount_value', Number],
      ['minOrderValue', 'min_order_value', Number],
      ['maxDiscountValue', 'max_discount_value', (v) => v ?? null],
      ['startAt', 'start_at', String],
      ['endAt', 'end_at', String],
      ['usageLimit', 'usage_limit', (v) => v ?? null],
      ['status', 'promotion_status', String],
    ];
    const fields: string[] = [];
    const params: any[] = [];
    for (const [key, column, transform] of map) {
      if (dto[key] !== undefined) {
        fields.push(`${column} = ?`);
        params.push(transform(dto[key]));
      }
    }
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      if (fields.length) {
        await runner.query(
          `UPDATE promotions SET ${fields.join(', ')}, updated_by_user_id = ?, updated_at = NOW() WHERE promotion_id = ?`,
          [...params, actorId, id],
        );
      }
      if (dto.productIds !== undefined) {
        await runner.query(`DELETE FROM promotion_products WHERE promotion_id = ?`, [id]);
        for (const productId of dto.productIds) {
          await runner.query(`INSERT IGNORE INTO promotion_products (promotion_id, product_id) VALUES (?, ?)`, [id, Number(productId)]);
        }
      }
      await this.audit(actorId, 'UPDATE_PROMOTION', 'promotions', id, `Cập nhật khuyến mãi #${id}`, runner);
      await runner.commitTransaction();
      return { success: true, message: 'Cập nhật khuyến mãi thành công' };
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async deactivatePromotion(id: number, actorId: number) {
    await this.requireRow('promotions', 'promotion_id', id);
    await this.dataSource.query(`UPDATE promotions SET promotion_status = 'INACTIVE', updated_by_user_id = ?, updated_at = NOW() WHERE promotion_id = ?`, [actorId, id]);
    await this.audit(actorId, 'DEACTIVATE_PROMOTION', 'promotions', id, `Vô hiệu hóa khuyến mãi #${id}`);
    return { success: true, message: 'Đã vô hiệu hóa khuyến mãi' };
  }

  async getReports(query: AdminListQueryDto) {
    const from = query.from || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10);
    const to = query.to || new Date().toISOString().slice(0, 10);
    const [summaryRows, dailyRevenue, topProducts, orderStatus, paymentStatus] = await Promise.all([
      this.dataSource.query(
        `
        SELECT
          COUNT(DISTINCT o.order_id) AS totalOrders,
          COALESCE(SUM(CASE WHEN os.order_status_code = 'DELIVERED' THEN vot.total_amount ELSE 0 END), 0) AS revenue,
          COALESCE(AVG(CASE WHEN os.order_status_code = 'DELIVERED' THEN vot.total_amount END), 0) AS averageOrderValue,
          COUNT(DISTINCT CASE WHEN os.order_status_code = 'DELIVERED' THEN o.customer_id END) AS purchasingCustomers
        FROM orders o
        JOIN order_statuses os ON os.order_status_id = o.order_status_id
        LEFT JOIN vw_order_totals vot ON vot.order_id = o.order_id
        WHERE o.order_created_at >= ?
          AND o.order_created_at < DATE_ADD(?, INTERVAL 1 DAY)
        `,
        [from, to],
      ),
      this.dataSource.query(
        `
        SELECT DATE(o.order_created_at) AS reportDate, COALESCE(SUM(vot.total_amount), 0) AS revenue, COUNT(*) AS orders
        FROM orders o
        JOIN order_statuses os ON os.order_status_id = o.order_status_id
        JOIN vw_order_totals vot ON vot.order_id = o.order_id
        WHERE os.order_status_code = 'DELIVERED'
          AND o.order_created_at >= ?
          AND o.order_created_at < DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY DATE(o.order_created_at)
        ORDER BY reportDate
        `,
        [from, to],
      ),
      this.dataSource.query(
        `
        SELECT
          p.product_id AS productId,
          p.product_name AS productName,
          SUM(oi.ordered_quantity) AS quantitySold,
          SUM(oi.ordered_quantity * oi.unit_price_at_order) AS revenue
        FROM order_items oi
        JOIN products p ON p.product_id = oi.product_id
        JOIN orders o ON o.order_id = oi.order_id
        JOIN order_statuses os ON os.order_status_id = o.order_status_id
        WHERE os.order_status_code = 'DELIVERED'
          AND o.order_created_at >= ?
          AND o.order_created_at < DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY p.product_id, p.product_name
        ORDER BY quantitySold DESC
        LIMIT 10
        `,
        [from, to],
      ),
      this.dataSource.query(
        `
        SELECT os.order_status_code AS statusCode, os.order_status_name AS statusName, COUNT(*) AS total
        FROM orders o
        JOIN order_statuses os ON os.order_status_id = o.order_status_id
        WHERE o.order_created_at >= ? AND o.order_created_at < DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY os.order_status_id, os.order_status_code, os.order_status_name
        ORDER BY total DESC
        `,
        [from, to],
      ),
      this.dataSource.query(
        `
        SELECT ps.payment_status_code AS statusCode, ps.payment_status_name AS statusName, COUNT(*) AS total, COALESCE(SUM(pay.payment_amount), 0) AS amount
        FROM payments pay
        JOIN payment_statuses ps ON ps.payment_status_id = pay.payment_status_id
        WHERE pay.created_at >= ? AND pay.created_at < DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY ps.payment_status_id, ps.payment_status_code, ps.payment_status_name
        ORDER BY total DESC
        `,
        [from, to],
      ),
    ]);
    const summary = summaryRows[0] || {};
    return {
      range: { from, to },
      summary: {
        totalOrders: Number(summary.totalOrders || 0),
        revenue: Number(summary.revenue || 0),
        averageOrderValue: Number(summary.averageOrderValue || 0),
        purchasingCustomers: Number(summary.purchasingCustomers || 0),
      },
      dailyRevenue: dailyRevenue.map((row: any) => ({
        ...row,
        revenue: Number(row.revenue || 0),
        orders: Number(row.orders || 0),
      })),
      topProducts: topProducts.map((row: any) => ({
        ...row,
        productId: Number(row.productId),
        quantitySold: Number(row.quantitySold || 0),
        revenue: Number(row.revenue || 0),
      })),
      orderStatus: orderStatus.map((row: any) => ({ ...row, total: Number(row.total || 0) })),
      paymentStatus: paymentStatus.map((row: any) => ({
        ...row,
        total: Number(row.total || 0),
        amount: Number(row.amount || 0),
      })),
    };
  }

  async listAuditLogs(query: AdminListQueryDto) {
    const { page, limit, offset } = this.page(query);
    const conditions: string[] = [];
    const params: any[] = [];
    if (query.search?.trim()) {
      conditions.push(`(al.action_name LIKE ? OR al.affected_table_name LIKE ? OR al.action_description LIKE ? OR u.user_full_name LIKE ?)`);
      const keyword = `%${query.search.trim()}%`;
      params.push(keyword, keyword, keyword, keyword);
    }
    if (query.from) {
      conditions.push(`al.action_at >= ?`);
      params.push(query.from);
    }
    if (query.to) {
      conditions.push(`al.action_at < DATE_ADD(?, INTERVAL 1 DAY)`);
      params.push(query.to);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRows = await this.dataSource.query(`SELECT COUNT(*) AS total FROM audit_logs al LEFT JOIN users u ON u.user_id = al.actor_user_id ${where}`, params);
    const rows = await this.dataSource.query(
      `
      SELECT
        al.audit_log_id AS id,
        al.actor_user_id AS actorId,
        u.user_full_name AS actorName,
        u.user_email AS actorEmail,
        al.action_name AS actionName,
        al.affected_table_name AS tableName,
        al.affected_record_id AS recordId,
        al.action_description AS description,
        al.action_at AS createdAt
      FROM audit_logs al
      LEFT JOIN users u ON u.user_id = al.actor_user_id
      ${where}
      ORDER BY al.action_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );
    return {
      items: rows.map((row: any) => ({
        ...row,
        id: Number(row.id),
        actorId: row.actorId === null ? null : Number(row.actorId),
        recordId: row.recordId === null ? null : Number(row.recordId),
      })),
      pagination: {
        page,
        limit,
        total: Number(countRows[0]?.total || 0),
        totalPages: Math.ceil(Number(countRows[0]?.total || 0) / limit),
      },
    };
  }

  async listAiSearchLogs(query: AdminListQueryDto) {
    const { page, limit, offset } = this.page(query);
    const conditions: string[] = [];
    const params: any[] = [];
    if (query.search?.trim()) {
      conditions.push(`asl.query_text LIKE ?`);
      params.push(`%${query.search.trim()}%`);
    }
    if (query.from) {
      conditions.push(`asl.searched_at >= ?`);
      params.push(query.from);
    }
    if (query.to) {
      conditions.push(`asl.searched_at < DATE_ADD(?, INTERVAL 1 DAY)`);
      params.push(query.to);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRows = await this.dataSource.query(`SELECT COUNT(*) AS total FROM ai_search_logs asl ${where}`, params);
    const rows = await this.dataSource.query(
      `
      SELECT
        asl.ai_search_log_id AS id,
        asl.query_text AS queryText,
        asl.detected_min_price AS minPrice,
        asl.detected_max_price AS maxPrice,
        asl.detected_purpose AS purpose,
        asl.searched_at AS searchedAt,
        u.user_full_name AS customerName,
        u.user_email AS customerEmail,
        c.category_name AS categoryName,
        (SELECT COUNT(*) FROM ai_search_results ar WHERE ar.ai_search_log_id = asl.ai_search_log_id) AS resultCount
      FROM ai_search_logs asl
      LEFT JOIN users u ON u.user_id = asl.customer_id
      LEFT JOIN categories c ON c.category_id = asl.detected_category_id
      ${where}
      ORDER BY asl.searched_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );
    return {
      items: rows.map((row: any) => ({
        ...row,
        id: Number(row.id),
        minPrice: row.minPrice === null ? null : Number(row.minPrice),
        maxPrice: row.maxPrice === null ? null : Number(row.maxPrice),
        resultCount: Number(row.resultCount || 0),
      })),
      pagination: {
        page,
        limit,
        total: Number(countRows[0]?.total || 0),
        totalPages: Math.ceil(Number(countRows[0]?.total || 0) / limit),
      },
    };
  }

  async getSettings(group?: string) {
    const rows = group
      ? await this.dataSource.query(
          `SELECT * FROM system_settings WHERE setting_group = ? ORDER BY setting_key`,
          [group],
        )
      : await this.dataSource.query(`SELECT * FROM system_settings ORDER BY setting_group, setting_key`);
    return rows.map((row: any) => ({
      key: row.setting_key,
      group: row.setting_group,
      value: row.setting_value,
      valueType: row.value_type,
      description: row.setting_description,
      updatedAt: row.updated_at,
    }));
  }

  async updateSetting(dto: UpdateSystemSettingDto, actorId: number) {
    if (dto.valueType === 'JSON') {
      try {
        JSON.parse(dto.value);
      } catch {
        throw new BadRequestException('Giá trị JSON không hợp lệ');
      }
    }
    await this.dataSource.query(
      `
      INSERT INTO system_settings (
        setting_key, setting_group, setting_value, value_type,
        setting_description, updated_by_user_id
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        setting_group = VALUES(setting_group),
        setting_value = VALUES(setting_value),
        value_type = VALUES(value_type),
        setting_description = VALUES(setting_description),
        updated_by_user_id = VALUES(updated_by_user_id),
        updated_at = NOW()
      `,
      [dto.key, dto.group, dto.value, dto.valueType, dto.description || null, actorId],
    );
    await this.audit(actorId, 'UPDATE_SYSTEM_SETTING', 'system_settings', null, `Cập nhật cấu hình ${dto.key}`);
    return { success: true, message: 'Lưu cấu hình thành công' };
  }
}

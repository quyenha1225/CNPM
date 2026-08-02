import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import {
  CreateProductImageDto,
  CreateProductVariantDto,
  CreateStaffAccountDto,
  InventoryTransactionDto,
  InventoryTypeCode,
  OrderStatusCode,
  PaymentStatusCode,
  ReviewStatusCode,
  UpdatePaymentStatusDto,
  UpdateProductVariantDto,
  UpdateStaffProductDto,
} from './dto/staff.dto';

type Actor = {
  id: number;
  role: string;
};

@Injectable()
export class StaffService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  private async writeAudit(
    actorId: number,
    actionName: string,
    tableName: string,
    recordId: number | null,
    description: string,
  ) {
    await this.dataSource.query(
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
      [
        actorId,
        actionName,
        tableName,
        recordId,
        description,
      ],
    );
  }

  async getDashboard() {
    const [
      summaryRows,
      recentOrders,
      lowStock,
      pendingReviews,
    ] = await Promise.all([
      this.dataSource.query(
        `
        SELECT
          (
            SELECT COUNT(*)
            FROM orders
            WHERE DATE(order_created_at) = CURDATE()
          ) AS ordersToday,

          (
            SELECT COUNT(*)
            FROM orders o
            JOIN order_statuses os
              ON os.order_status_id = o.order_status_id
            WHERE os.order_status_code IN ('PENDING', 'CONFIRMED')
          ) AS ordersWaiting,

          (
            SELECT COUNT(*)
            FROM products p
            LEFT JOIN vw_product_stock vps
              ON vps.product_id = p.product_id
            WHERE p.product_status = 'ACTIVE'
              AND COALESCE(vps.current_stock, 0) <= 10
          ) AS lowStockProducts,

          (
            SELECT COUNT(*)
            FROM product_reviews
            WHERE review_status = 'PENDING'
          ) AS pendingReviews,

          (
            SELECT COALESCE(SUM(payment_amount), 0)
            FROM payments p
            JOIN payment_statuses ps
              ON ps.payment_status_id = p.payment_status_id
            WHERE ps.payment_status_code = 'PAID'
              AND DATE_FORMAT(p.paid_at, '%Y-%m') =
                  DATE_FORMAT(CURDATE(), '%Y-%m')
          ) AS revenueThisMonth
        `,
      ),

      this.dataSource.query(
        `
        SELECT
          o.order_id AS id,
          o.order_code AS code,
          u.user_full_name AS customerName,
          os.order_status_code AS status,
          os.order_status_name AS statusName,
          COALESCE(vot.total_amount, 0) AS totalAmount,
          o.order_created_at AS createdAt
        FROM orders o
        JOIN users u
          ON u.user_id = o.customer_id
        JOIN order_statuses os
          ON os.order_status_id = o.order_status_id
        LEFT JOIN vw_order_totals vot
          ON vot.order_id = o.order_id
        ORDER BY o.order_created_at DESC
        LIMIT 8
        `,
      ),

      this.dataSource.query(
        `
        SELECT
          p.product_id AS id,
          p.product_name AS name,
          COALESCE(vps.current_stock, 0) AS stock
        FROM products p
        LEFT JOIN vw_product_stock vps
          ON vps.product_id = p.product_id
        WHERE p.product_status = 'ACTIVE'
          AND COALESCE(vps.current_stock, 0) <= 10
        ORDER BY stock ASC, p.product_name ASC
        LIMIT 8
        `,
      ),

      this.dataSource.query(
        `
        SELECT
          r.review_id AS id,
          p.product_name AS productName,
          u.user_full_name AS customerName,
          r.rating,
          r.review_title AS title,
          r.created_at AS createdAt
        FROM product_reviews r
        JOIN products p
          ON p.product_id = r.product_id
        JOIN users u
          ON u.user_id = r.user_id
        WHERE r.review_status = 'PENDING'
        ORDER BY r.created_at DESC
        LIMIT 8
        `,
      ),
    ]);

    const summary = summaryRows[0] || {};

    return {
      summary: {
        ordersToday: Number(
          summary.ordersToday || 0,
        ),
        ordersWaiting: Number(
          summary.ordersWaiting || 0,
        ),
        lowStockProducts: Number(
          summary.lowStockProducts || 0,
        ),
        pendingReviews: Number(
          summary.pendingReviews || 0,
        ),
        revenueThisMonth: Number(
          summary.revenueThisMonth || 0,
        ),
      },
      recentOrders: recentOrders.map(
        (row: any) => ({
          ...row,
          id: Number(row.id),
          totalAmount: Number(
            row.totalAmount || 0,
          ),
        }),
      ),
      lowStock: lowStock.map(
        (row: any) => ({
          ...row,
          id: Number(row.id),
          stock: Number(row.stock || 0),
        }),
      ),
      pendingReviews: pendingReviews.map(
        (row: any) => ({
          ...row,
          id: Number(row.id),
          rating: Number(
            row.rating || 0,
          ),
        }),
      ),
    };
  }

  async listOrders(
    search = '',
    status = '',
  ) {
    const keyword = `%${search.trim()}%`;
    const statusCode = status
      .trim()
      .toUpperCase();

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

        os.order_status_code AS status,
        os.order_status_name AS statusName,

        COALESCE(vot.total_amount, 0) AS totalAmount,

        osa.receiver_name AS receiverName,
        osa.receiver_phone AS receiverPhone,
        CONCAT_WS(
          ', ',
          osa.shipping_street,
          osa.shipping_ward,
          osa.shipping_district,
          osa.shipping_province
        ) AS shippingAddress,

        ps.payment_status_code AS paymentStatus,
        pm.payment_method_name AS paymentMethod

      FROM orders o

      JOIN users u
        ON u.user_id = o.customer_id

      JOIN order_statuses os
        ON os.order_status_id = o.order_status_id

      LEFT JOIN vw_order_totals vot
        ON vot.order_id = o.order_id

      LEFT JOIN order_shipping_addresses osa
        ON osa.order_id = o.order_id

      LEFT JOIN payments payment_row
        ON payment_row.order_id = o.order_id

      LEFT JOIN payment_statuses ps
        ON ps.payment_status_id =
           payment_row.payment_status_id

      LEFT JOIN payment_methods pm
        ON pm.payment_method_id =
           payment_row.payment_method_id

      WHERE
        (
          ? = ''
          OR o.order_code LIKE ?
          OR u.user_full_name LIKE ?
          OR u.user_email LIKE ?
          OR u.user_phone LIKE ?
        )
        AND (
          ? = ''
          OR os.order_status_code = ?
        )

      ORDER BY o.order_created_at DESC
      LIMIT 200
      `,
      [
        search.trim(),
        keyword,
        keyword,
        keyword,
        keyword,
        statusCode,
        statusCode,
      ],
    );

    return rows.map((row: any) => ({
      ...row,
      id: Number(row.id),
      customerId: Number(
        row.customerId,
      ),
      totalAmount: Number(
        row.totalAmount || 0,
      ),
    }));
  }

  async updateOrderStatus(
    orderId: number,
    newStatus: OrderStatusCode,
    note: string | undefined,
    actor: Actor,
  ) {
    const queryRunner =
      this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderRows =
        await queryRunner.query(
          `
          SELECT
            o.order_id,
            o.order_status_id,
            os.order_status_code
          FROM orders o
          JOIN order_statuses os
            ON os.order_status_id =
               o.order_status_id
          WHERE o.order_id = ?
          FOR UPDATE
          `,
          [orderId],
        );

      if (!orderRows.length) {
        throw new NotFoundException(
          'Không tìm thấy đơn hàng',
        );
      }

      const currentStatus =
        String(
          orderRows[0]
            .order_status_code,
        ).toUpperCase();

      const allowedTransitions: Record<
        string,
        string[]
      > = {
        PENDING: [
          'CONFIRMED',
          'CANCELLED',
        ],
        CONFIRMED: [
          'SHIPPING',
          'CANCELLED',
        ],
        SHIPPING: ['DELIVERED'],
        DELIVERED: [],
        CANCELLED: [],
      };

      if (
        currentStatus !== newStatus &&
        !(
          allowedTransitions[
            currentStatus
          ] || []
        ).includes(newStatus)
      ) {
        throw new BadRequestException(
          `Không thể chuyển đơn từ ${currentStatus} sang ${newStatus}`,
        );
      }

      const statusRows =
        await queryRunner.query(
          `
          SELECT order_status_id
          FROM order_statuses
          WHERE order_status_code = ?
          LIMIT 1
          `,
          [newStatus],
        );

      if (!statusRows.length) {
        throw new BadRequestException(
          'Trạng thái đơn hàng chưa được cấu hình',
        );
      }

      const newStatusId =
        statusRows[0].order_status_id;

      await queryRunner.query(
        `
        UPDATE orders
        SET
          order_status_id = ?,
          order_updated_at = NOW()
        WHERE order_id = ?
        `,
        [newStatusId, orderId],
      );

      await queryRunner.query(
        `
        INSERT INTO order_status_logs (
          order_id,
          old_order_status_id,
          new_order_status_id,
          changed_by_user_id,
          status_note
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          orderId,
          orderRows[0].order_status_id,
          newStatusId,
          actor.id,
          note?.trim() || null,
        ],
      );

      await queryRunner.query(
        `
        INSERT INTO audit_logs (
          actor_user_id,
          action_name,
          affected_table_name,
          affected_record_id,
          action_description
        )
        VALUES (?, ?, 'orders', ?, ?)
        `,
        [
          actor.id,
          'UPDATE_ORDER_STATUS',
          orderId,
          `Đổi trạng thái ${currentStatus} -> ${newStatus}`,
        ],
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        message:
          'Cập nhật trạng thái đơn hàng thành công',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async listProducts(search = '') {
    const keyword = `%${search.trim()}%`;

    const rows = await this.dataSource.query(
      `
      SELECT
        p.product_id AS id,
        p.product_name AS name,
        p.product_slug AS slug,
        p.product_description AS description,
        p.base_price AS price,
        p.product_status AS status,
        c.category_name AS categoryName,
        b.brand_name AS brandName,
        COALESCE(vps.current_stock, 0) AS stock,
        (
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.product_id
          ORDER BY
            pi.is_thumbnail DESC,
            pi.sort_order ASC,
            pi.image_id ASC
          LIMIT 1
        ) AS image
      FROM products p
      JOIN categories c
        ON c.category_id = p.category_id
      LEFT JOIN brands b
        ON b.brand_id = p.brand_id
      LEFT JOIN vw_product_stock vps
        ON vps.product_id = p.product_id
      WHERE
        ? = ''
        OR p.product_name LIKE ?
        OR p.product_slug LIKE ?
        OR c.category_name LIKE ?
        OR b.brand_name LIKE ?
      ORDER BY p.product_id DESC
      LIMIT 200
      `,
      [
        search.trim(),
        keyword,
        keyword,
        keyword,
        keyword,
      ],
    );

    return rows.map((row: any) => ({
      ...row,
      id: Number(row.id),
      price: Number(row.price || 0),
      stock: Number(row.stock || 0),
    }));
  }

  async updateProduct(
    productId: number,
    dto: UpdateStaffProductDto,
    actor: Actor,
  ) {
    const fields: string[] = [];
    const params: Array<
      string | number
    > = [];

    if (dto.name !== undefined) {
      fields.push('product_name = ?');
      params.push(dto.name.trim());
    }

    if (dto.price !== undefined) {
      fields.push('base_price = ?');
      params.push(dto.price);
    }

    if (
      dto.description !== undefined
    ) {
      fields.push(
        'product_description = ?',
      );
      params.push(
        dto.description.trim(),
      );
    }

    if (dto.status !== undefined) {
      fields.push('product_status = ?');
      params.push(dto.status);
    }

    if (!fields.length) {
      throw new BadRequestException(
        'Không có dữ liệu cần cập nhật',
      );
    }

    fields.push(
      'updated_by_user_id = ?',
      'updated_at = NOW()',
    );
    params.push(actor.id, productId);

    const result =
      await this.dataSource.query(
        `
        UPDATE products
        SET ${fields.join(', ')}
        WHERE product_id = ?
        `,
        params,
      );

    if (
      !result.affectedRows &&
      !result.changedRows
    ) {
      const exists =
        await this.dataSource.query(
          `
          SELECT product_id
          FROM products
          WHERE product_id = ?
          LIMIT 1
          `,
          [productId],
        );

      if (!exists.length) {
        throw new NotFoundException(
          'Không tìm thấy sản phẩm',
        );
      }
    }

    await this.writeAudit(
      actor.id,
      'UPDATE_PRODUCT',
      'products',
      productId,
      'Nhân viên cập nhật thông tin sản phẩm',
    );

    return {
      success: true,
      message:
        'Cập nhật sản phẩm thành công',
    };
  }



  async getProductAssets(productId: number) {
    const productRows = await this.dataSource.query(
      `
      SELECT product_id
      FROM products
      WHERE product_id = ?
      LIMIT 1
      `,
      [productId],
    );

    if (!productRows.length) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    const [images, variants] = await Promise.all([
      this.dataSource.query(
        `
        SELECT
          image_id AS id,
          image_url AS imageUrl,
          is_thumbnail AS isThumbnail,
          sort_order AS sortOrder
        FROM product_images
        WHERE product_id = ?
        ORDER BY is_thumbnail DESC, sort_order ASC, image_id ASC
        `,
        [productId],
      ),
      this.listVariants(productId),
    ]);

    return {
      images: images.map((row: any) => ({
        ...row,
        id: Number(row.id),
        isThumbnail: Boolean(Number(row.isThumbnail || 0)),
        sortOrder: Number(row.sortOrder || 0),
      })),
      variants,
    };
  }

  async createProductImage(
    productId: number,
    dto: CreateProductImageDto,
    actor: Actor,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productRows = await queryRunner.query(
        `SELECT product_id FROM products WHERE product_id = ? LIMIT 1 FOR UPDATE`,
        [productId],
      );

      if (!productRows.length) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      if (dto.isThumbnail) {
        await queryRunner.query(
          `UPDATE product_images SET is_thumbnail = 0 WHERE product_id = ?`,
          [productId],
        );
      }

      const result = await queryRunner.query(
        `
        INSERT INTO product_images (
          product_id,
          image_url,
          is_thumbnail,
          sort_order
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          productId,
          dto.imageUrl.trim(),
          dto.isThumbnail ? 1 : 0,
          dto.sortOrder ?? 0,
        ],
      );

      await queryRunner.query(
        `
        INSERT INTO audit_logs (
          actor_user_id,
          action_name,
          affected_table_name,
          affected_record_id,
          action_description
        )
        VALUES (?, 'CREATE_PRODUCT_IMAGE', 'product_images', ?, ?)
        `,
        [actor.id, Number(result.insertId), `Thêm ảnh cho sản phẩm ${productId}`],
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Thêm hình ảnh sản phẩm thành công',
        imageId: Number(result.insertId),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteProductImage(
    productId: number,
    imageId: number,
    actor: Actor,
  ) {
    const result = await this.dataSource.query(
      `
      DELETE FROM product_images
      WHERE image_id = ? AND product_id = ?
      `,
      [imageId, productId],
    );

    if (!result.affectedRows) {
      throw new NotFoundException('Không tìm thấy hình ảnh');
    }

    await this.writeAudit(
      actor.id,
      'DELETE_PRODUCT_IMAGE',
      'product_images',
      imageId,
      `Xóa ảnh của sản phẩm ${productId}`,
    );

    return {
      success: true,
      message: 'Xóa hình ảnh thành công',
    };
  }

  async createProductVariant(
    productId: number,
    dto: CreateProductVariantDto,
    actor: Actor,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productRows = await queryRunner.query(
        `SELECT product_id FROM products WHERE product_id = ? LIMIT 1 FOR UPDATE`,
        [productId],
      );

      if (!productRows.length) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      const skuRows = await queryRunner.query(
        `SELECT variant_id FROM product_variants WHERE sku = ? LIMIT 1`,
        [dto.sku.trim()],
      );

      if (skuRows.length) {
        throw new BadRequestException('SKU phiên bản đã tồn tại');
      }

      if (dto.isDefault) {
        await queryRunner.query(
          `UPDATE product_variants SET is_default = 0 WHERE product_id = ?`,
          [productId],
        );
      }

      const result = await queryRunner.query(
        `
        INSERT INTO product_variants (
          product_id,
          variant_name,
          sku,
          color,
          ram_size,
          storage_size,
          gpu_option,
          cpu_option,
          additional_price,
          variant_status,
          is_default
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
        `,
        [
          productId,
          dto.name.trim(),
          dto.sku.trim(),
          dto.color?.trim() || null,
          dto.ram?.trim() || null,
          dto.storage?.trim() || null,
          dto.gpu?.trim() || null,
          dto.cpu?.trim() || null,
          dto.additionalPrice ?? 0,
          dto.isDefault ? 1 : 0,
        ],
      );

      await queryRunner.query(
        `
        INSERT INTO variant_inventory (
          variant_id,
          stock_quantity,
          reserved_quantity
        )
        VALUES (?, 0, 0)
        `,
        [result.insertId],
      );

      await queryRunner.query(
        `
        INSERT INTO audit_logs (
          actor_user_id,
          action_name,
          affected_table_name,
          affected_record_id,
          action_description
        )
        VALUES (?, 'CREATE_PRODUCT_VARIANT', 'product_variants', ?, ?)
        `,
        [actor.id, Number(result.insertId), `Tạo phiên bản ${dto.name.trim()}`],
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Tạo phiên bản sản phẩm thành công',
        variantId: Number(result.insertId),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProductVariant(
    productId: number,
    variantId: number,
    dto: UpdateProductVariantDto,
    actor: Actor,
  ) {
    const fields: string[] = [];
    const params: Array<string | number> = [];

    const addText = (column: string, value: string | undefined) => {
      if (value !== undefined) {
        fields.push(`${column} = ?`);
        params.push(value.trim() || '');
      }
    };

    addText('variant_name', dto.name);
    addText('sku', dto.sku);
    addText('color', dto.color);
    addText('ram_size', dto.ram);
    addText('storage_size', dto.storage);
    addText('gpu_option', dto.gpu);
    addText('cpu_option', dto.cpu);

    if (dto.additionalPrice !== undefined) {
      fields.push('additional_price = ?');
      params.push(dto.additionalPrice);
    }

    if (dto.status !== undefined) {
      fields.push('variant_status = ?');
      params.push(dto.status);
    }

    if (dto.isDefault !== undefined) {
      fields.push('is_default = ?');
      params.push(dto.isDefault ? 1 : 0);
    }

    if (!fields.length) {
      throw new BadRequestException('Không có dữ liệu phiên bản cần cập nhật');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const variantRows = await queryRunner.query(
        `
        SELECT variant_id
        FROM product_variants
        WHERE variant_id = ? AND product_id = ?
        LIMIT 1
        FOR UPDATE
        `,
        [variantId, productId],
      );

      if (!variantRows.length) {
        throw new NotFoundException('Không tìm thấy phiên bản sản phẩm');
      }

      if (dto.isDefault) {
        await queryRunner.query(
          `UPDATE product_variants SET is_default = 0 WHERE product_id = ?`,
          [productId],
        );
      }

      params.push(variantId, productId);

      await queryRunner.query(
        `
        UPDATE product_variants
        SET ${fields.join(', ')}
        WHERE variant_id = ? AND product_id = ?
        `,
        params,
      );

      await queryRunner.query(
        `
        INSERT INTO audit_logs (
          actor_user_id,
          action_name,
          affected_table_name,
          affected_record_id,
          action_description
        )
        VALUES (?, 'UPDATE_PRODUCT_VARIANT', 'product_variants', ?, ?)
        `,
        [actor.id, variantId, `Cập nhật phiên bản sản phẩm ${productId}`],
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Cập nhật phiên bản thành công',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async listInventory(
    search = '',
    lowStockOnly = false,
  ) {
    const keyword = `%${search.trim()}%`;

    const rows = await this.dataSource.query(
      `
      SELECT
        p.product_id AS id,
        p.product_name AS name,
        p.product_status AS status,
        c.category_name AS categoryName,
        COALESCE(vps.current_stock, 0) AS stock,
        COUNT(DISTINCT pv.variant_id) AS variantCount
      FROM products p
      JOIN categories c
        ON c.category_id = p.category_id
      LEFT JOIN vw_product_stock vps
        ON vps.product_id = p.product_id
      LEFT JOIN product_variants pv
        ON pv.product_id = p.product_id
       AND pv.variant_status = 'ACTIVE'
      WHERE
        (
          ? = ''
          OR p.product_name LIKE ?
          OR c.category_name LIKE ?
        )
      GROUP BY
        p.product_id,
        p.product_name,
        p.product_status,
        c.category_name,
        vps.current_stock
      HAVING
        ? = 0
        OR stock <= 10
      ORDER BY stock ASC, p.product_name ASC
      LIMIT 300
      `,
      [
        search.trim(),
        keyword,
        keyword,
        lowStockOnly ? 1 : 0,
      ],
    );

    return rows.map((row: any) => ({
      ...row,
      id: Number(row.id),
      stock: Number(row.stock || 0),
      variantCount: Number(
        row.variantCount || 0,
      ),
    }));
  }

  async listVariants(productId: number) {
    const rows = await this.dataSource.query(
      `
      SELECT
        pv.variant_id AS id,
        pv.variant_name AS name,
        pv.sku,
        pv.color,
        pv.ram_size AS ram,
        pv.storage_size AS storage,
        pv.gpu_option AS gpu,
        pv.cpu_option AS cpu,
        COALESCE(vi.stock_quantity, 0) AS stock,
        COALESCE(vi.reserved_quantity, 0) AS reserved,
        GREATEST(
          COALESCE(vi.stock_quantity, 0) -
          COALESCE(vi.reserved_quantity, 0),
          0
        ) AS available
      FROM product_variants pv
      LEFT JOIN variant_inventory vi
        ON vi.variant_id = pv.variant_id
      WHERE pv.product_id = ?
        AND pv.variant_status = 'ACTIVE'
      ORDER BY pv.is_default DESC, pv.variant_id ASC
      `,
      [productId],
    );

    return rows.map((row: any) => ({
      ...row,
      id: Number(row.id),
      stock: Number(row.stock || 0),
      reserved: Number(
        row.reserved || 0,
      ),
      available: Number(
        row.available || 0,
      ),
    }));
  }

  async createInventoryTransaction(
    dto: InventoryTransactionDto,
    actor: Actor,
  ) {
    if (
      dto.type !==
        InventoryTypeCode.ADJUST &&
      dto.quantity <= 0
    ) {
      throw new BadRequestException(
        'Số lượng nhập hoặc xuất phải lớn hơn 0',
      );
    }

    if (
      dto.type ===
        InventoryTypeCode.ADJUST &&
      dto.quantity === 0
    ) {
      throw new BadRequestException(
        'Số lượng điều chỉnh phải khác 0',
      );
    }

    const queryRunner =
      this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productRows =
        await queryRunner.query(
          `
          SELECT product_id, product_name
          FROM products
          WHERE product_id = ?
          LIMIT 1
          FOR UPDATE
          `,
          [dto.productId],
        );

      if (!productRows.length) {
        throw new NotFoundException(
          'Không tìm thấy sản phẩm',
        );
      }

      if (dto.variantId) {
        const variantRows =
          await queryRunner.query(
            `
            SELECT pv.variant_id
            FROM product_variants pv
            WHERE pv.variant_id = ?
              AND pv.product_id = ?
            LIMIT 1
            FOR UPDATE
            `,
            [
              dto.variantId,
              dto.productId,
            ],
          );

        if (!variantRows.length) {
          throw new BadRequestException(
            'Phiên bản không thuộc sản phẩm đã chọn',
          );
        }
      }

      const currentStockRows = dto.variantId
        ? await queryRunner.query(
            `
            SELECT
              GREATEST(
                COALESCE(vi.stock_quantity, 0) -
                COALESCE(vi.reserved_quantity, 0),
                0
              ) AS stock
            FROM product_variants pv
            LEFT JOIN variant_inventory vi
              ON vi.variant_id = pv.variant_id
            WHERE pv.variant_id = ?
              AND pv.product_id = ?
            LIMIT 1
            FOR UPDATE
            `,
            [dto.variantId, dto.productId],
          )
        : await queryRunner.query(
            `
            SELECT COALESCE(current_stock, 0) AS stock
            FROM vw_product_stock
            WHERE product_id = ?
            LIMIT 1
            `,
            [dto.productId],
          );

      const currentStock = Number(
        currentStockRows[0]?.stock || 0,
      );

      if (
        dto.type ===
          InventoryTypeCode.OUT &&
        dto.quantity > currentStock
      ) {
        throw new BadRequestException(
          `Không đủ tồn kho. Hiện còn ${currentStock}`,
        );
      }

      const typeRows =
        await queryRunner.query(
          `
          SELECT inventory_type_id
          FROM inventory_transaction_types
          WHERE inventory_type_code = ?
          LIMIT 1
          `,
          [dto.type],
        );

      if (!typeRows.length) {
        throw new BadRequestException(
          'Loại giao dịch kho chưa được cấu hình',
        );
      }

      await queryRunner.query(
        `
        INSERT INTO inventory_transactions (
          product_id,
          variant_id,
          supplier_id,
          staff_user_id,
          inventory_type_id,
          transaction_quantity,
          unit_cost,
          transaction_note
        )
        VALUES (?, ?, NULL, ?, ?, ?, ?, ?)
        `,
        [
          dto.productId,
          dto.variantId || null,
          actor.id,
          typeRows[0]
            .inventory_type_id,
          dto.quantity,
          dto.unitCost ?? null,
          dto.note?.trim() || null,
        ],
      );

      if (dto.variantId) {
        const delta =
          dto.type ===
          InventoryTypeCode.OUT
            ? -dto.quantity
            : dto.quantity;

        await queryRunner.query(
          `
          INSERT INTO variant_inventory (
            variant_id,
            stock_quantity,
            reserved_quantity
          )
          VALUES (?, GREATEST(?, 0), 0)
          ON DUPLICATE KEY UPDATE
            stock_quantity = GREATEST(
              stock_quantity + ?,
              0
            )
          `,
          [
            dto.variantId,
            delta,
            delta,
          ],
        );
      }

      await queryRunner.query(
        `
        INSERT INTO audit_logs (
          actor_user_id,
          action_name,
          affected_table_name,
          affected_record_id,
          action_description
        )
        VALUES (?, ?, 'inventory_transactions', ?, ?)
        `,
        [
          actor.id,
          'CREATE_INVENTORY_TRANSACTION',
          dto.productId,
          `${dto.type} ${dto.quantity} sản phẩm`,
        ],
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        message:
          'Ghi nhận giao dịch kho thành công',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async listPayments(
    search = '',
    status = '',
  ) {
    const keyword = `%${search.trim()}%`;
    const statusCode = status
      .trim()
      .toUpperCase();

    const rows = await this.dataSource.query(
      `
      SELECT
        p.payment_id AS id,
        p.payment_code AS code,
        p.payment_amount AS amount,
        p.transaction_code AS transactionCode,
        p.paid_at AS paidAt,
        p.created_at AS createdAt,

        o.order_id AS orderId,
        o.order_code AS orderCode,

        u.user_full_name AS customerName,

        pm.payment_method_code AS method,
        pm.payment_method_name AS methodName,

        ps.payment_status_code AS status,
        ps.payment_status_name AS statusName

      FROM payments p

      JOIN orders o
        ON o.order_id = p.order_id

      JOIN users u
        ON u.user_id = o.customer_id

      JOIN payment_methods pm
        ON pm.payment_method_id =
           p.payment_method_id

      JOIN payment_statuses ps
        ON ps.payment_status_id =
           p.payment_status_id

      WHERE
        (
          ? = ''
          OR p.payment_code LIKE ?
          OR o.order_code LIKE ?
          OR u.user_full_name LIKE ?
        )
        AND (
          ? = ''
          OR ps.payment_status_code = ?
        )

      ORDER BY p.created_at DESC
      LIMIT 200
      `,
      [
        search.trim(),
        keyword,
        keyword,
        keyword,
        statusCode,
        statusCode,
      ],
    );

    return rows.map((row: any) => ({
      ...row,
      id: Number(row.id),
      orderId: Number(row.orderId),
      amount: Number(row.amount || 0),
    }));
  }

  async updatePaymentStatus(
    paymentId: number,
    dto: UpdatePaymentStatusDto,
    actor: Actor,
  ) {
    const statusRows =
      await this.dataSource.query(
        `
        SELECT payment_status_id
        FROM payment_statuses
        WHERE payment_status_code = ?
        LIMIT 1
        `,
        [dto.status],
      );

    if (!statusRows.length) {
      throw new BadRequestException(
        'Trạng thái thanh toán chưa được cấu hình',
      );
    }

    const result =
      await this.dataSource.query(
        `
        UPDATE payments
        SET
          payment_status_id = ?,
          transaction_code =
            COALESCE(?, transaction_code),
          paid_at =
            CASE
              WHEN ? = 'PAID'
                THEN COALESCE(paid_at, NOW())
              ELSE paid_at
            END
        WHERE payment_id = ?
        `,
        [
          statusRows[0]
            .payment_status_id,
          dto.transactionCode?.trim() ||
            null,
          dto.status,
          paymentId,
        ],
      );

    if (!result.affectedRows) {
      throw new NotFoundException(
        'Không tìm thấy thanh toán',
      );
    }

    await this.writeAudit(
      actor.id,
      'UPDATE_PAYMENT_STATUS',
      'payments',
      paymentId,
      `Đổi trạng thái thanh toán sang ${dto.status}`,
    );

    return {
      success: true,
      message:
        'Cập nhật thanh toán thành công',
    };
  }

  async listReviews(status = '') {
    const statusCode = status
      .trim()
      .toUpperCase();

    const rows = await this.dataSource.query(
      `
      SELECT
        r.review_id AS id,
        r.rating,
        r.review_title AS title,
        r.review_content AS content,
        r.review_status AS status,
        r.is_verified_purchase AS verifiedPurchase,
        r.created_at AS createdAt,

        p.product_id AS productId,
        p.product_name AS productName,

        u.user_full_name AS customerName,
        u.user_email AS customerEmail,

        COUNT(reply.reply_id) AS replyCount

      FROM product_reviews r

      JOIN products p
        ON p.product_id = r.product_id

      JOIN users u
        ON u.user_id = r.user_id

      LEFT JOIN product_review_replies reply
        ON reply.review_id = r.review_id

      WHERE
        ? = ''
        OR r.review_status = ?

      GROUP BY
        r.review_id,
        r.rating,
        r.review_title,
        r.review_content,
        r.review_status,
        r.is_verified_purchase,
        r.created_at,
        p.product_id,
        p.product_name,
        u.user_full_name,
        u.user_email

      ORDER BY
        CASE
          WHEN r.review_status = 'PENDING' THEN 0
          ELSE 1
        END,
        r.created_at DESC

      LIMIT 200
      `,
      [statusCode, statusCode],
    );

    return rows.map((row: any) => ({
      ...row,
      id: Number(row.id),
      productId: Number(
        row.productId,
      ),
      rating: Number(
        row.rating || 0,
      ),
      verifiedPurchase: Boolean(
        Number(
          row.verifiedPurchase || 0,
        ),
      ),
      replyCount: Number(
        row.replyCount || 0,
      ),
    }));
  }

  async updateReviewStatus(
    reviewId: number,
    status: ReviewStatusCode,
    actor: Actor,
  ) {
    const result =
      await this.dataSource.query(
        `
        UPDATE product_reviews
        SET
          review_status = ?,
          updated_at = NOW()
        WHERE review_id = ?
        `,
        [status, reviewId],
      );

    if (!result.affectedRows) {
      throw new NotFoundException(
        'Không tìm thấy đánh giá',
      );
    }

    await this.writeAudit(
      actor.id,
      'UPDATE_REVIEW_STATUS',
      'product_reviews',
      reviewId,
      `Đổi trạng thái đánh giá sang ${status}`,
    );

    return {
      success: true,
      message:
        'Cập nhật đánh giá thành công',
    };
  }

  async replyReview(
    reviewId: number,
    content: string,
    actor: Actor,
  ) {
    const reviewRows =
      await this.dataSource.query(
        `
        SELECT review_id
        FROM product_reviews
        WHERE review_id = ?
        LIMIT 1
        `,
        [reviewId],
      );

    if (!reviewRows.length) {
      throw new NotFoundException(
        'Không tìm thấy đánh giá',
      );
    }

    const result =
      await this.dataSource.query(
        `
        INSERT INTO product_review_replies (
          review_id,
          staff_user_id,
          reply_content
        )
        VALUES (?, ?, ?)
        `,
        [
          reviewId,
          actor.id,
          content.trim(),
        ],
      );

    await this.writeAudit(
      actor.id,
      'REPLY_REVIEW',
      'product_review_replies',
      Number(result.insertId),
      'Nhân viên phản hồi đánh giá',
    );

    return {
      success: true,
      message:
        'Đã gửi phản hồi đánh giá',
    };
  }

  async getRevenueReport() {
    const [
      monthly,
      statusSummary,
      topProducts,
    ] = await Promise.all([
      this.dataSource.query(
        `
        SELECT
          DATE_FORMAT(p.paid_at, '%Y-%m') AS month,
          COALESCE(SUM(p.payment_amount), 0) AS revenue,
          COUNT(*) AS paymentCount
        FROM payments p
        JOIN payment_statuses ps
          ON ps.payment_status_id = p.payment_status_id
        WHERE ps.payment_status_code = 'PAID'
          AND p.paid_at >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
        GROUP BY DATE_FORMAT(p.paid_at, '%Y-%m')
        ORDER BY month ASC
        `,
      ),

      this.dataSource.query(
        `
        SELECT
          os.order_status_code AS status,
          os.order_status_name AS statusName,
          COUNT(o.order_id) AS orderCount
        FROM order_statuses os
        LEFT JOIN orders o
          ON o.order_status_id = os.order_status_id
        GROUP BY
          os.order_status_id,
          os.order_status_code,
          os.order_status_name
        ORDER BY orderCount DESC
        `,
      ),

      this.dataSource.query(
        `
        SELECT
          p.product_id AS id,
          p.product_name AS name,
          COALESCE(vbsp.total_sold, 0) AS totalSold
        FROM products p
        LEFT JOIN vw_best_selling_products vbsp
          ON vbsp.product_id = p.product_id
        ORDER BY totalSold DESC, p.product_id DESC
        LIMIT 8
        `,
      ),
    ]);

    return {
      monthly: monthly.map(
        (row: any) => ({
          month: row.month,
          revenue: Number(
            row.revenue || 0,
          ),
          paymentCount: Number(
            row.paymentCount || 0,
          ),
        }),
      ),
      statusSummary:
        statusSummary.map(
          (row: any) => ({
            ...row,
            orderCount: Number(
              row.orderCount || 0,
            ),
          }),
        ),
      topProducts: topProducts.map(
        (row: any) => ({
          ...row,
          id: Number(row.id),
          totalSold: Number(
            row.totalSold || 0,
          ),
        }),
      ),
    };
  }

  async listStaffAccounts() {
    const rows = await this.dataSource.query(
      `
      SELECT
        u.user_id AS id,
        u.user_full_name AS name,
        u.user_email AS email,
        u.user_phone AS phone,
        u.account_status AS status,
        u.created_at AS createdAt,
        r.role_code AS role
      FROM users u
      JOIN roles r
        ON r.role_id = u.role_id
      WHERE r.role_code = 'STAFF'
      ORDER BY u.created_at DESC
      `,
    );

    return rows.map((row: any) => ({
      ...row,
      id: Number(row.id),
    }));
  }

  async createStaffAccount(
    dto: CreateStaffAccountDto,
    actor: Actor,
  ) {
    const email = dto.email
      .trim()
      .toLowerCase();

    const phone = dto.phone
      .replace(/[\s.-]/g, '')
      .replace(/^\+84/, '0');

    const duplicateRows =
      await this.dataSource.query(
        `
        SELECT user_id, user_email, user_phone
        FROM users
        WHERE LOWER(user_email) = LOWER(?)
           OR user_phone = ?
        LIMIT 1
        `,
        [email, phone],
      );

    if (duplicateRows.length) {
      throw new BadRequestException(
        'Email hoặc số điện thoại đã được sử dụng',
      );
    }

    const roleRows =
      await this.dataSource.query(
        `
        SELECT role_id
        FROM roles
        WHERE role_code = 'STAFF'
        LIMIT 1
        `,
      );

    if (!roleRows.length) {
      throw new BadRequestException(
        'Hệ thống chưa có vai trò STAFF',
      );
    }

    const passwordHash =
      await bcrypt.hash(
        dto.password,
        12,
      );

    const result =
      await this.dataSource.query(
        `
        INSERT INTO users (
          role_id,
          user_full_name,
          user_email,
          user_phone,
          password_hash,
          account_status
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          roleRows[0].role_id,
          dto.name.trim(),
          email,
          phone,
          passwordHash,
          dto.status || 'ACTIVE',
        ],
      );

    await this.writeAudit(
      actor.id,
      'CREATE_STAFF_ACCOUNT',
      'users',
      Number(result.insertId),
      `Admin tạo tài khoản nhân viên ${email}`,
    );

    return {
      success: true,
      message:
        'Tạo tài khoản nhân viên thành công',
      userId: Number(
        result.insertId,
      ),
    };
  }
}

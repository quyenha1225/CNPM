import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import {
  AccountOrdersQueryDto,
  CancelOrderDto,
  ChangePasswordDto,
  CreatePurchasedReviewDto,
  UpdateProfileDto,
} from './dto/account.dto';

@Injectable()
export class AccountService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  private normalizePhone(
    phone: string,
  ): string {
    return String(phone || '')
      .replace(/[\s.-]/g, '')
      .replace(/^\+84/, '0');
  }

  private numberValue(
    value: unknown,
  ): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed)
      ? parsed
      : 0;
  }

  async getProfile(userId: number) {
    const rows = await this.dataSource.query(
      `
      SELECT
        u.user_id AS id,
        u.user_full_name AS fullName,
        u.user_email AS email,
        u.user_phone AS phone,
        u.account_status AS status,
        u.created_at AS createdAt,
        u.updated_at AS updatedAt,
        r.role_code AS role
      FROM users u
      JOIN roles r
        ON r.role_id = u.role_id
      WHERE u.user_id = ?
      LIMIT 1
      `,
      [userId],
    );

    if (!rows.length) {
      throw new NotFoundException(
        'Không tìm thấy tài khoản.',
      );
    }

    return {
      success: true,
      profile: rows[0],
    };
  }

  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
  ) {
    const fullName = dto.fullName.trim();
    const phone = this.normalizePhone(
      dto.phone,
    );

    if (fullName.length < 2) {
      throw new BadRequestException(
        'Họ tên phải có ít nhất 2 ký tự.',
      );
    }

    const duplicateRows =
      await this.dataSource.query(
        `
        SELECT user_id
        FROM users
        WHERE user_phone = ?
          AND user_id <> ?
        LIMIT 1
        `,
        [phone, userId],
      );

    if (duplicateRows.length) {
      throw new BadRequestException(
        'Số điện thoại đã được tài khoản khác sử dụng.',
      );
    }

    await this.dataSource.query(
      `
      UPDATE users
      SET
        user_full_name = ?,
        user_phone = ?
      WHERE user_id = ?
      `,
      [fullName, phone, userId],
    );

    const result =
      await this.getProfile(userId);

    return {
      ...result,
      message:
        'Cập nhật thông tin tài khoản thành công.',
    };
  }

  async changePassword(
    userId: number,
    dto: ChangePasswordDto,
  ) {
    if (
      dto.newPassword !==
      dto.confirmPassword
    ) {
      throw new BadRequestException(
        'Mật khẩu xác nhận không khớp.',
      );
    }

    if (
      dto.currentPassword ===
      dto.newPassword
    ) {
      throw new BadRequestException(
        'Mật khẩu mới phải khác mật khẩu hiện tại.',
      );
    }

    const rows = await this.dataSource.query(
      `
      SELECT password_hash
      FROM users
      WHERE user_id = ?
        AND account_status = 'ACTIVE'
      LIMIT 1
      `,
      [userId],
    );

    if (!rows.length) {
      throw new NotFoundException(
        'Không tìm thấy tài khoản hợp lệ.',
      );
    }

    const matched = await bcrypt.compare(
      dto.currentPassword,
      rows[0].password_hash,
    );

    if (!matched) {
      throw new BadRequestException(
        'Mật khẩu hiện tại không chính xác.',
      );
    }

    const passwordHash = await bcrypt.hash(
      dto.newPassword,
      12,
    );

    await this.dataSource.query(
      `
      UPDATE users
      SET password_hash = ?
      WHERE user_id = ?
      `,
      [passwordHash, userId],
    );

    return {
      success: true,
      message: 'Đổi mật khẩu thành công.',
    };
  }

  async getOverview(userId: number) {
    const profileResult =
      await this.getProfile(userId);

    const statisticRows =
      await this.dataSource.query(
        `
        SELECT
          COUNT(*) AS totalOrders,
          COALESCE(
            SUM(
              CASE
                WHEN os.order_status_code IN (
                  'PENDING',
                  'CONFIRMED',
                  'SHIPPING'
                ) THEN 1
                ELSE 0
              END
            ),
            0
          ) AS processingOrders,
          COALESCE(
            SUM(
              CASE
                WHEN os.order_status_code =
                  'DELIVERED'
                THEN 1
                ELSE 0
              END
            ),
            0
          ) AS deliveredOrders,
          COALESCE(
            SUM(
              CASE
                WHEN os.order_status_code =
                  'DELIVERED'
                THEN (
                  SELECT COALESCE(
                    SUM(
                      oi.ordered_quantity *
                      oi.unit_price_at_order
                    ),
                    0
                  )
                  FROM order_items oi
                  WHERE oi.order_id =
                    o.order_id
                )
                ELSE 0
              END
            ),
            0
          ) AS totalSpent
        FROM orders o
        JOIN order_statuses os
          ON os.order_status_id =
             o.order_status_id
        WHERE o.customer_id = ?
        `,
        [userId],
      );

    const recentOrders =
      await this.getMyOrders(userId, {
        page: 1,
        limit: 5,
      });

    const statistics =
      statisticRows[0] || {};

    return {
      success: true,
      profile: profileResult.profile,
      statistics: {
        totalOrders: this.numberValue(
          statistics.totalOrders,
        ),
        processingOrders:
          this.numberValue(
            statistics.processingOrders,
          ),
        deliveredOrders:
          this.numberValue(
            statistics.deliveredOrders,
          ),
        totalSpent: this.numberValue(
          statistics.totalSpent,
        ),
      },
      recentOrders: recentOrders.orders,
    };
  }

  async getMyOrders(
    userId: number,
    query: AccountOrdersQueryDto,
  ) {
    const page = Math.max(
      Number(query.page || 1),
      1,
    );

    const limit = Math.min(
      Math.max(
        Number(query.limit || 10),
        1,
      ),
      50,
    );

    const offset = (page - 1) * limit;
    const parameters: unknown[] = [userId];
    let statusCondition = '';

    if (query.status) {
      statusCondition =
        'AND os.order_status_code = ?';
      parameters.push(
        query.status.toUpperCase(),
      );
    }

    const countRows =
      await this.dataSource.query(
        `
        SELECT COUNT(*) AS total
        FROM orders o
        JOIN order_statuses os
          ON os.order_status_id =
             o.order_status_id
        WHERE o.customer_id = ?
        ${statusCondition}
        `,
        parameters,
      );

    const orderParameters = [
      ...parameters,
      limit,
      offset,
    ];

    const rows = await this.dataSource.query(
      `
      SELECT
        o.order_id AS id,
        o.order_code AS code,
        o.order_note AS note,
        o.order_created_at AS createdAt,
        o.order_updated_at AS updatedAt,
        os.order_status_code AS statusCode,
        os.order_status_name AS statusName,

        (
          SELECT COUNT(*)
          FROM order_items oi_count
          WHERE oi_count.order_id =
            o.order_id
        ) AS itemLineCount,

        (
          SELECT COALESCE(
            SUM(
              oi_total.ordered_quantity *
              oi_total.unit_price_at_order
            ),
            0
          )
          FROM order_items oi_total
          WHERE oi_total.order_id =
            o.order_id
        ) AS totalAmount,

        (
          SELECT p_preview.product_name
          FROM order_items oi_preview
          JOIN products p_preview
            ON p_preview.product_id =
               oi_preview.product_id
          WHERE oi_preview.order_id =
            o.order_id
          ORDER BY p_preview.product_id
          LIMIT 1
        ) AS previewProductName,

        (
          SELECT pi_preview.image_url
          FROM order_items oi_preview
          JOIN product_images pi_preview
            ON pi_preview.product_id =
               oi_preview.product_id
           AND pi_preview.is_thumbnail = TRUE
          WHERE oi_preview.order_id =
            o.order_id
          ORDER BY pi_preview.sort_order,
                   pi_preview.image_id
          LIMIT 1
        ) AS previewImageUrl,

        (
          SELECT ps.payment_status_code
          FROM payments pay
          JOIN payment_statuses ps
            ON ps.payment_status_id =
               pay.payment_status_id
          WHERE pay.order_id = o.order_id
          ORDER BY pay.payment_id DESC
          LIMIT 1
        ) AS paymentStatusCode,

        (
          SELECT ps.payment_status_name
          FROM payments pay
          JOIN payment_statuses ps
            ON ps.payment_status_id =
               pay.payment_status_id
          WHERE pay.order_id = o.order_id
          ORDER BY pay.payment_id DESC
          LIMIT 1
        ) AS paymentStatusName

      FROM orders o
      JOIN order_statuses os
        ON os.order_status_id =
           o.order_status_id
      WHERE o.customer_id = ?
      ${statusCondition}
      ORDER BY o.order_created_at DESC,
               o.order_id DESC
      LIMIT ? OFFSET ?
      `,
      orderParameters,
    );

    const orders = rows.map((row: any) => ({
      ...row,
      id: this.numberValue(row.id),
      itemLineCount: this.numberValue(
        row.itemLineCount,
      ),
      totalAmount: this.numberValue(
        row.totalAmount,
      ),
      canCancel:
        [
          'PENDING',
          'CONFIRMED',
        ].includes(
          String(row.statusCode || '')
            .toUpperCase(),
        ) &&
        String(
          row.paymentStatusCode ||
            'UNPAID',
        ).toUpperCase() !== 'PAID',
    }));

    const total = this.numberValue(
      countRows[0]?.total,
    );

    return {
      success: true,
      page,
      limit,
      total,
      totalPages: Math.max(
        Math.ceil(total / limit),
        1,
      ),
      orders,
    };
  }

  async getMyOrderDetail(
    userId: number,
    orderId: number,
  ) {
    const orderRows =
      await this.dataSource.query(
        `
        SELECT
          o.order_id AS id,
          o.order_code AS code,
          o.order_note AS note,
          o.order_created_at AS createdAt,
          o.order_updated_at AS updatedAt,
          os.order_status_code AS statusCode,
          os.order_status_name AS statusName,

          osa.receiver_name AS receiverName,
          osa.receiver_phone AS receiverPhone,
          osa.shipping_province AS province,
          osa.shipping_district AS district,
          osa.shipping_ward AS ward,
          osa.shipping_street AS street,

          pay.payment_id AS paymentId,
          pay.payment_code AS paymentCode,
          pay.payment_amount AS paymentAmount,
          pay.transaction_code AS transactionCode,
          pay.paid_at AS paidAt,
          pay.created_at AS paymentCreatedAt,
          pm.payment_method_code AS paymentMethodCode,
          pm.payment_method_name AS paymentMethodName,
          ps.payment_status_code AS paymentStatusCode,
          ps.payment_status_name AS paymentStatusName

        FROM orders o
        JOIN order_statuses os
          ON os.order_status_id =
             o.order_status_id
        LEFT JOIN order_shipping_addresses osa
          ON osa.order_id = o.order_id
        LEFT JOIN payments pay
          ON pay.payment_id = (
            SELECT MAX(pay_latest.payment_id)
            FROM payments pay_latest
            WHERE pay_latest.order_id =
              o.order_id
          )
        LEFT JOIN payment_methods pm
          ON pm.payment_method_id =
             pay.payment_method_id
        LEFT JOIN payment_statuses ps
          ON ps.payment_status_id =
             pay.payment_status_id
        WHERE o.order_id = ?
          AND o.customer_id = ?
        LIMIT 1
        `,
        [orderId, userId],
      );

    if (!orderRows.length) {
      throw new NotFoundException(
        'Không tìm thấy đơn hàng của bạn.',
      );
    }

    const itemRows =
      await this.dataSource.query(
        `
        SELECT
          oi.product_id AS productId,
          oi.variant_id AS variantId,
          oi.ordered_quantity AS quantity,
          oi.unit_price_at_order AS unitPrice,
          (
            oi.ordered_quantity *
            oi.unit_price_at_order
          ) AS lineTotal,
          p.product_name AS productName,
          p.product_slug AS productSlug,
          pv.variant_name AS variantName,
          pv.sku AS variantSku,
          (
            SELECT pi.image_url
            FROM product_images pi
            WHERE pi.product_id =
              p.product_id
            ORDER BY
              pi.is_thumbnail DESC,
              pi.sort_order ASC,
              pi.image_id ASC
            LIMIT 1
          ) AS imageUrl,
          EXISTS (
            SELECT 1
            FROM product_reviews pr
            WHERE pr.order_id = oi.order_id
              AND pr.product_id =
                oi.product_id
              AND pr.user_id = ?
          ) AS hasReviewed
        FROM order_items oi
        JOIN products p
          ON p.product_id = oi.product_id
        LEFT JOIN product_variants pv
          ON pv.variant_id = oi.variant_id
        WHERE oi.order_id = ?
        ORDER BY p.product_id,
                 oi.variant_id
        `,
        [userId, orderId],
      );

    const historyRows =
      await this.dataSource.query(
        `
        SELECT
          osl.order_status_log_id AS id,
          old_status.order_status_code AS oldStatusCode,
          old_status.order_status_name AS oldStatusName,
          new_status.order_status_code AS newStatusCode,
          new_status.order_status_name AS newStatusName,
          osl.status_note AS note,
          osl.changed_at AS changedAt,
          u.user_full_name AS changedBy
        FROM order_status_logs osl
        LEFT JOIN order_statuses old_status
          ON old_status.order_status_id =
             osl.old_order_status_id
        JOIN order_statuses new_status
          ON new_status.order_status_id =
             osl.new_order_status_id
        LEFT JOIN users u
          ON u.user_id =
             osl.changed_by_user_id
        WHERE osl.order_id = ?
        ORDER BY osl.changed_at ASC,
                 osl.order_status_log_id ASC
        `,
        [orderId],
      );

    const rawOrder = orderRows[0];
    const statusCode = String(
      rawOrder.statusCode || '',
    ).toUpperCase();

    const order = {
      ...rawOrder,
      id: this.numberValue(rawOrder.id),
      paymentId: rawOrder.paymentId
        ? this.numberValue(
            rawOrder.paymentId,
          )
        : null,
      paymentAmount: this.numberValue(
        rawOrder.paymentAmount,
      ),
      canCancel:
        [
          'PENDING',
          'CONFIRMED',
        ].includes(statusCode) &&
        String(
          rawOrder.paymentStatusCode ||
            'UNPAID',
        ).toUpperCase() !== 'PAID',
    };

    const items = itemRows.map(
      (row: any) => ({
        ...row,
        productId: this.numberValue(
          row.productId,
        ),
        variantId: row.variantId
          ? this.numberValue(row.variantId)
          : null,
        quantity: this.numberValue(
          row.quantity,
        ),
        unitPrice: this.numberValue(
          row.unitPrice,
        ),
        lineTotal: this.numberValue(
          row.lineTotal,
        ),
        hasReviewed: Boolean(
          Number(row.hasReviewed),
        ),
      }),
    );

    return {
      success: true,
      order: {
        ...order,
        totalAmount: items.reduce(
          (sum, item) =>
            sum + item.lineTotal,
          0,
        ),
      },
      items,
      statusHistory: historyRows.map(
        (row: any) => ({
          ...row,
          id: this.numberValue(row.id),
        }),
      ),
    };
  }


  async createPurchasedReview(
    userId: number,
    orderId: number,
    productId: number,
    dto: CreatePurchasedReviewDto,
  ) {
    const eligibleRows =
      await this.dataSource.query(
        `
        SELECT o.order_id
        FROM orders o
        JOIN order_statuses os
          ON os.order_status_id =
             o.order_status_id
        JOIN order_items oi
          ON oi.order_id = o.order_id
         AND oi.product_id = ?
        WHERE o.order_id = ?
          AND o.customer_id = ?
          AND os.order_status_code =
            'DELIVERED'
        LIMIT 1
        `,
        [productId, orderId, userId],
      );

    if (!eligibleRows.length) {
      throw new BadRequestException(
        'Chỉ có thể đánh giá sản phẩm thuộc đơn hàng đã giao của bạn.',
      );
    }

    const duplicateRows =
      await this.dataSource.query(
        `
        SELECT review_id
        FROM product_reviews
        WHERE order_id = ?
          AND product_id = ?
          AND user_id = ?
        LIMIT 1
        `,
        [orderId, productId, userId],
      );

    if (duplicateRows.length) {
      throw new BadRequestException(
        'Bạn đã đánh giá sản phẩm này trong đơn hàng.',
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
      VALUES (?, ?, ?, ?, ?, ?, TRUE, 'PENDING')
      `,
      [
        productId,
        userId,
        orderId,
        dto.rating,
        dto.title?.trim() || null,
        dto.content.trim(),
      ],
    );

    return {
      success: true,
      reviewId: Number(result.insertId),
      message:
        'Đã gửi đánh giá. Nội dung đang chờ kiểm duyệt.',
    };
  }

  async cancelMyOrder(
    userId: number,
    orderId: number,
    dto: CancelOrderDto,
  ) {
    const queryRunner =
      this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderRows = await queryRunner.query(
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
          AND o.customer_id = ?
        LIMIT 1
        FOR UPDATE
        `,
        [orderId, userId],
      );

      if (!orderRows.length) {
        throw new NotFoundException(
          'Không tìm thấy đơn hàng của bạn.',
        );
      }

      const currentStatus = String(
        orderRows[0].order_status_code,
      ).toUpperCase();

      if (
        !['PENDING', 'CONFIRMED'].includes(
          currentStatus,
        )
      ) {
        throw new BadRequestException(
          'Chỉ có thể hủy đơn đang chờ xác nhận hoặc đã xác nhận.',
        );
      }

      const paidRows = await queryRunner.query(
        `
        SELECT ps.payment_status_code
        FROM payments pay
        JOIN payment_statuses ps
          ON ps.payment_status_id =
             pay.payment_status_id
        WHERE pay.order_id = ?
        ORDER BY pay.payment_id DESC
        LIMIT 1
        `,
        [orderId],
      );

      const paymentStatus = String(
        paidRows[0]?.payment_status_code ||
          'UNPAID',
      ).toUpperCase();

      if (paymentStatus === 'PAID') {
        throw new BadRequestException(
          'Đơn đã thanh toán. Vui lòng liên hệ cửa hàng để được hỗ trợ hủy và hoàn tiền.',
        );
      }

      const cancelledRows =
        await queryRunner.query(
          `
          SELECT order_status_id
          FROM order_statuses
          WHERE order_status_code =
            'CANCELLED'
          LIMIT 1
          `,
        );

      if (!cancelledRows.length) {
        throw new BadRequestException(
          'Hệ thống chưa cấu hình trạng thái CANCELLED.',
        );
      }

      const cancelledStatusId =
        Number(
          cancelledRows[0]
            .order_status_id,
        );

      await queryRunner.query(
        `
        UPDATE orders
        SET
          order_status_id = ?,
          order_note = CONCAT(
            COALESCE(order_note, ''),
            CASE
              WHEN COALESCE(order_note, '') = ''
                THEN ''
              ELSE ' | '
            END,
            ?
          )
        WHERE order_id = ?
        `,
        [
          cancelledStatusId,
          `Khách hàng hủy đơn: ${
            dto.reason?.trim() ||
            'Không nêu lý do'
          }`,
          orderId,
        ],
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
          cancelledStatusId,
          userId,
          dto.reason?.trim() ||
            'Khách hàng chủ động hủy đơn',
        ],
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Hủy đơn hàng thành công.',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

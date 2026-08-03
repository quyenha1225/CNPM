import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PaymentService {
  constructor(private readonly dataSource: DataSource) {}

  // 1. Tạo đơn hàng và lưu vào DB (Hỗ trợ cả QR và COD)
  async createOrder(body: any, userId: number | null = null) {
    const { totalAmount, paymentMethod, shippingAddress, items } = body;

    const orderCode = `ORD${Date.now()}`;

    const orderStatuses = await this.dataSource.query(
      `SELECT order_status_id FROM order_statuses WHERE order_status_code = 'PENDING' LIMIT 1`,
    );
    if (!orderStatuses || orderStatuses.length === 0) {
      throw new BadRequestException(
        'Lỗi hệ thống: Thiếu mã trạng thái đơn hàng PENDING trong DB',
      );
    }
    const pendingStatusId = orderStatuses[0].order_status_id;

    const methodCode = paymentMethod === 'qr' ? 'QR_BANKING' : 'COD';
    const paymentMethods = await this.dataSource.query(
      `SELECT payment_method_id FROM payment_methods WHERE payment_method_code = ? LIMIT 1`,
      [methodCode],
    );
    if (!paymentMethods || paymentMethods.length === 0) {
      throw new BadRequestException(
        `Lỗi hệ thống: Thiếu phương thức thanh toán ${methodCode} trong DB`,
      );
    }
    const paymentMethodId = paymentMethods[0].payment_method_id;

    const paymentStatuses = await this.dataSource.query(
      `SELECT payment_status_id FROM payment_statuses WHERE payment_status_code IN ('UNPAID', 'PENDING') LIMIT 1`,
    );
    if (!paymentStatuses || paymentStatuses.length === 0) {
      throw new BadRequestException(
        'Lỗi hệ thống: Thiếu mã trạng thái chờ thanh toán (UNPAID/PENDING) trong DB',
      );
    }
    const paymentStatusId = paymentStatuses[0].payment_status_id;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderRes = await queryRunner.query(
        `INSERT INTO orders (order_code, customer_id, order_status_id, order_note, order_created_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [orderCode, userId || 1, pendingStatusId, shippingAddress.note || ''],
      );
      const orderId = orderRes.insertId;

      await queryRunner.query(
        `INSERT INTO order_shipping_addresses (order_id, receiver_name, receiver_phone, shipping_province, shipping_district, shipping_ward, shipping_street) 
         VALUES (?, ?, ?, 'N/A', 'N/A', 'N/A', ?)`,
        [
          orderId,
          shippingAddress.receiverName,
          shippingAddress.receiverPhone,
          shippingAddress.address,
        ],
      );

      for (const item of items) {
        await queryRunner.query(
          `INSERT INTO order_items (order_id, product_id, ordered_quantity, unit_price_at_order) 
           VALUES (?, ?, ?, ?)`,
          [orderId, item.productId, item.quantity, item.unitPrice],
        );
      }

      await queryRunner.query(
        `INSERT INTO payments (order_id, payment_method_id, payment_status_id, payment_code, payment_amount, qr_content, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          orderId,
          paymentMethodId,
          paymentStatusId,
          `PAY-${orderCode}`,
          totalAmount,
          orderCode,
        ],
      );

      await queryRunner.commitTransaction();
      return { success: true, order_code: orderCode, orderId };
    } catch (err: unknown) {
      await queryRunner.rollbackTransaction();
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      throw new BadRequestException(
        'Lỗi khi lưu đơn hàng vào Database: ' + errorMessage,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // 2. Webhook nhận tiền từ SePay (Đã loại bỏ hoàn toàn các dòng log rườm rà)
  async handleSepayWebhook(payload: any) {
    const amountIn = payload.transferAmount;
    const rawContent = `${payload.transferContent || ''} ${payload.description || ''}`;

    const match = rawContent.match(/ORD\d+/i);
    if (!match) {
      return { success: true, message: 'No Order Code matched' };
    }

    const orderCode = match[0].toUpperCase();

    const orders = await this.dataSource.query(
      `SELECT o.order_id, p.payment_id, p.payment_amount 
       FROM orders o 
       JOIN payments p ON p.order_id = o.order_id 
       WHERE o.order_code = ? LIMIT 1`,
      [orderCode],
    );

    if (orders.length === 0) {
      return { success: true, message: 'Order not found' };
    }

    const { order_id, payment_id, payment_amount } = orders[0];

    if (Number(amountIn) >= Number(payment_amount)) {
      const [[paidStatus], [confirmedStatus]] = await Promise.all([
        this.dataSource.query(
          `SELECT payment_status_id FROM payment_statuses WHERE payment_status_code = 'PAID' LIMIT 1`,
        ),
        this.dataSource.query(
          `SELECT order_status_id FROM order_statuses WHERE order_status_code = 'CONFIRMED' LIMIT 1`,
        ),
      ]);

      await this.dataSource.query(
        `UPDATE payments SET payment_status_id = ?, transaction_code = ?, paid_at = NOW() WHERE payment_id = ?`,
        [
          paidStatus.payment_status_id,
          payload.referenceCode || payload.id,
          payment_id,
        ],
      );

      await this.dataSource.query(
        `UPDATE orders SET order_status_id = ?, order_updated_at = NOW() WHERE order_id = ?`,
        [confirmedStatus.order_status_id, order_id],
      );
    }

    return { success: true };
  }

  // 3. API để Frontend kiểm tra trạng thái đơn (Polling)
  async checkOrderStatus(orderCode: string) {
    const data = await this.dataSource.query(
      `SELECT ps.payment_status_code 
       FROM orders o 
       JOIN payments p ON p.order_id = o.order_id 
       JOIN payment_statuses ps ON ps.payment_status_id = p.payment_status_id
       WHERE o.order_code = ? LIMIT 1`,
      [orderCode],
    );

    if (data.length === 0)
      throw new BadRequestException('Không tìm thấy đơn hàng');

    return {
      paid: data[0].payment_status_code === 'PAID',
      status: data[0].payment_status_code,
    };
  }
}

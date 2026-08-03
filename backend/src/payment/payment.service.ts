import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PaymentService {
  constructor(private readonly dataSource: DataSource) {}

  // 1. Tạo đơn hàng và lưu vào DB (Hỗ trợ cả QR và COD)
  async createOrder(body: any, userId: number | null = null) {
    const { totalAmount, paymentMethod, shippingAddress, items } = body;

    // Tạo mã đơn hàng (VD: ORD1712345678)
    const orderCode = `ORD${Date.now()}`;

    // Lấy trạng thái đơn hàng (PENDING: Chờ xác nhận / Chờ xử lý)
    const orderStatuses = await this.dataSource.query(
      `SELECT order_status_id FROM order_statuses WHERE order_status_code = 'PENDING' LIMIT 1`,
    );
    if (!orderStatuses || orderStatuses.length === 0) {
      throw new BadRequestException(
        'Lỗi hệ thống: Thiếu mã trạng thái đơn hàng PENDING trong DB',
      );
    }
    const pendingStatusId = orderStatuses[0].order_status_id;

    // Xác định phương thức thanh toán: 'qr' -> QR_BANKING, còn lại -> COD
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

    // Lấy trạng thái thanh toán (UNPAID: Chưa thanh toán)
    const paymentStatuses = await this.dataSource.query(
      `SELECT payment_status_id FROM payment_statuses WHERE payment_status_code IN ('UNPAID', 'PENDING') LIMIT 1`,
    );
    if (!paymentStatuses || paymentStatuses.length === 0) {
      throw new BadRequestException(
        'Lỗi hệ thống: Thiếu mã trạng thái chờ thanh toán (UNPAID/PENDING) trong DB',
      );
    }
    const paymentStatusId = paymentStatuses[0].payment_status_id;

    // Bắt đầu Transaction để đảm bảo tính toàn vẹn dữ liệu
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // a. Lưu vào bảng orders
      const orderRes = await queryRunner.query(
        `INSERT INTO orders (order_code, customer_id, order_status_id, order_note, order_created_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [orderCode, userId || 1, pendingStatusId, shippingAddress.note || ''],
      );
      const orderId = orderRes.insertId;

      // b. Lưu vào bảng order_shipping_addresses
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

      // c. Lưu chi tiết sản phẩm vào order_items
      for (const item of items) {
        await queryRunner.query(
          `INSERT INTO order_items (order_id, product_id, ordered_quantity, unit_price_at_order) 
           VALUES (?, ?, ?, ?)`,
          [orderId, item.productId, item.quantity, item.unitPrice],
        );
      }

      // d. Lưu vào bảng payments
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

  // 2. Webhook nhận tiền từ SePay (Tự động cập nhật khi khách chuyển khoản VietQR thành công)
  async handleSepayWebhook(payload: any) {
    console.log('=== [SEPAY WEBHOOK NHẬN ĐƯỢC] ===', JSON.stringify(payload));

    const amountIn = payload.transferAmount;
    const rawContent = `${payload.transferContent || ''} ${payload.description || ''}`;
    console.log(
      `-> Số tiền chuyển: ${amountIn} | Nội dung tổng hợp: "${rawContent}"`,
    );

    // Dùng Regex tìm chính xác chuỗi ORD theo sau bởi các chữ số
    const match = rawContent.match(/ORD\d+/i);

    if (!match) {
      console.log('-> ⚠️ Không tìm thấy mã đơn hàng ORD... trong nội dung!');
      return { success: true, message: 'No Order Code matched' };
    }

    const orderCode = match[0].toUpperCase();
    console.log(`-> 🎯 Đã bóc tách thành công mã đơn hàng: ${orderCode}`);

    // Lấy thông tin order và payment từ DB
    const orders = await this.dataSource.query(
      `SELECT o.order_id, p.payment_id, p.payment_amount 
       FROM orders o 
       JOIN payments p ON p.order_id = o.order_id 
       WHERE o.order_code = ? LIMIT 1`,
      [orderCode],
    );

    if (orders.length === 0) {
      console.log(`-> ⚠️ Không tìm thấy đơn hàng ${orderCode} trong Database!`);
      return { success: true, message: 'Order not found' };
    }

    const { order_id, payment_id, payment_amount } = orders[0];
    console.log(
      `-> Tiền cần thanh toán: ${payment_amount} | Tiền khách chuyển: ${amountIn}`,
    );

    // Kiểm tra nếu khách chuyển đủ tiền
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

      console.log(
        `✅ [THANH TOÁN THÀNH CÔNG] Đã cập nhật trạng thái PAID cho đơn hàng: ${orderCode}`,
      );
    } else {
      console.log(`-> ⚠️ Số tiền chuyển không đủ so với giá trị đơn hàng!`);
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

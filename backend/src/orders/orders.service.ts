import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(private readonly dataSource: DataSource) {}

  // API lấy danh sách lịch sử đơn hàng của 1 user
  async getUserOrders(userId: number) {
    return this.dataSource.query(
      `SELECT 
        o.order_id, 
        o.order_code, 
        o.order_created_at, 
        os.order_status_name, 
        p.payment_amount, 
        ps.payment_status_name
       FROM orders o
       JOIN order_statuses os ON o.order_status_id = os.order_status_id
       LEFT JOIN payments p ON p.order_id = o.order_id
       LEFT JOIN payment_statuses ps ON p.payment_status_id = ps.payment_status_id
       WHERE o.customer_id = ?
       ORDER BY o.order_created_at DESC`,
      [userId]
    );
  }

  // API lấy chi tiết 1 đơn hàng (hiển thị sản phẩm bên trong)
  async getOrderDetail(orderCode: string) {
    const order = await this.dataSource.query(
      `SELECT * FROM orders WHERE order_code = ? LIMIT 1`,
      [orderCode]
    );

    if (order.length === 0) return null;

    const items = await this.dataSource.query(
      `SELECT oi.*, pr.product_name, pr.product_slug 
       FROM order_items oi
       JOIN products pr ON pr.product_id = oi.product_id
       WHERE oi.order_id = ?`,
      [order[0].order_id]
    );

    return { ...order[0], items };
  }
}
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // API tạo đơn hàng (Nhận thông tin giỏ hàng, thông tin giao hàng, phương thức thanh toán)
  @Post()
  async createPayment(@Body() body: any) {
    const userId = body.userId || null;
    return await this.paymentService.createOrder(body, userId);
  }

  // API nhận Webhook từ SePay khi có biến động số dư tài khoản ngân hàng
  @Post('webhook')
  async sepayWebhook(@Body() payload: any) {
    return await this.paymentService.handleSepayWebhook(payload);
  }

  // API cho phép Frontend kiểm tra trạng thái thanh toán định kỳ (Polling)
  @Get(':orderCode/status')
  async checkStatus(@Param('orderCode') orderCode: string) {
    return await this.paymentService.checkOrderStatus(orderCode);
  }
}
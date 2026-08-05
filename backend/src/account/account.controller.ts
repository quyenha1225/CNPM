import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  AccountAuthGuard,
  type AccountRequest,
} from './account-auth.guard';
import { AccountService } from './account.service';
import {
  AccountOrdersQueryDto,
  CancelOrderDto,
  ChangePasswordDto,
  CreatePurchasedReviewDto,
  UpdateProfileDto,
} from './dto/account.dto';

@Controller('account')
@UseGuards(AccountAuthGuard)
export class AccountController {
  constructor(
    private readonly accountService:
      AccountService,
  ) {}

  private userId(
    request: AccountRequest,
  ): number {
    return Number(
      request.accountUser?.id || 0,
    );
  }

  @Get('overview')
  getOverview(
    @Req() request: AccountRequest,
  ) {
    return this.accountService.getOverview(
      this.userId(request),
    );
  }

  @Get('profile')
  getProfile(
    @Req() request: AccountRequest,
  ) {
    return this.accountService.getProfile(
      this.userId(request),
    );
  }

  @Patch('profile')
  updateProfile(
    @Req() request: AccountRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.accountService.updateProfile(
      this.userId(request),
      dto,
    );
  }

  @Patch('password')
  changePassword(
    @Req() request: AccountRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.accountService.changePassword(
      this.userId(request),
      dto,
    );
  }

  @Get('orders')
  getMyOrders(
    @Req() request: AccountRequest,
    @Query() query: AccountOrdersQueryDto,
  ) {
    return this.accountService.getMyOrders(
      this.userId(request),
      query,
    );
  }

  @Get('orders/:id')
  getMyOrderDetail(
    @Req() request: AccountRequest,
    @Param('id', ParseIntPipe)
    orderId: number,
  ) {
    return this.accountService.getMyOrderDetail(
      this.userId(request),
      orderId,
    );
  }


  @Post(
    'orders/:orderId/items/:productId/review',
  )
  createPurchasedReview(
    @Req() request: AccountRequest,
    @Param('orderId', ParseIntPipe)
    orderId: number,
    @Param('productId', ParseIntPipe)
    productId: number,
    @Body() dto: CreatePurchasedReviewDto,
  ) {
    return this.accountService.createPurchasedReview(
      this.userId(request),
      orderId,
      productId,
      dto,
    );
  }

  @Patch('orders/:id/cancel')
  cancelMyOrder(
    @Req() request: AccountRequest,
    @Param('id', ParseIntPipe)
    orderId: number,
    @Body() dto: CancelOrderDto,
  ) {
    return this.accountService.cancelMyOrder(
      this.userId(request),
      orderId,
      dto,
    );
  }
}

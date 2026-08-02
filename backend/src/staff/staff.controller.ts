import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from '../auth/auth.service';
import {
  CreateProductImageDto,
  CreateProductVariantDto,
  CreateStaffAccountDto,
  InventoryTransactionDto,
  ReplyReviewDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
  UpdateProductVariantDto,
  UpdateReviewStatusDto,
  UpdateStaffProductDto,
} from './dto/staff.dto';
import { StaffService } from './staff.service';

const SESSION_COOKIE =
  'electroshop_session';

@Controller('staff')
export class StaffController {
  constructor(
    private readonly staffService:
      StaffService,

    private readonly authService:
      AuthService,
  ) {}

  private async getActor(
    request: Request,
  ) {
    const token =
      request.cookies?.[
        SESSION_COOKIE
      ];

    return this.authService.getProfileFromToken(
      token,
    );
  }

  private requireRole(
    actor: {
      id: number;
      role: string;
    },
    roles: string[],
  ) {
    const role = String(
      actor.role || '',
    ).toUpperCase();

    if (!roles.includes(role)) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện chức năng này',
      );
    }
  }

  private async requireStaff(
    request: Request,
  ) {
    const actor =
      await this.getActor(request);

    this.requireRole(actor, [
      'STAFF',
      'ADMIN',
    ]);

    return actor;
  }

  private async requireAdmin(
    request: Request,
  ) {
    const actor =
      await this.getActor(request);

    this.requireRole(actor, [
      'ADMIN',
    ]);

    return actor;
  }

  @Get('dashboard')
  async dashboard(
    @Req() request: Request,
  ) {
    await this.requireStaff(request);

    return this.staffService.getDashboard();
  }

  @Get('orders')
  async orders(
    @Req() request: Request,
    @Query('search') search = '',
    @Query('status') status = '',
  ) {
    await this.requireStaff(request);

    return this.staffService.listOrders(
      search,
      status,
    );
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Req() request: Request,
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const actor =
      await this.requireStaff(
        request,
      );

    return this.staffService.updateOrderStatus(
      id,
      dto.status,
      dto.note,
      actor,
    );
  }

  @Get('products')
  async products(
    @Req() request: Request,
    @Query('search') search = '',
  ) {
    await this.requireStaff(request);

    return this.staffService.listProducts(
      search,
    );
  }

  @Patch('products/:id')
  async updateProduct(
    @Req() request: Request,
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
    @Body() dto: UpdateStaffProductDto,
  ) {
    const actor =
      await this.requireStaff(
        request,
      );

    return this.staffService.updateProduct(
      id,
      dto,
      actor,
    );
  }



  @Get('products/:id/assets')
  async productAssets(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.requireStaff(request);

    return this.staffService.getProductAssets(id);
  }

  @Post('products/:id/images')
  async createProductImage(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProductImageDto,
  ) {
    const actor = await this.requireStaff(request);

    return this.staffService.createProductImage(
      id,
      dto,
      actor,
    );
  }

  @Delete('products/:productId/images/:imageId')
  async deleteProductImage(
    @Req() request: Request,
    @Param('productId', ParseIntPipe) productId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    const actor = await this.requireStaff(request);

    return this.staffService.deleteProductImage(
      productId,
      imageId,
      actor,
    );
  }

  @Post('products/:id/variants')
  async createProductVariant(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProductVariantDto,
  ) {
    const actor = await this.requireStaff(request);

    return this.staffService.createProductVariant(
      id,
      dto,
      actor,
    );
  }

  @Patch('products/:productId/variants/:variantId')
  async updateProductVariant(
    @Req() request: Request,
    @Param('productId', ParseIntPipe) productId: number,
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() dto: UpdateProductVariantDto,
  ) {
    const actor = await this.requireStaff(request);

    return this.staffService.updateProductVariant(
      productId,
      variantId,
      dto,
      actor,
    );
  }

  @Get('inventory')
  async inventory(
    @Req() request: Request,
    @Query('search') search = '',
    @Query('lowStockOnly')
    lowStockOnly = 'false',
  ) {
    await this.requireStaff(request);

    return this.staffService.listInventory(
      search,
      lowStockOnly === 'true' ||
        lowStockOnly === '1',
    );
  }

  @Get(
    'inventory/products/:id/variants',
  )
  async variants(
    @Req() request: Request,
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    await this.requireStaff(request);

    return this.staffService.listVariants(
      id,
    );
  }

  @Post('inventory/transactions')
  async createInventoryTransaction(
    @Req() request: Request,
    @Body()
    dto: InventoryTransactionDto,
  ) {
    const actor =
      await this.requireStaff(
        request,
      );

    return this.staffService.createInventoryTransaction(
      dto,
      actor,
    );
  }

  @Get('payments')
  async payments(
    @Req() request: Request,
    @Query('search') search = '',
    @Query('status') status = '',
  ) {
    await this.requireStaff(request);

    return this.staffService.listPayments(
      search,
      status,
    );
  }

  @Patch('payments/:id/status')
  async updatePaymentStatus(
    @Req() request: Request,
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
    @Body()
    dto: UpdatePaymentStatusDto,
  ) {
    const actor =
      await this.requireStaff(
        request,
      );

    return this.staffService.updatePaymentStatus(
      id,
      dto,
      actor,
    );
  }

  @Get('reviews')
  async reviews(
    @Req() request: Request,
    @Query('status') status = '',
  ) {
    await this.requireStaff(request);

    return this.staffService.listReviews(
      status,
    );
  }

  @Patch('reviews/:id/status')
  async updateReviewStatus(
    @Req() request: Request,
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
    @Body()
    dto: UpdateReviewStatusDto,
  ) {
    const actor =
      await this.requireStaff(
        request,
      );

    return this.staffService.updateReviewStatus(
      id,
      dto.status,
      actor,
    );
  }

  @Post('reviews/:id/replies')
  async replyReview(
    @Req() request: Request,
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
    @Body() dto: ReplyReviewDto,
  ) {
    const actor =
      await this.requireStaff(
        request,
      );

    return this.staffService.replyReview(
      id,
      dto.content,
      actor,
    );
  }

  @Get('reports/revenue')
  async revenue(
    @Req() request: Request,
  ) {
    await this.requireStaff(request);

    return this.staffService.getRevenueReport();
  }

  @Get('accounts')
  async accounts(
    @Req() request: Request,
  ) {
    await this.requireAdmin(request);

    return this.staffService.listStaffAccounts();
  }

  @Post('accounts')
  async createAccount(
    @Req() request: Request,
    @Body()
    dto: CreateStaffAccountDto,
  ) {
    const actor =
      await this.requireAdmin(
        request,
      );

    return this.staffService.createStaffAccount(
      dto,
      actor,
    );
  }
}

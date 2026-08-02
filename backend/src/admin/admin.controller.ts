import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard, type AdminRequest } from './admin-auth.guard';
import { AdminService } from './admin.service';
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

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private actorId(request: AdminRequest) {
    return Number(request.adminUser?.id || 0);
  }

  @Get('lookups')
  getLookups() {
    return this.adminService.getLookups();
  }

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  listUsers(@Query() query: AdminListQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Post('staff')
  createStaff(
    @Body() dto: CreateStaffDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.createStaff(dto, this.actorId(request));
  }

  @Patch('users/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminUserDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.updateUser(id, dto, this.actorId(request));
  }

  @Patch('users/:id/password')
  resetUserPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResetUserPasswordDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.resetUserPassword(id, dto, this.actorId(request));
  }

  @Delete('users/:id')
  deactivateUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.deactivateUser(id, this.actorId(request));
  }

  @Get('products')
  listProducts(@Query() query: AdminListQueryDto) {
    return this.adminService.listProducts(query);
  }

  @Get('products/:id')
  getProductDetail(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getProductDetail(id);
  }

  @Post('products')
  createProduct(
    @Body() dto: CreateProductDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.createProduct(dto, this.actorId(request));
  }

  @Patch('products/:id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.updateProduct(id, dto, this.actorId(request));
  }

  @Patch('products/:id/status')
  updateProductStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.updateProductStatus(id, dto, this.actorId(request));
  }

  @Delete('products/:id')
  deleteProduct(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.updateProductStatus(
      id,
      { status: 'DELETED' },
      this.actorId(request),
    );
  }

  @Post('products/:id/images')
  addProductImage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProductImageDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.addProductImage(id, dto, this.actorId(request));
  }

  @Delete('product-images/:imageId')
  deleteProductImage(
    @Param('imageId', ParseIntPipe) imageId: number,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.deleteProductImage(imageId, this.actorId(request));
  }

  @Post('products/:id/variants')
  createVariant(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateVariantDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.createVariant(id, dto, this.actorId(request));
  }

  @Patch('variants/:variantId')
  updateVariant(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() dto: UpdateVariantDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.updateVariant(
      variantId,
      dto,
      this.actorId(request),
    );
  }

  @Delete('variants/:variantId')
  deactivateVariant(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.deactivateVariant(
      variantId,
      this.actorId(request),
    );
  }

  @Put('products/:id/specifications')
  replaceProductSpecifications(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplaceProductSpecificationsDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.replaceProductSpecifications(
      id,
      dto,
      this.actorId(request),
    );
  }

  @Get('inventory')
  listInventory(@Query() query: AdminListQueryDto) {
    return this.adminService.listInventory(query);
  }

  @Get('inventory/transactions')
  listInventoryTransactions(@Query() query: AdminListQueryDto) {
    return this.adminService.listInventoryTransactions(query);
  }

  @Post('inventory/transactions')
  createInventoryTransaction(
    @Body() dto: CreateInventoryTransactionDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.createInventoryTransaction(
      dto,
      this.actorId(request),
    );
  }

  @Get('orders')
  listOrders(@Query() query: AdminListQueryDto) {
    return this.adminService.listOrders(query);
  }

  @Get('orders/:id')
  getOrderDetail(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getOrderDetail(id);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.updateOrderStatus(id, dto, this.actorId(request));
  }

  @Get('payments')
  listPayments(@Query() query: AdminListQueryDto) {
    return this.adminService.listPayments(query);
  }

  @Patch('payments/:id/status')
  updatePaymentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentStatusDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.updatePaymentStatus(
      id,
      dto,
      this.actorId(request),
    );
  }

  @Get('reviews')
  listReviews(@Query() query: AdminListQueryDto) {
    return this.adminService.listReviews(query);
  }

  @Patch('reviews/:id/status')
  moderateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModerateReviewDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.moderateReview(id, dto, this.actorId(request));
  }

  @Post('reviews/:id/replies')
  replyReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplyReviewDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.replyReview(id, dto, this.actorId(request));
  }

  @Delete('reviews/:id')
  deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.deleteReview(id, this.actorId(request));
  }

  @Get('promotions')
  listPromotions(@Query() query: AdminListQueryDto) {
    return this.adminService.listPromotions(query);
  }

  @Post('promotions')
  createPromotion(
    @Body() dto: CreatePromotionDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.createPromotion(dto, this.actorId(request));
  }

  @Patch('promotions/:id')
  updatePromotion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePromotionDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.updatePromotion(id, dto, this.actorId(request));
  }

  @Delete('promotions/:id')
  deactivatePromotion(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.deactivatePromotion(id, this.actorId(request));
  }

  @Get('reports')
  getReports(@Query() query: AdminListQueryDto) {
    return this.adminService.getReports(query);
  }

  @Get('audit-logs')
  listAuditLogs(@Query() query: AdminListQueryDto) {
    return this.adminService.listAuditLogs(query);
  }

  @Get('ai/search-logs')
  listAiSearchLogs(@Query() query: AdminListQueryDto) {
    return this.adminService.listAiSearchLogs(query);
  }

  @Get('settings')
  getSettings(@Query('group') group?: string) {
    return this.adminService.getSettings(group);
  }

  @Put('settings')
  updateSetting(
    @Body() dto: UpdateSystemSettingDto,
    @Req() request: AdminRequest,
  ) {
    return this.adminService.updateSetting(dto, this.actorId(request));
  }
}

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export enum OrderStatusCode {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum InventoryTypeCode {
  IN = 'IN',
  OUT = 'OUT',
  ADJUST = 'ADJUST',
}

export enum ReviewStatusCode {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum PaymentStatusCode {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatusCode, {
    message: 'Trạng thái đơn hàng không hợp lệ',
  })
  status: OrderStatusCode;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}

export class InventoryTransactionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  variantId?: number;

  @IsEnum(InventoryTypeCode, {
    message: 'Loại giao dịch kho không hợp lệ',
  })
  type: InventoryTypeCode;

  @Type(() => Number)
  @IsInt()
  quantity: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}

export class UpdateReviewStatusDto {
  @IsEnum(ReviewStatusCode, {
    message: 'Trạng thái đánh giá không hợp lệ',
  })
  status: ReviewStatusCode;
}

export class ReplyReviewDto {
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  content: string;
}

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatusCode, {
    message: 'Trạng thái thanh toán không hợp lệ',
  })
  status: PaymentStatusCode;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  transactionCode?: string;
}

export class CreateStaffAccountDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @IsEmail(
    {},
    {
      message: 'Email không hợp lệ',
    },
  )
  email: string;

  @IsString()
  @Matches(/^(0|\+84)[0-9]{9}$/, {
    message:
      'Số điện thoại phải gồm 10 số và bắt đầu bằng 0',
  })
  phone: string;

  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/,
    {
      message:
        'Mật khẩu phải từ 8 ký tự, có chữ hoa, chữ thường và chữ số',
    },
  )
  password: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}

export class UpdateStaffProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}


export class CreateProductImageDto {
  @IsUrl(
    {
      require_protocol: true,
    },
    {
      message: 'Đường dẫn hình ảnh không hợp lệ',
    },
  )
  @MaxLength(500)
  imageUrl: string;

  @IsOptional()
  @IsBoolean()
  isThumbnail?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreateProductVariantDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  sku: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ram?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  storage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  gpu?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cpu?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  additionalPrice?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateProductVariantDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  sku?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ram?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  storage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  gpu?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cpu?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  additionalPrice?: number;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

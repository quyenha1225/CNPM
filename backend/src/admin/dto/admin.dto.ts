import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class AdminListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  role?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  brandId?: number;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class CreateStaffDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @IsEmail()
  @MaxLength(150)
  email!: string;

  @IsString()
  @Matches(/^(0|\+84)[0-9]{9,10}$/, {
    message: 'Số điện thoại không đúng định dạng Việt Nam',
  })
  phone!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Mật khẩu phải có chữ hoa, chữ thường và số',
  })
  password!: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'LOCKED'])
  status = 'ACTIVE';
}

export class UpdateAdminUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(0|\+84)[0-9]{9,10}$/, {
    message: 'Số điện thoại không đúng định dạng Việt Nam',
  })
  phone?: string;

  @IsOptional()
  @IsIn(['CUSTOMER', 'STAFF', 'ADMIN'])
  roleCode?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'LOCKED'])
  status?: string;
}

export class ResetUserPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Mật khẩu phải có chữ hoa, chữ thường và số',
  })
  password!: string;
}

export class UpdateStatusDto {
  @IsString()
  @MaxLength(50)
  status!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}

export class CreateProductDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  brandId?: number;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(220)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  barcode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  manufacturerPartNumber?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2200)
  releaseYear?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  originCountry?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  warrantyMonths = 0;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'DRAFT'])
  status = 'ACTIVE';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class CreateProductImageDto {
  @IsString()
  @MaxLength(500)
  imageUrl!: string;

  @IsOptional()
  @Type(() => Boolean)
  isThumbnail = false;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder = 0;
}

export class CreateVariantDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsString()
  @MaxLength(100)
  sku!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ramSize?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  storageSize?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  gpuOption?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cpuOption?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  additionalPrice = 0;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status = 'ACTIVE';

  @IsOptional()
  @Type(() => Boolean)
  isDefault = false;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  initialStock = 0;
}

export class UpdateVariantDto extends PartialType(CreateVariantDto) {}

export class ProductSpecificationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  attributeId!: number;

  @IsString()
  @MaxLength(1000)
  value!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  numericValue?: number;

  @IsOptional()
  booleanValue?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  normalizedValue?: string;
}

export class ReplaceProductSpecificationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSpecificationDto)
  specifications!: ProductSpecificationDto[];
}

export class CreateInventoryTransactionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  variantId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  supplierId?: number;

  @IsIn(['IN', 'OUT', 'ADJUST'])
  typeCode!: 'IN' | 'OUT' | 'ADJUST';

  @Type(() => Number)
  @IsInt()
  quantity!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitCost?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  @MaxLength(50)
  statusCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}

export class UpdatePaymentStatusDto {
  @IsString()
  @MaxLength(50)
  statusCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  transactionCode?: string;
}

export class ModerateReviewDto {
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status!: string;
}

export class ReplyReviewDto {
  @IsString()
  @MinLength(2)
  content!: string;
}

export class CreatePromotionDto {
  @IsString()
  @MaxLength(50)
  code!: string;

  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['PERCENT', 'FIXED'])
  discountType!: 'PERCENT' | 'FIXED';

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountValue!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minOrderValue = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxDiscountValue?: number;

  @IsDateString()
  startAt!: string;

  @IsDateString()
  endAt!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @IsIn(['DRAFT', 'ACTIVE', 'INACTIVE'])
  status = 'DRAFT';

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  productIds?: number[];
}

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {}

export class UpdateSystemSettingDto {
  @IsString()
  @MaxLength(100)
  key!: string;

  @IsString()
  group!: string;

  @IsString()
  value!: string;

  @IsOptional()
  @IsIn(['STRING', 'NUMBER', 'BOOLEAN', 'JSON'])
  valueType = 'STRING';

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

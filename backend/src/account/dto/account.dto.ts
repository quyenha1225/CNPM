import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @Length(2, 150)
  fullName!: string;

  @Transform(({ value }) =>
    String(value ?? '')
      .replace(/[\s.-]/g, '')
      .replace(/^\+84/, '0'),
  )
  @IsString()
  @Matches(/^0\d{9,10}$/, {
    message: 'Số điện thoại không hợp lệ.',
  })
  phone!: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;

  @IsString()
  @MinLength(8)
  confirmPassword!: string;
}

export class AccountOrdersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn([
    'PENDING',
    'CONFIRMED',
    'SHIPPING',
    'DELIVERED',
    'CANCELLED',
  ])
  status?: string;
}

export class CancelOrderDto {
  @IsOptional()
  @IsString()
  @Length(0, 255)
  reason?: string;
}


export class CreatePurchasedReviewDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  content!: string;
}

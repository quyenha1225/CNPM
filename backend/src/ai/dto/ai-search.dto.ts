import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class AiSearchDto {
  @IsString()
  @MinLength(2, {
    message: 'Nội dung tìm kiếm phải có ít nhất 2 ký tự',
  })
  @MaxLength(1000, {
    message: 'Nội dung tìm kiếm không được vượt quá 1000 ký tự',
  })
  query!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  customerId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit = 10;
}

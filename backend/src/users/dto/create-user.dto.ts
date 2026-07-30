import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @Transform(({ value }) => String(value || '').trim())
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @MinLength(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Họ tên không được vượt quá 100 ký tự' })
  name!: string;

  @Transform(({ value }) => String(value || '').trim().toLowerCase())
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @Transform(({ value }) =>
    String(value || '').replace(/[\s.-]/g, '').replace(/^\+84/, '0'),
  )
  @Matches(/^(03|05|07|08|09)\d{8}$/, {
    message: 'Số điện thoại Việt Nam không hợp lệ',
  })
  phone!: string;

  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/[a-z]/, { message: 'Mật khẩu phải có chữ thường' })
  @Matches(/[A-Z]/, { message: 'Mật khẩu phải có chữ hoa' })
  @Matches(/\d/, { message: 'Mật khẩu phải có chữ số' })
  password!: string;
}

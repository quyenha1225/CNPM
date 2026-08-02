import {
  IsEmail,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class RequestPasswordOtpDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;
}

export class VerifyPasswordOtpDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @IsString({ message: 'OTP phải là chuỗi ký tự' })
  @Length(6, 6, { message: 'OTP phải có đúng 6 chữ số' })
  @Matches(/^\d{6}$/, { message: 'OTP chỉ được chứa chữ số' })
  otp!: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @IsString({ message: 'OTP phải là chuỗi ký tự' })
  @Length(6, 6, { message: 'OTP phải có đúng 6 chữ số' })
  @Matches(/^\d{6}$/, { message: 'OTP chỉ được chứa chữ số' })
  otp!: string;

  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Mật khẩu phải có chữ hoa, chữ thường và chữ số',
  })
  newPassword!: string;
}

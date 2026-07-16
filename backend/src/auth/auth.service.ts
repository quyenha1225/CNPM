import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // ================== HÀM ĐĂNG NHẬP ==================
  async login(loginDto: any) {
    const { email, password } = loginDto;

    const user = (await this.usersRepository.findOne({
      where: { user_email: email },
      relations: { role: true },
    })) as any;

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    if (user.account_status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản đã bị khóa!');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    return {
      message: 'Đăng nhập thành công',
      token: 'YOUR_GENERATED_JWT_TOKEN',
      user: {
        id: user.user_id,
        email: user.user_email,
        fullName: user.user_full_name,
        role_code: user.role?.role_code,
      },
    };
  }

  // ================== HÀM ĐĂNG KÝ ==================
  async register(registerDto: any) {
    // Dựa vào các trường nhập liệu trên form Đăng ký của bạn
    const { name, email, phone, password } = registerDto;

    // 1. Kiểm tra xem email đã tồn tại trong DB chưa
    const existingUser = await this.usersRepository.findOne({ where: { user_email: email } });
    if (existingUser) {
      throw new UnauthorizedException('Email này đã được sử dụng!');
    }

    // 2. Băm (Hash) mật khẩu bằng bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Tạo user mới với mật khẩu đã mã hóa
    const newUser = this.usersRepository.create({
      user_full_name: name,
      user_email: email,
      user_phone: phone,
      password_hash: hashedPassword, // Lưu chuỗi loằng ngoằng, KHÔNG lưu text thường
      account_status: 'ACTIVE',
      // Mặc định gán role_id = 2 (Giả sử 2 là CUSTOMER trong bảng Role của bạn, bạn có thể điều chỉnh lại)
      role: { role_id: 2 } as any, 
    });

    // 4. Lưu xuống Database
    await this.usersRepository.save(newUser);

    return { message: 'Đăng ký thành công!' };
  }
}
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  private sanitizeUser(user: any) {
    return {
      id: Number(user.user_id),
      name: user.user_full_name,
      email: user.user_email,
      phone: user.user_phone,
      roleId: Number(user.role_id),
      role: user.role_code || null,
      status: user.account_status,
    };
  }

  private createAccessToken(user: any) {
    return this.jwtService.sign({
      sub: Number(user.user_id),
      email: user.user_email,
      roleId: Number(user.role_id),
    });
  }

  async register(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();
    const phone = dto.phone.replace(/[\s.-]/g, '').replace(/^\+84/, '0');

    const duplicateRows = await this.dataSource.query(
      `
      SELECT user_id, user_email, user_phone
      FROM users
      WHERE LOWER(user_email) = LOWER(?)
         OR user_phone = ?
      LIMIT 1
      `,
      [email, phone],
    );

    if (duplicateRows.length) {
      if (
        String(duplicateRows[0].user_email).toLowerCase() === email
      ) {
        throw new BadRequestException('Email đã được sử dụng');
      }
      throw new BadRequestException('Số điện thoại đã được sử dụng');
    }

    const roleRows = await this.dataSource.query(
      `
      SELECT role_id, role_code
      FROM roles
      WHERE role_code = 'CUSTOMER'
      LIMIT 1
      `,
    );

    if (!roleRows.length) {
      throw new BadRequestException(
        'Hệ thống chưa có vai trò CUSTOMER',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await this.dataSource.query(
      `
      INSERT INTO users (
        role_id,
        user_full_name,
        user_email,
        user_phone,
        password_hash,
        account_status
      )
      VALUES (?, ?, ?, ?, ?, 'ACTIVE')
      `,
      [
        roleRows[0].role_id,
        dto.name.trim(),
        email,
        phone,
        passwordHash,
      ],
    );

    const rows = await this.dataSource.query(
      `
      SELECT
        u.user_id,
        u.role_id,
        u.user_full_name,
        u.user_email,
        u.user_phone,
        u.account_status,
        r.role_code
      FROM users u
      JOIN roles r ON r.role_id = u.role_id
      WHERE u.user_id = ?
      LIMIT 1
      `,
      [result.insertId],
    );

    const user = rows[0];
    const token = this.createAccessToken(user);

    return {
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: this.sanitizeUser(user),
    };
  }

  async login(dto: LoginDto) {
    const rows = await this.dataSource.query(
      `
      SELECT
        u.user_id,
        u.role_id,
        u.user_full_name,
        u.user_email,
        u.user_phone,
        u.password_hash,
        u.account_status,
        r.role_code
      FROM users u
      JOIN roles r ON r.role_id = u.role_id
      WHERE LOWER(u.user_email) = LOWER(?)
      LIMIT 1
      `,
      [dto.email.trim().toLowerCase()],
    );

    if (!rows.length) {
      throw new UnauthorizedException(
        'Email hoặc mật khẩu không chính xác',
      );
    }

    const user = rows[0];

    if (user.account_status !== 'ACTIVE') {
      throw new UnauthorizedException(
        'Tài khoản hiện không hoạt động',
      );
    }

    const passwordMatched = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );

    if (!passwordMatched) {
      throw new UnauthorizedException(
        'Email hoặc mật khẩu không chính xác',
      );
    }

    const token = this.createAccessToken(user);

    return {
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: this.sanitizeUser(user),
    };
  }

  async getProfileFromToken(token?: string) {
    if (!token) {
      throw new UnauthorizedException('Bạn chưa đăng nhập');
    }

    let payload: { sub: number };

    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException(
        'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
      );
    }

    const rows = await this.dataSource.query(
      `
      SELECT
        u.user_id,
        u.role_id,
        u.user_full_name,
        u.user_email,
        u.user_phone,
        u.account_status,
        r.role_code
      FROM users u
      JOIN roles r ON r.role_id = u.role_id
      WHERE u.user_id = ?
      LIMIT 1
      `,
      [payload.sub],
    );

    if (!rows.length || rows[0].account_status !== 'ACTIVE') {
      throw new UnauthorizedException('Không tìm thấy tài khoản hợp lệ');
    }

    return this.sanitizeUser(rows[0]);
  }
}

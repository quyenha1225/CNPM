import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';

export type AdminRequest = Request & {
  adminUser?: {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
  };
};

const SESSION_COOKIE = 'electroshop_session';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();

    const bearerToken = request.headers.authorization?.startsWith('Bearer ')
      ? request.headers.authorization.slice(7).trim()
      : undefined;

    const token = request.cookies?.[SESSION_COOKIE] || bearerToken;

    if (!token) {
      throw new UnauthorizedException('Bạn chưa đăng nhập');
    }

    const user = await this.authService.getProfileFromToken(token);

    if (String(user.role || '').toUpperCase() !== 'ADMIN') {
      throw new ForbiddenException('Chỉ ADMIN được truy cập chức năng này');
    }

    request.adminUser = {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      role: String(user.role),
      status: user.status,
    };

    return true;
  }
}

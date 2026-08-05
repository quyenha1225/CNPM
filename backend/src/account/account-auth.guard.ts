import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from '../auth/auth.service';

const SESSION_COOKIE = 'electroshop_session';

export interface AccountUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  roleId: number;
  role: string | null;
  status: string;
}

export interface AccountRequest extends Request {
  accountUser?: AccountUser;
}

@Injectable()
export class AccountAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AccountRequest>();

    const token =
      request.cookies?.[SESSION_COOKIE];

    const user =
      await this.authService.getProfileFromToken(
        token,
      );

    request.accountUser = user;

    return true;
  }
}

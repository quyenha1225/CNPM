import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

interface GoogleTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  id_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

@Injectable()
export class GoogleOauthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  private requiredConfig(name: string): string {
    const value = this.configService
      .get<string>(name)
      ?.trim();

    if (!value) {
      throw new InternalServerErrorException(
        `Thiếu cấu hình ${name} trong backend/.env`,
      );
    }

    return value;
  }

  getAuthorizationUrl(): string {
    const clientId =
      this.requiredConfig('GOOGLE_CLIENT_ID');

    const callbackUrl =
      this.requiredConfig('GOOGLE_CALLBACK_URL');

    const parameters = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
    });

    return (
      'https://accounts.google.com/o/oauth2/v2/auth?' +
      parameters.toString()
    );
  }

  private async exchangeCode(
    code: string,
  ): Promise<string> {
    const clientId =
      this.requiredConfig('GOOGLE_CLIENT_ID');

    const clientSecret =
      this.requiredConfig('GOOGLE_CLIENT_SECRET');

    const callbackUrl =
      this.requiredConfig('GOOGLE_CALLBACK_URL');

    const response = await fetch(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded',
        },

        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code',
        }),
      },
    );

    const result =
      (await response.json()) as GoogleTokenResponse;

    if (
      !response.ok ||
      !result.access_token
    ) {
      console.error(
        'Google token exchange failed:',
        result,
      );

      throw new UnauthorizedException(
        result.error_description ||
          'Không thể xác thực mã đăng nhập Google',
      );
    }

    return result.access_token;
  }

  private async getGoogleProfile(
    accessToken: string,
  ): Promise<GoogleProfile> {
    const response = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
    );

    const profile =
      (await response.json()) as GoogleProfile;

    if (
      !response.ok ||
      !profile.email ||
      !profile.sub
    ) {
      console.error(
        'Google userinfo failed:',
        profile,
      );

      throw new UnauthorizedException(
        'Không thể lấy thông tin tài khoản Google',
      );
    }

    if (!profile.email_verified) {
      throw new UnauthorizedException(
        'Email Google chưa được xác minh',
      );
    }

    return profile;
  }

  async loginWithCode(code: string) {
    const accessToken =
      await this.exchangeCode(code);

    const profile =
      await this.getGoogleProfile(
        accessToken,
      );

    const email = profile.email
      .trim()
      .toLowerCase();

    const existingUsers: Array<{
      user_id: number;
      user_full_name: string;
      user_email: string;
      account_status: string;
      role_code: string;
    }> = await this.dataSource.query(
      `
        SELECT
          u.user_id,
          u.user_full_name,
          u.user_email,
          u.account_status,
          r.role_code
        FROM users u
        INNER JOIN roles r
          ON r.role_id = u.role_id
        WHERE LOWER(u.user_email) = ?
        LIMIT 1
      `,
      [email],
    );

    let user = existingUsers[0];

    if (!user) {
      const customerRoles: Array<{
        role_id: number;
      }> = await this.dataSource.query(
        `
          SELECT role_id
          FROM roles
          WHERE role_code = 'CUSTOMER'
          LIMIT 1
        `,
      );

      if (!customerRoles.length) {
        throw new InternalServerErrorException(
          'Database chưa có role CUSTOMER',
        );
      }

      /*
       * Tài khoản Google không dùng mật khẩu cục bộ,
       * nhưng database hiện yêu cầu password_hash.
       */
      const randomPasswordHash =
        await bcrypt.hash(
          randomUUID(),
          12,
        );

      const insertResult: {
        insertId?: number;
      } = await this.dataSource.query(
        `
          INSERT INTO users (
            role_id,
            user_full_name,
            user_email,
            password_hash,
            account_status
          )
          VALUES (?, ?, ?, ?, 'ACTIVE')
        `,
        [
          customerRoles[0].role_id,
          profile.name ||
            email.split('@')[0],
          email,
          randomPasswordHash,
        ],
      );

      user = {
        user_id: Number(
          insertResult.insertId,
        ),
        user_full_name:
          profile.name ||
          email.split('@')[0],
        user_email: email,
        account_status: 'ACTIVE',
        role_code: 'CUSTOMER',
      };
    }

    if (
      String(
        user.account_status,
      ).toUpperCase() !== 'ACTIVE'
    ) {
      throw new ForbiddenException(
        'Tài khoản đã bị khóa hoặc ngừng hoạt động',
      );
    }

    const token =
      await this.jwtService.signAsync({
        sub: Number(user.user_id),
        email: user.user_email,
        role: user.role_code,
      });

    return {
      token,

      user: {
        id: Number(user.user_id),
        fullName:
          user.user_full_name,
        email: user.user_email,
        role: user.role_code,
        picture:
          profile.picture || null,
      },
    };
  }
}
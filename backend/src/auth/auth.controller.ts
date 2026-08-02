import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';

import type {
  CookieOptions,
  Request,
  Response,
} from 'express';

import { CreateUserDto } from '../users/dto/create-user.dto';

import { AuthService } from './auth.service';
import { GoogleOauthService } from './google-oauth.service';
import { PasswordResetService } from './password-reset.service';

import {
  RequestPasswordOtpDto,
  ResetPasswordDto,
  VerifyPasswordOtpDto,
} from './dto/forgot-password.dto';

import { LoginDto } from './dto/login.dto';

const SESSION_COOKIE = 'electroshop_session';

function parseBoolean(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (
    value === undefined ||
    value.trim() === ''
  ) {
    return fallback;
  }

  return [
    '1',
    'true',
    'yes',
    'on',
  ].includes(value.trim().toLowerCase());
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService:
      AuthService,

    private readonly passwordResetService:
      PasswordResetService,

    private readonly googleOauthService:
      GoogleOauthService,
  ) {}

  /**
   * Cấu hình cookie đăng nhập.
   *
   * Localhost:
   * COOKIE_SECURE=false
   * COOKIE_SAME_SITE=lax
   *
   * Production HTTPS:
   * COOKIE_SECURE=true
   * COOKIE_SAME_SITE=none
   */
  private cookieOptions(
    rememberMe = false,
  ): CookieOptions {
    const isProduction =
      process.env.NODE_ENV ===
      'production';

    const secure = parseBoolean(
      process.env.COOKIE_SECURE,
      isProduction,
    );

    const configuredSameSite =
      String(
        process.env
          .COOKIE_SAME_SITE ||
          (isProduction
            ? 'none'
            : 'lax'),
      )
        .trim()
        .toLowerCase();

    let sameSite:
      | 'lax'
      | 'strict'
      | 'none' = 'lax';

    if (
      configuredSameSite ===
      'strict'
    ) {
      sameSite = 'strict';
    } else if (
      configuredSameSite ===
      'none'
    ) {
      sameSite = 'none';
    }

    const options: CookieOptions = {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',

      maxAge: rememberMe
        ? 30 *
          24 *
          60 *
          60 *
          1000
        : 24 *
          60 *
          60 *
          1000,
    };

    const domain =
      process.env.COOKIE_DOMAIN?.trim();

    if (domain) {
      options.domain = domain;
    }

    return options;
  }

  /**
   * Đăng ký tài khoản thường.
   */
  @Post('register')
  async register(
    @Body()
    dto: CreateUserDto,

    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    const {
      token,
      ...safeResult
    } =
      await this.authService.register(
        dto,
      );

    response.cookie(
      SESSION_COOKIE,
      token,
      this.cookieOptions(true),
    );

    return safeResult;
  }

  /**
   * Đăng nhập bằng email và mật khẩu.
   */
  @Post('login')
  async login(
    @Body()
    dto: LoginDto,

    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    const {
      token,
      ...safeResult
    } =
      await this.authService.login(
        dto,
      );

    response.cookie(
      SESSION_COOKIE,
      token,
      this.cookieOptions(
        Boolean(dto.rememberMe),
      ),
    );

    return safeResult;
  }

  /**
   * Bắt đầu đăng nhập Google.
   *
   * GET /api/auth/google
   */
  @Get('google')
  googleLogin(
    @Res()
    response: Response,
  ) {
    try {
      const authorizationUrl =
        this.googleOauthService
          .getAuthorizationUrl();

      return response.redirect(
        authorizationUrl,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể khởi tạo đăng nhập Google';

      return response
        .status(500)
        .json({
          success: false,
          message,
        });
    }
  }

  /**
   * Google chuyển người dùng về route này sau khi chọn tài khoản.
   *
   * GET /api/auth/google/callback?code=...
   */
  @Get('google/callback')
  async googleCallback(
    @Query('code')
    code: string | undefined,

    @Query('error')
    googleError:
      | string
      | undefined,

    @Query('error_description')
    errorDescription:
      | string
      | undefined,

    @Res()
    response: Response,
  ) {
    const successUrl =
      process.env
        .GOOGLE_LOGIN_SUCCESS_URL?.trim() ||
      'http://localhost:3000/react-ecommerce/#/';

    const failureUrl =
      process.env
        .GOOGLE_LOGIN_FAILURE_URL?.trim() ||
      'http://localhost:3000/react-ecommerce/#/login';

    if (googleError) {
      const message =
        errorDescription ||
        googleError;

      return response.redirect(
        `${failureUrl}?googleError=${encodeURIComponent(
          message,
        )}`,
      );
    }

    if (!code) {
      return response.redirect(
        `${failureUrl}?googleError=${encodeURIComponent(
          'Google không trả về authorization code',
        )}`,
      );
    }

    try {
      const result =
        await this.googleOauthService
          .loginWithCode(code);

      response.cookie(
        SESSION_COOKIE,
        result.token,
        this.cookieOptions(true),
      );

      return response.redirect(
        successUrl,
      );
    } catch (error: unknown) {
      console.error(
        'Google OAuth callback failed:',
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : 'Đăng nhập Google thất bại';

      return response.redirect(
        `${failureUrl}?googleError=${encodeURIComponent(
          message,
        )}`,
      );
    }
  }

  /**
   * Lấy người dùng đang đăng nhập.
   *
   * JWT được đọc từ cookie HTTP-only.
   */
  @Get('me')
  async me(
    @Req()
    request: Request,
  ) {
    const token =
      request.cookies?.[
        SESSION_COOKIE
      ];

    const user =
      await this.authService
        .getProfileFromToken(
          token,
        );

    return {
      success: true,
      user,
    };
  }

  /**
   * Đăng xuất.
   */
  @Post('logout')
  logout(
    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    const {
      maxAge: _maxAge,
      ...clearOptions
    } =
      this.cookieOptions(false);

    response.clearCookie(
      SESSION_COOKIE,
      clearOptions,
    );

    return {
      success: true,
      message:
        'Đăng xuất thành công',
    };
  }

  /**
   * Gửi OTP quên mật khẩu.
   *
   * POST /api/auth/forgot-password/request-otp
   */
  @Post(
    'forgot-password/request-otp',
  )
  requestPasswordOtp(
    @Body()
    dto: RequestPasswordOtpDto,
  ) {
    return this.passwordResetService
      .requestOtp(dto.email);
  }

  /**
   * Kiểm tra OTP.
   *
   * POST /api/auth/forgot-password/verify-otp
   */
  @Post(
    'forgot-password/verify-otp',
  )
  verifyPasswordOtp(
    @Body()
    dto: VerifyPasswordOtpDto,
  ) {
    return this.passwordResetService
      .verifyOtp(
        dto.email,
        dto.otp,
      );
  }

  /**
   * Đặt lại mật khẩu.
   *
   * POST /api/auth/forgot-password/reset
   */
  @Post(
    'forgot-password/reset',
  )
  resetPassword(
    @Body()
    dto: ResetPasswordDto,
  ) {
    return this.passwordResetService
      .resetPassword(
        dto.email,
        dto.otp,
        dto.newPassword,
      );
  }
}
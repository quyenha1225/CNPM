import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  JwtModule,
  type JwtModuleOptions,
} from '@nestjs/jwt';
import {
  PasswordResetService,
} from './password-reset.service';
import {
  GoogleOauthService,
} from './google-oauth.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,

    UsersModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (
        configService: ConfigService,
      ): JwtModuleOptions => {
        const jwtSecret =
          configService.get<string>('JWT_SECRET') ||
          'electroshop-development-secret-change-this';

        const expiresIn = (
          configService.get<string>('JWT_EXPIRES_IN') ||
          configService.get<string>('JWT_EXPIRATION') ||
          '30d'
        ) as NonNullable<
          JwtModuleOptions['signOptions']
        >['expiresIn'];

        return {
          secret: jwtSecret,

          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],

  controllers: [AuthController],

exports: [
  AuthService,
],
providers: [
  AuthService,
  PasswordResetService,
  GoogleOauthService
],
})
export class AuthModule {}
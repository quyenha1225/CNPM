import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { DataSource } from 'typeorm';

@Injectable()
export class PasswordResetService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly dataSource: DataSource) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure:
        String(process.env.SMTP_SECURE || 'false').toLowerCase() ===
        'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private normalizeEmail(email: string): string {
    return String(email || '').trim().toLowerCase();
  }

  private expiryMinutes(): number {
    const value = Number(process.env.OTP_EXPIRES_MINUTES || 5);
    return Number.isFinite(value) ? Math.max(1, value) : 5;
  }

  private resendSeconds(): number {
    const value = Number(process.env.OTP_RESEND_SECONDS || 60);
    return Number.isFinite(value) ? Math.max(10, value) : 60;
  }

  async requestOtp(rawEmail: string) {
    const email = this.normalizeEmail(rawEmail);

    const users: Array<{
      user_id: number;
      account_status: string;
    }> = await this.dataSource.query(
      `
        SELECT user_id, account_status
        FROM users
        WHERE LOWER(user_email) = ?
        LIMIT 1
      `,
      [email],
    );

    if (
      !users.length ||
      String(users[0].account_status).toUpperCase() !== 'ACTIVE'
    ) {
      return {
        success: true,
        message:
          'Nếu email tồn tại trong hệ thống, mã OTP sẽ được gửi.',
        resendAfterSeconds: this.resendSeconds(),
      };
    }

    const latest: Array<{ created_at: Date | string }> =
      await this.dataSource.query(
        `
          SELECT created_at
          FROM password_reset_otps
          WHERE email = ?
          ORDER BY reset_otp_id DESC
          LIMIT 1
        `,
        [email],
      );

    if (latest.length) {
      const elapsed = Math.floor(
        (Date.now() - new Date(latest[0].created_at).getTime()) /
          1000,
      );

      if (elapsed < this.resendSeconds()) {
        throw new HttpException(
          `Vui lòng chờ ${
            this.resendSeconds() - elapsed
          } giây trước khi gửi lại mã.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const otp = randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(
      Date.now() + this.expiryMinutes() * 60 * 1000,
    );

    await this.dataSource.query(
      `
        UPDATE password_reset_otps
        SET used_at = NOW()
        WHERE email = ? AND used_at IS NULL
      `,
      [email],
    );

    const inserted: any = await this.dataSource.query(
      `
        INSERT INTO password_reset_otps (
          user_id,
          email,
          otp_hash,
          expires_at
        )
        VALUES (?, ?, ?, ?)
      `,
      [users[0].user_id, email, otpHash, expiresAt],
    );

    try {
      await this.transporter.verify();

      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Mã OTP đặt lại mật khẩu Gearxin',
        text:
          `Mã OTP của bạn là ${otp}. ` +
          `Mã có hiệu lực trong ${this.expiryMinutes()} phút.`,
        html: `
          <div style="max-width:560px;margin:0 auto;padding:32px;
            border-radius:18px;background:#071426;color:#fff;
            font-family:Arial,sans-serif">
            <p style="color:#22d3ee;font-weight:700">
              GEARXIN ACCOUNT RECOVERY
            </p>
            <h1>Đặt lại mật khẩu</h1>
            <p>Mã OTP xác thực tài khoản của bạn:</p>
            <div style="padding:18px;border-radius:12px;background:#fff;
              color:#071426;font-size:32px;font-weight:800;
              letter-spacing:10px;text-align:center">
              ${otp}
            </div>
            <p style="color:#94a3b8">
              Mã có hiệu lực trong ${this.expiryMinutes()} phút.
              Không chia sẻ mã này với bất kỳ ai.
            </p>
          </div>
        `,
      });
    } catch (error) {
      if (inserted?.insertId) {
        await this.dataSource.query(
          `
            UPDATE password_reset_otps
            SET used_at = NOW()
            WHERE reset_otp_id = ?
          `,
          [inserted.insertId],
        );
      }

      console.error('SMTP send OTP error:', error);

      throw new InternalServerErrorException(
        'Không thể gửi email OTP. Hãy kiểm tra SMTP_USER, SMTP_PASS và App Password Gmail.',
      );
    }

    return {
      success: true,
      message: 'Mã OTP đã được gửi tới email của bạn.',
      resendAfterSeconds: this.resendSeconds(),
    };
  }

  private async getValidOtp(rawEmail: string, otp: string) {
    const email = this.normalizeEmail(rawEmail);

    const rows: Array<{
      reset_otp_id: number;
      user_id: number;
      otp_hash: string;
      expires_at: Date | string;
      verified_at: Date | string | null;
      attempts: number;
    }> = await this.dataSource.query(
      `
        SELECT
          reset_otp_id,
          user_id,
          otp_hash,
          expires_at,
          verified_at,
          attempts
        FROM password_reset_otps
        WHERE email = ? AND used_at IS NULL
        ORDER BY reset_otp_id DESC
        LIMIT 1
      `,
      [email],
    );

    if (!rows.length) {
      throw new BadRequestException(
        'Không tìm thấy yêu cầu OTP hợp lệ.',
      );
    }

    const record = rows[0];

    if (new Date(record.expires_at).getTime() < Date.now()) {
      throw new BadRequestException(
        'Mã OTP đã hết hạn. Vui lòng gửi mã mới.',
      );
    }

    if (Number(record.attempts) >= 5) {
      throw new BadRequestException(
        'Bạn đã nhập sai OTP quá nhiều lần. Vui lòng gửi mã mới.',
      );
    }

    const matched = await bcrypt.compare(otp, record.otp_hash);

    if (!matched) {
      await this.dataSource.query(
        `
          UPDATE password_reset_otps
          SET attempts = attempts + 1
          WHERE reset_otp_id = ?
        `,
        [record.reset_otp_id],
      );

      throw new BadRequestException('Mã OTP không chính xác.');
    }

    return record;
  }

  async verifyOtp(email: string, otp: string) {
    const record = await this.getValidOtp(email, otp);

    await this.dataSource.query(
      `
        UPDATE password_reset_otps
        SET verified_at = NOW()
        WHERE reset_otp_id = ?
      `,
      [record.reset_otp_id],
    );

    return {
      success: true,
      message: 'Mã OTP đã được xác thực.',
    };
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ) {
    const record = await this.getValidOtp(email, otp);

    if (!record.verified_at) {
      throw new BadRequestException(
        'Bạn cần xác thực OTP trước khi đổi mật khẩu.',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `
          UPDATE users
          SET password_hash = ?, updated_at = NOW()
          WHERE user_id = ?
        `,
        [passwordHash, record.user_id],
      );

      await manager.query(
        `
          UPDATE password_reset_otps
          SET used_at = NOW()
          WHERE reset_otp_id = ?
        `,
        [record.reset_otp_id],
      );
    });

    return {
      success: true,
      message: 'Mật khẩu đã được cập nhật thành công.',
    };
  }
}

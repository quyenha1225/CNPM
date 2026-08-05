import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AccountAuthGuard } from './account-auth.guard';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [AuthModule],
  controllers: [AccountController],
  providers: [
    AccountService,
    AccountAuthGuard,
  ],
  exports: [AccountService],
})
export class AccountModule {}

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersService } from './services/users.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { UserGuard } from './guards/user.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  providers: [
    UsersService,
    ApiKeyGuard,
    UserGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UserGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [UsersService, ApiKeyGuard, UserGuard, RolesGuard],
})
export class AuthModule {}

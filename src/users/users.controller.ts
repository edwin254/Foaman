import { Controller, Get, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';

@Controller('onboarded')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Lists users who completed USSD onboarding (customer profile and/or worker profile).
   * Auth will be added later — open for local/dev inspection only.
   */
  @Get()
  async listOnboarded(@Query('role') role?: string) {
    const parsedRole = this.parseRole(role);
    return this.usersService.listOnboarded(parsedRole);
  }

  private parseRole(role?: string): Role | undefined {
    if (!role) {
      return undefined;
    }

    const normalized = role.toUpperCase();
    if (Object.values(Role).includes(normalized as Role)) {
      return normalized as Role;
    }

    return undefined;
  }
}

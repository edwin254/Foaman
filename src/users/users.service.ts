import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface OnboardedUserView {
  id: string;
  phone: string;
  fullName: string | null;
  location: string | null;
  role: Role;
  createdAt: Date;
  workerProfile: {
    skill: string;
    idNumber: string;
    isVerified: boolean;
  } | null;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listOnboarded(role?: Role): Promise<{ count: number; users: OnboardedUserView[] }> {
    const where: Prisma.UserWhereInput = {
      OR: [
        { fullName: { not: null } },
        { workerProfile: { isNot: null } },
      ],
    };

    if (role) {
      where.role = role;
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        workerProfile: {
          select: {
            skill: true,
            idNumber: true,
            isVerified: true,
          },
        },
      },
    });

    return {
      count: users.length,
      users: users.map((user) => ({
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        location: user.location,
        role: user.role,
        createdAt: user.createdAt,
        workerProfile: user.workerProfile,
      })),
    };
  }
}

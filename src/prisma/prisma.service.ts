import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString =
      `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT ?? '5432'}/${process.env.DB_DATABASE}`;
    const configuredUrl = process.env.DATABASE_URL;

    super({
      adapter: new PrismaPg({
        connectionString: configuredUrl?.startsWith('postgres')
          ? configuredUrl
          : connectionString,
      }),
    });
  }

  // Logic to connect when the NestJS app starts
  async onModuleInit() {
    await this.$connect();
  }

  // Logic to disconnect when the NestJS app shuts down
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from "../../generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Logic to connect when the NestJS app starts
  async onModuleInit() {
    await this.$connect();
  }

  // Logic to disconnect when the NestJS app shuts down
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
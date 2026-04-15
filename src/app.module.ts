import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { PrismaModule } from './prisma/prisma.module';
import { UssdModule } from './ussd/ussd.module';
import { WorkerModule } from './worker/worker.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    PrismaModule,
    WorkerModule,
    UssdModule,
  ],
})
export class AppModule {}
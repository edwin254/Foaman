import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Worker } from '../worker/entities/worker.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Worker],
  synchronize: true, // set false in production
  logging: true,
  extra: {
    ssl: false,
  },
};

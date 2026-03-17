import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Worker } from '../workers/entities/worker.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
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

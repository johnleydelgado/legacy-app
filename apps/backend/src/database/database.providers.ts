import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      try {
        const dataSource = new DataSource({
          type: 'mysql',
          host: process.env.MYSQL_HOST,
          port: parseInt(process.env.MYSQL_PORT || "0"),
          username: process.env.MYSQL_USERNAME,
          password: process.env.MYSQL_PASSWORD,
          connectTimeout: 60 * 60 * 1000,
          database: process.env.MYSQL_DATABASE,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: false,
        });

        await dataSource.initialize();

        console.log("Database connected successfully");

        return dataSource

      } catch (error) {
        console.log('Error connecting to database');
        throw error;
      }
    },
  },
];

import 'dotenv/config';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/dist/**/*.entity{.js,.ts}'],
  migrations: [__dirname + '/dist/src/migrations/**/*{.js,.ts}'],
  synchronize: false,
  logging: true,
  migrationsRun: false, // не запускать миграции автоматически
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
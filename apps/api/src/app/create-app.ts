import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import type { Express } from 'express';
import type { RuntimeEnv } from '@tula/contracts';
import { parseAppEnv } from '../platform/config/runtime.js';
import { attachPlatformHttp } from '../platform/mock/server.js';

@Module({})
class AppModule {}

export const createApiApp = async (env: RuntimeEnv = parseAppEnv()): Promise<INestApplication> => {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  app.enableCors({
    origin: [env.PUBLIC_WEB_ORIGIN, env.ADMIN_WEB_ORIGIN, 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
    credentials: true,
  });
  attachPlatformHttp(app.getHttpAdapter().getInstance() as Express, env);
  return app;
};

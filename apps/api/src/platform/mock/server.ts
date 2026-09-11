import type { Express } from 'express';
import express from 'express';
import type { RuntimeEnv } from '@tula/contracts';
import { createCatalogHandler, createHealthHandlers } from './http.js';

export const attachPlatformHttp = (app: Express, env: RuntimeEnv): Express => {
  const health = createHealthHandlers(env);
  app.get('/health/live', health.live);
  app.get('/health/ready', (req, res) => {
    void health.ready(req, res);
  });
  app.use(createCatalogHandler(env));
  return app;
};

export const createExpressApi = (env: RuntimeEnv): Express => {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  return attachPlatformHttp(app, env);
};

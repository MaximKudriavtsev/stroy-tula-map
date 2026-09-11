import type { NextFunction, Request, Response } from 'express';
import { matchEndpoint, type RuntimeEnv } from '@tula/contracts';
import { checkReadiness, featureNotAvailable, newRequestId, toApiError } from '../config/runtime.js';
import { dispatchMock } from './dispatch.js';

export const createCatalogHandler = (env: RuntimeEnv) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.path === '/health/live' || req.path === '/health/ready') {
      next();
      return;
    }
    const requestId = String(req.headers['x-request-id'] ?? newRequestId());
    res.setHeader('x-request-id', requestId);
    const matched = matchEndpoint(req.method, req.path);
    if (!matched) {
      res.status(404).json(
        toApiError( { code: 'NOT_FOUND', message: 'Маршрут не найден в contracts v1' }, requestId).body,
      );
      return;
    }
    try {
      if (matched.endpoint.params) {
        matched.endpoint.params.parse(matched.params);
      }
      const payload = await dispatchMock({
        endpoint: matched.endpoint,
        params: matched.params,
        query: req.query as Record<string, unknown>,
        body: req.body,
        requestId,
        env,
      });
      if (matched.endpoint.response) {
        matched.endpoint.response.parse(payload);
      }
      res.status(200).json(payload);
    } catch (error) {
      const mapped = toApiError(error, requestId);
      if (mapped.body.code === 'FEATURE_NOT_AVAILABLE' && env.NODE_ENV === 'production') {
        res.status(404).json(
          toApiError({ code: 'NOT_FOUND', message: 'Маршрут недоступен' }, requestId).body,
        );
        return;
      }
      res.status(mapped.status).json(mapped.body);
    }
  };
};

export const createHealthHandlers = (env: RuntimeEnv) => ({
  live: (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  },
  ready: async (_req: Request, res: Response) => {
    const body = await checkReadiness(env);
    res.status(body.status === 'ok' ? 200 : 503).json(body);
  },
});

export { featureNotAvailable };

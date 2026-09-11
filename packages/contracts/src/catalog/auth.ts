import { z } from 'zod';
import { LoginRequestSchema, LogoutResponseSchema, SessionResponseSchema } from '../extras/schemas.js';
import type { CatalogEndpoint } from './types.js';

export const authEndpoints: CatalogEndpoint[] = [
  {
    operationId: 'login',
    method: 'POST',
    path: '/api/v1/auth/login',
    summary: 'Вход сотрудника',
    tags: ['Auth'],
    auth: 'public',
    permission: null,
    availability: 'not-implemented',
    feature: 'F01',
    body: LoginRequestSchema,
    response: SessionResponseSchema,
    errorCodes: ['SCHEMA_ERROR', 'UNAUTHORIZED', 'RATE_LIMITED', 'FEATURE_NOT_AVAILABLE'],
  },
  {
    operationId: 'logout',
    method: 'POST',
    path: '/api/v1/auth/logout',
    summary: 'Выход и инвалидация сессии',
    tags: ['Auth'],
    auth: 'cookie',
    permission: null,
    availability: 'not-implemented',
    feature: 'F01',
    response: LogoutResponseSchema,
    errorCodes: ['UNAUTHORIZED', 'FEATURE_NOT_AVAILABLE'],
  },
  {
    operationId: 'me',
    method: 'GET',
    path: '/api/v1/auth/me',
    summary: 'Текущий сотрудник',
    tags: ['Auth'],
    auth: 'cookie',
    permission: null,
    availability: 'foundation-mock',
    feature: 'F01',
    response: SessionResponseSchema,
    errorCodes: ['UNAUTHORIZED'],
  },
];

export const IdParamsSchema = z.object({ id: z.string().uuid() });
export const ObjectIdParamsSchema = z.object({ id: z.string().uuid() });
export const ObjectEventParamsSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
});
export const ObjectMetricParamsSchema = z.object({
  id: z.string().uuid(),
  metricId: z.string().uuid(),
});
export const AppealIdParamsSchema = z.object({ id: z.string().uuid() });
export const TaskIdParamsSchema = z.object({ id: z.string().uuid() });
export const NotificationIdParamsSchema = z.object({ id: z.string().uuid() });
export const SessionIdParamsSchema = z.object({ id: z.string().uuid() });
export const MunicipalityIdParamsSchema = z.object({ id: z.string().uuid() });

export const IfMatchHeadersSchema = z.object({
  'if-match': z.string().min(1),
});

export const OptionalIfMatchHeadersSchema = z.object({
  'if-match': z.string().min(1).optional(),
});

export const IdempotencyHeadersSchema = z.object({
  'idempotency-key': z.string().min(8),
});

export const CsrfHeadersSchema = z.object({
  'x-csrf-token': z.string().min(1),
});

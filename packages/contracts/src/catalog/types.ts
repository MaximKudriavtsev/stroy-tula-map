import type { z } from 'zod';
import type { PermissionAction } from '../common/permissions.js';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
export type AuthKind = 'public' | 'cookie' | 'max-secret' | 'internal';
export type EndpointAvailability = 'foundation-mock' | 'not-implemented' | 'dev-only';

export type CatalogEndpoint = {
  operationId: string;
  method: HttpMethod;
  path: string;
  summary: string;
  tags: string[];
  auth: AuthKind;
  permission: PermissionAction | null;
  availability: EndpointAvailability;
  feature: string;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
  headers?: z.ZodTypeAny;
  body?: z.ZodTypeAny;
  response: z.ZodTypeAny;
  errorCodes: string[];
};

export const IfMatchHeaderSchema = {
  description: 'If-Match с версией редакции; устаревшая версия → 409 VERSION_CONFLICT',
};

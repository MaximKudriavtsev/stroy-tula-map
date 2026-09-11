import { randomUUID } from 'node:crypto';
import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import {
  assertProductionSafe,
  createApiError,
  parseRuntimeEnv,
  zodIssuesToFieldErrors,
  type ApiError,
  type HealthReadyResponse,
  type RuntimeEnv,
} from '@tula/contracts';
import { createDbClient } from '@tula/db';
import { Redis } from 'ioredis';
import { ZodError } from 'zod';

export const newRequestId = (): string => randomUUID();

export const parseAppEnv = (): RuntimeEnv => {
  const parsed = parseRuntimeEnv(process.env);
  assertProductionSafe(parsed);
  return parsed;
};

export const toApiError = (error: unknown, requestId: string): { status: number; body: ApiError } => {
  if (error instanceof ZodError) {
    return {
      status: 400,
      body: createApiError({
        code: 'SCHEMA_ERROR',
        message: 'Запрос не проходит runtime-схему',
        requestId,
        fieldErrors: zodIssuesToFieldErrors(error.issues),
      }),
    };
  }
  if (typeof error === 'object' && error && 'code' in error && 'message' in error) {
    const body = createApiError({
      code: String((error as { code: string }).code),
      message: String((error as { message: string }).message),
      requestId,
      fieldErrors: (error as { fieldErrors?: Record<string, string[]> }).fieldErrors,
    });
    const statusByCode: Record<string, number> = {
      SCHEMA_ERROR: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      VERSION_CONFLICT: 409,
      IDEMPOTENCY_CONFLICT: 409,
      FEATURE_NOT_AVAILABLE: 501,
      PRODUCTION_UNSAFE: 500,
    };
    return { status: statusByCode[body.code] ?? 500, body };
  }
  return {
    status: 500,
    body: createApiError({
      code: 'INTEGRATION_FAILURE',
      message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      requestId,
    }),
  };
};

export const featureNotAvailable = (feature: string, requestId: string): ApiError =>
  createApiError({
    code: 'FEATURE_NOT_AVAILABLE',
    message: `Поведение будет реализовано в ${feature}`,
    requestId,
  });

const pingState = async (fn: () => Promise<void>): Promise<'ok' | 'error'> => {
  try {
    await fn();
    return 'ok';
  } catch {
    return 'error';
  }
};

export const checkReadiness = async (env: RuntimeEnv): Promise<HealthReadyResponse> => {
  if (env.API_MODE === 'mock') {
    return {
      status: 'ok',
      apiMode: 'mock',
      checks: { postgres: 'skipped', redis: 'skipped', storage: 'skipped' },
    };
  }
  const postgres = await pingState(async () => {
    const db = createDbClient(env.DATABASE_URL);
    try {
      await db.ping();
    } finally {
      await db.close();
    }
  });
  const redis = await pingState(async () => {
    const client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 1500,
      lazyConnect: true,
    });
    try {
      await client.connect();
      await client.ping();
    } finally {
      client.disconnect();
    }
  });
  const storage = await pingState(async () => {
    const s3 = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: env.S3_FORCE_PATH_STYLE,
      credentials: { accessKeyId: env.S3_ACCESS_KEY, secretAccessKey: env.S3_SECRET_KEY },
    });
    try {
      await s3.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
    } finally {
      s3.destroy();
    }
  });
  const checks = { postgres, redis, storage };
  const failed = Object.values(checks).some((value) => value === 'error');
  return { status: failed ? 'error' : 'ok', apiMode: 'live', checks };
};

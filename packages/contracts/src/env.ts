import { z } from 'zod';
import {
  ApiModeSchema,
  DataModeSchema,
  MessengerAdapterKindSchema,
} from './common/enums.js';

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value !== 'string') {
    return value;
  }
  if (['1', 'true', 'yes', 'on'].includes(value.toLowerCase())) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(value.toLowerCase())) {
    return false;
  }
  return value;
}, z.boolean());

export const RuntimeEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_MODE: ApiModeSchema.default('mock'),
  DATA_MODE: DataModeSchema.default('demo'),
  ALLOW_DEV_ROUTES: booleanFromEnv.default(true),
  ALLOW_SEED_DEMO: booleanFromEnv.default(true),
  MESSENGER_ADAPTER: MessengerAdapterKindSchema.default('simulator'),
  API_PORT: z.coerce.number().int().positive().default(3000),
  PUBLIC_WEB_ORIGIN: z.string().default('http://localhost:5173'),
  ADMIN_WEB_ORIGIN: z.string().default('http://localhost:5174'),
  DATABASE_URL: z.string().min(1).default('postgres://tula:tula@localhost:5432/tula'),
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
  S3_ENDPOINT: z.string().min(1).default('http://localhost:9000'),
  S3_REGION: z.string().min(1).default('us-east-1'),
  S3_BUCKET: z.string().min(1).default('tula'),
  S3_ACCESS_KEY: z.string().min(1).default('tula'),
  S3_SECRET_KEY: z.string().min(1).default('tula-secret'),
  S3_FORCE_PATH_STYLE: booleanFromEnv.default(true),
});
export type RuntimeEnv = z.infer<typeof RuntimeEnvSchema>;

export const parseRuntimeEnv = (input: NodeJS.ProcessEnv | Record<string, string | undefined>): RuntimeEnv =>
  RuntimeEnvSchema.parse(input);

export const collectProductionUnsafeReasons = (env: RuntimeEnv): string[] => {
  if (env.NODE_ENV !== 'production') {
    return [];
  }
  const reasons: string[] = [];
  if (env.API_MODE === 'mock') {
    reasons.push('API_MODE=mock запрещён в production');
  }
  if (env.ALLOW_DEV_ROUTES) {
    reasons.push('ALLOW_DEV_ROUTES запрещён в production');
  }
  if (env.ALLOW_SEED_DEMO) {
    reasons.push('seed:demo / ALLOW_SEED_DEMO запрещены в production');
  }
  if (env.MESSENGER_ADAPTER === 'simulator') {
    reasons.push('симулятор MessengerAdapter запрещён в production');
  }
  return reasons;
};

export const assertProductionSafe = (env: RuntimeEnv): void => {
  const reasons = collectProductionUnsafeReasons(env);
  if (reasons.length > 0) {
    const error = new Error(reasons.join('; '));
    error.name = 'PRODUCTION_UNSAFE';
    throw error;
  }
};

export const assertSeedAllowed = (env: RuntimeEnv): void => {
  if (env.NODE_ENV === 'production' || !env.ALLOW_SEED_DEMO) {
    const error = new Error('seed:demo запрещён в этом окружении');
    error.name = 'PRODUCTION_UNSAFE';
    throw error;
  }
};

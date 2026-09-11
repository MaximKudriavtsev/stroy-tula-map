import { Worker } from 'bullmq';
import type { RuntimeEnv } from '@tula/contracts';

export const createWorkerConnection = (env: RuntimeEnv) => {
  if (env.API_MODE !== 'live') {
    return null;
  }
  return new Worker(
    'platform-heartbeat',
    async () => ({ ok: true }),
    { connection: { url: env.REDIS_URL } },
  );
};

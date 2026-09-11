import { createApiClient } from '@tula/api-client';
import type { DataOrigin } from '@tula/contracts';

export const dataOrigin: DataOrigin = import.meta.env.VITE_DATA_MODE === 'real' ? 'REAL' : 'DEMO';

export const api = createApiClient({ baseUrl: '' });

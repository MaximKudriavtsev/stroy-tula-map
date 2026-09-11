export {
  createGeneratedClient,
  generatedOperationIds,
  GENERATED_CONTRACT_VERSION,
} from './generated/client.js';
export type { GeneratedApiClient } from './generated/client.js';
export { createHttp, getEndpointByOperationId } from './http.js';
export type { CreateApiClientOptions, InvokeArgs } from './http.js';

import { createGeneratedClient } from './generated/client.js';
import type { CreateApiClientOptions } from './http.js';

export const createApiClient = (options: CreateApiClientOptions) => createGeneratedClient(options);

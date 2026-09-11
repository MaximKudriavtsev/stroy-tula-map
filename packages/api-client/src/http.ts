import {
  ApiErrorSchema,
  catalogEndpoints,
  createApiError,
  matchEndpoint,
  type CatalogEndpoint,
} from '@tula/contracts';

export type CreateApiClientOptions = {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
};

export type InvokeArgs = {
  query?: Record<string, unknown>;
  params?: Record<string, string>;
  body?: unknown;
  headers?: Record<string, string>;
};

const fillPath = (path: string, params: Record<string, string> = {}): string =>
  path.replace(/\{([^}]+)\}/g, (_full, name: string) => {
    const value = params[name];
    if (!value) {
      throw new Error(`Нет path-параметра ${name}`);
    }
    return encodeURIComponent(value);
  });

const toSearch = (query: Record<string, unknown> | undefined): string => {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, String(item));
      }
      continue;
    }
    if (key === 'bbox' && Array.isArray(value)) {
      params.set(key, value.join(','));
      continue;
    }
    params.set(key, String(value));
  }
  const encoded = params.toString();
  return encoded ? `?${encoded}` : '';
};

export const createHttp = (options: CreateApiClientOptions) => {
  const fetchImpl = options.fetch ?? globalThis.fetch;
  return async (endpoint: CatalogEndpoint, args: InvokeArgs = {}): Promise<unknown> => {
    const extraHeaders = options.getHeaders ? await options.getHeaders() : {};
    const path = fillPath(endpoint.path, args.params);
    const url = `${options.baseUrl.replace(/\/$/, '')}${path}${toSearch(args.query)}`;
    const response = await fetchImpl(url, {
      method: endpoint.method,
      headers: {
        accept: 'application/json',
        ...(args.body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...extraHeaders,
        ...args.headers,
      },
      body: args.body !== undefined ? JSON.stringify(args.body) : undefined,
    });
    const json: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const parsed = ApiErrorSchema.safeParse(json);
      if (parsed.success) {
        throw parsed.data;
      }
      throw createApiError({
        code: 'INTEGRATION_FAILURE',
        message: `HTTP ${response.status}`,
        requestId: 'client',
      });
    }
    return endpoint.response.parse(json);
  };
};

export const getEndpointByOperationId = (operationId: string): CatalogEndpoint => {
  const endpoint = catalogEndpoints.find((item) => item.operationId === operationId);
  if (!endpoint) {
    throw new Error(`Неизвестная операция ${operationId}`);
  }
  return endpoint;
};

export { matchEndpoint };

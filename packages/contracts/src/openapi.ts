import { z } from 'zod';
import { catalogEndpoints } from './catalog/index.js';
import { ApiErrorSchema } from './common/error.js';
import type { CatalogEndpoint } from './catalog/types.js';

type JsonSchema = Record<string, unknown>;

const toJsonSchema = async (schema: z.ZodTypeAny, name: string): Promise<JsonSchema> => {
  const { zodToJsonSchema } = await import('zod-to-json-schema');
  return zodToJsonSchema(schema, {
    name,
    target: 'openApi3',
    $refStrategy: 'none',
  }) as JsonSchema;
};

const pathToOpenApi = (path: string): string => path;

const securityFor = (endpoint: CatalogEndpoint): Record<string, string[]>[] | undefined => {
  if (endpoint.auth === 'public') {
    return undefined;
  }
  if (endpoint.auth === 'cookie') {
    return [{ cookieAuth: [] }];
  }
  if (endpoint.auth === 'max-secret') {
    return [{ maxSecret: [] }];
  }
  return [{ internalToken: [] }];
};

export const CONTRACT_VERSION = '1.0.0';

export const buildOpenApiDocument = async (): Promise<Record<string, unknown>> => {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const endpoint of catalogEndpoints) {
    const pathKey = pathToOpenApi(endpoint.path);
    const methodKey = endpoint.method.toLowerCase();
    const operation: Record<string, unknown> = {
      operationId: endpoint.operationId,
      summary: endpoint.summary,
      tags: endpoint.tags,
      security: securityFor(endpoint),
      'x-permission': endpoint.permission,
      'x-feature': endpoint.feature,
      'x-availability': endpoint.availability,
      responses: {
        '200': {
          description: 'Успех',
          content: {
            'application/json': {
              schema: await toJsonSchema(endpoint.response, `${endpoint.operationId}Response`),
            },
          },
        },
        default: {
          description: 'Ошибка ApiError',
          content: {
            'application/json': {
              schema: await toJsonSchema(ApiErrorSchema, 'ApiError'),
            },
          },
        },
      },
    };

    if (endpoint.params) {
      const json = await toJsonSchema(endpoint.params, `${endpoint.operationId}Params`);
      const properties = (json.properties ?? {}) as Record<string, JsonSchema>;
      operation.parameters = [
        ...((operation.parameters as unknown[]) ?? []),
        ...Object.entries(properties).map(([name, schema]) => ({
          name,
          in: 'path',
          required: true,
          schema,
        })),
      ];
    }

    if (endpoint.query) {
      const json = await toJsonSchema(endpoint.query, `${endpoint.operationId}Query`);
      const properties = (json.properties ?? {}) as Record<string, JsonSchema>;
      const required = new Set((json.required as string[] | undefined) ?? []);
      operation.parameters = [
        ...((operation.parameters as unknown[]) ?? []),
        ...Object.entries(properties).map(([name, schema]) => ({
          name,
          in: 'query',
          required: required.has(name),
          schema,
        })),
      ];
    }

    if (endpoint.headers) {
      const json = await toJsonSchema(endpoint.headers, `${endpoint.operationId}Headers`);
      const properties = (json.properties ?? {}) as Record<string, JsonSchema>;
      const required = new Set((json.required as string[] | undefined) ?? []);
      operation.parameters = [
        ...((operation.parameters as unknown[]) ?? []),
        ...Object.entries(properties).map(([name, schema]) => ({
          name,
          in: 'header',
          required: required.has(name),
          schema,
        })),
      ];
    }

    if (endpoint.body) {
      operation.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: await toJsonSchema(endpoint.body, `${endpoint.operationId}Body`),
          },
        },
      };
    }

    paths[pathKey] = { ...paths[pathKey], [methodKey]: operation };
  }

  return {
    openapi: '3.0.3',
    info: {
      title: 'Портал строительства Тульской области',
      version: CONTRACT_VERSION,
      description: 'Contracts v1. Источник: packages/contracts. Несовместимые изменения согласуются с интегратором.',
    },
    servers: [{ url: '/', description: 'Относительный origin приложения' }],
    paths,
    components: {
      securitySchemes: {
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'tula_session' },
        maxSecret: { type: 'apiKey', in: 'header', name: 'X-Max-Bot-Secret' },
        internalToken: { type: 'apiKey', in: 'header', name: 'X-Internal-Token' },
      },
    },
    tags: [
      { name: 'Auth' },
      { name: 'Objects' },
      { name: 'Imports' },
      { name: 'Media' },
      { name: 'Timeline' },
      { name: 'Metrics' },
      { name: 'Workflow' },
      { name: 'Bot' },
      { name: 'Analysis' },
      { name: 'Grouping' },
      { name: 'Extras' },
      { name: 'POS' },
      { name: 'Confirmation' },
      { name: 'Operations' },
    ],
  };
};

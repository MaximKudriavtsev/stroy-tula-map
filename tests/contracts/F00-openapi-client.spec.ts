import { describe, expect, it } from 'vitest';
import { buildOpenApiDocument, catalogEndpoints, CONTRACT_VERSION } from '@tula/contracts';
import { GENERATED_CONTRACT_VERSION, createApiClient, generatedOperationIds } from '@tula/api-client';

describe('F00 OpenAPI и generated client', () => {
  it('OpenAPI содержит все endpoints каталога', async () => {
    const doc = await buildOpenApiDocument();
    expect(doc.info && (doc.info as { version: string }).version).toBe(CONTRACT_VERSION);
    const paths = doc.paths as Record<string, Record<string, unknown>>;
    for (const endpoint of catalogEndpoints) {
      const item = paths[endpoint.path];
      expect(item, endpoint.path).toBeTruthy();
      expect(item?.[endpoint.method.toLowerCase()], `${endpoint.method} ${endpoint.path}`).toBeTruthy();
    }
  });

  it('generated client совпадает с версией контракта и покрывает invoke', () => {
    expect(GENERATED_CONTRACT_VERSION).toBe(CONTRACT_VERSION);
    const client = createApiClient({ baseUrl: 'http://127.0.0.1:3000' });
    expect(typeof client.invoke).toBe('function');
    expect(generatedOperationIds.sort()).toEqual(
      catalogEndpoints.map((endpoint) => endpoint.operationId).sort(),
    );
  });

  it('у каждого endpoint заданы request/response и permissions', () => {
    for (const endpoint of catalogEndpoints) {
      expect(endpoint.response).toBeTruthy();
      expect(Array.isArray(endpoint.errorCodes)).toBe(true);
      if (endpoint.path.startsWith('/api/v1/admin')) {
        expect(endpoint.auth === 'cookie' || endpoint.permission !== null).toBe(true);
      }
    }
  });
});

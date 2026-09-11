import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { parseRuntimeEnv } from '@tula/contracts';
import { createDbClient, listMigrationFiles } from '@tula/db';
import { createExpressApi } from '../../apps/api/src/platform/mock/server.js';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

const env = parseRuntimeEnv({
  NODE_ENV: 'test',
  API_MODE: 'mock',
  ALLOW_DEV_ROUTES: 'true',
  ALLOW_SEED_DEMO: 'true',
  MESSENGER_ADAPTER: 'simulator',
});

describe('F00 health and mock API', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const expressApp = createExpressApi(env);
    server = await new Promise<Server>((resolve) => {
      const started = expressApp.listen(0, '127.0.0.1', () => resolve(started));
    });
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it('live всегда ок, ready в mock не требует контейнеры', async () => {
    const live = await fetch(`${baseUrl}/health/live`).then((res) => res.json());
    const readyRes = await fetch(`${baseUrl}/health/ready`);
    const ready = await readyRes.json();
    expect(live).toEqual({ status: 'ok' });
    expect(readyRes.status).toBe(200);
    expect(ready.apiMode).toBe('mock');
    expect(ready.checks.postgres).toBe('skipped');
  });

  it('публичный список без DEMO пуст и не подмешивает fixtures', async () => {
    const page = await fetch(`${baseUrl}/api/v1/public/objects`).then((res) => res.json());
    expect(page.items).toEqual([]);
    expect(page.total).toBe(0);
  });

  it('DEMO round-trip проходит схему и содержит школу без выдачи за реальный адрес', async () => {
    const page = await fetch(`${baseUrl}/api/v1/public/objects?dataOrigin=DEMO`).then((res) => res.json());
    expect(page.total).toBeGreaterThanOrEqual(5);
    expect(page.items.some((item: { name: string }) => item.name === 'Демонстрационная школа А')).toBe(true);
    const school = page.items.find((item: { name: string }) => item.name === 'Демонстрационная школа А') as {
      id: string;
    };
    const detail = await fetch(`${baseUrl}/api/v1/public/objects/${school.id}?dataOrigin=DEMO`).then((res) => res.json());
    expect(detail.dataOrigin).toBe('DEMO');
    expect(String(detail.address ?? '').includes('демонстрационный')).toBe(true);
  });

  it('карта не содержит объект без координат, список содержит', async () => {
    const list = await fetch(`${baseUrl}/api/v1/public/objects?dataOrigin=DEMO`).then((res) => res.json());
    const map = await fetch(`${baseUrl}/api/v1/public/map?dataOrigin=DEMO`).then((res) => res.json());
    const withoutPoint = list.items.filter((item: { anchor: unknown }) => item.anchor === null);
    expect(withoutPoint.length).toBeGreaterThan(0);
    expect(map.features.every((feature: { geometry: { type: string } }) => feature.geometry.type === 'Point')).toBe(true);
    expect(map.total).toBe(list.total);
    expect(map.featuredCount).toBe(list.total - withoutPoint.length);
  });

  it('at возвращает FEATURE_NOT_AVAILABLE, а не тихий ignore', async () => {
    const res = await fetch(`${baseUrl}/api/v1/public/objects?dataOrigin=DEMO&at=2020-01-01`);
    const body = await res.json();
    expect(res.status).toBe(501);
    expect(body.code).toBe('FEATURE_NOT_AVAILABLE');
  });

  it('невалидный UUID даёт SCHEMA_ERROR', async () => {
    const res = await fetch(`${baseUrl}/api/v1/public/objects/not-a-uuid?dataOrigin=DEMO`);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.code).toBe('SCHEMA_ERROR');
  });

  it('generated client проходит round-trip тех же схем, что mock', async () => {
    const { createApiClient } = await import('@tula/api-client');
    const client = createApiClient({ baseUrl });
    const page = await client.listPublicObjects({ dataOrigin: 'DEMO' });
    expect(page.items.some((item) => item.name === 'Демонстрационная школа А')).toBe(true);
    const empty = await client.listPublicObjects();
    expect(empty.items).toEqual([]);
  });

  it('нереализованный endpoint отвечает 501, два заявителя одной проблемы видны в mock', async () => {
    const unimplemented = await fetch(`${baseUrl}/api/v1/admin/objects`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    expect(unimplemented.status).toBe(501);
    const appeals = await fetch(`${baseUrl}/api/v1/admin/appeals`).then((res) => res.json());
    expect(appeals.items).toHaveLength(2);
    expect(new Set(appeals.items.map((item: { applicantId: string }) => item.applicantId)).size).toBe(2);
    expect(new Set(appeals.items.map((item: { taskId: string }) => item.taskId)).size).toBe(1);
  });
});

describe('F00 db registry', () => {
  it('каталог миграций содержит только F00 и не содержит бизнес-таблиц соседних фич', async () => {
    const files = await listMigrationFiles();
    expect(files.some((file) => file.feature === 'F00')).toBe(true);
    expect(files.every((file) => file.feature === 'F00')).toBe(true);
    expect(files[0]?.sql.includes('schema_migrations')).toBe(true);
    expect(files.some((file) => file.sql.toLowerCase().includes('create table objects'))).toBe(false);
  });

  it('клиент БД экспортирует ping', async () => {
    const client = createDbClient('postgres://tula:tula@127.0.0.1:5432/tula');
    expect(typeof client.ping).toBe('function');
    expect(typeof client.close).toBe('function');
    await client.close();
  });
});

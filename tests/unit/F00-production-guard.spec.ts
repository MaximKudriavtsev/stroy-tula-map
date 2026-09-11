import { describe, expect, it } from 'vitest';
import {
  assertProductionSafe,
  assertSeedAllowed,
  collectProductionUnsafeReasons,
  parseRuntimeEnv,
} from '@tula/contracts';
import { createMessengerSimulator } from '@tula/fixtures';

describe('F00 production guard', () => {
  it('production запрещает mock, simulator и seed:demo', () => {
    const env = parseRuntimeEnv({
      NODE_ENV: 'production',
      API_MODE: 'mock',
      ALLOW_DEV_ROUTES: 'true',
      ALLOW_SEED_DEMO: 'true',
      MESSENGER_ADAPTER: 'simulator',
    });
    const reasons = collectProductionUnsafeReasons(env);
    expect(reasons.join(' ')).toMatch(/mock/);
    expect(reasons.join(' ')).toMatch(/seed:demo|ALLOW_SEED_DEMO/);
    expect(reasons.join(' ')).toMatch(/симулятор/);
    expect(() => assertProductionSafe(env)).toThrow(/mock|симулятор|seed/i);
    expect(() => assertSeedAllowed(env)).toThrow();
  });

  it('безопасный production-конфиг проходит', () => {
    const env = parseRuntimeEnv({
      NODE_ENV: 'production',
      API_MODE: 'live',
      ALLOW_DEV_ROUTES: 'false',
      ALLOW_SEED_DEMO: 'false',
      MESSENGER_ADAPTER: 'max',
    });
    expect(collectProductionUnsafeReasons(env)).toEqual([]);
    expect(() => assertProductionSafe(env)).not.toThrow();
  });

  it('симулятор нормализует webhook по схеме и не ходит во внешний канал', async () => {
    const simulator = createMessengerSimulator();
    const parsed = simulator.normalizeWebhook({
      key: 'k1',
      kind: 'TEXT',
      value: { text: 'демо' },
      receivedAt: '2026-03-01T12:00:00.000Z',
    });
    expect(parsed.kind).toBe('TEXT');
    const sent = await simulator.send({
      id: '00000000-0000-4000-8000-000000000777',
      appealId: '00000000-0000-4000-8000-000000000501',
      kind: 'STATUS',
      recipientApplicantId: '00000000-0000-4000-8000-000000000401',
      text: 'демо',
      assetIds: [],
    });
    expect(sent.outcome).toBe('ACCEPTED');
    expect(sent.providerMessageId?.startsWith('sim-')).toBe(true);
  });
});

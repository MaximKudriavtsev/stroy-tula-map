import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '../..');

describe('F00 feature test runner', () => {
  it('не даёт ложного зелёного на неизвестной фиче', () => {
    const result = spawnSync(
      'pnpm',
      ['exec', 'tsx', 'tools/run-feature-tests.ts', '--suite=unit', '--feature=F99'],
      { cwd: root, encoding: 'utf8' },
    );
    expect(result.status).not.toBe(0);
    expect((result.stderr + result.stdout).includes('Нет сценариев')).toBe(true);
  });
});

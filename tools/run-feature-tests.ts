import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Suite = 'unit' | 'integration' | 'e2e';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const parseArgs = (argv: string[]): { suite: Suite; feature?: string } => {
  let suite: Suite = 'unit';
  let feature: string | undefined;
  for (const arg of argv) {
    if (arg.startsWith('--suite=')) {
      suite = arg.slice('--suite='.length) as Suite;
    } else if (arg.startsWith('--feature=')) {
      feature = arg.slice('--feature='.length);
    }
  }
  if (!['unit', 'integration', 'e2e'].includes(suite)) {
    throw new Error(`Неизвестный suite ${suite}`);
  }
  return { suite, feature };
};

const collectFiles = async (dir: string, acc: string[] = []): Promise<string[]> => {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(full, acc);
    } else if (/\.(ts|tsx|js)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
};

const { suite, feature } = parseArgs(process.argv.slice(2));

const suiteDirs: Record<Suite, string[]> = {
  unit: [path.join(root, 'tests/unit'), path.join(root, 'tests/contracts')],
  integration: [path.join(root, 'tests/integration')],
  e2e: [path.join(root, 'tests/e2e')],
};

const allFiles = (await Promise.all(suiteDirs[suite].map((dir) => collectFiles(dir)))).flat();
const selected = feature
  ? allFiles.filter((file) => path.basename(file).toUpperCase().includes(feature.toUpperCase()))
  : allFiles;

if (feature && selected.length === 0) {
  console.error(`Нет сценариев ${suite} для ${feature}`);
  process.exit(1);
}

if (selected.length === 0) {
  console.error(`Нет сценариев ${suite}`);
  process.exit(1);
}

const relative = selected.map((file) => path.relative(root, file));
console.log(`F00 runner: ${suite}${feature ? ` ${feature}` : ''} → ${relative.length} файл(ов)`);

const command = suite === 'e2e' ? 'playwright' : 'vitest';
const args =
  suite === 'e2e' ? ['test', ...relative] : ['run', ...relative, '--reporter=dot'];

const child = spawn(command === 'playwright' ? 'pnpm' : 'pnpm', ['exec', command, ...args], {
  cwd: root,
  stdio: 'inherit',
});

child.on('exit', (code) => process.exit(code ?? 1));

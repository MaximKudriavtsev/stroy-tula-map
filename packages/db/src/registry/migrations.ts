import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type MigrationFile = {
  id: string;
  feature: string;
  filename: string;
  absolutePath: string;
  sql: string;
  checksum: string;
};

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const migrationsRoot = path.join(packageRoot, 'migrations');

export const listMigrationFiles = async (): Promise<MigrationFile[]> => {
  const features = await readdir(migrationsRoot, { withFileTypes: true });
  const files: MigrationFile[] = [];
  for (const featureDir of features.filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const dir = path.join(migrationsRoot, featureDir.name);
    const sqlFiles = (await readdir(dir)).filter((name) => name.endsWith('.sql')).sort();
    for (const filename of sqlFiles) {
      const absolutePath = path.join(dir, filename);
      const sql = await readFile(absolutePath, 'utf8');
      const id = `${featureDir.name}/${filename}`;
      files.push({
        id,
        feature: featureDir.name,
        filename,
        absolutePath,
        sql,
        checksum: createHash('sha256').update(sql).digest('hex'),
      });
    }
  }
  return files;
};

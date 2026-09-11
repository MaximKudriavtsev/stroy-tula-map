import { parseRuntimeEnv } from '@tula/contracts';
import { createDbClient } from './client/create-db-client.js';
import { listMigrationFiles } from './registry/migrations.js';

export const applyMigrations = async (connectionString: string): Promise<string[]> => {
  const client = createDbClient(connectionString);
  const applied: string[] = [];
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        feature TEXT NOT NULL,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    const existing = await client.query<{ id: string; checksum: string }>(
      'SELECT id, checksum FROM schema_migrations',
    );
    const byId = new Map(existing.rows.map((row) => [row.id, row.checksum]));
    const files = await listMigrationFiles();
    for (const file of files) {
      const previous = byId.get(file.id);
      if (previous && previous !== file.checksum) {
        throw new Error(`Миграция ${file.id} уже применена с другим checksum`);
      }
      if (previous) {
        continue;
      }
      await client.query('BEGIN');
      try {
        await client.query(file.sql);
        await client.query(
          'INSERT INTO schema_migrations (id, feature, checksum) VALUES ($1, $2, $3)',
          [file.id, file.feature, file.checksum],
        );
        await client.query('COMMIT');
        applied.push(file.id);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
    return applied;
  } finally {
    await client.close();
  }
};

const isDirect = import.meta.url === `file://${process.argv[1]}`;
if (isDirect) {
  const env = parseRuntimeEnv(process.env);
  const applied = await applyMigrations(env.DATABASE_URL);
  console.log(applied.length === 0 ? 'Миграции уже применены' : `Применены: ${applied.join(', ')}`);
}

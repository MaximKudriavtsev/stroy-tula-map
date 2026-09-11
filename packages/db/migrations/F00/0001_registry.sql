-- F00: реестр миграций. Бизнес-таблицы соседних фич не создаются.
CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  feature TEXT NOT NULL,
  checksum TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_heartbeat (
  name TEXT PRIMARY KEY,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

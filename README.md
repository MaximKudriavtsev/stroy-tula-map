# Портал строительства Тульской области

Монорепозиторий F00: contracts v1, mock API, public-web и admin-web.

Нужны Node 22 и pnpm 9.15 (`corepack enable && corepack prepare pnpm@9.15.9 --activate`).

## Быстрый старт

```bash
cp .env.example .env
pnpm install --frozen-lockfile
pnpm dev
```

- http://localhost:5173 — публичный портал
- http://localhost:5174 — админка
- http://localhost:3000/health/live — API

С Docker (PostGIS, Redis, MinIO):

```bash
pnpm infra:up
pnpm db:migrate
```

В `API_MODE=mock` UI работает без контейнеров. Демонстрационные объекты запрашиваются с `dataOrigin=DEMO`.

## Команды

```bash
pnpm typecheck
pnpm contracts:check
pnpm test:unit -- --feature=F00
pnpm test:integration -- --feature=F00
pnpm test:e2e -- --feature=F00
pnpm build
```

Документация заданий: `docs/README.md`. Handoff каркаса: `docs/handoffs/F00.md`.

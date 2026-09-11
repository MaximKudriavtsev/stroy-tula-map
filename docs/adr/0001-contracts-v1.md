# ADR 0001. Contracts v1 и владение каркасом

Статус: принято (F00 MVP)  
Дата: 2026-09-11

## Контекст

Портал строительства Тульской области собирается несколькими исполнителями в одном pnpm-workspace. Нужна заморозка DTO, OpenAPI, generated client, fixtures, команд проверки и правил изменения общих файлов.

## Решение

1. Версия контракта: **v1.0.0**. Источник правды — `packages/contracts`. OpenAPI — `packages/contracts/openapi/v1.json`. Клиент — `packages/api-client/src/generated/**`. Несовместимые изменения согласуются с интегратором.
2. Владелец общих файлов после F00 — интегратор: корневые `package.json`, `pnpm-lock.yaml`, `tsconfig.base.json`, lockfile, OpenAPI, генератор клиента, composition roots `apps/*/src/app/**`.
3. Каталог миграций: `packages/db/migrations/Fxx/`. Реестр `schema_migrations` применяет `packages/db`. Исполнитель добавляет SQL только в папку своей фичи. Уже применённые файлы не переписываются. Порядок регистрации модулей API: platform (auth, access, audit, health, mock) → objects → media → workflow → bot → analysis → extras.
4. `API_MODE=mock|live`, `DATA_MODE=real|demo`. Публичные запросы без `dataOrigin` читают REAL. Production (`NODE_ENV=production`) запрещает mock, `ALLOW_DEV_ROUTES`, `seed:demo` и `MESSENGER_ADAPTER=simulator`.
5. Нереализованный endpoint в development: `501 FEATURE_NOT_AVAILABLE`. В production такие маршруты скрываются (`404`). Параметр `at` до F08 не игнорируется.

## Последствия

Следующие фичи компилируются против schemas и fixtures. Локальный агент экспортирует модуль и описывает подключение в `docs/handoffs/Fxx.md`, не меняя корневые конфиги самостоятельно.

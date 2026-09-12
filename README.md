# stroy-tula

Монорепозиторий проекта карты строящихся объектов Тульской области.

```
services/
├── frontend/   Next.js 16 (App Router, Tailwind, Яндекс Карты 3.0)
└── backend/    NestJS 11 + TypeORM + PostgreSQL/PostGIS
```

Каждый сервис ставит зависимости независимо: свои `package.json` и `package-lock.json`.
Корневой `package.json` не содержит зависимостей — только скрипты-обёртки над сервисами.

## Установка

```bash
npm run install:all
```

## Локальная разработка без docker

```bash
npm run dev:frontend   # http://localhost:3000
npm run dev:backend    # http://localhost:4000
```

Перед первым запуском скопируйте примеры переменных окружения:

- `services/frontend/.env.example` → `services/frontend/.env.local`
- `services/backend/.env.example` → `services/backend/.env`

## Запуск в docker

```bash
cp .env.example .env   # заполните DB_* и NEXT_PUBLIC_YANDEX_MAPS_API_KEY
npm run docker:dev     # frontend :3000, backend :4000, postgres :5432
npm run docker:prod
npm run docker:down
```

Внутри сети compose бэкенд доступен как `http://server:3000`, на хост он публикуется
как `4000`, чтобы не конфликтовать с dev-сервером Next.js на `3000`.

## Основные скрипты

| Скрипт | Действие |
| --- | --- |
| `install:all` | Установка зависимостей обоих сервисов |
| `dev:frontend` / `dev:backend` | Dev-режим сервиса |
| `build:frontend` / `build:backend` | Production-сборка |
| `start:frontend` / `start:backend` | Запуск собранного сервиса |
| `lint:frontend` / `lint:backend` | Линтинг |
| `test:backend` / `test:backend:e2e` | Тесты бэкенда |
| `migration:generate` / `migration:run` / `migration:revert` / `migration:show` | Миграции TypeORM |
| `import:places` | Импорт `services/backend/places.csv` через API (`API_URL`, по умолчанию `http://localhost:4000`) |
| `fetch:pois` | Обновление данных OSM для карты |
| `fetch:population` | Обновление сетки населения для режима «Обеспеченность» |
| `docker:dev` / `docker:prod` / `docker:down` | Работа с compose |

Документация по каждой части — в `services/frontend/README.md` и `services/backend/README.md`.

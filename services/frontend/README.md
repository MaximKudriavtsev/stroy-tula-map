# Карта строительства Тульской области

Каркас публичной карты. Базы данных пока нет: объекты берутся из локальной заглушки.

## Запуск

1. Скопируйте `.env.example` в `.env.local` и укажите ключ Яндекс Карт.
2. В кабинете API для ключа добавьте HTTP Referer: `http://localhost:3000/*`
3. Запустите проект:

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Что уже есть

- Next.js (App Router) + TypeScript + Tailwind
- Полноэкранные Яндекс Карты (JS API v3), центр — Тульская область
- Строительные объекты из `src/data/objects.ts` / `places.csv`
- Режим **Доступность**: тепловая карта покрытия по POI OpenStreetMap (`src/data/osm-pois.json`)

## Обновление POI для теплокарты

```bash
npm run fetch:pois
```

Скрипт запрашивает Overpass API по Тульской области и перезаписывает `src/data/osm-pois.json` (ODbL / © OpenStreetMap contributors).

## Структура

```
src/app/          страницы Next.js
src/components/   карта и UI
src/data/         локальные данные (стройки, OSM POI, граница области)
scripts/          выгрузка OSM
docs.md           описание продукта
```

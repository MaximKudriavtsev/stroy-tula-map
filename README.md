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
- Полноэкранные Яндекс Карты (JS API 2.1), центр — Тульская область
- 5 вымышленных объектов в `src/data/objects.ts`

## Структура

```
src/app/          страницы Next.js
src/components/   карта
src/data/         локальные данные-заглушки
docs.md           описание продукта
```

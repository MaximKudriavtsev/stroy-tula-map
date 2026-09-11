import { expect, test } from '@playwright/test';

test('публичный портал показывает демо-школу и слот карты', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173/');
  await expect(page.getByText('Портал строительства')).toBeVisible();
  await expect(page.getByText('Показаны демонстрационные данные')).toBeVisible();
  await expect(page.getByText('Демонстрационная школа А')).toBeVisible();
  await expect(page.getByText('без точки на карте')).toBeVisible();
  await expect(page.getByLabel('Слот карты')).toBeVisible();
});

test('админка показывает таблицу объектов', async ({ page }) => {
  await page.goto('http://127.0.0.1:5174/');
  await expect(page.getByText('Редактор объектов')).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByText('Демонстрационная школа А')).toBeVisible();
  await page.getByRole('link', { name: 'Форма' }).click();
  await expect(page.getByLabel('Название')).toBeVisible();
  await page.getByRole('button', { name: 'Проверить форму' }).click();
  await expect(page.getByText(/остаётся локальным/)).toBeVisible();
});

test('состояния загрузки, ошибки и пусто доступны', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173/states');
  await expect(page.getByText('Загрузка…')).toBeVisible();
  await expect(page.getByText('Не удалось загрузить данные')).toBeVisible();
  await expect(page.getByText('Ничего не найдено')).toBeVisible();
});

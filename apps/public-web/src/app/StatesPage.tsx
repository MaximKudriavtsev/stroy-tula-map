import { Link } from 'react-router-dom';
import { AppShell, EmptyState, ErrorState, LoadingState } from '@tula/ui';

export const StatesPage = () => (
  <AppShell eyebrow="UI kit" title="Состояния загрузки" nav={<Link to="/">На портал</Link>}>
    <div style={{ display: 'grid', gap: 16, maxWidth: 560 }}>
      <LoadingState />
      <ErrorState message="Не удалось загрузить данные" />
      <EmptyState title="Ничего не найдено" hint="Пустая выборка не подменяет демонстрационные объекты в real-режиме." />
    </div>
  </AppShell>
);

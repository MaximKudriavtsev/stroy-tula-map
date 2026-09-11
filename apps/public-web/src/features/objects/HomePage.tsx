import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ObjectSummary } from '@tula/contracts';
import { AppShell, DemoBanner, EmptyState, ErrorState, LoadingState, MapSlot } from '@tula/ui';
import { api, dataOrigin } from '../../app/api.js';

export const HomePage = () => {
  const [items, setItems] = useState<ObjectSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    setItems(null);
    void api
      .listPublicObjects({ dataOrigin })
      .then((page) => setItems(page.items))
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'Не удалось загрузить объекты');
      });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell
      eyebrow="Тульская область"
      title="Портал строительства"
      nav={
        <>
          <Link to="/">Объекты</Link>
          <Link to="/states">Состояния UI</Link>
        </>
      }
    >
      <DemoBanner visible={dataOrigin === 'DEMO'} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <section>
          <h2>Реестр</h2>
          {items === null && !error ? <LoadingState /> : null}
          {error ? <ErrorState message={error} onRetry={load} /> : null}
          {items && items.length === 0 ? (
            <EmptyState title="Ничего не найдено" hint="Для реальных данных укажите DATA_MODE=real и наполните реестр в F03." />
          ) : null}
          {items && items.length > 0 ? (
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <Link to={`/objects/${item.id}`}>{item.name}</Link>
                  <div style={{ color: 'var(--color-text-muted)' }}>
                    {item.type} · {item.status}
                    {item.anchor ? '' : ' · без точки на карте'}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
        <MapSlot />
      </div>
    </AppShell>
  );
};

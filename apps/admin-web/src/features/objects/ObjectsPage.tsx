import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ObjectDraft } from '@tula/contracts';
import { AppShell, DataTable, DemoBanner, EmptyState, ErrorState, LoadingState, MapSlot } from '@tula/ui';
import { api, dataOrigin } from '../../app/api.js';

export const ObjectsPage = () => {
  const [rows, setRows] = useState<ObjectDraft[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    setRows(null);
    void api
      .listAdminObjects({ dataOrigin })
      .then((page) => setRows(page.items))
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'Не удалось загрузить реестр');
      });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell
      eyebrow="Служебный контур"
      title="Редактор объектов"
      nav={
        <>
          <Link to="/">Таблица</Link>
          <Link to="/form">Форма</Link>
        </>
      }
    >
      <DemoBanner visible={dataOrigin === 'DEMO'} />
      {rows === null && !error ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {rows && rows.length === 0 ? <EmptyState title="Нет черновиков" /> : null}
      {rows && rows.length > 0 ? (
        <DataTable
          rows={rows}
          getRowId={(row) => row.objectId}
          columns={[
            { key: 'name', header: 'Название', render: (row) => row.fields.name },
            { key: 'type', header: 'Тип', render: (row) => row.fields.type },
            { key: 'status', header: 'Статус', render: (row) => row.fields.status },
            {
              key: 'anchor',
              header: 'Точка',
              render: (row) => (row.fields.anchor ? 'есть' : 'нет'),
            },
          ]}
        />
      ) : null}
      <div style={{ marginTop: 24 }}>
        <MapSlot />
      </div>
    </AppShell>
  );
};

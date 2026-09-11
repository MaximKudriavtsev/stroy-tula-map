import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ObjectDetail } from '@tula/contracts';
import { AppShell, DemoBanner, ErrorState, LoadingState } from '@tula/ui';
import { api, dataOrigin } from '../../app/api.js';

export const ObjectPage = () => {
  const { id } = useParams();
  const [object, setObject] = useState<ObjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    void api
      .getPublicObject(id, { dataOrigin })
      .then(setObject)
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'Карточка недоступна');
      });
  }, [id]);

  return (
    <AppShell
      eyebrow="Карточка объекта"
      title={object?.name ?? 'Объект'}
      nav={<Link to="/">К списку</Link>}
    >
      <DemoBanner visible={dataOrigin === 'DEMO'} />
      {!object && !error ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {object ? (
        <article>
          <p>Тип: {object.type}</p>
          <p>Статус: {object.status}</p>
          <p>Адрес: {object.address ?? 'не указан'}</p>
          <p>Координаты: {object.anchor ? object.anchor.join(', ') : 'нет, объект виден только в списке'}</p>
          <p>Прогресс: {object.progressPercent === null ? 'нет числа' : `${object.progressPercent}%`}</p>
        </article>
      ) : null}
    </AppShell>
  );
};

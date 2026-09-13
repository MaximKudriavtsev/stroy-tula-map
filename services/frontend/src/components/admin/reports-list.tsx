"use client";

import { useEffect, useState } from "react";
import { fetchReports, type ApiReport } from "@/lib/api/reports";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("ru-RU");
}

export function ReportsList() {
  const [items, setItems] = useState<ApiReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const reports = await fetchReports();
        if (!cancelled) {
          setItems(reports);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Не удалось загрузить обращения",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="type-body-md text-on-surface-variant">Загрузка…</p>;
  }

  if (error) {
    return <p className="type-body-md text-error">{error}</p>;
  }

  if (items.length === 0) {
    return (
      <p className="type-body-md text-on-surface-variant">
        Обращения не найдены
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest shadow-panel">
      <table className="w-full min-w-[48rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low">
            <th className="px-md py-sm type-label-md text-on-surface-variant">
              №
            </th>
            <th className="px-md py-sm type-label-md text-on-surface-variant">
              objectId
            </th>
            <th className="px-md py-sm type-label-md text-on-surface-variant">
              userId
            </th>
            <th className="px-md py-sm type-label-md text-on-surface-variant">
              Текст
            </th>
            <th className="px-md py-sm type-label-md text-on-surface-variant">
              Дата
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              className="border-b border-outline-variant last:border-b-0"
              key={item.id}
            >
              <td className="px-md py-md type-body-md tnum text-on-surface">
                {index + 1}
              </td>
              <td className="px-md py-md type-body-md text-on-surface">
                {item.objectId}
              </td>
              <td className="px-md py-md type-body-md text-on-surface">
                {item.userId}
              </td>
              <td className="max-w-xl px-md py-md type-body-md text-on-surface">
                {item.text}
              </td>
              <td className="whitespace-nowrap px-md py-md type-body-md text-on-surface">
                {formatDate(item.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

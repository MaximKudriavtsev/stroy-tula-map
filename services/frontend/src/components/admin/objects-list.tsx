"use client";

import { useEffect, useState } from "react";
import { fetchObjects } from "@/lib/api/objects";
import type { ApiObject } from "@/lib/api/types";
import {
  isObjectCategory,
  objectCategoryLabels,
} from "@/lib/create-object";

function categoryLabel(category: string): string {
  if (isObjectCategory(category)) {
    return objectCategoryLabels[category];
  }
  return category;
}

function displayValue(value?: string | null): string {
  return value?.trim() ? value : "—";
}

type ObjectsListProps = {
  onSelectObject?: (id: string) => void;
};

export function ObjectsList({ onSelectObject }: ObjectsListProps) {
  const [items, setItems] = useState<ApiObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const objects = await fetchObjects();
        if (!cancelled) {
          setItems(objects);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Не удалось загрузить объекты",
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
    return (
      <p className="type-body-md text-on-surface-variant">Загрузка…</p>
    );
  }

  if (error) {
    return <p className="type-body-md text-error">{error}</p>;
  }

  if (items.length === 0) {
    return (
      <p className="type-body-md text-on-surface-variant">
        Объекты не найдены
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
              ГРБС
            </th>
            <th className="px-md py-sm type-label-md text-on-surface-variant">
              Наименование ОКС
            </th>
            <th className="px-md py-sm type-label-md text-on-surface-variant">
              Категория
            </th>
            <th className="px-md py-sm type-label-md text-on-surface-variant">
              Этап строительства
            </th>
            <th className="px-md py-sm type-label-md text-on-surface-variant">
              Адрес
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              className={`border-b border-outline-variant last:border-b-0 ${
                onSelectObject
                  ? "cursor-pointer transition-colors hover:bg-surface-container"
                  : ""
              }`}
              key={item.id}
              onClick={() => onSelectObject?.(item.id)}
            >
              <td className="px-md py-md type-body-md tnum text-on-surface">
                {index + 1}
              </td>
              <td className="px-md py-md type-body-md text-on-surface">
                {item.grbs}
              </td>
              <td className="px-md py-md type-body-md text-on-surface">
                {item.oksName}
              </td>
              <td className="px-md py-md type-body-md text-on-surface">
                {categoryLabel(item.category)}
              </td>
              <td className="px-md py-md type-body-md text-on-surface">
                {displayValue(item.constructionStage)}
              </td>
              <td className="px-md py-md type-body-md text-on-surface">
                {displayValue(item.address)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

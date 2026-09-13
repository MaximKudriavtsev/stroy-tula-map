"use client";

import { useEffect, useState, type ReactNode } from "react";
import { fetchReports, type ApiReport } from "@/lib/api/reports";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("ru-RU");
}

const replyFilters = {
  all: "all",
  replied: "replied",
  unreplied: "unreplied",
} as const;

type ReplyFilter = (typeof replyFilters)[keyof typeof replyFilters];

const replyFilterOrder: ReplyFilter[] = [
  replyFilters.all,
  replyFilters.replied,
  replyFilters.unreplied,
];

const replyFilterLabels: Record<ReplyFilter, string> = {
  all: "Все",
  replied: "С ответом",
  unreplied: "Без ответа",
};

function filterToQuery(filter: ReplyFilter): { isReplied?: boolean } {
  if (filter === replyFilters.replied) {
    return { isReplied: true };
  }
  if (filter === replyFilters.unreplied) {
    return { isReplied: false };
  }
  return {};
}

type ReportsListProps = {
  onSelectReport?: (id: string) => void;
};

export function ReportsList({ onSelectReport }: ReportsListProps) {
  const [items, setItems] = useState<ApiReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyFilter, setReplyFilter] = useState<ReplyFilter>(replyFilters.all);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const reports = await fetchReports(filterToQuery(replyFilter));
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
  }, [replyFilter]);

  let content: ReactNode;

  if (loading) {
    content = <p className="type-body-md text-on-surface-variant">Загрузка…</p>;
  } else if (error) {
    content = <p className="type-body-md text-error">{error}</p>;
  } else if (items.length === 0) {
    content = (
      <p className="type-body-md text-on-surface-variant">
        Обращения не найдены
      </p>
    );
  } else {
    content = (
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
              <th className="px-md py-sm type-label-md text-on-surface-variant">
                <span className="sr-only">Ответ</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                className={`border-b border-outline-variant last:border-b-0 ${
                  onSelectReport
                    ? "cursor-pointer transition-colors hover:bg-surface-container"
                    : ""
                }`}
                key={item.id}
                onClick={() => onSelectReport?.(item.id)}
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
                <td className="px-md py-md text-right type-body-md text-success">
                  {item.isReplied ? (
                    <span aria-label="Есть ответ">✓</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg">
      <div
        aria-label="Фильтр по ответу"
        className="inline-flex w-fit rounded-full border border-outline-variant bg-surface-container-lowest p-0.5 shadow-panel"
        role="tablist"
      >
        {replyFilterOrder.map((filter) => {
          const isSelected = replyFilter === filter;

          return (
            <button
              aria-selected={isSelected}
              className={`rounded-full px-md py-sm type-label-md transition-colors ${
                isSelected
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
              key={filter}
              onClick={() => setReplyFilter(filter)}
              role="tab"
              type="button"
            >
              {replyFilterLabels[filter]}
            </button>
          );
        })}
      </div>
      {content}
    </div>
  );
}

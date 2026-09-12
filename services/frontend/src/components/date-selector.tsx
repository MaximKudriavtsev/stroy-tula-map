"use client";

import { useState } from "react";
import { DEFAULT_MAP_DATE } from "@/data/map-date";

const MONTH_LABELS = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
] as const;

const DEFAULT_YEARS = [2024, 2025];
const DEFAULT_DATE = DEFAULT_MAP_DATE;

type DateSelectorProps = {
  years?: number[];
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
};

export function DateSelector({
  years = DEFAULT_YEARS,
  value,
  defaultValue = DEFAULT_DATE,
  onChange,
}: DateSelectorProps) {
  const [uncontrolledDate, setUncontrolledDate] = useState(() =>
    startOfMonth(defaultValue),
  );
  const date = value ? startOfMonth(value) : uncontrolledDate;
  const selectedYear = date.getFullYear();
  const selectedMonth = date.getMonth();

  const setDate = (nextDate: Date) => {
    const normalized = startOfMonth(nextDate);
    if (value === undefined) {
      setUncontrolledDate(normalized);
    }
    onChange?.(normalized);
  };

  return (
    <div
      aria-label="Выбор даты"
      className="inline-flex max-w-full items-center gap-md overflow-x-auto rounded-full border border-outline-variant bg-surface-container-lowest px-sm py-sm shadow-panel"
    >
      <div
        aria-label="Год"
        className="flex shrink-0 items-center rounded-full bg-surface-container-low p-xs"
        role="group"
      >
        {years.map((year) => {
          const selected = year === selectedYear;

          return (
            <button
              aria-pressed={selected}
              className={
                selected
                  ? "rounded-full bg-primary-container px-md py-xs type-label-md font-semibold text-on-primary transition-colors hover:bg-primary"
                  : "rounded-full px-md py-xs type-label-md font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              }
              key={year}
              onClick={() => setDate(new Date(year, selectedMonth, 1))}
              type="button"
            >
              <span className="tnum">{year}</span>
            </button>
          );
        })}
      </div>

      <span
        aria-hidden="true"
        className="h-md w-px shrink-0 bg-outline-variant"
      />

      <div aria-label="Месяц" className="flex items-center gap-xs" role="group">
        {MONTH_LABELS.map((label, month) => {
          const selected = month === selectedMonth;

          return (
            <button
              aria-label={label}
              aria-pressed={selected}
              className={
                selected
                  ? "rounded-full bg-primary-container px-sm py-xs type-label-md font-semibold text-on-primary transition-colors hover:bg-primary"
                  : "rounded-full px-sm py-xs type-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
              }
              key={label}
              onClick={() => setDate(new Date(selectedYear, month, 1))}
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

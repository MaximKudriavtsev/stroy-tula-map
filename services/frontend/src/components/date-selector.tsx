"use client";

import { useState } from "react";
import { DEFAULT_MAP_DATE } from "@/data/map-date";
import {
  isSameMonth,
  startOfMonth,
  yearsInclusive,
} from "@/lib/construction-progress";

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

type DateSelectorProps = {
  minDate: Date;
  maxDate?: Date;
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
};

export function DateSelector({
  minDate,
  maxDate = DEFAULT_MAP_DATE,
  value,
  defaultValue = maxDate,
  onChange,
}: DateSelectorProps) {
  const min = startOfMonth(minDate);
  const max = startOfMonth(maxDate);
  const years = yearsInclusive(min, max);

  const [uncontrolledDate, setUncontrolledDate] = useState(() =>
    clampDate(startOfMonth(defaultValue), min, max),
  );
  const date = value
    ? clampDate(startOfMonth(value), min, max)
    : uncontrolledDate;
  const selectedYear = date.getFullYear();
  const selectedMonth = date.getMonth();
  const isNow = isSameMonth(date, max);

  const setDate = (nextDate: Date) => {
    const normalized = clampDate(startOfMonth(nextDate), min, max);
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
          const candidate = new Date(selectedYear, month, 1);
          const allowed = isMonthInRange(candidate, min, max);
          const selected = month === selectedMonth;

          return (
            <button
              aria-disabled={!allowed}
              aria-label={label}
              aria-pressed={selected}
              className={
                !allowed
                  ? "cursor-not-allowed rounded-full px-sm py-xs type-label-md text-on-surface-variant/35"
                  : selected
                    ? "rounded-full bg-primary-container px-sm py-xs type-label-md font-semibold text-on-primary transition-colors hover:bg-primary"
                    : "rounded-full px-sm py-xs type-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
              }
              disabled={!allowed}
              key={label}
              onClick={() => setDate(candidate)}
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>

      <span
        aria-hidden="true"
        className="h-md w-px shrink-0 bg-outline-variant"
      />

      <button
        aria-pressed={isNow}
        className={
          isNow
            ? "shrink-0 rounded-full bg-primary-container px-md py-xs type-label-md font-semibold text-on-primary transition-colors hover:bg-primary"
            : "shrink-0 rounded-full px-md py-xs type-label-md font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
        }
        onClick={() => setDate(max)}
        type="button"
      >
        Сейчас
      </button>
    </div>
  );
}

function isMonthInRange(date: Date, min: Date, max: Date) {
  const time = startOfMonth(date).getTime();
  return time >= min.getTime() && time <= max.getTime();
}

function clampDate(date: Date, min: Date, max: Date) {
  const time = date.getTime();
  if (time < min.getTime()) {
    return min;
  }
  if (time > max.getTime()) {
    return max;
  }
  return date;
}

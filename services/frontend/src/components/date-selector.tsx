"use client";

import { useCallback, useRef, useState } from "react";
import { DEFAULT_MAP_DATE } from "@/data/map-date";
import { useDismissable } from "@/lib/use-dismissable";
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
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const [uncontrolledDate, setUncontrolledDate] = useState(() =>
    clampDate(startOfMonth(defaultValue), min, max),
  );
  const date = value
    ? clampDate(startOfMonth(value), min, max)
    : uncontrolledDate;
  const selectedYear = date.getFullYear();
  const selectedMonth = date.getMonth();
  const isNow = isSameMonth(date, max);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  useDismissable(panelOpen, closePanel, panelRef);

  const setDate = (nextDate: Date) => {
    const normalized = clampDate(startOfMonth(nextDate), min, max);
    if (value === undefined) {
      setUncontrolledDate(normalized);
    }
    onChange?.(normalized);
  };

  const renderYearButtons = () =>
    years.map((year) => {
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
    });

  const renderMonthButtons = (closeOnSelect = false) =>
    MONTH_LABELS.map((label, month) => {
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
          onClick={() => {
            setDate(candidate);
            if (closeOnSelect) {
              setPanelOpen(false);
            }
          }}
          type="button"
        >
          {label}
        </button>
      );
    });

  const renderNowButton = (closeOnSelect = false) => (
    <button
      aria-pressed={isNow}
      className={
        isNow
          ? "shrink-0 rounded-full bg-primary-container px-md py-xs type-label-md font-semibold text-on-primary transition-colors hover:bg-primary"
          : "shrink-0 rounded-full px-md py-xs type-label-md font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
      }
      onClick={() => {
        setDate(max);
        if (closeOnSelect) {
          setPanelOpen(false);
        }
      }}
      type="button"
    >
      Сейчас
    </button>
  );

  return (
    <div className="w-full min-w-0 md:contents">
      <div className="relative w-full min-w-0 md:hidden" ref={panelRef}>
        {panelOpen ? (
          <div className="absolute inset-x-0 bottom-full z-30 mb-sm rounded-2xl border border-outline-variant bg-surface-container-lowest p-sm shadow-overlay">
            <div
              aria-label="Год"
              className="mb-sm flex flex-wrap items-center justify-center gap-xs"
              role="group"
            >
              {renderYearButtons()}
            </div>
            <div
              aria-label="Месяц"
              className="grid grid-cols-4 gap-xs"
              role="group"
            >
              {renderMonthButtons(true)}
            </div>
          </div>
        ) : null}

        <div
          aria-label="Выбор даты"
          className="flex w-full min-w-0 items-center gap-sm rounded-full border border-outline-variant bg-surface-container-lowest px-sm py-sm shadow-panel"
        >
          <button
            aria-expanded={panelOpen}
            aria-haspopup="dialog"
            className="flex min-w-0 flex-1 items-center justify-center gap-xs rounded-full bg-surface-container-low px-md py-xs type-label-md font-semibold text-on-surface"
            onClick={() => setPanelOpen((open) => !open)}
            type="button"
          >
            <span className="truncate">
              {MONTH_LABELS[selectedMonth]}{" "}
              <span className="tnum">{selectedYear}</span>
            </span>
            <ChevronIcon
              className={`size-md shrink-0 text-on-surface-variant transition-transform ${
                panelOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {renderNowButton(true)}
        </div>
      </div>

      <div
        aria-label="Выбор даты"
        className="hidden max-w-full items-center gap-md overflow-x-auto rounded-full border border-outline-variant bg-surface-container-lowest px-sm py-sm shadow-panel md:inline-flex"
      >
        <div
          aria-label="Год"
          className="flex shrink-0 items-center rounded-full bg-surface-container-low p-xs"
          role="group"
        >
          {renderYearButtons()}
        </div>

        <span
          aria-hidden="true"
          className="h-md w-px shrink-0 bg-outline-variant"
        />

        <div aria-label="Месяц" className="flex items-center gap-xs" role="group">
          {renderMonthButtons()}
        </div>

        <span
          aria-hidden="true"
          className="h-md w-px shrink-0 bg-outline-variant"
        />

        {renderNowButton()}
      </div>
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

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M5 7.5 10 12.5 15 7.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

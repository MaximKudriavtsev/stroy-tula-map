"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { objectCardPhotoSrc } from "@/components/object-card-photo";
import type { ConstructionObject } from "@/data/objects";
import {
  constructionTimelineForObject,
  stageForProgress,
  type ConstructionTimelinePoint,
} from "@/lib/construction-progress";

const SITE_PHOTOS = [
  "Основное здание",
  "Стройплощадка",
  "Территория",
] as const;

type ConstructionProgressProps = {
  object: ConstructionObject;
};

export function ConstructionProgress({ object }: ConstructionProgressProps) {
  const points = useMemo(
    () => constructionTimelineForObject(object),
    [object],
  );
  const [selectedKey, setSelectedKey] = useState(
    () => points.at(-1)?.key ?? "",
  );

  useEffect(() => {
    setSelectedKey(
      constructionTimelineForObject(object).at(-1)?.key ?? "",
    );
  }, [object]);

  const selected =
    points.find((point) => point.key === selectedKey) ?? points.at(-1);

  if (!selected) {
    return null;
  }

  const stage = stageForProgress(selected.progress);

  return (
    <div className="flex flex-col gap-md">
      <ChronologySection
        onSelect={setSelectedKey}
        points={points}
        selected={selected}
        stageSummary={stage.summary}
      />
      <ReadinessSection
        progress={selected.progress}
        stageTitle={stage.title}
      />
      <SitePhotosSection objectName={object.name} />
    </div>
  );
}

function ChronologySection({
  points,
  selected,
  stageSummary,
  onSelect,
}: {
  points: ConstructionTimelinePoint[];
  selected: ConstructionTimelinePoint;
  stageSummary: string;
  onSelect: (key: string) => void;
}) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = selectedRef.current;
    const scroller = button?.parentElement;

    if (!button || !scroller) {
      return;
    }

    const left =
      button.offsetLeft - scroller.clientWidth / 2 + button.offsetWidth / 2;
    scroller.scrollTo({ left: Math.max(0, left) });
  }, [selected.key]);

  return (
    <section
      aria-label="Хронология стройки"
      className="flex flex-col gap-md rounded-xl border border-outline-variant bg-surface-container-low p-md"
    >
      <div className="flex items-center justify-between gap-sm">
        <div className="flex min-w-0 items-center gap-sm">
          <ClockIcon className="size-md shrink-0 text-primary" />
          <h3 className="type-label-md font-semibold uppercase text-on-surface-variant">
            Хронология стройки
          </h3>
        </div>
        <p className="shrink-0 type-label-md font-semibold text-primary">
          {selected.fullLabel}
        </p>
      </div>

      <div
        aria-label="Месяцы строительства"
        className="flex gap-sm overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="listbox"
      >
        {points.map((point) => {
          const selectedMonth = point.key === selected.key;

          return (
            <button
              aria-selected={selectedMonth}
              className={
                selectedMonth
                  ? "flex min-w-16 shrink-0 cursor-pointer flex-col items-center rounded-xl bg-primary-container px-sm py-sm text-on-primary"
                  : "flex min-w-16 shrink-0 cursor-pointer flex-col items-center rounded-xl px-sm py-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              }
              key={point.key}
              onClick={() => onSelect(point.key)}
              ref={selectedMonth ? selectedRef : undefined}
              role="option"
              type="button"
            >
              <span className="type-label-md font-semibold">
                {point.shortLabel}
              </span>
              <span className="tnum type-body-sm">{point.progress}%</span>
            </button>
          );
        })}
      </div>

      <p className="type-body-sm text-on-surface-variant">
        {selected.fullLabel}: {stageSummary}
      </p>
    </section>
  );
}

function ReadinessSection({
  progress,
  stageTitle,
}: {
  progress: number;
  stageTitle: string;
}) {
  return (
    <section
      aria-label="Готовность на выбранном этапе"
      className="flex flex-col gap-md rounded-xl border border-outline-variant bg-surface-container-low p-md"
    >
      <div className="flex items-center justify-between gap-sm">
        <div className="flex min-w-0 items-center gap-sm">
          <TrendIcon className="size-md shrink-0 text-primary" />
          <h3 className="type-label-md font-semibold uppercase text-on-surface-variant">
            Готовность на выбранном этапе
          </h3>
        </div>
        <p className="tnum shrink-0 type-label-md font-semibold text-primary">
          {progress}%
        </p>
      </div>

      <div
        aria-hidden="true"
        className="h-sm overflow-hidden rounded-full bg-surface-container-highest"
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      <p className="flex items-start gap-sm type-body-sm font-semibold text-success">
        <span
          aria-hidden="true"
          className="mt-1 size-sm shrink-0 rounded-full bg-success"
        />
        <span>{stageTitle}</span>
      </p>
    </section>
  );
}

function SitePhotosSection({ objectName }: { objectName: string }) {
  return (
    <section aria-label="Фотохроника со стройплощадки" className="flex flex-col gap-sm">
      <div className="flex items-center gap-sm">
        <CameraIcon className="size-md shrink-0 text-primary" />
        <h3 className="type-label-md font-semibold uppercase text-on-surface-variant">
          Фотохроника со стройплощадки
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-sm">
        {SITE_PHOTOS.map((label) => (
          <figure
            className="relative overflow-hidden rounded-xl"
            key={label}
          >
            <img
              alt={`${objectName}: ${label}`}
              className="aspect-[4/5] w-full object-cover"
              src={objectCardPhotoSrc}
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-inverse-surface/90 px-sm py-sm type-body-sm text-inverse-on-surface">
              {label}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
    >
      <circle
        cx="10"
        cy="10"
        r="7.25"
        stroke="currentColor"
        strokeDasharray="2.2 2.2"
        strokeWidth="1.5"
      />
      <path
        d="M10 6.5V10l2.4 1.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function TrendIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M3.5 13.5 8 9l3 3 5.5-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M12.5 6h4v4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M3.5 6.5h3l1.2-1.6h4.6L13.5 6.5h3A1.5 1.5 0 0 1 18 8v6.5A1.5 1.5 0 0 1 16.5 16h-13A1.5 1.5 0 0 1 2 14.5V8A1.5 1.5 0 0 1 3.5 6.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="11" r="2.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ConstructionObject } from "@/data/objects";
import {
  constructionStages,
  constructionTimelineForObject,
  resolveTimelineKey,
  stageForProgress,
  type ConstructionStage,
  type ConstructionTimelinePoint,
} from "@/lib/construction-progress";

type ConstructionProgressProps = {
  object: ConstructionObject;
  mapDate?: Date | null;
  syncToMapDate?: boolean;
  onStagePhotoChange?: (photoSrc: string) => void;
  onPhotoViewerChange?: (open: boolean) => void;
};

export function ConstructionProgress({
  object,
  mapDate = null,
  syncToMapDate = false,
  onStagePhotoChange,
  onPhotoViewerChange,
}: ConstructionProgressProps) {
  const points = useMemo(
    () => constructionTimelineForObject(object),
    [object],
  );
  const [selectedKey, setSelectedKey] = useState(() =>
    resolveTimelineKey(points, syncToMapDate ? mapDate : null),
  );

  useEffect(() => {
    setSelectedKey(
      resolveTimelineKey(
        constructionTimelineForObject(object),
        syncToMapDate ? mapDate : null,
      ),
    );
  }, [object, mapDate, syncToMapDate]);

  const selected =
    points.find((point) => point.key === selectedKey) ?? points.at(-1);

  const stage = selected ? stageForProgress(selected.progress) : null;

  useEffect(() => {
    if (!stage || !onStagePhotoChange) {
      return;
    }

    onStagePhotoChange(stage.photoSrc);
  }, [stage, onStagePhotoChange]);

  if (!selected || !stage) {
    return null;
  }

  return (
    <div className="flex flex-col gap-md">
      <ChronologySection
        onSelect={setSelectedKey}
        points={points}
        selected={selected}
      />
      <ReadinessSection
        progress={selected.progress}
        stageTitle={stage.title}
      />
      <SitePhotosSection
        objectName={object.name}
        onPhotoViewerChange={onPhotoViewerChange}
      />
    </div>
  );
}

function ChronologySection({
  points,
  selected,
  onSelect,
}: {
  points: ConstructionTimelinePoint[];
  selected: ConstructionTimelinePoint;
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

function SitePhotosSection({
  objectName,
  onPhotoViewerChange,
}: {
  objectName: string;
  onPhotoViewerChange?: (open: boolean) => void;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    onPhotoViewerChange?.(openIndex != null);
  }, [onPhotoViewerChange, openIndex]);

  useEffect(() => {
    return () => {
      onPhotoViewerChange?.(false);
    };
  }, [onPhotoViewerChange]);

  useEffect(() => {
    setOpenIndex(null);
  }, [objectName]);

  return (
    <section aria-label="Фотохроника со стройплощадки" className="flex flex-col gap-sm">
      <div className="flex items-center gap-sm">
        <CameraIcon className="size-md shrink-0 text-primary" />
        <h3 className="type-label-md font-semibold uppercase text-on-surface-variant">
          Фотохроника со стройплощадки
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-sm sm:grid-cols-3">
        {constructionStages.map((stage, index) => (
          <button
            aria-label={`Открыть фото: ${stage.title}`}
            className="relative cursor-pointer overflow-hidden rounded-xl text-left transition-transform hover:brightness-105 active:scale-[0.99]"
            key={stage.photoSrc}
            onClick={() => setOpenIndex(index)}
            type="button"
          >
            <img
              alt={`${objectName}: ${stage.title}`}
              className="aspect-[4/5] w-full object-cover"
              src={stage.photoSrc}
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-inverse-surface/90 px-sm py-sm type-body-sm text-inverse-on-surface">
              {stage.title}
            </span>
          </button>
        ))}
      </div>

      {openIndex != null ? (
        <SitePhotoLightbox
          index={openIndex}
          objectName={objectName}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
          stages={constructionStages}
        />
      ) : null}
    </section>
  );
}

function SitePhotoLightbox({
  index,
  objectName,
  stages,
  onClose,
  onIndexChange,
}: {
  index: number;
  objectName: string;
  stages: readonly ConstructionStage[];
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const stage = stages[index];
  const canPrev = index > 0;
  const canNext = index < stages.length - 1;

  const showPrev = useCallback(() => {
    onIndexChange(Math.max(0, index - 1));
  }, [index, onIndexChange]);

  const showNext = useCallback(() => {
    onIndexChange(Math.min(stages.length - 1, index + 1));
  }, [index, onIndexChange, stages.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrev();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, showNext, showPrev]);

  if (typeof document === "undefined" || !stage) {
    return null;
  }

  return createPortal(
    <div
      aria-label={`Фото: ${stage.title}`}
      aria-modal="true"
      className="fixed inset-0 z-[200] flex flex-col bg-inverse-surface/95 text-inverse-on-surface"
      role="dialog"
    >
      <div className="flex shrink-0 items-start justify-between gap-md px-md pt-md pb-sm md:px-lg md:pt-lg">
        <div className="min-w-0">
          <p className="type-label-sm text-inverse-on-surface/70">
            Фотохроника · {index + 1} / {stages.length}
          </p>
          <h2 className="mt-xs truncate type-title-sm">{stage.title}</h2>
          <p className="mt-xs truncate type-body-sm text-inverse-on-surface/70">
            {objectName}
          </p>
        </div>
        <button
          aria-label="Закрыть фото"
          className="flex size-xl shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-container-lowest text-on-surface shadow-panel transition-colors hover:bg-surface-container-low"
          onClick={onClose}
          type="button"
        >
          <CloseIcon className="size-md" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <button
          aria-label="Закрыть фото"
          className="absolute inset-0 cursor-zoom-out"
          onClick={onClose}
          type="button"
        />

        <img
          alt={`${objectName}: ${stage.title}`}
          className="pointer-events-none absolute inset-0 m-auto max-h-full max-w-full object-contain px-sm pb-sm md:px-lg md:pb-md"
          src={stage.photoSrc}
        />

        {canPrev ? (
          <button
            aria-label="Предыдущее фото"
            className="absolute top-1/2 left-sm flex size-xl -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-inverse-on-surface/10 text-inverse-on-surface transition-colors hover:bg-inverse-on-surface/20 md:left-md"
            onClick={showPrev}
            type="button"
          >
            <ChevronIcon className="size-md rotate-90" />
          </button>
        ) : null}

        {canNext ? (
          <button
            aria-label="Следующее фото"
            className="absolute top-1/2 right-sm flex size-xl -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-inverse-on-surface/10 text-inverse-on-surface transition-colors hover:bg-inverse-on-surface/20 md:right-md"
            onClick={showNext}
            type="button"
          >
            <ChevronIcon className="size-md -rotate-90" />
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
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

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M6 6l8 8M14 6l-8 8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
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

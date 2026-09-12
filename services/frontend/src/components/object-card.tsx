"use client";

import { useEffect, useState } from "react";
import {
  CategoryIcon,
  iconClassByCategory,
} from "@/components/object-category-icon";
import { ObjectCardFooter } from "@/components/object-card-footer";
import { ObjectCardPhoto } from "@/components/object-card-photo";
import { ObjectCardTabs } from "@/components/object-card-tabs";
import { ObjectCardTab } from "@/data/object-card-tabs";
import type { ConstructionObject } from "@/data/objects";
import {
  isConstructionCompleteAt,
  progressAtDate,
  stageForProgress,
} from "@/lib/construction-progress";
import { inferObjectCategory } from "@/lib/object-chip";

type ObjectCardProps = {
  object: ConstructionObject;
  open: boolean;
  mapDate: Date;
  syncTimelineToMapDate?: boolean;
  onClose: () => void;
  isochroneActive: boolean;
  onShowIsochrone: () => void;
  onHideIsochrone: () => void;
};

function photoForObject(object: ConstructionObject, date: Date) {
  return stageForProgress(progressAtDate(object, date)).photoSrc;
}

export function ObjectCard({
  object,
  open,
  mapDate,
  syncTimelineToMapDate = false,
  onClose,
  isochroneActive,
  onShowIsochrone,
  onHideIsochrone,
}: ObjectCardProps) {
  const initialTab =
    syncTimelineToMapDate && !isConstructionCompleteAt(object, mapDate)
      ? ObjectCardTab.Progress
      : ObjectCardTab.About;
  const [photoSrc, setPhotoSrc] = useState(() =>
    photoForObject(object, mapDate),
  );
  const category = inferObjectCategory(object.name);
  const collapsed = isochroneActive;

  useEffect(() => {
    setPhotoSrc(photoForObject(object, mapDate));
  }, [object, mapDate]);

  const handleShowIsochrone = () => {
    onShowIsochrone();
  };

  const handleExpand = () => {
    onHideIsochrone();
  };

  const handleClose = () => {
    onHideIsochrone();
    onClose();
  };

  return (
    <aside
      aria-hidden={!open}
      aria-label="Карточка объекта"
      className={`pointer-events-auto absolute top-md right-margin z-30 flex w-[min(100%-2rem,26rem)] flex-col overflow-hidden border border-outline-variant bg-surface-container-lowest shadow-overlay transition-[max-height,border-radius,opacity,transform] duration-300 ease-in-out md:right-margin-desktop ${
        collapsed
          ? "bottom-auto max-h-[4.75rem] rounded-[1.75rem]"
          : "bottom-md max-h-[calc(100dvh-2rem)] rounded-[2rem]"
      } ${
        open
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-6 opacity-0"
      }`}
    >
      <div
        aria-hidden={collapsed}
        className={`grid min-h-0 transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          collapsed
            ? "pointer-events-none grid-rows-[0fr] opacity-0"
            : "min-h-0 flex-1 grid-rows-[1fr] opacity-100"
        }`}
      >
        <div className="flex min-h-0 flex-col overflow-hidden">
          <ObjectCardPhoto
            category={category}
            name={object.name}
            onClose={handleClose}
            photoSrc={photoSrc}
          />
          <div className="flex min-h-0 flex-1 flex-col gap-md px-md pt-md pb-md">
            <div className="flex shrink-0 flex-col gap-sm">
              <h2
                className="truncate type-headline-md text-on-surface"
                title={object.name}
              >
                {object.name}
              </h2>
              <p className="flex items-start gap-sm type-body-md text-on-surface-variant">
                <LocationIcon className="mt-px size-md shrink-0 text-primary" />
                <span>{object.address}</span>
              </p>
            </div>
            <ObjectCardTabs
              initialTab={initialTab}
              isochroneActive={isochroneActive}
              mapDate={mapDate}
              object={object}
              onHideIsochrone={onHideIsochrone}
              onShowIsochrone={handleShowIsochrone}
              onStagePhotoChange={setPhotoSrc}
              syncTimelineToMapDate={syncTimelineToMapDate}
            />
          </div>
          <ObjectCardFooter progress={progressAtDate(object, mapDate)} />
        </div>
      </div>

      <div
        aria-hidden={!collapsed}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          collapsed
            ? "grid-rows-[1fr] opacity-100"
            : "pointer-events-none grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex items-center gap-md px-md py-sm">
            <CategoryIcon
              category={category}
              className={`size-[1.125rem] shrink-0 ${iconClassByCategory[category]}`}
            />

            <div className="min-w-0 flex-1">
              <h2
                className="truncate type-title-sm text-on-surface"
                title={object.name}
              >
                {object.name}
              </h2>
              <p className="mt-xs flex items-center gap-xs type-body-sm text-on-surface-variant">
                <LocationIcon className="size-sm shrink-0 text-primary" />
                <span className="truncate">{object.address}</span>
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-sm">
              <button
                aria-label="Развернуть карточку"
                className="flex size-[2rem] shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-container-low text-on-surface transition-colors hover:bg-surface-container"
                onClick={handleExpand}
                tabIndex={collapsed ? 0 : -1}
                type="button"
              >
                <ExpandIcon className="size-md" />
              </button>

              <button
                aria-label="Закрыть карточку"
                className="flex size-[2rem] shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-container-low text-on-surface transition-colors hover:bg-surface-container"
                onClick={handleClose}
                tabIndex={collapsed ? 0 : -1}
                type="button"
              >
                <CloseIcon className="size-md" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M10 17.2s5.2-4.6 5.2-8.2A5.2 5.2 0 0 0 10 3.8 5.2 5.2 0 0 0 4.8 9c0 3.6 5.2 8.2 5.2 8.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="9" r="1.7" fill="currentColor" />
    </svg>
  );
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M11.5 3.5H16.5V8.5M8.5 16.5H3.5V11.5M16.5 3.5 11 9M3.5 16.5 9 11"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
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

"use client";

import { useEffect, useState } from "react";
import { ConstructionParticipants } from "@/components/construction-participants";
import { ConstructionProgress } from "@/components/construction-progress";
import { KeyParameters } from "@/components/key-parameters";
import { ObjectAccessibility } from "@/components/object-accessibility";
import {
  ObjectCardTab,
  objectCardTabLabels,
  objectCardTabOrder,
} from "@/data/object-card-tabs";
import type { ConstructionObject } from "@/data/objects";
import { constructionParticipantsForObject } from "@/lib/construction-participants";
import { keyParametersForObject } from "@/lib/key-parameters";
import { nearestStopForObjectId } from "@/lib/nearest-stop";

type ObjectCardTabsProps = {
  object: ConstructionObject;
  initialTab?: ObjectCardTab;
  mapDate?: Date | null;
  syncTimelineToMapDate?: boolean;
  isochroneActive: boolean;
  onShowIsochrone: () => void;
  onHideIsochrone: () => void;
  onStagePhotoChange?: (photoSrc: string) => void;
  onPhotoViewerChange?: (open: boolean) => void;
};

export function ObjectCardTabs({
  object,
  initialTab = ObjectCardTab.About,
  mapDate = null,
  syncTimelineToMapDate = false,
  isochroneActive,
  onShowIsochrone,
  onHideIsochrone,
  onStagePhotoChange,
  onPhotoViewerChange,
}: ObjectCardTabsProps) {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [object.id, initialTab]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-md">
      <div
        aria-label="Разделы карточки объекта"
        className="flex w-full shrink-0 items-center rounded-full border border-outline-variant bg-surface-container-low p-xs shadow-panel"
        role="tablist"
      >
        {objectCardTabOrder.map((item) => {
          const selected = item === tab;

          return (
            <button
              aria-selected={selected}
              className={
                selected
                  ? "min-w-0 flex-1 cursor-pointer rounded-full bg-primary-container px-sm py-sm type-label-md font-semibold text-on-primary shadow-panel transition-colors hover:bg-primary"
                  : "min-w-0 flex-1 cursor-pointer rounded-full px-sm py-sm type-label-md text-on-surface-variant transition-colors hover:text-on-surface"
              }
              id={`object-card-tab-${item}`}
              key={item}
              onClick={() => setTab(item)}
              role="tab"
              type="button"
            >
              <span className="block truncate">{objectCardTabLabels[item]}</span>
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`object-card-tab-${tab}`}
        className="min-h-0 flex-1 overflow-y-auto pb-md"
        role="tabpanel"
      >
        {tab === ObjectCardTab.About ? (
          <AboutTabView
            isochroneActive={isochroneActive}
            object={object}
            onHideIsochrone={onHideIsochrone}
            onShowIsochrone={onShowIsochrone}
          />
        ) : null}
        {tab === ObjectCardTab.Progress ? (
          <ConstructionProgress
            mapDate={mapDate}
            object={object}
            onPhotoViewerChange={onPhotoViewerChange}
            onStagePhotoChange={onStagePhotoChange}
            syncToMapDate={syncTimelineToMapDate}
          />
        ) : null}
      </div>
    </div>
  );
}

function AboutTabView({
  object,
  isochroneActive,
  onShowIsochrone,
  onHideIsochrone,
}: {
  object: ConstructionObject;
  isochroneActive: boolean;
  onShowIsochrone: () => void;
  onHideIsochrone: () => void;
}) {
  return (
    <div className="flex flex-col gap-md">
      <KeyParameters items={keyParametersForObject(object)} />
      <ConstructionParticipants
        items={constructionParticipantsForObject(object)}
      />
      <ObjectAccessibility
        isochroneActive={isochroneActive}
        onHideIsochrone={onHideIsochrone}
        onShowIsochrone={onShowIsochrone}
        stop={nearestStopForObjectId(object.id)}
      />
    </div>
  );
}

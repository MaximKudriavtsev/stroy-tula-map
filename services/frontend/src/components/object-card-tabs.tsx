"use client";

import { useEffect, useState } from "react";
import { ConstructionParticipants } from "@/components/construction-participants";
import { ConstructionProgress } from "@/components/construction-progress";
import { KeyParameters } from "@/components/key-parameters";
import {
  ObjectCardTab,
  objectCardTabLabels,
  objectCardTabOrder,
} from "@/data/object-card-tabs";
import type { ConstructionObject } from "@/data/objects";
import { constructionParticipantsForObject } from "@/lib/construction-participants";
import { keyParametersForObject } from "@/lib/key-parameters";

type ObjectCardTabsProps = {
  object: ConstructionObject;
  initialTab?: ObjectCardTab;
  mapDate?: Date | null;
  syncTimelineToMapDate?: boolean;
  onStagePhotoChange?: (photoSrc: string) => void;
};

export function ObjectCardTabs({
  object,
  initialTab = ObjectCardTab.About,
  mapDate = null,
  syncTimelineToMapDate = false,
  onStagePhotoChange,
}: ObjectCardTabsProps) {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [object.id, initialTab]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-md">
      <div
        aria-label="Разделы карточки объекта"
        className="flex w-full shrink-0 items-center rounded-full border border-outline-variant bg-surface-container-low p-xs"
        role="tablist"
      >
        {objectCardTabOrder.map((item) => {
          const selected = item === tab;

          return (
            <button
              aria-selected={selected}
              className={
                selected
                  ? "min-w-0 flex-1 cursor-pointer rounded-full bg-primary-container px-sm py-sm type-label-md font-semibold text-on-primary transition-colors hover:bg-primary"
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
          <AboutTabView object={object} />
        ) : null}
        {tab === ObjectCardTab.Progress ? (
          <ConstructionProgress
            mapDate={mapDate}
            object={object}
            onStagePhotoChange={onStagePhotoChange}
            syncToMapDate={syncTimelineToMapDate}
          />
        ) : null}
      </div>
    </div>
  );
}

function AboutTabView({ object }: { object: ConstructionObject }) {
  return (
    <div className="flex flex-col gap-md">
      <KeyParameters items={keyParametersForObject(object)} />
      <ConstructionParticipants
        items={constructionParticipantsForObject(object)}
      />
    </div>
  );
}

"use client";

import { ObjectCardFooter } from "@/components/object-card-footer";
import { ObjectCardPhoto } from "@/components/object-card-photo";
import { ObjectCardTabs } from "@/components/object-card-tabs";
import type { ConstructionObject } from "@/data/objects";
import { inferObjectCategory, progressForObject } from "@/lib/object-chip";

type ObjectCardProps = {
  object: ConstructionObject;
  open: boolean;
  onClose: () => void;
};

export function ObjectCard({ object, open, onClose }: ObjectCardProps) {
  return (
    <aside
      aria-hidden={!open}
      aria-label="Карточка объекта"
      className={`pointer-events-auto absolute inset-y-md right-margin z-30 flex w-[min(100%-2rem,26rem)] flex-col overflow-hidden rounded-[2rem] border border-outline-variant bg-surface-container-lowest shadow-overlay transition-[opacity,transform] duration-300 ease-out md:right-margin-desktop ${
        open
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-6 opacity-0"
      }`}
    >
      <ObjectCardPhoto
        category={inferObjectCategory(object.name)}
        name={object.name}
        onClose={onClose}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-md px-md pt-md">
        <div className="flex shrink-0 flex-col gap-sm">
          <h2 className="type-headline-md text-on-surface">{object.name}</h2>
          <p className="flex items-start gap-sm type-body-md text-on-surface-variant">
            <LocationIcon className="mt-px size-md shrink-0 text-primary" />
            <span>{object.address}</span>
          </p>
        </div>
        <ObjectCardTabs object={object} />
      </div>
      <ObjectCardFooter progress={progressForObject(object)} />
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

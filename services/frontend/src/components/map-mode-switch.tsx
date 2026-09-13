"use client";

import type { ComponentType } from "react";
import { mapModeLabels, type MapMode, mapModes } from "@/data/map-modes";

type MapModeSwitchProps = {
  value: MapMode;
  onChange: (mode: MapMode) => void;
};

const modeOrder: MapMode[] = [
  mapModes.objects,
  mapModes.coverage,
  mapModes.provision,
];

const modeIcon: Record<MapMode, ComponentType<{ className?: string }>> = {
  [mapModes.objects]: ApartmentBuildingIcon,
  [mapModes.coverage]: PersonWalkIcon,
  [mapModes.provision]: ChartIcon,
};

export const MapModeSwitch = ({ value, onChange }: MapModeSwitchProps) => {
  return (
    <div
      aria-label="Режим карты"
      className="inline-flex h-12 shrink-0 items-center gap-xs rounded-full border border-outline-variant bg-surface-container-lowest p-xs shadow-panel md:gap-sm"
      role="group"
    >
      {modeOrder.map((mode, index) => {
        const isSelected = value === mode;
        const Icon = modeIcon[mode];
        const label = mapModeLabels[mode];
        const isLast = index === modeOrder.length - 1;

        return (
          <div className="group relative h-full" key={mode}>
            <button
              aria-label={label}
              aria-pressed={isSelected}
              className={`inline-flex h-full aspect-square cursor-pointer items-center justify-center rounded-full transition-colors ${
                isSelected
                  ? "bg-primary text-on-primary shadow-panel"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
              onClick={() => onChange(mode)}
              type="button"
            >
              <Icon className="size-5" />
            </button>
            <span
              className={`pointer-events-none absolute top-full z-10 mt-sm whitespace-nowrap rounded-full bg-inverse-surface px-md py-sm opacity-0 shadow-overlay type-label-md text-inverse-on-surface transition-[opacity,transform] duration-150 group-hover:opacity-100 ${
                isLast
                  ? "right-0 translate-y-1 group-hover:translate-y-0"
                  : "left-1/2 -translate-x-1/2 translate-y-1 group-hover:-translate-x-1/2 group-hover:translate-y-0"
              }`}
              role="tooltip"
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

function ApartmentBuildingIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M5 21V4.5A1.5 1.5 0 0 1 6.5 3h7A1.5 1.5 0 0 1 15 4.5V21" />
      <path d="M15 9h2.5A1.5 1.5 0 0 1 19 10.5V21" />
      <path d="M5 21h14" />
      <path d="M8 7h2.5" />
      <path d="M8 10.5h2.5" />
      <path d="M8 14h2.5" />
      <path d="M8 17.5h2.5" />
      <path d="M16.5 13h1" />
      <path d="M16.5 16.5h1" />
    </svg>
  );
}

function PersonWalkIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M13.5 5.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9.8 8.9 7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7Z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M4 19h16" />
      <path d="M7 16V11" />
      <path d="M12 16V7" />
      <path d="M17 16v-3" />
    </svg>
  );
}

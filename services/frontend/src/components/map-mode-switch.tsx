"use client";

import { mapModeLabels, type MapMode, mapModes } from "@/data/map-modes";

type MapModeSwitchProps = {
  value: MapMode;
  onChange: (mode: MapMode) => void;
};

const modeOrder: MapMode[] = [mapModes.objects, mapModes.coverage, mapModes.provision];

export const MapModeSwitch = ({ value, onChange }: MapModeSwitchProps) => {
  const handleSelect = (mode: MapMode) => {
    onChange(mode);
  };

  return (
    <div
      aria-label="Режим карты"
      className="inline-flex rounded-full border border-outline-variant bg-surface-container-lowest p-0.5 shadow-panel"
      role="group"
    >
      {modeOrder.map((mode) => {
        const isSelected = value === mode;

        return (
          <button
            aria-pressed={isSelected}
            className={`rounded-full px-md py-sm type-label-md transition-colors ${
              isSelected
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
            key={mode}
            onClick={() => handleSelect(mode)}
            type="button"
          >
            {mapModeLabels[mode]}
          </button>
        );
      })}
    </div>
  );
};

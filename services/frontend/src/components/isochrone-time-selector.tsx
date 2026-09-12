/**
 * Isochrone time selector.
 *
 * Pill-style toggle for choosing between 5, 10, 15 and 30 minutes.
 */

"use client";

import type { IsochroneTime } from "@/lib/use-isochrone";
import { ISOCHRONE_TIMES } from "@/lib/use-isochrone";

type IsochroneTimeSelectorProps = {
  selectedTime: IsochroneTime;
  onTimeChange: (time: IsochroneTime) => void;
};

const TIME_LABELS: Record<IsochroneTime, string> = {
  5: "5 мин",
  10: "10 мин",
  15: "15 мин",
  30: "30 мин",
};

export function IsochroneTimeSelector({ selectedTime, onTimeChange }: IsochroneTimeSelectorProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-outline-variant bg-surface-container-lowest shadow-panel">
      {ISOCHRONE_TIMES.map((time) => (
        <button
          key={time}
          aria-pressed={selectedTime === time}
          className={
            selectedTime === time
              ? "px-md py-sm type-label-md bg-primary-container text-on-primary-container transition-colors hover:bg-primary"
              : "px-md py-sm type-label-md text-on-surface transition-colors hover:bg-on-primary-container"
          }
          onClick={() => onTimeChange(time)}
          type="button"
        >
          {TIME_LABELS[time]}
        </button>
      ))}
    </div>
  );
}

import {
  formatStopDistance,
  formatWalkingTime,
  type NearestStopInfo,
} from "@/lib/nearest-stop";

type ObjectAccessibilityProps = {
  stop: NearestStopInfo | null;
  isochroneActive: boolean;
  onShowIsochrone: () => void;
  onHideIsochrone: () => void;
};

export function ObjectAccessibility({
  stop,
  isochroneActive,
  onShowIsochrone,
  onHideIsochrone,
}: ObjectAccessibilityProps) {
  const stopName = stop?.stopName?.trim();
  const hasDistance = stop?.distanceM != null;

  return (
    <section aria-label="Доступность" className="flex flex-col gap-sm">
      <div className="flex items-center gap-sm">
        <AccessIcon className="size-md shrink-0 text-primary" />
        <h3 className="type-label-md font-semibold uppercase text-on-surface-variant">
          Доступность
        </h3>
      </div>

      <div className="flex flex-col gap-sm">
        <div className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-low px-md py-sm">
          <BusIcon className="size-md shrink-0 text-primary" />

          <div className="min-w-0 flex-1">
            <p className="type-body-sm text-on-surface-variant">
              Ближайшая остановка
            </p>
            <p className="truncate type-body-sm font-semibold text-on-surface">
              {hasDistance
                ? stopName
                  ? `«${stopName}»`
                  : "Без названия"
                : "Нет данных"}
            </p>
          </div>

          {hasDistance ? (
            <div className="shrink-0 text-right">
              <p className="tnum type-body-sm font-semibold text-primary">
                {formatStopDistance(stop.distanceM!)}
              </p>
              <p className="type-body-sm text-on-surface-variant">
                {formatWalkingTime(stop.distanceM!)}
              </p>
            </div>
          ) : null}
        </div>

        <button
          aria-pressed={isochroneActive}
          className={
            isochroneActive
              ? "inline-flex h-xl w-full cursor-pointer items-center justify-center gap-sm rounded-full bg-primary px-md type-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container"
              : "inline-flex h-xl w-full cursor-pointer items-center justify-center gap-sm rounded-full bg-primary-container px-md type-label-md font-semibold text-on-primary transition-colors hover:bg-primary"
          }
          onClick={isochroneActive ? onHideIsochrone : onShowIsochrone}
          type="button"
        >
          <PersonWalkIcon className="size-md shrink-0" />
          Зона пешей доступности
        </button>
      </div>
    </section>
  );
}

function AccessIcon({ className }: { className?: string }) {
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

function BusIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10Zm3.5 1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM18 11H6V6h12v5Z" />
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

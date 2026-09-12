"use client";

import type { IsochroneTime } from "@/lib/use-isochrone";

type ObjectCardProps = {
  name: string;
  open: boolean;
  onClose: () => void;
  isochroneActive: boolean;
  onShowIsochrone: () => void;
  onHideIsochrone: () => void;
};

export function ObjectCard({
  name,
  open,
  onClose,
  isochroneActive,
  onShowIsochrone,
  onHideIsochrone,
}: ObjectCardProps) {
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
      <div className="flex shrink-0 justify-end p-md pb-sm">
        <button
          aria-label="Закрыть карточку"
          className="flex size-xl shrink-0 items-center justify-center rounded-full bg-surface-container-low text-on-surface transition-colors hover:bg-surface-container"
          onClick={onClose}
          type="button"
        >
          <CloseIcon className="size-md" />
        </button>
      </div>
      <div className="px-md pb-md">
        <h2 className="type-headline-md text-on-surface">{name}</h2>
      </div>

      <div className="px-md pb-md">
        <div className="flex flex-col gap-sm">
          <div className="flex items-center justify-between">
            <span className="type-body-sm text-on-surface-variant">
              Пешие маршруты
            </span>
            {isochroneActive && (
              <button
                className="type-body-sm text-on-surface-variant underline"
                onClick={onHideIsochrone}
                type="button"
              >
                Скрыть
              </button>
            )}
          </div>

          {!isochroneActive ? (
            <button
              className="inline-flex items-center justify-center gap-xs rounded-full bg-primary-container px-md py-sm type-label-md text-on-primary-container transition-colors hover:bg-primary"
              onClick={onShowIsochrone}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="size-sm"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  fill="currentColor"
                />
              </svg>
              Показать пешие маршруты
            </button>
          ) : (
            <p className="type-body-sm text-on-surface-variant">
              Выберите время в панели внизу карты
            </p>
          )}
        </div>
      </div>
    </aside>
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

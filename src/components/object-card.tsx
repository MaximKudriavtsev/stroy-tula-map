"use client";

type ObjectCardProps = {
  name: string;
  open: boolean;
  onClose: () => void;
};

export function ObjectCard({ name, open, onClose }: ObjectCardProps) {
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

type MapHintProps = {
  children?: string;
  showHand?: boolean;
};

export function MapHint({
  children = "Выберите объект на карте, чтобы узнать о нем подробнее",
  showHand = false,
}: MapHintProps) {
  return (
    <p
      className="inline-flex max-w-full items-center gap-sm rounded-full border border-outline-variant bg-surface-container-lowest px-md py-sm shadow-panel type-body-md text-on-surface"
      role="status"
    >
      {showHand ? (
        <PointingHandIcon className="size-md shrink-0 text-on-surface-variant" />
      ) : null}
      <span>{children}</span>
    </p>
  );
}

function PointingHandIcon({ className }: { className?: string }) {
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
      <path d="M22 14a8 8 0 0 1-8 8" />
      <path d="M18 11v-1a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
      <path d="M14 10V9a2 2 0 0 0-2-2 2 2 0 0 0-2 2v1" />
      <path d="M10 9.5V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v10" />
      <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  );
}

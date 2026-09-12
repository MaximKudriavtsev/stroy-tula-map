type BrandProps = {
  showTagline?: boolean;
  className?: string;
};

export function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="flex size-xl items-center justify-center rounded-full bg-primary-container text-on-primary"
    >
      <svg
        className="size-lg"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
        viewBox="0 0 24 24"
      >
        <path d="m11 17 2 2a1 1 0 1 0 3-3" />
        <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.36.36a3 3 0 0 1-4.24 0l-2.06-2.06a3 3 0 0 0-4.24 0L2 10" />
        <path d="m18 9 1.45-1.45a3 3 0 0 0 0-4.24L16.3.1a1 1 0 0 0-1.41 0" />
        <path d="m2 15 6 6" />
        <path d="m7 11 2.09-2.09a1 1 0 0 1 1.41 0l2.09 2.09" />
      </svg>
    </span>
  );
}

export function Brand({ showTagline = true, className = "" }: BrandProps) {
  return (
    <div className={`flex shrink-0 items-center gap-sm ${className}`.trim()}>
      <BrandMark />
      <div className="min-w-0">
        <p className="type-title-sm">
          <span className="text-primary">Город.</span>
          <span>В Деле</span>
        </p>
        {showTagline ? (
          <p className="hidden type-body-sm text-on-surface-variant sm:block">
            Строим для жителей
          </p>
        ) : null}
      </div>
    </div>
  );
}

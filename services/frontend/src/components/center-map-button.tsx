type CenterMapButtonProps = {
  onCenter?: () => void;
};

export function CenterMapButton({ onCenter }: CenterMapButtonProps) {
  return (
    <button
      className="flex h-xl shrink-0 items-center gap-xs rounded-full border border-outline-variant bg-on-primary-container px-md type-label-md text-primary transition-colors hover:border-primary hover:bg-primary-fixed"
      onClick={onCenter}
      type="button"
    >
      <NearMeIcon className="size-md" />
      <span className="hidden sm:inline">Рядом со мной</span>
    </button>
  );
}

function NearMeIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M8 14.4s4.6-4.1 4.6-7.2A4.6 4.6 0 0 0 8 2.6a4.6 4.6 0 0 0-4.6 4.6c0 3.1 4.6 7.2 4.6 7.2Z"
        fill="currentColor"
        opacity="0.16"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <circle cx="8" cy="7.1" r="1.45" fill="currentColor" />
    </svg>
  );
}

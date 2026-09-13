import { getMaxBotReportUrl } from "@/lib/max-bot";

type ObjectCardFooterProps = {
  progress: number;
  onPassportClick?: () => void;
};

export function ObjectCardFooter({
  progress,
  onPassportClick,
}: ObjectCardFooterProps) {
  const percent = Math.round(Math.min(100, Math.max(0, progress)));
  const reportUrl = getMaxBotReportUrl();
  const reportClassName =
    "inline-flex h-xl w-full cursor-pointer items-center justify-center gap-sm rounded-full bg-primary-container px-md type-label-md font-semibold text-on-primary transition-colors hover:bg-primary";

  return (
    <div className="mt-auto flex shrink-0 flex-col gap-md border-t border-outline-variant px-md py-md">
      <div className="flex items-center justify-between gap-md">
        <div className="flex min-w-0 items-center gap-sm">
          <ReadinessIcon className="size-md shrink-0 text-primary" />
          <p className="truncate type-body-sm text-on-surface-variant">
            Готовность: <span className="tnum">{percent}%</span>
          </p>
        </div>

        <button
          className="inline-flex shrink-0 cursor-pointer items-center gap-xs type-body-sm font-semibold text-primary transition-colors hover:text-primary-container"
          onClick={onPassportClick}
          type="button"
        >
          Паспорт объекта
          <ArrowIcon className="size-md" />
        </button>
      </div>

      {reportUrl ? (
        <a
          className={reportClassName}
          href={reportUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <ChatIcon className="size-md shrink-0" />
          Сообщить о проблеме
        </a>
      ) : (
        <button className={reportClassName} disabled type="button">
          <ChatIcon className="size-md shrink-0" />
          Сообщить о проблеме
        </button>
      )}
    </div>
  );
}

function ReadinessIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
    >
      <circle
        cx="10"
        cy="10"
        opacity="0.28"
        r="7"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M10 3a7 7 0 0 1 7 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M10 6.2v3.8l2.6 1.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M4.2 3.8h11.6A1.8 1.8 0 0 1 17.6 5.6v6.4a1.8 1.8 0 0 1-1.8 1.8H8.4L4.2 16.8V3.8Z" />
    </svg>
  );
}

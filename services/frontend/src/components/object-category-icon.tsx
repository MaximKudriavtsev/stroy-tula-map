import { ObjectCategory } from "@/data/object-categories";

export const iconClassByCategory: Record<ObjectCategory, string> = {
  [ObjectCategory.All]: "text-on-surface-variant",
  [ObjectCategory.Healthcare]: "text-primary-container",
  [ObjectCategory.Education]: "text-tertiary",
  [ObjectCategory.Sport]: "text-secondary",
  [ObjectCategory.Infrastructure]: "text-primary",
  [ObjectCategory.UtilitiesAndParks]: "text-tertiary-container",
};

export function CategoryIcon({
  category,
  className,
}: {
  category: ObjectCategory;
  className?: string;
}) {
  switch (category) {
    case ObjectCategory.All:
      return <AllIcon className={className} />;
    case ObjectCategory.Healthcare:
      return <HealthcareIcon className={className} />;
    case ObjectCategory.Education:
      return <EducationIcon className={className} />;
    case ObjectCategory.Sport:
      return <SportIcon className={className} />;
    case ObjectCategory.Infrastructure:
      return <InfrastructureIcon className={className} />;
    case ObjectCategory.UtilitiesAndParks:
      return <ParksIcon className={className} />;
  }
}

function AllIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <rect height="3" rx="0.5" width="3" x="2" y="2" />
      <rect height="3" rx="0.5" width="3" x="6.5" y="2" />
      <rect height="3" rx="0.5" width="3" x="11" y="2" />
      <rect height="3" rx="0.5" width="3" x="2" y="6.5" />
      <rect height="3" rx="0.5" width="3" x="6.5" y="6.5" />
      <rect height="3" rx="0.5" width="3" x="11" y="6.5" />
      <rect height="3" rx="0.5" width="3" x="2" y="11" />
      <rect height="3" rx="0.5" width="3" x="6.5" y="11" />
      <rect height="3" rx="0.5" width="3" x="11" y="11" />
    </svg>
  );
}

function HealthcareIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 16 16"
    >
      <rect
        height="12"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.4"
        width="12"
        x="2"
        y="2"
      />
      <path
        d="M8 5v6M5 8h6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function EducationIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M2.5 6.4 8 3.6l5.5 2.8L8 9.2 2.5 6.4Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
      <path
        d="M4.2 7.6v3.2c0 .2 1.6 1.6 3.8 1.6s3.8-1.4 3.8-1.6V7.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
      <path
        d="M13.5 6.6v4.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function SportIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 16 16"
    >
      <circle cx="8" cy="3.4" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3.2 6.2 8 7.4l4.8-1.2M8 7.4v2.2M5 14l3-4.4L11 14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function InfrastructureIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M10.2 2.8a2.4 2.4 0 0 1 3 3L9.4 9.6l-3-3 3.8-3.8Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
      <path
        d="M6.2 6.8 2.6 13.4l6.6-3.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function ParksIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M8 13.4V8.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M8 11.8c-2.4 0-4-1.5-4-3.4C4 6.2 5.6 4 8 2.8 10.4 4 12 6.2 12 8.4c0 1.9-1.6 3.4-4 3.4Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

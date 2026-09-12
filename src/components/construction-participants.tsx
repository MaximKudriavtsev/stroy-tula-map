import type { ConstructionParticipant } from "@/lib/construction-participants";

type ConstructionParticipantsProps = {
  items: ConstructionParticipant[];
};

export function ConstructionParticipants({
  items,
}: ConstructionParticipantsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Участники строительства"
      className="flex flex-col gap-sm"
    >
      <div className="flex items-center gap-sm">
        <BuildingIcon className="size-md shrink-0 text-primary" />
        <h3 className="type-label-md font-semibold uppercase text-on-surface-variant">
          Участники строительства
        </h3>
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
        {items.map((item, index) => (
          <div
            className={`flex items-start justify-between gap-md px-md py-sm ${
              index > 0 ? "border-t border-outline-variant" : ""
            }`}
            key={item.label}
          >
            <p className="shrink-0 type-body-sm text-on-surface-variant">
              {item.label}
            </p>
            <p className="min-w-0 text-right type-body-sm text-on-surface">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M4.5 17V7.5L10 3.5l5.5 4V17"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M7.5 17v-4h5v4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M8 8.5h.01M10 8.5h.01M12 8.5h.01M8 11h.01M10 11h.01M12 11h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

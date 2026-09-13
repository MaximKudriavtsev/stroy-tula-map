import { CategoryIsometricBuilding } from "@/components/isometric-buildings";
import { ObjectBuildStatus } from "@/data/object-build-status";
import { ObjectCategory } from "@/data/object-categories";
import { getProgressTone } from "@/lib/progress-tone";

type ObjectInfoChipProps = {
  category: Exclude<ObjectCategory, ObjectCategory.All>;
  name: string;
  status: ObjectBuildStatus;
  progress: number;
  selected?: boolean;
  className?: string;
};

export function ObjectInfoChip({
  category,
  name,
  progress,
  selected = false,
  className,
}: ObjectInfoChipProps) {
  const percent = Math.round(Math.min(100, Math.max(0, progress)));
  const tone = getProgressTone(percent);

  return (
    <div
      className={`inline-flex cursor-pointer flex-col items-center gap-xs ${className ?? ""}`}
      data-selected={selected ? "true" : "false"}
      role="status"
    >
      <div
        className={`map-marker-model-wrap relative flex h-32 w-40 shrink-0 items-end justify-center ${
          selected ? "is-selected-model" : ""
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-1 left-1/2 h-3 w-24 -translate-x-1/2 rounded-[100%] bg-on-surface/15 blur-[3px] transition-opacity ${
            selected ? "opacity-100" : "opacity-0"
          }`}
        />
        <CategoryIsometricBuilding
          category={category}
          className="relative z-10 block h-32 w-40"
        />
      </div>
      <div className="inline-flex max-w-32 items-center gap-xs rounded-full border border-outline-variant bg-surface-container-lowest py-xs pl-sm pr-xs shadow-panel">
        <p className="min-w-0 truncate type-body-sm text-on-surface">{name}</p>
        <span
          className="tnum shrink-0 rounded-full px-sm py-xs type-body-sm font-semibold"
          style={{ backgroundColor: tone.background, color: tone.color }}
        >
          {percent}%
        </span>
      </div>
    </div>
  );
}

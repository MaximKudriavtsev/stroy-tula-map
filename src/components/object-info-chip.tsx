import { CategoryIsometricBuilding } from "@/components/isometric-buildings";
import {
  ObjectBuildStatus,
  objectBuildStatusLabels,
} from "@/data/object-build-status";
import { ObjectCategory } from "@/data/object-categories";
import { getProgressTone } from "@/lib/progress-tone";

type ObjectInfoChipProps = {
  category: Exclude<ObjectCategory, ObjectCategory.All>;
  name: string;
  status: ObjectBuildStatus;
  progress: number;
  className?: string;
};

export function ObjectInfoChip({
  category,
  name,
  status,
  progress,
  className,
}: ObjectInfoChipProps) {
  const percent = Math.round(Math.min(100, Math.max(0, progress)));
  const tone = getProgressTone(percent);

  return (
    <div
      className={`inline-flex flex-col items-center gap-xs ${className ?? ""}`}
      role="status"
    >
      <div className="flex h-24 w-24 shrink-0 items-end justify-center">
        <CategoryIsometricBuilding
          category={category}
          className="block h-24 w-24"
        />
      </div>
      <div className="inline-flex max-w-56 items-center gap-xs rounded-full border border-outline-variant bg-surface-container-lowest py-xs pl-sm pr-xs shadow-panel">
        <p className="min-w-0 truncate type-body-sm text-on-surface">{name}</p>
        <span
          aria-hidden="true"
          className="size-xs shrink-0 rounded-full"
          style={{ backgroundColor: tone.color }}
        />
        <p className="shrink-0 type-body-sm" style={{ color: tone.color }}>
          {objectBuildStatusLabels[status]}
        </p>
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

import {
  CategoryIcon,
  iconClassByCategory,
} from "@/components/object-category-icon";
import {
  ObjectCategory,
  objectCategoryLabels,
} from "@/data/object-categories";

type ObjectFilterChipProps = {
  category: ObjectCategory;
  count: number;
  selected?: boolean;
  onSelect?: (category: ObjectCategory) => void;
};

export function ObjectFilterChip({
  category,
  count,
  selected = false,
  onSelect,
}: ObjectFilterChipProps) {
  const label = objectCategoryLabels[category];

  return (
    <button
      aria-label={`${label}, ${count}`}
      aria-pressed={selected}
      className={
        selected
          ? "inline-flex shrink-0 cursor-pointer items-center gap-xs rounded-full bg-primary-container px-md py-sm type-label-md text-on-primary transition-colors hover:bg-primary"
          : "inline-flex shrink-0 cursor-pointer items-center gap-xs rounded-full border border-outline-variant bg-surface-container-lowest px-md py-sm type-label-md text-on-surface shadow-panel transition-colors hover:border-primary hover:bg-on-primary-container"
      }
      onClick={() => onSelect?.(category)}
      type="button"
    >
      <CategoryIcon
        category={category}
        className={`size-md ${selected ? "text-on-primary" : iconClassByCategory[category]}`}
      />
      <span>
        {label}{" "}
        <span className="tnum">({count})</span>
      </span>
    </button>
  );
}

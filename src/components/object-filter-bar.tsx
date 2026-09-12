"use client";

import { useState } from "react";
import { ObjectFilterChip } from "@/components/object-filter-chip";
import {
  ObjectCategory,
  objectCategoryOrder,
} from "@/data/object-categories";

type ObjectFilterBarProps = {
  counts: Record<ObjectCategory, number>;
  value?: ObjectCategory;
  onChange?: (category: ObjectCategory) => void;
};

export function ObjectFilterBar({
  counts,
  value,
  onChange,
}: ObjectFilterBarProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(
    ObjectCategory.All,
  );
  const selected = value ?? uncontrolledValue;

  const handleSelect = (category: ObjectCategory) => {
    if (value === undefined) {
      setUncontrolledValue(category);
    }
    onChange?.(category);
  };

  return (
    <div
      aria-label="Фильтр по типу объекта"
      className="flex max-w-full flex-wrap items-center gap-sm"
      role="group"
    >
      {objectCategoryOrder.map((category) => (
        <ObjectFilterChip
          category={category}
          count={counts[category]}
          key={category}
          onSelect={handleSelect}
          selected={selected === category}
        />
      ))}
    </div>
  );
}

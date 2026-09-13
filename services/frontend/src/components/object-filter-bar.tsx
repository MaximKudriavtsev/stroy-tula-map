"use client";

import { useCallback, useRef, useState } from "react";
import { ObjectFilterChip } from "@/components/object-filter-chip";
import {
  CategoryIcon,
  iconClassByCategory,
} from "@/components/object-category-icon";
import {
  ObjectCategory,
  objectCategoryLabels,
  objectCategoryOrder,
} from "@/data/object-categories";
import { useDismissable } from "@/lib/use-dismissable";

type ObjectFilterBarProps = {
  counts: Record<ObjectCategory, number>;
  value?: ObjectCategory;
  unavailable?: ReadonlySet<ObjectCategory>;
  onChange?: (category: ObjectCategory) => void;
};

export function ObjectFilterBar({
  counts,
  value,
  unavailable,
  onChange,
}: ObjectFilterBarProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(
    ObjectCategory.All,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = value ?? uncontrolledValue;
  const selectedLabel = objectCategoryLabels[selected];

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useDismissable(menuOpen, closeMenu, menuRef);

  const handleSelect = (category: ObjectCategory) => {
    if (unavailable?.has(category)) {
      return;
    }

    if (value === undefined) {
      setUncontrolledValue(category);
    }
    onChange?.(category);
    setMenuOpen(false);
  };

  return (
    <>
      <div className="relative md:hidden" ref={menuRef}>
        <button
          aria-expanded={menuOpen}
          aria-haspopup="listbox"
          aria-label={`Фильтр по типу объекта: ${selectedLabel}`}
          className="inline-flex max-w-full items-center gap-sm rounded-full border border-outline-variant bg-surface-container-lowest px-md py-sm shadow-panel type-label-md text-on-surface"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <CategoryIcon
            category={selected}
            className={`size-md shrink-0 ${iconClassByCategory[selected]}`}
          />
          <span className="min-w-0 truncate">
            {selectedLabel}{" "}
            <span className="tnum">({counts[selected]})</span>
          </span>
          <ChevronIcon
            className={`size-md shrink-0 text-on-surface-variant transition-transform ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {menuOpen ? (
          <div
            className="absolute left-0 top-full z-30 mt-sm min-w-56 max-w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest py-xs shadow-overlay"
            role="listbox"
          >
            {objectCategoryOrder.map((category) => {
              const disabled = unavailable?.has(category) ?? false;
              const isSelected = selected === category;
              const label = objectCategoryLabels[category];

              return (
                <button
                  aria-disabled={disabled}
                  aria-selected={isSelected}
                  className={
                    disabled
                      ? "flex w-full cursor-not-allowed items-center gap-sm px-md py-sm text-left type-label-md text-on-surface-variant opacity-50"
                      : isSelected
                        ? "flex w-full cursor-pointer items-center gap-sm bg-primary-container px-md py-sm text-left type-label-md text-on-primary"
                        : "flex w-full cursor-pointer items-center gap-sm px-md py-sm text-left type-label-md text-on-surface transition-colors hover:bg-surface-container-low"
                  }
                  disabled={disabled}
                  key={category}
                  onClick={() => handleSelect(category)}
                  role="option"
                  type="button"
                >
                  <CategoryIcon
                    category={category}
                    className={`size-md shrink-0 ${
                      isSelected
                        ? "text-on-primary"
                        : iconClassByCategory[category]
                    }`}
                  />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  <span className="tnum shrink-0">({counts[category]})</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div
        aria-label="Фильтр по типу объекта"
        className="hidden max-w-full flex-wrap items-center gap-sm md:flex"
        role="group"
      >
        {objectCategoryOrder.map((category) => (
          <ObjectFilterChip
            category={category}
            count={counts[category]}
            disabled={unavailable?.has(category) ?? false}
            key={category}
            onSelect={handleSelect}
            selected={selected === category}
          />
        ))}
      </div>
    </>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M5 7.5 10 12.5 15 7.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

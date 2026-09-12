"use client";

import { Brand } from "@/components/brand";
import { CenterMapButton } from "@/components/center-map-button";
import { SearchField } from "@/components/search-field";

type MapSearchBarProps = {
  value?: string;
  onChange?: (query: string) => void;
  onSearch?: (query: string) => void;
  onCenter?: () => void;
};

export function MapSearchBar({
  value,
  onChange,
  onSearch,
  onCenter,
}: MapSearchBarProps) {
  return (
    <div className="flex items-center gap-sm rounded-full border border-outline-variant bg-surface-container-lowest p-sm shadow-panel md:gap-md">
      <Brand />

      <div
        aria-hidden="true"
        className="hidden h-xl w-px shrink-0 bg-outline-variant sm:block"
      />

      <SearchField onChange={onChange} onSearch={onSearch} value={value} />
      <CenterMapButton onCenter={onCenter} />
    </div>
  );
}

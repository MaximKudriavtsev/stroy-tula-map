"use client";

import { useEffect, useState } from "react";
import { ConstructionStatusBar } from "@/components/construction-status-bar";
import { DateSelector } from "@/components/date-selector";
import { MapHint } from "@/components/map-hint";
import { MapSearchBar } from "@/components/map-search-bar";
import { MapView } from "@/components/map-view";
import { ObjectCard } from "@/components/object-card";
import { ObjectFilterBar } from "@/components/object-filter-bar";
import { ObjectCategory } from "@/data/object-categories";
import {
  constructionObjects,
  type ConstructionObject,
} from "@/data/objects";
import { countObjectsByCategory } from "@/lib/object-chip";

const openingYear = 2026;
const openingCount = constructionObjects.filter(
  (object) => object.status === "planned",
).length;
const buildingCount = constructionObjects.filter(
  (object) => object.status === "in_progress",
).length;

const HUD_TRANSITION_MS = 300;

export default function Home() {
  const [category, setCategory] = useState(ObjectCategory.All);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedObject, setSelectedObject] =
    useState<ConstructionObject | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ru");
  const searchedObjects = normalizedQuery
    ? constructionObjects.filter((object) =>
        object.name.toLocaleLowerCase("ru").includes(normalizedQuery),
      )
    : constructionObjects;
  const categoryCounts = countObjectsByCategory(searchedObjects);

  useEffect(() => {
    if (isCardOpen || !selectedObject) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSelectedObject(null);
    }, HUD_TRANSITION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isCardOpen, selectedObject]);

  const handleObjectSelect = (object: ConstructionObject) => {
    setSelectedObject(object);

    if (isCardOpen) {
      return;
    }

    setIsCardOpen(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsCardOpen(true);
      });
    });
  };

  const handleCardClose = () => {
    setIsCardOpen(false);
  };

  return (
    <div className="relative h-dvh overflow-hidden">
      <MapView
        category={category}
        onObjectSelect={handleObjectSelect}
        searchQuery={searchQuery}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-margin pt-md md:px-margin-desktop">
        <div className="flex w-full flex-col items-start gap-sm">
          <div className="flex w-full items-stretch justify-between gap-sm md:gap-md">
            <div className="pointer-events-auto min-w-0">
              <MapSearchBar
                onChange={setSearchQuery}
                onSearch={setSearchQuery}
                value={searchQuery}
              />
            </div>
            <div className="pointer-events-auto flex shrink-0">
              <ConstructionStatusBar
                buildingCount={buildingCount}
                openingCount={openingCount}
                year={openingYear}
              />
            </div>
          </div>
          <div
            aria-hidden={isCardOpen}
            className={`pointer-events-auto transition-[opacity,transform] duration-300 ease-out ${
              isCardOpen
                ? "pointer-events-none -translate-y-2 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
            inert={isCardOpen ? true : undefined}
          >
            <ObjectFilterBar
              counts={categoryCounts}
              onChange={setCategory}
              value={category}
            />
          </div>
        </div>
      </div>

      <div
        aria-hidden={isCardOpen}
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-sm px-margin pb-md transition-[opacity,transform] duration-300 ease-out md:px-margin-desktop md:pb-lg ${
          isCardOpen
            ? "translate-y-3 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
        inert={isCardOpen ? true : undefined}
      >
        <MapHint />
        <div className="pointer-events-auto">
          <DateSelector />
        </div>
      </div>

      {selectedObject ? (
        <ObjectCard
          object={selectedObject}
          onClose={handleCardClose}
          open={isCardOpen}
        />
      ) : null}
    </div>
  );
}

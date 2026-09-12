"use client";

import { useEffect, useState } from "react";
import { ConstructionStatusBar } from "@/components/construction-status-bar";
import { CoverageLegend } from "@/components/coverage-legend";
import { DateSelector } from "@/components/date-selector";
import { MapHint } from "@/components/map-hint";
import { MapModeSwitch } from "@/components/map-mode-switch";
import { MapSearchBar } from "@/components/map-search-bar";
import { MapView } from "@/components/map-view";
import { ObjectCard } from "@/components/object-card";
import { ObjectFilterBar } from "@/components/object-filter-bar";
import { mapModes, type MapMode } from "@/data/map-modes";
import { ObjectCategory } from "@/data/object-categories";
import { constructionObjects, type ConstructionObject } from "@/data/objects";
import { countOsmPoisByCategory, filterOsmPois, osmPois } from "@/data/osm-pois";
import { countObjectsByCategory } from "@/lib/object-chip";
import type { IsochroneTime } from "@/lib/use-isochrone";

const openingYear = 2026;
const openingCount = constructionObjects.filter(
  (object) => object.status === "planned",
).length;
const buildingCount = constructionObjects.filter(
  (object) => object.status === "in_progress",
).length;

const HUD_TRANSITION_MS = 300;

export default function Home() {
  const [mapMode, setMapMode] = useState<MapMode>(mapModes.objects);
  const [category, setCategory] = useState(ObjectCategory.All);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedObject, setSelectedObject] =
    useState<ConstructionObject | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isochroneTime, setIsochroneTime] = useState<IsochroneTime | null>(
    null,
  );

  const isCoverageMode = mapMode === mapModes.coverage;
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ru");

  const searchedObjects = normalizedQuery
    ? constructionObjects.filter((object) =>
        object.name.toLocaleLowerCase("ru").includes(normalizedQuery),
      )
    : constructionObjects;

  const searchedPois = filterOsmPois(osmPois, ObjectCategory.All, searchQuery);

  const categoryCounts = isCoverageMode
    ? countOsmPoisByCategory(searchedPois)
    : countObjectsByCategory(searchedObjects);

  useEffect(() => {
    if (isCardOpen || !selectedObject) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSelectedObject(null);
    }, HUD_TRANSITION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isCardOpen, selectedObject]);

  useEffect(() => {
    if (!isCoverageMode) {
      return;
    }

    setIsCardOpen(false);
  }, [isCoverageMode]);

  const handleObjectSelect = (object: ConstructionObject) => {
    if (isCoverageMode) {
      return;
    }

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

  const handleShowIsochrone = () => {
    setIsochroneTime(10);
  };

  const handleHideIsochrone = () => {
    setIsochroneTime(null);
  };

  const handleIsochroneTimeChange = (time: IsochroneTime) => {
    setIsochroneTime(time);
  };

  const handleModeChange = (mode: MapMode) => {
    setMapMode(mode);
  };

  return (
    <div className="relative h-dvh overflow-hidden">
      <MapView
        category={category}
        isochroneTime={isochroneTime}
        mode={mapMode}
        onIsochroneTimeChange={handleIsochroneTimeChange}
        onObjectSelect={handleObjectSelect}
        searchQuery={searchQuery}
        selectedObject={selectedObject}
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
            className={`pointer-events-auto flex max-w-full flex-wrap items-center gap-sm transition-[opacity,transform] duration-300 ease-out ${
              isCardOpen
                ? "pointer-events-none -translate-y-2 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
            inert={isCardOpen ? true : undefined}
          >
            <MapModeSwitch onChange={handleModeChange} value={mapMode} />
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
        {isCoverageMode ? <CoverageLegend /> : null}
        <MapHint>
          {isCoverageMode
            ? "Цвет показывает суммарную доступность инфраструктуры: красный — слабо, зелёный — сильно"
            : "Выберите объект на карте, чтобы узнать о нем подробнее"}
        </MapHint>
        <div className="pointer-events-auto">
          <DateSelector />
        </div>
      </div>

      {selectedObject && !isCoverageMode ? (
        <ObjectCard
          isochroneActive={isochroneTime !== null}
          object={selectedObject}
          onClose={handleCardClose}
          onHideIsochrone={handleHideIsochrone}
          onShowIsochrone={handleShowIsochrone}
          open={isCardOpen}
        />
      ) : null}
    </div>
  );
}

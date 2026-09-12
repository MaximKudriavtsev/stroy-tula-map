"use client";

import { useEffect, useMemo, useState } from "react";
import { ConstructionStatusBar } from "@/components/construction-status-bar";
import { CoverageLegend } from "@/components/coverage-legend";
import { DateSelector } from "@/components/date-selector";
import { MapHint } from "@/components/map-hint";
import { MapModeSwitch } from "@/components/map-mode-switch";
import { MapSearchBar } from "@/components/map-search-bar";
import { MapView } from "@/components/map-view";
import { ObjectCard } from "@/components/object-card";
import { ObjectFilterBar } from "@/components/object-filter-bar";
import { ProvisionLegend } from "@/components/provision-legend";
import { SplashOverlay } from "@/components/splash-overlay";
import { DEFAULT_MAP_DATE } from "@/data/map-date";
import { isHeatmapMode, mapModes, type MapMode } from "@/data/map-modes";
import {
  ObjectCategory,
  nextAvailableCategory,
  provisionUnavailableCategories,
} from "@/data/object-categories";
import { constructionObjects, type ConstructionObject } from "@/data/objects";
import { countOsmPoisByCategory, filterOsmPois, osmPois } from "@/data/osm-pois";
import {
  earliestConstructionStart,
  hasConstructionStartedAt,
  isSameMonth,
  startOfMonth,
} from "@/lib/construction-progress";
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
const MAP_NOW = startOfMonth(DEFAULT_MAP_DATE);

const mapHintByMode: Record<MapMode, string> = {
  objects: "Выберите объект на карте, чтобы узнать о нем подробнее",
  coverage:
    "Цвет показывает суммарную доступность инфраструктуры: красный — слабо, зелёный — сильно",
  provision:
    "Цвет сравнивает число объектов с нормативом на местное население: красный — дефицит, серый — здесь не живут",
};

export default function Home() {
  const earliestDate = useMemo(
    () => earliestConstructionStart(constructionObjects, MAP_NOW),
    [],
  );
  const [mapDate, setMapDate] = useState(MAP_NOW);
  const [mapMode, setMapMode] = useState<MapMode>(mapModes.objects);
  const [category, setCategory] = useState(ObjectCategory.All);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedObject, setSelectedObject] =
    useState<ConstructionObject | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isochroneTime, setIsochroneTime] = useState<IsochroneTime | null>(
    null,
  );

  const isHeatmap = isHeatmapMode(mapMode);
  const isProvisionMode = mapMode === mapModes.provision;
  const isCoverageMode = mapMode === mapModes.coverage;
  const isObjectsMode = mapMode === mapModes.objects;
  const isCurrentMapDate = isSameMonth(mapDate, MAP_NOW);
  const showStatusBar = isCurrentMapDate && isObjectsMode && !isCardOpen;
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ru");

  const searchedObjects = normalizedQuery
    ? constructionObjects.filter((object) =>
        object.name.toLocaleLowerCase("ru").includes(normalizedQuery),
      )
    : constructionObjects;

  const datedObjects = searchedObjects.filter((object) =>
    hasConstructionStartedAt(object, mapDate),
  );

  const searchedPois = filterOsmPois(osmPois, ObjectCategory.All, searchQuery);

  const categoryCounts = isHeatmap
    ? countOsmPoisByCategory(searchedPois)
    : countObjectsByCategory(datedObjects);

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
    if (!isHeatmap) {
      return;
    }

    setIsCardOpen(false);
  }, [isHeatmap]);

  const handleObjectSelect = (object: ConstructionObject) => {
    if (isHeatmap) {
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
    setIsochroneTime(null);
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

    if (mode !== mapModes.provision) {
      return;
    }

    if (!provisionUnavailableCategories.has(category)) {
      return;
    }

    setCategory(
      nextAvailableCategory(category, provisionUnavailableCategories),
    );
  };

  return (
    <div className="relative h-dvh overflow-hidden">
      <MapView
        category={category}
        isochroneTime={isochroneTime}
        mapDate={mapDate}
        mode={mapMode}
        onIsochroneTimeChange={handleIsochroneTimeChange}
        onObjectSelect={handleObjectSelect}
        searchQuery={searchQuery}
        selectedObject={selectedObject}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-margin pt-md md:px-margin-desktop">
        <div className="flex w-full flex-col items-start gap-sm">
          <div className="relative flex w-full items-stretch justify-between gap-sm md:gap-md">
            <div className="pointer-events-auto min-w-0">
              <MapSearchBar
                onChange={setSearchQuery}
                onSearch={setSearchQuery}
                value={searchQuery}
              />
            </div>
            <div
              aria-hidden={!showStatusBar}
              className={`pointer-events-auto absolute inset-y-0 right-0 flex transition-[opacity,transform] duration-300 ease-out ${
                showStatusBar
                  ? "translate-x-0 opacity-100"
                  : "pointer-events-none translate-x-3 opacity-0"
              }`}
              inert={!showStatusBar ? true : undefined}
            >
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
              unavailable={
                isProvisionMode ? provisionUnavailableCategories : undefined
              }
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
        <div className="relative flex w-full flex-col items-center gap-sm">
          <div
            aria-hidden={!isProvisionMode}
            className={`absolute bottom-full left-1/2 mb-sm -translate-x-1/2 transition-[opacity,transform] duration-300 ease-out ${
              isProvisionMode
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            }`}
            inert={!isProvisionMode ? true : undefined}
          >
            <ProvisionLegend />
          </div>

          <div
            aria-hidden={!isCoverageMode}
            className={`absolute bottom-full left-1/2 mb-sm -translate-x-1/2 transition-[opacity,transform] duration-300 ease-out ${
              isCoverageMode
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            }`}
            inert={!isCoverageMode ? true : undefined}
          >
            <CoverageLegend />
          </div>

          <MapHint showHand={isObjectsMode}>{mapHintByMode[mapMode]}</MapHint>

          <div className="pointer-events-auto">
            <DateSelector
              maxDate={MAP_NOW}
              minDate={earliestDate}
              onChange={setMapDate}
              value={mapDate}
            />
          </div>
        </div>
      </div>

      {selectedObject && !isHeatmap ? (
        <ObjectCard
          isochroneActive={isochroneTime !== null}
          mapDate={mapDate}
          object={selectedObject}
          onClose={handleCardClose}
          onHideIsochrone={handleHideIsochrone}
          onShowIsochrone={handleShowIsochrone}
          open={isCardOpen && !isHeatmap}
          syncTimelineToMapDate={!isCurrentMapDate}
        />
      ) : null}

      <SplashOverlay />
    </div>
  );
}

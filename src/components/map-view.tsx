"use client";

import { useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Feature } from "@yandex/ymaps3-clusterer";
import type { LngLat, LngLatBounds, YMap } from "@yandex/ymaps3-types";
import { IsochroneTimeSelector } from "@/components/isochrone-time-selector";
import type { IsochroneTime } from "@/lib/use-isochrone";
import { ObjectInfoChip } from "@/components/object-info-chip";
import { ObjectCategory } from "@/data/object-categories";
import { useIsochrone } from "@/lib/use-isochrone";
import {
  constructionObjects,
  type ConstructionObject,
} from "@/data/objects";
import { tulaOblastBoundary } from "@/data/tula-oblast-boundary";
import { clusterByRectGrid } from "@/lib/cluster-by-rect-grid";
import {
  buildStatusForObject,
  inferObjectCategory,
  progressForObject,
} from "@/lib/object-chip";

/** Размер маркера ≈ 224×130: ячейка шире по X, уже по Y. */
const CLUSTER_GRID = { gridWidth: 240, gridHeight: 130 };

const TULA_OBLAST_BORDER_COLOR = "#B84A39";
const TULA_OBLAST_OUTSIDE_FILL = "rgba(11, 18, 32, 0.42)";
const CLUSTER_SOURCE = "clusterer-source";

/** Внешнее кольцо на весь мир: внутри него вырезается Тульская область. [lng, lat] */
const WORLD_OUTER_RING: LngLat[] = [
  [-179.99, 85],
  [179.99, 85],
  [179.99, -85],
  [-179.99, -85],
  [-179.99, 85],
];

/** Граница хранится как [широта, долгота] (формат v2) — переводим в [lng, lat]. */
const toLngLat = ([lat, lng]: number[]): LngLat => [lng, lat];

const toLngLatRing = (ring: number[][]): LngLat[] => ring.map(toLngLat);

const expandBounds = (bounds: LngLatBounds, factor: number): LngLatBounds => {
  const southWest = bounds[0];
  const northEast = bounds[1];
  const lngPadding = (northEast[0] - southWest[0]) * factor;
  const latPadding = (northEast[1] - southWest[1]) * factor;

  return [
    [southWest[0] - lngPadding, southWest[1] - latPadding],
    [northEast[0] + lngPadding, northEast[1] + latPadding],
  ];
};

const getBoundsFromCoordinates = (coordinates: LngLat[]): LngLatBounds => {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of coordinates) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
};

const loadYandexMaps = async (apiKey: string) => {
  if (!window.ymaps3) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        reject(new Error("Не удалось загрузить API Яндекс Карт"));
      };
      document.head.appendChild(script);
    });
  }

  if (!window.ymaps3) {
    throw new Error("API Яндекс Карт не инициализировался");
  }

  await ymaps3.ready;

  ymaps3.import.registerCdn("https://cdn.jsdelivr.net/npm/{package}", [
    "@yandex/ymaps3-default-ui-theme@0.0",
    "@yandex/ymaps3-clusterer@0.0",
  ]);

  return ymaps3;
};

const createClusterElement = (count: number) => {
  const element = document.createElement("div");
  element.style.cssText = [
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "width:40px",
    "height:40px",
    "border-radius:50%",
    `background:${TULA_OBLAST_BORDER_COLOR}`,
    "color:#fff",
    "font:600 13px/1 system-ui,sans-serif",
    "box-shadow:0 2px 8px rgba(0,0,0,0.25)",
    "transform:translate(-50%,-50%)",
    "cursor:pointer",
    "user-select:none",
  ].join(";");
  element.textContent = String(count);
  return element;
};

const createObjectChipMarker = (
  object: ConstructionObject,
  roots: Root[],
  onSelect?: (object: ConstructionObject) => void,
) => {
  const progress = progressForObject(object);
  const element = document.createElement("div");
  element.style.cssText =
    "transform:translate(-50%,calc(-100% - 6px));pointer-events:auto;cursor:pointer;filter:drop-shadow(0 4px 16px rgb(108 88 76 / 0.08));";
  element.addEventListener("click", (event) => {
    event.stopPropagation();
    onSelect?.(object);
  });

  const root = createRoot(element);
  roots.push(root);
  root.render(
    <ObjectInfoChip
      category={inferObjectCategory(object.name)}
      name={object.name}
      progress={progress}
      status={buildStatusForObject(object, progress)}
    />,
  );

  return element;
};

const buildMapFeatures = (): Feature[] => {
  const features: Feature[] = [];

  for (const object of constructionObjects) {
    if (object.latitude === null || object.longitude === null) {
      continue;
    }

    features.push({
      type: "Feature",
      id: object.id,
      geometry: {
        type: "Point",
        coordinates: [object.longitude, object.latitude],
      },
      properties: {
        objectId: object.id,
        name: object.name,
        category: inferObjectCategory(object.name),
      },
    });
  }

  return features;
};

const filterMapFeatures = (
  features: Feature[],
  category: ObjectCategory,
  searchQuery: string,
) => {
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ru");

  return features.filter((feature) => {
    if (
      category !== ObjectCategory.All &&
      feature.properties?.category !== category
    ) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const name = String(feature.properties?.name ?? "").toLocaleLowerCase("ru");
    return name.includes(normalizedQuery);
  });
};

type MapViewProps = {
  category?: ObjectCategory;
  searchQuery?: string;
  onObjectSelect?: (object: ConstructionObject) => void;
  selectedObject?: ConstructionObject | null;
  isochroneTime?: IsochroneTime | null;
  onIsochroneTimeChange?: (time: IsochroneTime) => void;
};

export const MapView = ({
  category = ObjectCategory.All,
  searchQuery = "",
  onObjectSelect,
  selectedObject,
  isochroneTime,
  onIsochroneTimeChange,
}: MapViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef(category);
  const searchQueryRef = useRef(searchQuery);
  const onObjectSelectRef = useRef(onObjectSelect);
  const clustererRef = useRef<{ update: (props: { features: Feature[] }) => void } | null>(
    null,
  );
  const allFeaturesRef = useRef<Feature[]>([]);
  const isochroneFeatureRef = useRef<unknown>(null);
  const mapRef = useRef<YMap | null>(null);
  const YMapFeatureRef = useRef<unknown>(null);
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
  const [errorMessage, setErrorMessage] = useState<string | null>(
    apiKey ? null : "Не задан NEXT_PUBLIC_YANDEX_MAPS_API_KEY",
  );

  categoryRef.current = category;
  searchQueryRef.current = searchQuery;
  onObjectSelectRef.current = onObjectSelect;

  // Sync selectedObject prop with ref for click handlers
  useEffect(() => {
    // selectedObjectRef is intentionally not used for isochrone logic
    // (that uses the prop directly)
  }, [selectedObject]);

  const {
    state: isochroneState,
    hasActiveIsochrone,
  } = useIsochrone(
    selectedObject?.longitude ?? null,
    selectedObject?.latitude ?? null,
    selectedObject?.municipality,
    isochroneTime ?? 10,
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !apiKey) {
      return;
    }

    let isCancelled = false;
    let map: YMap | undefined;
    const markerRoots: Root[] = [];

    const setupMap = async () => {
      try {
        const api = await loadYandexMaps(apiKey);

        if (isCancelled || !containerRef.current) {
          return;
        }

        const {
          YMap,
          YMapDefaultSchemeLayer,
          YMapDefaultFeaturesLayer,
          YMapFeature,
          YMapMarker,
          YMapControls,
          YMapFeatureDataSource,
          YMapLayer,
        } = api;

        YMapFeatureRef.current = YMapFeature;

        const [{ YMapClusterer }, theme] = await Promise.all([
          api.import("@yandex/ymaps3-clusterer") as Promise<
            typeof import("@yandex/ymaps3-clusterer")
          >,
          api.import("@yandex/ymaps3-default-ui-theme") as Promise<
            typeof import("@yandex/ymaps3-default-ui-theme")
          >,
        ]);

        const { YMapZoomControl, YMapGeolocationControl } = theme;

        if (isCancelled || !containerRef.current) {
          return;
        }

        const oblastRings = tulaOblastBoundary.map(toLngLatRing);
        const oblastBounds = getBoundsFromCoordinates(oblastRings.flat());

        map = new YMap(containerRef.current, {
          location: {
            bounds: oblastBounds,
          },
          margin: [24, 24, 24, 24],
        });

        map
          .addChild(new YMapDefaultSchemeLayer({}))
          .addChild(new YMapDefaultFeaturesLayer({}))
          .addChild(new YMapFeatureDataSource({ id: CLUSTER_SOURCE }))
          .addChild(
            new YMapLayer({
              source: CLUSTER_SOURCE,
              type: "markers",
              zIndex: 1800,
            }),
          );



        map.addChild(
          new YMapFeature({
            id: "oblast-mask",
            geometry: {
              type: "Polygon",
              coordinates: [WORLD_OUTER_RING, ...oblastRings],
            },
            style: {
              fill: TULA_OBLAST_OUTSIDE_FILL,
              fillRule: "evenodd",
              stroke: [],
              simplificationRate: 0,
              interactive: false,
              zIndex: 0,
            },
          }),
        );

        map.addChild(
          new YMapFeature({
            id: "oblast-border",
            geometry: {
              type: "Polygon",
              coordinates: oblastRings,
            },
            style: {
              fill: "rgba(0,0,0,0)",
              stroke: [
                { width: 8, color: "#FFFFFF", opacity: 0.95 },
                { width: 4, color: TULA_OBLAST_BORDER_COLOR },
              ],
              simplificationRate: 0,
              interactive: false,
              zIndex: 1,
            },
          }),
        );

        map.update({
          zoomRange: { min: map.zoom, max: 21 },
          restrictMapArea: expandBounds(oblastBounds, 0.02),
        });

        map.addChild(
          new YMapControls({ position: "right" })
            .addChild(new YMapZoomControl({}))
            .addChild(new YMapGeolocationControl({})),
        );

        const objectsById = new Map(
          constructionObjects.map((object) => [object.id, object]),
        );
        const allFeatures = buildMapFeatures();
        allFeaturesRef.current = allFeatures;
        const features = filterMapFeatures(
          allFeatures,
          categoryRef.current,
          searchQueryRef.current,
        );

        const marker = (feature: Feature) => {
          const object = objectsById.get(String(feature.id));

          if (!object) {
            return new YMapMarker({
              coordinates: feature.geometry.coordinates,
              source: CLUSTER_SOURCE,
            });
          }

          return new YMapMarker(
            {
              coordinates: feature.geometry.coordinates,
              source: CLUSTER_SOURCE,
              onClick() {
                if (map) {
                  map.setLocation({
                    center: [object.longitude, object.latitude] as LngLat,
                    zoom: 14,
                    duration: 500,
                  });
                }
                onObjectSelectRef.current?.(object);
              },
            },
            createObjectChipMarker(object, markerRoots, (selected) => {
              if (map) {
                map.setLocation({
                  center: [selected.longitude, selected.latitude] as LngLat,
                  zoom: 14,
                  duration: 500,
                });
              }
              onObjectSelectRef.current?.(selected);
            }),
          );
        };

        const cluster = (coordinates: LngLat, clusterFeatures: Feature[]) =>
          new YMapMarker(
            {
              coordinates,
              source: CLUSTER_SOURCE,
              onClick() {
                if (!map) {
                  return;
                }

                map.setLocation({
                  bounds: getBoundsFromCoordinates(
                    clusterFeatures.map((item) => item.geometry.coordinates),
                  ),
                  duration: 400,
                });
              },
            },
            createClusterElement(clusterFeatures.length),
          );

        const clusterer = new YMapClusterer({
          method: clusterByRectGrid(CLUSTER_GRID),
          features,
          marker,
          cluster,
        });
        clustererRef.current = clusterer;
        map.addChild(clusterer);
        mapRef.current = map;
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Не удалось загрузить карту",
          );
        }
      }
    };

    void setupMap();

    return () => {
      isCancelled = true;
      clustererRef.current = null;
      markerRoots.forEach((root) => {
        root.unmount();
      });
      map?.destroy();
    };
  }, [apiKey]);

  useEffect(() => {
    const clusterer = clustererRef.current;
    if (!clusterer || allFeaturesRef.current.length === 0) {
      return;
    }

    clusterer.update({
      features: filterMapFeatures(
        allFeaturesRef.current,
        category,
        searchQuery,
      ),
    });
  }, [category, searchQuery]);

  // ---- Isochrone feature management ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing isochrone
    if (isochroneFeatureRef.current) {
      map.removeChild(isochroneFeatureRef.current as any);
      isochroneFeatureRef.current = null;
    }

    if (isochroneState.status === "ready" && isochroneTime != null) {
      const YMapFeatureCtor = YMapFeatureRef.current as new (props: any) => any;
      if (!YMapFeatureCtor) return;

      const feature = new YMapFeatureCtor({
        id: "isochrone-zone",
        geometry: {
          type: "Polygon",
          coordinates: [isochroneState.data.coordinates],
        },
        style: {
          fill: "rgba(184, 74, 57, 0.25)",
          stroke: [{ width: 3, color: "#B84A39", opacity: 0.8 }],
          simplificationRate: 0,
          interactive: false,
          zIndex: 2,
        },
      });
      map.addChild(feature);
      isochroneFeatureRef.current = feature;
    }
  }, [isochroneState, isochroneTime]);

  if (errorMessage) {
    return (
      <div className="flex h-dvh w-full items-center justify-center p-6 text-center text-sm text-zinc-600">
        {errorMessage}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-dvh w-full">
      {hasActiveIsochrone && isochroneTime != null && (
        <div className="pointer-events-auto absolute bottom-20 left-1/2 z-20 -translate-x-1/2 md:bottom-28">
          <div className="flex flex-col items-center gap-2">
            <IsochroneTimeSelector
              selectedTime={isochroneTime}
              onTimeChange={onIsochroneTimeChange}
            />
            {isochroneState.status === "loading" && (
              <p className="text-sm text-zinc-500">Загрузка...</p>
            )}
            {isochroneState.status === "error" && (
              <p className="text-sm text-zinc-600">{isochroneState.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

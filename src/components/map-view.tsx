"use client";

import { useEffect, useRef, useState } from "react";
import type { Feature } from "@yandex/ymaps3-clusterer";
import type { LngLat, LngLatBounds, YMap } from "@yandex/ymaps3-types";
import {
  constructionObjects,
  statusLabels,
  type ConstructionStatus,
} from "@/data/objects";
import { tulaOblastBoundary } from "@/data/tula-oblast-boundary";

const TULA_OBLAST_BORDER_COLOR = "#FF2E00";
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

const markerColorByStatus: Record<ConstructionStatus, string> = {
  planned: "#64748b",
  in_progress: "#d97706",
  completed: "#16a34a",
};

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

const createPopupContent = (name: string, address: string, status: string) => {
  const content = document.createElement("div");
  content.style.cssText = "min-width:180px;max-width:260px;font:14px/1.4 system-ui,sans-serif";
  content.innerHTML = `<strong>${name}</strong><br/>${address}<br/>${status}`;
  return content;
};

export const MapView = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
  const [errorMessage, setErrorMessage] = useState<string | null>(
    apiKey ? null : "Не задан NEXT_PUBLIC_YANDEX_MAPS_API_KEY",
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !apiKey) {
      return;
    }

    let isCancelled = false;
    let map: YMap | undefined;

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

        const [{ YMapClusterer, clusterByGrid }, theme] = await Promise.all([
          api.import("@yandex/ymaps3-clusterer") as Promise<
            typeof import("@yandex/ymaps3-clusterer")
          >,
          api.import("@yandex/ymaps3-default-ui-theme") as Promise<
            typeof import("@yandex/ymaps3-default-ui-theme")
          >,
        ]);

        const { YMapDefaultMarker, YMapZoomControl, YMapGeolocationControl } =
          theme;

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
              name: object.name,
              address: object.address,
              status: object.status,
            },
          });
        }

        const marker = (feature: Feature) => {
          const status = feature.properties?.status as ConstructionStatus;
          const name = String(feature.properties?.name ?? "");
          const address = String(feature.properties?.address ?? "");
          const color = markerColorByStatus[status] ?? markerColorByStatus.planned;

          return new YMapDefaultMarker({
            coordinates: feature.geometry.coordinates,
            source: CLUSTER_SOURCE,
            color: { day: color, night: color },
            size: "small",
            title: name,
            subtitle: `${address} · ${statusLabels[status]}`,
            popup: {
              content: () =>
                createPopupContent(name, address, statusLabels[status]),
              position: "top",
            },
          });
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

        map.addChild(
          new YMapClusterer({
            method: clusterByGrid({ gridSize: 80 }),
            features,
            marker,
            cluster,
          }),
        );
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
      map?.destroy();
    };
  }, [apiKey]);

  if (errorMessage) {
    return (
      <div className="flex h-dvh w-full items-center justify-center p-6 text-center text-sm text-zinc-600">
        {errorMessage}
      </div>
    );
  }

  return <div ref={containerRef} className="h-dvh w-full" />;
};

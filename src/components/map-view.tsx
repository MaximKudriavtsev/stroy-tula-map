"use client";

import { useEffect, useRef, useState } from "react";
import {
  constructionObjects,
  statusLabels,
  type ConstructionStatus,
} from "@/data/objects";
import { tulaOblastBoundary } from "@/data/tula-oblast-boundary";

const TULA_OBLAST_CENTER: [number, number] = [53.92, 37.62];
const TULA_OBLAST_ZOOM = 8;
const TULA_OBLAST_BORDER_COLOR = "#FF2E00";
const TULA_OBLAST_OUTSIDE_FILL = "#0B1220";

/** Внешнее кольцо на весь мир: внутри него вырезается Тульская область. */
const WORLD_OUTER_RING: number[][] = [
  [85, -179.99],
  [85, 179.99],
  [-85, 179.99],
  [-85, -179.99],
  [85, -179.99],
];

const markerColorByStatus: Record<ConstructionStatus, string> = {
  planned: "#64748b",
  in_progress: "#d97706",
  completed: "#16a34a",
};

const expandBounds = (bounds: number[][], factor: number): number[][] => {
  const southWest = bounds[0];
  const northEast = bounds[1];
  const latPadding = (northEast[0] - southWest[0]) * factor;
  const lonPadding = (northEast[1] - southWest[1]) * factor;

  return [
    [southWest[0] - latPadding, southWest[1] - lonPadding],
    [northEast[0] + latPadding, northEast[1] + lonPadding],
  ];
};

const getYmapsApi = () => window.ymaps;

const loadYandexMaps = async (apiKey: string) => {
  if (!getYmapsApi()) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        reject(new Error("Не удалось загрузить API Яндекс Карт"));
      };
      document.head.appendChild(script);
    });
  }

  const api = getYmapsApi();

  if (!api) {
    throw new Error("API Яндекс Карт не инициализировался");
  }

  await new Promise<void>((resolve) => {
    api.ready(() => resolve());
  });

  return api;
};

export const MapView = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

    if (!container) {
      return;
    }

    if (!apiKey) {
      setErrorMessage("Не задан NEXT_PUBLIC_YANDEX_MAPS_API_KEY");
      return;
    }

    let isCancelled = false;
    let map: ymaps.Map | undefined;

    const setupMap = async () => {
      try {
        const ymapsApi = await loadYandexMaps(apiKey);

        if (isCancelled || !containerRef.current) {
          return;
        }

        map = new ymapsApi.Map(containerRef.current, {
          center: TULA_OBLAST_CENTER,
          zoom: TULA_OBLAST_ZOOM,
          controls: ["zoomControl", "geolocationControl"],
        });

        const oblastMask = new ymapsApi.Polygon(
          [WORLD_OUTER_RING, ...tulaOblastBoundary],
          {},
          {
            coordRendering: "straightPath",
            fillColor: TULA_OBLAST_OUTSIDE_FILL,
            fillOpacity: 0.42,
            interactivityModel: "default#silent",
            strokeWidth: 0,
            zIndex: 0,
          } as ymaps.IPolygonOptions & {
            coordRendering: "straightPath";
          },
        );
        oblastMask.geometry?.setFillRule("evenOdd");

        const oblastBorder = new ymapsApi.Polygon(
          tulaOblastBoundary,
          {
            hintContent: "Тульская область",
          },
          {
            fill: false,
            interactivityModel: "default#silent",
            strokeColor: ["#FFFFFF", TULA_OBLAST_BORDER_COLOR],
            strokeOpacity: [0.95, 1],
            strokeWidth: [8, 4],
            zIndex: 1,
          },
        );

        map.geoObjects.add(oblastMask);
        map.geoObjects.add(oblastBorder);

        const oblastBounds = oblastBorder.geometry?.getBounds();

        if (oblastBounds) {
          await map.setBounds(oblastBounds, {
            checkZoomRange: true,
            duration: 0,
            zoomMargin: [24],
          });

          if (isCancelled) {
            return;
          }

          map.options.set({
            minZoom: map.getZoom(),
            restrictMapArea: expandBounds(map.getBounds(), 0.02),
          });
        }

        const clustererOptions: ymaps.IClustererOptions &
          ymaps.IClusterPlacemarkOptionsWithClusterPrefix = {
          clusterDisableClickZoom: false,
          clusterHideIconOnBalloonOpen: false,
          clusterIconColor: TULA_OBLAST_BORDER_COLOR,
          gridSize: 80,
          groupByCoordinates: false,
          hasBalloon: true,
          minClusterSize: 2,
        };
        const clusterer = new ymapsApi.Clusterer(clustererOptions);
        const placemarks: ymaps.Placemark[] = [];

        for (const object of constructionObjects) {
          if (object.latitude === null || object.longitude === null) {
            continue;
          }

          placemarks.push(
            new ymapsApi.Placemark(
              [object.latitude, object.longitude],
              {
                balloonContentHeader: object.name,
                balloonContentBody: `${object.address}<br/>${statusLabels[object.status]}`,
                clusterCaption: object.name,
              },
              {
                preset: "islands#dotIcon",
                iconColor: markerColorByStatus[object.status],
              },
            ),
          );
        }

        clusterer.add(placemarks);
        map.geoObjects.add(clusterer as unknown as ymaps.IGeoObject);
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
  }, []);

  if (errorMessage) {
    return (
      <div className="flex h-dvh w-full items-center justify-center p-6 text-center text-sm text-zinc-600">
        {errorMessage}
      </div>
    );
  }

  return <div ref={containerRef} className="h-dvh w-full" />;
};

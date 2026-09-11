"use client";

import { useEffect, useRef, useState } from "react";
import {
  constructionObjects,
  statusLabels,
  type ConstructionStatus,
} from "@/data/objects";

const TULA_OBLAST_CENTER: [number, number] = [53.92, 37.62];
const TULA_OBLAST_ZOOM = 8;

const markerColorByStatus: Record<ConstructionStatus, string> = {
  planned: "#64748b",
  in_progress: "#d97706",
  completed: "#16a34a",
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

        for (const object of constructionObjects) {
          if (object.latitude === null || object.longitude === null) {
            continue;
          }

          map.geoObjects.add(
            new ymapsApi.Placemark(
              [object.latitude, object.longitude],
              {
                balloonContentHeader: object.name,
                balloonContentBody: `${object.address}<br/>${statusLabels[object.status]}`,
              },
              {
                preset: "islands#dotIcon",
                iconColor: markerColorByStatus[object.status],
              },
            ),
          );
        }
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

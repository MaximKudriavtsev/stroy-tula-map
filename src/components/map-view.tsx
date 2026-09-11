"use client";

import { useEffect, useRef, useState } from "react";
import type { YMap } from "@yandex/ymaps3-types";
import {
  constructionObjects,
  statusLabels,
  type ConstructionObject,
  type ConstructionStatus,
} from "@/data/objects";

const TULA_OBLAST_CENTER: [number, number] = [37.62, 53.92];
const TULA_OBLAST_ZOOM = 8;
const TULA_OBLAST_TILT = (45 * Math.PI) / 180;

const markerColorByStatus: Record<ConstructionStatus, string> = {
  planned: "#64748b",
  in_progress: "#d97706",
  completed: "#16a34a",
};

const getYmapsApi = () => window.ymaps3;

const loadYandexMaps = async (apiKey: string) => {
  const waitForReady = async () => {
    const api = getYmapsApi();

    if (!api) {
      throw new Error("API Яндекс Карт не инициализировался");
    }

    await api.ready;
    return api;
  };

  if (!getYmapsApi()) {
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

  return waitForReady();
};

const createMarkerElement = (object: ConstructionObject) => {
  const root = document.createElement("div");
  root.className = "relative cursor-pointer";

  const pin = document.createElement("button");
  pin.type = "button";
  pin.setAttribute("aria-label", object.name);
  pin.className =
    "block h-4 w-4 rounded-full border-2 border-white shadow-md";
  pin.style.backgroundColor = markerColorByStatus[object.status];

  const popup = document.createElement("div");
  popup.className =
    "absolute bottom-full left-1/2 z-10 mb-2 hidden w-56 -translate-x-1/2 rounded-lg bg-white p-2 text-left text-sm leading-snug text-zinc-900 shadow-lg";
  popup.innerHTML = `<strong>${object.name}</strong><br/>${object.address}<br/>${statusLabels[object.status]}`;

  pin.addEventListener("click", (event) => {
    event.stopPropagation();
    popup.classList.toggle("hidden");
  });

  root.append(pin, popup);
  return root;
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
    let map: YMap | undefined;

    const setupMap = async () => {
      try {
        const ymaps = await loadYandexMaps(apiKey);

        if (isCancelled || !containerRef.current) {
          return;
        }

        const {
          YMap,
          YMapDefaultSchemeLayer,
          YMapDefaultFeaturesLayer,
          YMapMarker,
        } = ymaps;

        map = new YMap(containerRef.current, {
          location: {
            center: TULA_OBLAST_CENTER,
            zoom: TULA_OBLAST_ZOOM,
          },
          camera: {
            tilt: TULA_OBLAST_TILT,
            azimuth: 0,
          },
          mode: "vector",
        });

        map.addChild(new YMapDefaultSchemeLayer({}));
        map.addChild(new YMapDefaultFeaturesLayer({}));

        for (const object of constructionObjects) {
          map.addChild(
            new YMapMarker(
              {
                coordinates: [object.longitude, object.latitude],
              },
              createMarkerElement(object),
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

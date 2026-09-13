'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { Feature } from '@yandex/ymaps3-clusterer';
import type { LngLat, LngLatBounds, Projection, YMap } from '@yandex/ymaps3-types';
import { IsochroneTimeSelector } from '@/components/isochrone-time-selector';
import { MapHint } from '@/components/map-hint';
import type { IsochroneTime } from '@/lib/use-isochrone';
import { ObjectInfoChip } from '@/components/object-info-chip';
import { isHeatmapMode, mapModes, type MapMode } from '@/data/map-modes';
import { ObjectCategory } from '@/data/object-categories';
import { useIsochrone } from '@/lib/use-isochrone';
import {
    easeInOutCubic,
    isochroneFill,
    isochroneStroke,
    morphRings,
} from '@/lib/isochrone-morph';
import { constructionObjects, type ConstructionObject } from '@/data/objects';
import { filterOsmPois, osmPois, type OsmPoi } from '@/data/osm-pois';
import { populationHexes } from '@/data/population-grid';
import { tulaOblastBoundary } from '@/data/tula-oblast-boundary';
import { clusterByRectGrid } from '@/lib/cluster-by-rect-grid';
import { drawCoverageHeatmap } from '@/lib/coverage-heatmap';
import {
    computeProvisionField,
    drawProvisionHeatmap,
    groupPoisByCategory,
} from '@/lib/provision-field';
import { buildStatusForProgress, inferObjectCategory } from '@/lib/object-chip';
import {
    hasConstructionStartedAt,
    progressAtDate,
} from '@/lib/construction-progress';
import { DEFAULT_MAP_DATE } from '@/data/map-date';

/** Размер маркера ≈ 224×130: ячейка шире по X, уже по Y. */
const CLUSTER_GRID = { gridWidth: 240, gridHeight: 130 };

const TULA_OBLAST_BORDER_COLOR = '#B84A39';
const TULA_OBLAST_OUTSIDE_FILL = 'rgba(11, 18, 32, 0.42)';
const CLUSTER_SOURCE = 'clusterer-source';

const MAP_MARGIN = 24;
const MAP_MAX_ZOOM = 21;
/** Небольшой запас, чтобы карта не была жёстко залипшей на минимальном зуме. */
const RESTRICT_SLACK = 0.02;

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

type ViewportRestriction = { minZoom: number; restrictMapArea: LngLatBounds };

/**
 * Мировые координаты лежат в [-1, 1], пиксель мира = 2 ** (zoom + 7).
 * Ограничение считаем от вьюпорта: область Тулы вытянута по вертикали, поэтому на
 * широком экране она заметно уже вьюпорта. Если restrictMapArea меньше вьюпорта,
 * Яндекс не может удержать вьюпорт внутри и прижимает камеру к краю области.
 */
const getViewportRestriction = (
    projection: Projection,
    bounds: LngLatBounds,
    size: { x: number; y: number }
): ViewportRestriction => {
    const southWest = projection.toWorldCoordinates(bounds[0]);
    const northEast = projection.toWorldCoordinates(bounds[1]);
    const spanX = Math.abs(northEast.x - southWest.x);
    const spanY = Math.abs(northEast.y - southWest.y);
    const centerX = (southWest.x + northEast.x) / 2;
    const centerY = (southWest.y + northEast.y) / 2;

    // Зум, при котором область целиком видна с учётом margin карты.
    const availableX = Math.max(size.x - MAP_MARGIN * 2, 1);
    const availableY = Math.max(size.y - MAP_MARGIN * 2, 1);
    const minZoom =
        Math.min(Math.log2(availableX / spanX), Math.log2(availableY / spanY)) - 7;

    const worldPerPixel = 1 / 2 ** (minZoom + 7);
    const halfX = (Math.max(spanX, size.x * worldPerPixel) / 2) * (1 + RESTRICT_SLACK);
    const halfY = (Math.max(spanY, size.y * worldPerPixel) / 2) * (1 + RESTRICT_SLACK);

    return {
        minZoom,
        restrictMapArea: [
            projection.fromWorldCoordinates({ x: centerX - halfX, y: centerY - halfY }),
            projection.fromWorldCoordinates({ x: centerX + halfX, y: centerY + halfY }),
        ],
    };
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
            const script = document.createElement('script');
            script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => {
                reject(new Error('Не удалось загрузить API Яндекс Карт'));
            };
            document.head.appendChild(script);
        });
    }

    if (!window.ymaps3) {
        throw new Error('API Яндекс Карт не инициализировался');
    }

    await ymaps3.ready;

    ymaps3.import.registerCdn('https://cdn.jsdelivr.net/npm/{package}', [
        '@yandex/ymaps3-default-ui-theme@0.0',
        '@yandex/ymaps3-clusterer@0.0',
    ]);

    return ymaps3;
};

const createClusterElement = (count: number) => {
    const element = document.createElement('div');
    element.style.cssText = [
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'width:40px',
        'height:40px',
        'border-radius:50%',
        `background:${TULA_OBLAST_BORDER_COLOR}`,
        'color:#fff',
        'font:600 13px/1 system-ui,sans-serif',
        'box-shadow:0 2px 8px rgba(0,0,0,0.25)',
        'transform:translate(-50%,-50%)',
        'cursor:pointer',
        'user-select:none',
    ].join(';');
    element.textContent = String(count);
    return element;
};

const objectsById = new Map(
    constructionObjects.map((object) => [object.id, object])
);

const MARKER_EXIT_MS = 280;

const createObjectChipMarker = (
    object: ConstructionObject,
    roots: Root[],
    mapDateRef: { current: Date },
    selectedIdRef: { current: string | null },
    enterIdsRef: { current: Set<string> | null },
    chipRenderers: Map<string, () => void>,
    markerElements: Map<string, HTMLElement>,
    onSelect?: (object: ConstructionObject) => void
) => {
    const objectId = String(object.id);
    const element = document.createElement('div');
    element.dataset.objectId = objectId;
    element.className = 'map-marker-root';
    element.style.cssText =
        'transform:translate(-50%,calc(-100% - 6px));pointer-events:auto;cursor:pointer;filter:drop-shadow(0 1px 2px rgb(28 28 24 / 0.04)) drop-shadow(0 4px 10px rgb(108 88 76 / 0.05));';

    const shouldEnter = enterIdsRef.current?.has(objectId) ?? true;
    enterIdsRef.current?.delete(objectId);

    const anim = document.createElement('div');
    anim.className = shouldEnter
        ? 'map-marker-anim map-marker-enter'
        : 'map-marker-anim';
    if (shouldEnter) {
        anim.addEventListener(
            'animationend',
            () => {
                anim.classList.remove('map-marker-enter');
            },
            { once: true }
        );
    }
    element.appendChild(anim);

    const applySelectedState = () => {
        const selected = String(selectedIdRef.current ?? '') === objectId;
        element.classList.toggle('is-selected', selected);
        return selected;
    };

    element.addEventListener('click', (event) => {
        event.stopPropagation();
        selectedIdRef.current = objectId;
        syncMarkerSelection(objectId, chipRenderers);
        onSelect?.(object);
    });

    const root = createRoot(anim);
    roots.push(root);

    const renderChip = () => {
        const progress = progressAtDate(object, mapDateRef.current);
        const selected = applySelectedState();
        root.render(
            <ObjectInfoChip
                category={inferObjectCategory(object.name)}
                name={object.name}
                progress={progress}
                selected={selected}
                status={buildStatusForProgress(progress)}
            />
        );
    };

    renderChip();
    chipRenderers.set(objectId, renderChip);
    markerElements.set(objectId, element);

    return element;
};

/** Класс is-selected на живых маркерах в DOM. */
const applySelectionClasses = (selectedId: string | null) => {
    const normalizedId = selectedId == null ? null : String(selectedId);

    document.querySelectorAll<HTMLElement>('.map-marker-root[data-object-id]').forEach((element) => {
        const objectId = element.dataset.objectId ?? '';
        element.classList.toggle('is-selected', objectId === normalizedId);
    });
};

/** Синхронизирует selected по живому DOM на карте + React-корням. */
const syncMarkerSelection = (
    selectedId: string | null,
    chipRenderers: Map<string, () => void>
) => {
    applySelectionClasses(selectedId);

    for (const renderChip of chipRenderers.values()) {
        renderChip();
    }
};

const prefersReducedMarkerMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const playMarkerEnter = (element: HTMLElement) => {
    const anim = element.querySelector<HTMLElement>('.map-marker-anim');
    if (!anim || prefersReducedMarkerMotion()) {
        return;
    }

    anim.classList.remove('map-marker-enter');
    void anim.offsetWidth;
    anim.classList.add('map-marker-enter');
    anim.addEventListener(
        'animationend',
        () => {
            anim.classList.remove('map-marker-enter');
        },
        { once: true }
    );
};

const registerLiveMarkers = (
    markerElements: Map<string, HTMLElement>,
    enterIds: Set<string> | null
) => {
    document
        .querySelectorAll<HTMLElement>('.map-marker-root[data-object-id]')
        .forEach((element) => {
            const objectId = element.dataset.objectId ?? '';
            if (!objectId) {
                return;
            }

            markerElements.set(objectId, element);

            if (!enterIds?.has(objectId)) {
                return;
            }

            playMarkerEnter(element);
            enterIds.delete(objectId);
        });
};

const findMarkerElement = (
    objectId: string,
    markerElements: Map<string, HTMLElement>
) =>
    markerElements.get(objectId) ??
    document.querySelector<HTMLElement>(
        `.map-marker-root[data-object-id="${CSS.escape(objectId)}"]`
    );

const spawnMarkerExitGhost = (
    source: HTMLElement,
    host: HTMLElement
) => {
    const sourceAnim = source.querySelector('.map-marker-anim');
    if (!sourceAnim) {
        return;
    }

    const sourceRect = source.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    const ghost = document.createElement('div');
    ghost.className = 'map-marker-exit-ghost';
    ghost.style.cssText = [
        'position:absolute',
        `left:${sourceRect.left - hostRect.left}px`,
        `top:${sourceRect.top - hostRect.top}px`,
        `width:${sourceRect.width}px`,
        'pointer-events:none',
        'z-index:6',
    ].join(';');

    const anim = sourceAnim.cloneNode(true) as HTMLElement;
    anim.className = 'map-marker-anim map-marker-exit';
    ghost.appendChild(anim);
    host.appendChild(ghost);

    window.setTimeout(() => {
        ghost.remove();
    }, MARKER_EXIT_MS);
};

const buildMapFeatures = (): Feature[] => {
    const features: Feature[] = [];

    for (const object of constructionObjects) {
        if (object.latitude === null || object.longitude === null) {
            continue;
        }

        features.push({
            type: 'Feature',
            id: object.id,
            geometry: {
                type: 'Point',
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
    mapDate: Date
) => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('ru');

    return features.filter((feature) => {
        const object = objectsById.get(String(feature.id));

        if (!object || !hasConstructionStartedAt(object, mapDate)) {
            return false;
        }

        if (category !== ObjectCategory.All && feature.properties?.category !== category) {
            return false;
        }

        if (!normalizedQuery) {
            return true;
        }

        const name = String(feature.properties?.name ?? '').toLocaleLowerCase('ru');
        return name.includes(normalizedQuery);
    });
};

type MapViewProps = {
    mode?: MapMode;
    category?: ObjectCategory;
    searchQuery?: string;
    mapDate?: Date;
    onObjectSelect?: (object: ConstructionObject) => void;
    selectedObject?: ConstructionObject | null;
    isochroneTime?: IsochroneTime | null;
    onIsochroneTimeChange?: (time: IsochroneTime) => void;
    onMapReady?: (map: YMap | null) => void;
};

export const MapView = ({
    mode = mapModes.objects,
    category = ObjectCategory.All,
    searchQuery = '',
    mapDate = DEFAULT_MAP_DATE,
    onObjectSelect,
    selectedObject,
    isochroneTime,
    onIsochroneTimeChange,
    onMapReady,
}: MapViewProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const markerGhostHostRef = useRef<HTMLDivElement>(null);
    const fieldCanvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const modeRef = useRef(mode);
    const categoryRef = useRef(category);
    const searchQueryRef = useRef(searchQuery);
    const mapDateRef = useRef(mapDate);
    const onObjectSelectRef = useRef(onObjectSelect);
    const selectedIdRef = useRef<string | null>(selectedObject?.id ?? null);
    const enterIdsRef = useRef<Set<string> | null>(null);
    const chipRenderersRef = useRef(new Map<string, () => void>());
    const markerElementsRef = useRef(new Map<string, HTMLElement>());
    const displayedFeaturesRef = useRef<Feature[]>([]);
    const coveragePoisRef = useRef<OsmPoi[]>(osmPois);
    const clipRingsRef = useRef<LngLat[][]>([]);
    const clustererRef = useRef<{
        update: (props: { features: Feature[] }) => void;
    } | null>(null);
    const mapRef = useRef<YMap | null>(null);
    const allFeaturesRef = useRef<Feature[]>([]);
    const isochroneFeatureRef = useRef<{
        update: (props: Record<string, unknown>) => void;
    } | null>(null);
    const isochroneCoordsRef = useRef<number[][] | null>(null);
    const isochroneAnimRef = useRef<number | null>(null);
    const YMapFeatureRef = useRef<unknown>(null);
    const redrawCoverageRef = useRef<(() => void) | null>(null);
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
    const [errorMessage, setErrorMessage] = useState<string | null>(
        apiKey ? null : 'Не задан NEXT_PUBLIC_YANDEX_MAPS_API_KEY'
    );

    modeRef.current = mode;
    categoryRef.current = category;
    searchQueryRef.current = searchQuery;
    mapDateRef.current = mapDate;
    onObjectSelectRef.current = onObjectSelect;
    selectedIdRef.current =
        selectedObject?.id == null ? null : String(selectedObject.id);
    coveragePoisRef.current = filterOsmPois(osmPois, category, searchQuery);

    // Обеспеченность сравнивается с нормативом по каждой категории, поэтому фильтр
    // категорий выбирает нормативы, а не подмножество POI: сузить набор объектов
    // означало бы показать дефицит там, где объект просто отфильтрован.
    const provisionPois = useMemo(
        () => groupPoisByCategory(filterOsmPois(osmPois, ObjectCategory.All, searchQuery)),
        [searchQuery]
    );
    const provisionPoisRef = useRef(provisionPois);

    useEffect(() => {
        provisionPoisRef.current = provisionPois;
        redrawCoverageRef.current?.();
    }, [provisionPois]);

    useEffect(() => {
        selectedIdRef.current =
            selectedObject?.id == null ? null : String(selectedObject.id);
        syncMarkerSelection(selectedIdRef.current, chipRenderersRef.current);
    }, [selectedObject]);

    // Кластеризатор часто пересоздаёт DOM без нашего update — ловим появление маркеров
    useEffect(() => {
        const host = markerGhostHostRef.current;
        if (!host) {
            return;
        }

        let frameId = 0;
        const observer = new MutationObserver((mutations) => {
            const hasMarkerChange = mutations.some((mutation) =>
                [...mutation.addedNodes, ...mutation.removedNodes].some((node) => {
                    if (!(node instanceof HTMLElement)) {
                        return false;
                    }
                    return (
                        node.classList.contains('map-marker-root') ||
                        Boolean(node.querySelector?.('.map-marker-root'))
                    );
                })
            );

            if (!hasMarkerChange) {
                return;
            }

            if (frameId !== 0) {
                return;
            }

            frameId = window.requestAnimationFrame(() => {
                frameId = 0;
                registerLiveMarkers(
                    markerElementsRef.current,
                    enterIdsRef.current,
                );
                // Только CSS-класс: полный renderChip здесь зациклил бы observer
                applySelectionClasses(selectedIdRef.current);
                const selectedId = selectedIdRef.current;
                if (selectedId) {
                    chipRenderersRef.current.get(selectedId)?.();
                }
            });
        });

        observer.observe(host, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            if (frameId !== 0) {
                window.cancelAnimationFrame(frameId);
            }
        };
    }, []);

    const { state: isochroneState, hasActiveIsochrone } = useIsochrone(
        isochroneTime != null ? (selectedObject?.longitude ?? null) : null,
        isochroneTime != null ? (selectedObject?.latitude ?? null) : null,
        selectedObject?.municipality,
        isochroneTime ?? undefined
    );

    useEffect(() => {
        const container = containerRef.current;

        if (!container || !apiKey) {
            return;
        }

        let isCancelled = false;
        let map: YMap | undefined;
        let redrawFrameId = 0;
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
                    YMapListener,
                } = api;

                YMapFeatureRef.current = YMapFeature;

                const [{ YMapClusterer }, theme] = await Promise.all([
                    api.import('@yandex/ymaps3-clusterer') as Promise<
                        typeof import('@yandex/ymaps3-clusterer')
                    >,
                    api.import('@yandex/ymaps3-default-ui-theme') as Promise<
                        typeof import('@yandex/ymaps3-default-ui-theme')
                    >,
                ]);

                const { YMapZoomControl, YMapGeolocationControl } = theme;

                if (isCancelled || !containerRef.current) {
                    return;
                }

                const oblastRings = tulaOblastBoundary.map(toLngLatRing);
                clipRingsRef.current = oblastRings;
                const oblastBounds = getBoundsFromCoordinates(oblastRings.flat());

                map = new YMap(containerRef.current, {
                    location: {
                        bounds: oblastBounds,
                    },
                    margin: [MAP_MARGIN, MAP_MARGIN, MAP_MARGIN, MAP_MARGIN],
                    camera: {
                        tilt: 0,
                        azimuth: 0,
                    },
                });
                mapRef.current = map;
                onMapReady?.(map);

                map.addChild(new YMapDefaultSchemeLayer({}))
                    .addChild(new YMapDefaultFeaturesLayer({}))
                    .addChild(new YMapFeatureDataSource({ id: CLUSTER_SOURCE }))
                    .addChild(
                        new YMapLayer({
                            source: CLUSTER_SOURCE,
                            type: 'markers',
                            zIndex: 1800,
                        })
                    );

                map.addChild(
                    new YMapFeature({
                        id: 'oblast-mask',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [WORLD_OUTER_RING, ...oblastRings],
                        },
                        style: {
                            fill: TULA_OBLAST_OUTSIDE_FILL,
                            fillRule: 'evenodd',
                            stroke: [],
                            simplificationRate: 0,
                            interactive: false,
                            zIndex: 0,
                        },
                    })
                );

                map.addChild(
                    new YMapFeature({
                        id: 'oblast-border',
                        geometry: {
                            type: 'Polygon',
                            coordinates: oblastRings,
                        },
                        style: {
                            fill: 'rgba(0,0,0,0)',
                            stroke: [
                                { width: 8, color: '#FFFFFF', opacity: 0.95 },
                                { width: 4, color: TULA_OBLAST_BORDER_COLOR },
                            ],
                            simplificationRate: 0,
                            interactive: false,
                            zIndex: 1,
                        },
                    })
                );

                const applyViewportRestriction = () => {
                    const currentMap = mapRef.current;
                    const container = containerRef.current;

                    if (!currentMap || !container) {
                        return;
                    }

                    const size = {
                        x: container.clientWidth || currentMap.size.x,
                        y: container.clientHeight || currentMap.size.y,
                    };

                    if (size.x <= 0 || size.y <= 0) {
                        return;
                    }

                    const { minZoom, restrictMapArea } = getViewportRestriction(
                        currentMap.projection,
                        oblastBounds,
                        size
                    );

                    currentMap.update({
                        zoomRange: { min: minZoom, max: MAP_MAX_ZOOM },
                        restrictMapArea,
                    });
                };

                applyViewportRestriction();

                map.addChild(
                    new YMapControls({ position: 'right' })
                        .addChild(new YMapZoomControl({}))
                        .addChild(new YMapGeolocationControl({}))
                );

                const objectsByIdLocal = objectsById;
                const allFeatures = buildMapFeatures();
                allFeaturesRef.current = allFeatures;
                chipRenderersRef.current.clear();
                markerElementsRef.current.clear();
                displayedFeaturesRef.current = [];

                const resolveClusterFeatures = () => {
                    if (isHeatmapMode(modeRef.current)) {
                        return [];
                    }

                    return filterMapFeatures(
                        allFeaturesRef.current,
                        categoryRef.current,
                        searchQueryRef.current,
                        mapDateRef.current
                    );
                };

                const features = resolveClusterFeatures();
                displayedFeaturesRef.current = features;

                const marker = (feature: Feature) => {
                    const object = objectsByIdLocal.get(String(feature.id));

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
                                selectedIdRef.current = String(object.id);
                                syncMarkerSelection(
                                    selectedIdRef.current,
                                    chipRenderersRef.current
                                );
                                onObjectSelectRef.current?.(object);
                            },
                        },
                        createObjectChipMarker(
                            object,
                            markerRoots,
                            mapDateRef,
                            selectedIdRef,
                            enterIdsRef,
                            chipRenderersRef.current,
                            markerElementsRef.current,
                            (selected) => {
                                if (map) {
                                    map.setLocation({
                                        center: [selected.longitude, selected.latitude] as LngLat,
                                        duration: 500,
                                    });
                                }
                                selectedIdRef.current = String(selected.id);
                                syncMarkerSelection(
                                    selectedIdRef.current,
                                    chipRenderersRef.current
                                );
                                onObjectSelectRef.current?.(selected);
                            }
                        )
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
                                        clusterFeatures.map((item) => item.geometry.coordinates)
                                    ),
                                    duration: 400,
                                });
                            },
                        },
                        createClusterElement(clusterFeatures.length)
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

                const syncCanvasSize = (
                    canvas: HTMLCanvasElement,
                    cssWidth: number,
                    cssHeight: number,
                    dpr: number
                ) => {
                    const nextWidth = Math.round(cssWidth * dpr);
                    const nextHeight = Math.round(cssHeight * dpr);

                    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
                        canvas.width = nextWidth;
                        canvas.height = nextHeight;
                        canvas.style.width = `${cssWidth}px`;
                        canvas.style.height = `${cssHeight}px`;
                    }
                };

                const redrawCoverage = () => {
                    const fieldCanvas = fieldCanvasRef.current;
                    const overlayCanvas = overlayCanvasRef.current;
                    const currentMap = mapRef.current;

                    if (!fieldCanvas || !overlayCanvas || !currentMap) {
                        return;
                    }

                    if (!isHeatmapMode(modeRef.current)) {
                        const fieldContext = fieldCanvas.getContext('2d');
                        const overlayContext = overlayCanvas.getContext('2d');
                        fieldContext?.clearRect(0, 0, fieldCanvas.width, fieldCanvas.height);
                        overlayContext?.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
                        fieldCanvas.style.opacity = '0';
                        overlayCanvas.style.opacity = '0';
                        return;
                    }

                    fieldCanvas.style.opacity = '1';
                    overlayCanvas.style.opacity = '1';

                    const size = currentMap.size;
                    const dpr = window.devicePixelRatio || 1;
                    const cssWidth = size.x;
                    const cssHeight = size.y;

                    syncCanvasSize(fieldCanvas, cssWidth, cssHeight, dpr);
                    syncCanvasSize(overlayCanvas, cssWidth, cssHeight, dpr);

                    const fieldCtx = fieldCanvas.getContext('2d');
                    const overlayCtx = overlayCanvas.getContext('2d');

                    if (!fieldCtx || !overlayCtx) {
                        return;
                    }

                    fieldCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
                    overlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

                    const renderState = {
                        center: [...currentMap.center] as LngLat,
                        zoom: currentMap.zoom,
                        width: cssWidth,
                        height: cssHeight,
                        projection: currentMap.projection,
                    };

                    if (modeRef.current === mapModes.provision) {
                        const field = computeProvisionField(
                            populationHexes,
                            provisionPoisRef.current,
                            categoryRef.current,
                            renderState
                        );

                        if (field) {
                            drawProvisionHeatmap(
                                fieldCtx,
                                overlayCtx,
                                field,
                                clipRingsRef.current,
                                renderState
                            );
                        }

                        return;
                    }

                    const pois = coveragePoisRef.current;
                    const filterShare = osmPois.length > 0 ? pois.length / osmPois.length : 1;

                    drawCoverageHeatmap(fieldCtx, overlayCtx, pois, clipRingsRef.current, {
                        ...renderState,
                        filterShare,
                    });
                };

                const scheduleRedraw = () => {
                    if (redrawFrameId !== 0) {
                        return;
                    }

                    redrawFrameId = window.requestAnimationFrame(() => {
                        redrawFrameId = 0;
                        redrawCoverage();
                    });
                };

                redrawCoverageRef.current = redrawCoverage;

                map.addChild(
                    new YMapListener({
                        onUpdate() {
                            scheduleRedraw();
                        },
                        onResize() {
                            applyViewportRestriction();
                            scheduleRedraw();
                        },
                    })
                );

                redrawCoverage();
            } catch (error) {
                if (!isCancelled) {
                    setErrorMessage(
                        error instanceof Error ? error.message : 'Не удалось загрузить карту'
                    );
                }
            }
        };

        void setupMap();

        return () => {
            isCancelled = true;
            if (redrawFrameId !== 0) {
                window.cancelAnimationFrame(redrawFrameId);
            }
            clustererRef.current = null;
            mapRef.current = null;
            onMapReady?.(null);
            redrawCoverageRef.current = null;
            markerRoots.forEach((root) => {
                root.unmount();
            });
            map?.destroy();
        };
    }, [apiKey]);

    useEffect(() => {
        const clusterer = clustererRef.current;
        const ghostHost = markerGhostHostRef.current;
        if (!clusterer || allFeaturesRef.current.length === 0) {
            return;
        }

        mapDateRef.current = mapDate;

        for (const renderChip of chipRenderersRef.current.values()) {
            renderChip();
        }

        const nextFeatures = isHeatmapMode(mode)
            ? []
            : filterMapFeatures(
                  allFeaturesRef.current,
                  category,
                  searchQuery,
                  mapDate
              );

        const previous = displayedFeaturesRef.current;
        const previousIds = new Set(previous.map((feature) => String(feature.id)));
        const nextIds = new Set(nextFeatures.map((feature) => String(feature.id)));
        const removed = previous.filter(
            (feature) => !nextIds.has(String(feature.id))
        );
        const addedIds = new Set(
            nextFeatures
                .map((feature) => String(feature.id))
                .filter((id) => !previousIds.has(id))
        );

        if (!prefersReducedMarkerMotion() && ghostHost && removed.length > 0) {
            for (const feature of removed) {
                const element = findMarkerElement(
                    String(feature.id),
                    markerElementsRef.current,
                );
                if (element) {
                    spawnMarkerExitGhost(element, ghostHost);
                }
            }
        }

        // Popup только у реально новых объектов, не у тех, что уже были на карте
        enterIdsRef.current = addedIds;
        clusterer.update({ features: nextFeatures });
        displayedFeaturesRef.current = nextFeatures;

        for (const objectId of [...markerElementsRef.current.keys()]) {
            if (!nextIds.has(objectId)) {
                markerElementsRef.current.delete(objectId);
                chipRenderersRef.current.delete(objectId);
            }
        }

        registerLiveMarkers(markerElementsRef.current, addedIds);

        // Кластеризатор мог пересоздать DOM — заново навешиваем selected и попап
        syncMarkerSelection(selectedIdRef.current, chipRenderersRef.current);
        window.requestAnimationFrame(() => {
            registerLiveMarkers(markerElementsRef.current, enterIdsRef.current);
            syncMarkerSelection(selectedIdRef.current, chipRenderersRef.current);
        });

        redrawCoverageRef.current?.();
    }, [category, searchQuery, mode, mapDate]);

    // ---- Isochrone feature management ----
    useEffect(() => {
        const stopAnim = () => {
            if (isochroneAnimRef.current != null) {
                cancelAnimationFrame(isochroneAnimRef.current);
                isochroneAnimRef.current = null;
            }
        };

        const map = mapRef.current;
        const YMapFeatureCtor = YMapFeatureRef.current as
            | (new (props: Record<string, unknown>) => {
                  update: (props: Record<string, unknown>) => void;
              })
            | null;

        const clearFeature = () => {
            stopAnim();
            if (map && isochroneFeatureRef.current) {
                map.removeChild(isochroneFeatureRef.current as never);
                isochroneFeatureRef.current = null;
            }
            isochroneCoordsRef.current = null;
        };

        if (!map || !YMapFeatureCtor) {
            return;
        }

        const readyCoords =
            isochroneState.status === 'ready'
                ? isochroneState.data.coordinates
                : null;
        const visibleCoords =
            readyCoords ??
            (isochroneState.status === 'loading' || isochroneState.status === 'error'
                ? isochroneState.data?.coordinates
                : null) ??
            null;

        if (isochroneTime == null || (!readyCoords && !isochroneCoordsRef.current && !visibleCoords)) {
            clearFeature();
            return;
        }

        const applyGeometry = (
            ring: number[][],
            fillOpacity = 0.25,
            strokeOpacity = 0.8,
        ) => {
            const geometry = {
                type: 'Polygon',
                coordinates: [ring],
            };
            const style = {
                fill: isochroneFill(fillOpacity),
                stroke: isochroneStroke(strokeOpacity),
                simplificationRate: 0,
                interactive: false,
                zIndex: 2,
            };

            if (isochroneFeatureRef.current) {
                isochroneFeatureRef.current.update({ geometry, style });
                return;
            }

            const feature = new YMapFeatureCtor({
                id: 'isochrone-zone',
                geometry,
                style,
            });
            map.addChild(feature as never);
            isochroneFeatureRef.current = feature;
        };

        if (isochroneState.status === 'loading' && isochroneCoordsRef.current) {
            return;
        }

        if (!readyCoords) {
            if (visibleCoords && !isochroneFeatureRef.current) {
                applyGeometry(visibleCoords);
                isochroneCoordsRef.current = visibleCoords;
            }
            return;
        }

        const previous = isochroneCoordsRef.current;
        if (previous === readyCoords) {
            return;
        }

        stopAnim();

        if (!previous) {
            const startedAt = performance.now();
            const durationMs = 280;
            const tick = (now: number) => {
                const progress = Math.min(1, (now - startedAt) / durationMs);
                const eased = easeInOutCubic(progress);
                applyGeometry(readyCoords, 0.25 * eased, 0.8 * eased);
                if (progress < 1) {
                    isochroneAnimRef.current = requestAnimationFrame(tick);
                    return;
                }
                isochroneAnimRef.current = null;
                isochroneCoordsRef.current = readyCoords;
            };
            isochroneAnimRef.current = requestAnimationFrame(tick);
            return () => stopAnim();
        }

        const startedAt = performance.now();
        const durationMs = 450;
        const tick = (now: number) => {
            const progress = Math.min(1, (now - startedAt) / durationMs);
            const eased = easeInOutCubic(progress);
            applyGeometry(morphRings(previous, readyCoords, eased));
            if (progress < 1) {
                isochroneAnimRef.current = requestAnimationFrame(tick);
                return;
            }
            isochroneAnimRef.current = null;
            applyGeometry(readyCoords);
            isochroneCoordsRef.current = readyCoords;
        };
        isochroneAnimRef.current = requestAnimationFrame(tick);

        return () => stopAnim();
    }, [isochroneState, isochroneTime]);

    if (errorMessage) {
        return (
            <div className="flex h-dvh w-full items-center justify-center p-6 text-center text-sm text-zinc-600">
                {errorMessage}
            </div>
        );
    }

    return (
        <div className="relative z-0 h-dvh w-full" ref={markerGhostHostRef}>
            <div ref={containerRef} className="h-dvh w-full" />
            <canvas
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[5]"
                ref={fieldCanvasRef}
                style={{
                    mixBlendMode: 'multiply',
                    opacity: isHeatmapMode(mode) ? 1 : 0,
                }}
            />
            <canvas
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[6]"
                ref={overlayCanvasRef}
                style={{ opacity: isHeatmapMode(mode) ? 1 : 0 }}
            />
            {hasActiveIsochrone && isochroneTime != null ? (
                <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex w-full flex-col items-stretch gap-sm px-margin pb-safe md:px-margin-desktop md:pb-lg">
                    <div className="flex justify-center">
                        <MapHint>
                            Выберите время, чтобы изменить радиус зоны доступности
                        </MapHint>
                    </div>
                    <IsochroneTimeSelector
                        selectedTime={isochroneTime}
                        onTimeChange={onIsochroneTimeChange ?? (() => {})}
                    />
                    {isochroneState.status === 'error' && !isochroneState.data ? (
                        <p className="text-center type-body-sm text-on-surface-variant">
                            {isochroneState.message}
                        </p>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
};

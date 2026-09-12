import type { LngLat } from "@yandex/ymaps3-types";
import { ObjectCategory } from "@/data/object-categories";
import type { OsmPoi, OsmPoiCategory } from "@/data/osm-pois";
import type { PopulationHex } from "@/data/population-grid";
import {
  PROVISION_DEMAND_FLOOR,
  PROVISION_REQUIRED_FLOOR,
  provisionCategoriesFor,
  provisionNorms,
} from "@/data/provision-norms";
import {
  applyClipPath,
  ensureCanvas,
  metersPerPixelAt,
  strokeClipBorder,
  type CoverageRenderState,
} from "@/lib/coverage-heatmap";
import {
  PROVISION_STATE_EMPTY,
  PROVISION_STATE_NOT_REQUIRED,
  provisionFieldOpacity,
  provisionIsolineOpacity,
  provisionIsolineStateColors,
  provisionStateColors,
  provisionStateForRatio,
  type Rgb,
} from "@/lib/provision-scale";

/** Поле считается в буфере пониженного разрешения: пять категорий за кадр. */
export const PROVISION_BUFFER_SCALE = 6;

/**
 * На обзорных масштабах нормативные 500-1500 м занимают единицы пикселей, и поле
 * рассыпается в точки. Поэтому ядро не может быть мельче этого размера на экране:
 * оба поля растут синхронно, так что обеспеченность просто усредняется по большей
 * окрестности — для обзора области это корректно.
 */
const MIN_KERNEL_CSS_PX = 18;

/** Нормировка конусного ядра: при K(d) = 3(1 - d/r) интеграл равен πr². */
const CONE_KERNEL_NORMALIZATION = 3;

type ProvisionField = {
  width: number;
  height: number;
  states: Uint8Array;
  /** Индекс лимитирующей категории в `categories`. */
  limiting: Uint8Array;
  categories: OsmPoiCategory[];
};

type Buffers = {
  width: number;
  height: number;
  demand: Float32Array;
  supply: Float32Array;
  /** Населённость по самому широкому из применённых радиусов. */
  maxDemand: Float32Array;
  ratio: Float32Array;
  states: Uint8Array;
  limiting: Uint8Array;
};

/** Экранные позиции гексов: считаются один раз на кадр и переиспользуются категориями. */
type ProjectedHexes = {
  x: Float64Array;
  y: Float64Array;
  population: Float64Array;
};

let buffers: Buffers | null = null;
let projectedHexes: ProjectedHexes | null = null;
let fillCanvas: HTMLCanvasElement | null = null;
let lineCanvas: HTMLCanvasElement | null = null;

const ensureProjectedHexes = (count: number): ProjectedHexes => {
  if (projectedHexes && projectedHexes.x.length === count) {
    return projectedHexes;
  }

  projectedHexes = {
    x: new Float64Array(count),
    y: new Float64Array(count),
    population: new Float64Array(count),
  };

  return projectedHexes;
};

/**
 * lngLatToScreen заново проецирует центр карты на каждом вызове, что при десятках
 * тысяч точек за кадр заметно. Здесь центр считается один раз и переиспользуется.
 */
const createScreenProjector = (state: CoverageRenderState) => {
  const worldSize = 2 ** (state.zoom + 8);
  const centerWorld = state.projection.toWorldCoordinates(state.center);
  const centerX = ((centerWorld.x + 1) / 2) * worldSize;
  const centerY = ((1 - centerWorld.y) / 2) * worldSize;
  const offsetX = state.width / 2 - centerX;
  const offsetY = state.height / 2 - centerY;

  return (longitude: number, latitude: number) => {
    const world = state.projection.toWorldCoordinates([longitude, latitude]);

    return {
      x: ((world.x + 1) / 2) * worldSize + offsetX,
      y: ((1 - world.y) / 2) * worldSize + offsetY,
    };
  };
};

const ensureBuffers = (width: number, height: number): Buffers => {
  if (buffers && buffers.width === width && buffers.height === height) {
    return buffers;
  }

  const size = width * height;
  buffers = {
    width,
    height,
    demand: new Float32Array(size),
    supply: new Float32Array(size),
    maxDemand: new Float32Array(size),
    ratio: new Float32Array(size),
    states: new Uint8Array(size),
    limiting: new Uint8Array(size),
  };

  return buffers;
};

const splatCone = (
  field: Float32Array,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  radiusPx: number,
  weight: number,
) => {
  const minX = Math.max(0, Math.ceil(centerX - radiusPx));
  const maxX = Math.min(width - 1, Math.floor(centerX + radiusPx));
  const minY = Math.max(0, Math.ceil(centerY - radiusPx));
  const maxY = Math.min(height - 1, Math.floor(centerY + radiusPx));

  if (minX > maxX || minY > maxY) {
    return;
  }

  const invRadius = 1 / radiusPx;
  const peak = weight * CONE_KERNEL_NORMALIZATION;

  for (let y = minY; y <= maxY; y += 1) {
    const dy = y + 0.5 - centerY;
    const rowOffset = y * width;

    for (let x = minX; x <= maxX; x += 1) {
      const dx = x + 0.5 - centerX;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance >= radiusPx) {
        continue;
      }

      field[rowOffset + x] += peak * (1 - distance * invRadius);
    }
  }
};

const resolveRadiusPx = (
  norm: { serviceRadiusMeters: number },
  state: CoverageRenderState,
  bufferScale: number,
) => {
  const metersPerPixel = metersPerPixelAt(state.center[1], state.zoom);
  const cssPx =
    Number.isFinite(metersPerPixel) && metersPerPixel > 0
      ? norm.serviceRadiusMeters / metersPerPixel
      : MIN_KERNEL_CSS_PX;

  return Math.max(MIN_KERNEL_CSS_PX, cssPx) * bufferScale;
};

export const computeProvisionField = (
  populationHexes: PopulationHex[],
  poisByCategory: Map<OsmPoiCategory, OsmPoi[]>,
  category: ObjectCategory,
  state: CoverageRenderState,
): ProvisionField | null => {
  const width = Math.max(1, Math.ceil(state.width / PROVISION_BUFFER_SCALE));
  const height = Math.max(1, Math.ceil(state.height / PROVISION_BUFFER_SCALE));
  const bufferScale = width / state.width;
  const categories = provisionCategoriesFor(category);

  if (categories.length === 0) {
    return null;
  }

  const { demand, supply, maxDemand, ratio, states, limiting } = ensureBuffers(width, height);
  const size = width * height;

  ratio.fill(Infinity);
  limiting.fill(0);
  states.fill(PROVISION_STATE_EMPTY);
  // Безлюдной территорию признаём только если её не видит даже самый широкий норматив.
  maxDemand.fill(0);

  const toScreen = createScreenProjector(state);
  const hexes = ensureProjectedHexes(populationHexes.length);

  for (let index = 0; index < populationHexes.length; index += 1) {
    const [longitude, latitude, population] = populationHexes[index];
    const screen = toScreen(longitude, latitude);
    hexes.x[index] = screen.x * bufferScale;
    hexes.y[index] = screen.y * bufferScale;
    hexes.population[index] = population;
  }

  categories.forEach((activeCategory, categoryIndex) => {
    const norm = provisionNorms[activeCategory];
    const radiusPx = resolveRadiusPx(norm, state, bufferScale);
    const padding = radiusPx + 2;

    demand.fill(0);
    supply.fill(0);

    for (let index = 0; index < hexes.x.length; index += 1) {
      const x = hexes.x[index];
      const y = hexes.y[index];

      if (x < -padding || y < -padding || x > width + padding || y > height + padding) {
        continue;
      }

      splatCone(demand, width, height, x, y, radiusPx, hexes.population[index]);
    }

    for (const poi of poisByCategory.get(activeCategory) ?? []) {
      const screen = toScreen(poi.longitude, poi.latitude);
      const x = screen.x * bufferScale;
      const y = screen.y * bufferScale;

      if (x < -padding || y < -padding || x > width + padding || y > height + padding) {
        continue;
      }

      splatCone(supply, width, height, x, y, radiusPx, 1);
    }

    for (let index = 0; index < size; index += 1) {
      const demandValue = demand[index];

      if (demandValue > maxDemand[index]) {
        maxDemand[index] = demandValue;
      }

      const required = demandValue / norm.peoplePerUnit;

      if (required < PROVISION_REQUIRED_FLOOR) {
        continue;
      }

      const categoryRatio = supply[index] / required;

      if (categoryRatio < ratio[index]) {
        ratio[index] = categoryRatio;
        limiting[index] = categoryIndex;
      }
    }
  });

  for (let index = 0; index < size; index += 1) {
    if (maxDemand[index] < PROVISION_DEMAND_FLOOR) {
      states[index] = PROVISION_STATE_EMPTY;
      continue;
    }

    const value = ratio[index];
    states[index] =
      value === Infinity ? PROVISION_STATE_NOT_REQUIRED : provisionStateForRatio(value);
  }

  return { width, height, states, limiting, categories };
};

const packRgba = (color: Rgb) => (255 << 24) | (color.b << 16) | (color.g << 8) | color.r;

const buildStateLut = (colors: Rgb[]) => {
  const lut = new Uint32Array(colors.length);

  for (let index = 0; index < colors.length; index += 1) {
    lut[index] = packRgba(colors[index]);
  }

  return lut;
};

const FILL_LUT = buildStateLut(provisionStateColors);
const LINE_LUT = buildStateLut(provisionIsolineStateColors);

const colorizeStates = (field: ProvisionField, fillData: ImageData, lineData: ImageData) => {
  const { width, height, states } = field;
  const fillView = new Uint32Array(fillData.data.buffer);
  const lineView = new Uint32Array(lineData.data.buffer);

  for (let index = 0; index < width * height; index += 1) {
    fillView[index] = FILL_LUT[states[index]];
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const state = states[index];
      const isEdge =
        (x + 1 < width && states[index + 1] !== state) ||
        (y + 1 < height && states[index + width] !== state);

      lineView[index] = isEdge ? LINE_LUT[state] : 0;
    }
  }
};

export const drawProvisionHeatmap = (
  fieldCtx: CanvasRenderingContext2D,
  overlayCtx: CanvasRenderingContext2D,
  field: ProvisionField,
  clipRings: LngLat[][],
  state: CoverageRenderState,
) => {
  const { width, height, zoom } = state;

  fieldCtx.clearRect(0, 0, width, height);
  overlayCtx.clearRect(0, 0, width, height);

  if (width <= 0 || height <= 0) {
    return;
  }

  fillCanvas = ensureCanvas(fillCanvas, field.width, field.height);
  lineCanvas = ensureCanvas(lineCanvas, field.width, field.height);

  const fillCtx = fillCanvas.getContext("2d");
  const lineCtx = lineCanvas.getContext("2d");

  if (!fillCtx || !lineCtx) {
    return;
  }

  const fillData = fillCtx.createImageData(field.width, field.height);
  const lineData = lineCtx.createImageData(field.width, field.height);
  colorizeStates(field, fillData, lineData);
  fillCtx.putImageData(fillData, 0, 0);
  lineCtx.putImageData(lineData, 0, 0);

  fieldCtx.save();
  applyClipPath(fieldCtx, clipRings, state);
  fieldCtx.globalAlpha = provisionFieldOpacity(zoom);
  fieldCtx.imageSmoothingEnabled = true;
  fieldCtx.imageSmoothingQuality = "high";
  fieldCtx.drawImage(fillCanvas, 0, 0, width, height);
  fieldCtx.restore();

  const isolineOpacity = provisionIsolineOpacity(zoom);

  overlayCtx.save();
  applyClipPath(overlayCtx, clipRings, state);

  if (isolineOpacity > 0.01) {
    overlayCtx.globalAlpha = isolineOpacity;
    overlayCtx.imageSmoothingEnabled = true;
    overlayCtx.imageSmoothingQuality = "high";
    overlayCtx.drawImage(lineCanvas, 0, 0, width, height);
  }

  overlayCtx.restore();
  strokeClipBorder(overlayCtx, clipRings, state);
};

export const groupPoisByCategory = (pois: OsmPoi[]): Map<OsmPoiCategory, OsmPoi[]> => {
  const grouped = new Map<OsmPoiCategory, OsmPoi[]>();

  for (const poi of pois) {
    const list = grouped.get(poi.category);

    if (list) {
      list.push(poi);
      continue;
    }

    grouped.set(poi.category, [poi]);
  }

  return grouped;
};

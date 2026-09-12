import type { LngLat, Projection } from "@yandex/ymaps3-types";
import type { OsmPoi, OsmPoiCategory } from "@/data/osm-pois";
import {
  coverageAlphaToLevel,
  coverageBandColors,
  coverageDotColorByCategory,
  coverageDotStyle,
  coverageFieldOpacity,
  coverageIsolineBandColors,
  coverageIsolineOpacity,
  coverageRadiusMeters,
  coverageTargetDensity,
  type Rgb,
} from "@/lib/coverage-scale";

export const COVERAGE_BUFFER_SCALE = 4;
export const COVERAGE_BORDER_COLOR = "#B84A39";

type WorldPoint = { x: number; y: number };

export type CoveragePoint = {
  longitude: number;
  latitude: number;
  category?: OsmPoiCategory;
};

export type CoverageRenderState = {
  center: LngLat;
  zoom: number;
  width: number;
  height: number;
  projection: Projection;
  filterShare?: number;
};

type KernelCache = {
  radiusPx: number;
  peakAlpha: number;
  canvas: HTMLCanvasElement;
};

let kernelCache: KernelCache | null = null;
let densityBuffer: HTMLCanvasElement | null = null;
let fillBuffer: HTMLCanvasElement | null = null;
let lineBuffer: HTMLCanvasElement | null = null;

export const metersPerPixelAt = (latitude: number, zoom: number) =>
  (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / 2 ** zoom;

const worldToPixel = (world: WorldPoint, zoom: number) => {
  const worldSize = 2 ** (zoom + 8);

  return {
    x: ((world.x + 1) / 2) * worldSize,
    y: ((1 - world.y) / 2) * worldSize,
  };
};

export const lngLatToScreen = (
  lngLat: LngLat,
  state: CoverageRenderState,
): { x: number; y: number } => {
  const world = state.projection.toWorldCoordinates(lngLat);
  const centerWorld = state.projection.toWorldCoordinates(state.center);
  const point = worldToPixel(world, state.zoom);
  const center = worldToPixel(centerWorld, state.zoom);

  return {
    x: point.x - center.x + state.width / 2,
    y: point.y - center.y + state.height / 2,
  };
};

export const ensureCanvas = (
  canvas: HTMLCanvasElement | null,
  width: number,
  height: number,
): HTMLCanvasElement => {
  const next = canvas ?? document.createElement("canvas");

  if (next.width !== width || next.height !== height) {
    next.width = width;
    next.height = height;
  }

  return next;
};

const packRgba = (color: Rgb, alpha: number) =>
  (alpha << 24) | (color.b << 16) | (color.g << 8) | color.r;

const buildLevelLuts = () => {
  const fillLut = new Uint32Array(256);
  const lineLut = new Uint32Array(256);
  const levelByAlpha = new Uint8Array(256);

  for (let alpha = 0; alpha < 256; alpha += 1) {
    const level = coverageAlphaToLevel(alpha, 255);
    levelByAlpha[alpha] = level;
    fillLut[alpha] = packRgba(coverageBandColors[level], 255);
    lineLut[alpha] = packRgba(coverageIsolineBandColors[level], 255);
  }

  return { fillLut, lineLut, levelByAlpha };
};

const LEVEL_LUTS = buildLevelLuts();

const coneKernelAreaKm2 = (radiusKm: number) => (Math.PI * radiusKm * radiusKm) / 3;

const getKernelSprite = (radiusPx: number, peakAlpha: number): HTMLCanvasElement => {
  const roundedRadius = Math.max(1, Math.round(radiusPx));
  const roundedPeak = Math.max(1, Math.min(255, Math.round(peakAlpha)));

  if (
    kernelCache &&
    kernelCache.radiusPx === roundedRadius &&
    kernelCache.peakAlpha === roundedPeak
  ) {
    return kernelCache.canvas;
  }

  const size = roundedRadius * 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return canvas;
  }

  const image = ctx.createImageData(size, size);
  const data = image.data;
  const cx = roundedRadius;
  const cy = roundedRadius;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance >= roundedRadius) {
        continue;
      }

      const t = 1 - distance / roundedRadius;
      const alpha = Math.max(1, Math.round(roundedPeak * t));
      const offset = (y * size + x) * 4;
      data[offset] = 255;
      data[offset + 1] = 255;
      data[offset + 2] = 255;
      data[offset + 3] = alpha;
    }
  }

  ctx.putImageData(image, 0, 0);
  kernelCache = {
    radiusPx: roundedRadius,
    peakAlpha: roundedPeak,
    canvas,
  };

  return canvas;
};

export const applyClipPath = (
  ctx: CanvasRenderingContext2D,
  clipRings: LngLat[][],
  state: CoverageRenderState,
) => {
  if (clipRings.length === 0) {
    return;
  }

  ctx.beginPath();

  for (const ring of clipRings) {
    if (ring.length < 3) {
      continue;
    }

    const first = lngLatToScreen(ring[0], state);
    ctx.moveTo(first.x, first.y);

    for (let index = 1; index < ring.length; index += 1) {
      const screen = lngLatToScreen(ring[index], state);
      ctx.lineTo(screen.x, screen.y);
    }

    ctx.closePath();
  }

  ctx.clip();
};

export const strokeClipBorder = (
  ctx: CanvasRenderingContext2D,
  clipRings: LngLat[][],
  state: CoverageRenderState,
) => {
  if (clipRings.length === 0) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = COVERAGE_BORDER_COLOR;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.beginPath();

  for (const ring of clipRings) {
    if (ring.length < 3) {
      continue;
    }

    const first = lngLatToScreen(ring[0], state);
    ctx.moveTo(first.x, first.y);

    for (let index = 1; index < ring.length; index += 1) {
      const screen = lngLatToScreen(ring[index], state);
      ctx.lineTo(screen.x, screen.y);
    }

    ctx.closePath();
  }

  ctx.stroke();
  ctx.restore();
};

const colorizeDensity = (
  densityData: ImageData,
  fillData: ImageData,
  lineData: ImageData,
) => {
  const source = densityData.data;
  const fill = fillData.data;
  const line = lineData.data;
  const width = densityData.width;
  const height = densityData.height;
  const { fillLut, lineLut, levelByAlpha } = LEVEL_LUTS;
  const fillView = new Uint32Array(fill.buffer);
  const lineView = new Uint32Array(line.buffer);

  for (let index = 0; index < width * height; index += 1) {
    const alpha = source[index * 4 + 3];
    fillView[index] = fillLut[alpha];
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const alpha = source[index * 4 + 3];
      const level = levelByAlpha[alpha];
      let isEdge = false;

      if (x + 1 < width) {
        const rightAlpha = source[(index + 1) * 4 + 3];
        if (levelByAlpha[rightAlpha] !== level) {
          isEdge = true;
        }
      }

      if (!isEdge && y + 1 < height) {
        const belowAlpha = source[(index + width) * 4 + 3];
        if (levelByAlpha[belowAlpha] !== level) {
          isEdge = true;
        }
      }

      lineView[index] = isEdge ? lineLut[alpha] : 0;
    }
  }
};

export const drawCoverageHeatmap = (
  fieldCtx: CanvasRenderingContext2D,
  overlayCtx: CanvasRenderingContext2D,
  points: CoveragePoint[],
  clipRings: LngLat[][],
  state: CoverageRenderState,
) => {
  const { width, height, zoom } = state;

  fieldCtx.clearRect(0, 0, width, height);
  overlayCtx.clearRect(0, 0, width, height);

  if (width <= 0 || height <= 0) {
    return;
  }

  const sampleLat = state.center[1];
  const radiusMeters = coverageRadiusMeters(zoom);
  const metersPerPixel = metersPerPixelAt(sampleLat, zoom);
  const radiusCssPx =
    Number.isFinite(metersPerPixel) && metersPerPixel > 0
      ? radiusMeters / metersPerPixel
      : 14;
  const bufferWidth = Math.max(1, Math.ceil(width / COVERAGE_BUFFER_SCALE));
  const bufferHeight = Math.max(1, Math.ceil(height / COVERAGE_BUFFER_SCALE));
  const bufferScaleX = bufferWidth / width;
  const bufferScaleY = bufferHeight / height;
  const radiusBufferPx = Math.max(
    1,
    (radiusCssPx * (bufferScaleX + bufferScaleY)) / 2,
  );

  const filterShare = state.filterShare ?? 1;
  const targetDensity = coverageTargetDensity(zoom, filterShare);
  const radiusKm = radiusMeters / 1000;
  const expectedStack = Math.max(
    1,
    targetDensity * coneKernelAreaKm2(radiusKm),
  );
  const peakAlpha = Math.max(1, Math.min(255, Math.round(255 / expectedStack)));
  const sprite = getKernelSprite(radiusBufferPx, peakAlpha);

  densityBuffer = ensureCanvas(densityBuffer, bufferWidth, bufferHeight);
  fillBuffer = ensureCanvas(fillBuffer, bufferWidth, bufferHeight);
  lineBuffer = ensureCanvas(lineBuffer, bufferWidth, bufferHeight);

  const densityCtx = densityBuffer.getContext("2d", { willReadFrequently: true });
  const fillBufCtx = fillBuffer.getContext("2d");
  const lineBufCtx = lineBuffer.getContext("2d");

  if (!densityCtx || !fillBufCtx || !lineBufCtx) {
    return;
  }

  densityCtx.setTransform(1, 0, 0, 1, 0, 0);
  densityCtx.clearRect(0, 0, bufferWidth, bufferHeight);
  densityCtx.globalCompositeOperation = "lighter";

  const spriteSize = sprite.width;
  const halfSprite = spriteSize / 2;
  const bufferPad = radiusBufferPx + 2;

  for (const point of points) {
    const screen = lngLatToScreen([point.longitude, point.latitude], state);
    const bx = screen.x * bufferScaleX;
    const by = screen.y * bufferScaleY;

    if (
      bx < -bufferPad ||
      by < -bufferPad ||
      bx > bufferWidth + bufferPad ||
      by > bufferHeight + bufferPad
    ) {
      continue;
    }

    densityCtx.drawImage(sprite, bx - halfSprite, by - halfSprite);
  }

  densityCtx.globalCompositeOperation = "source-over";

  const densityData = densityCtx.getImageData(0, 0, bufferWidth, bufferHeight);
  const fillData = fillBufCtx.createImageData(bufferWidth, bufferHeight);
  const lineData = lineBufCtx.createImageData(bufferWidth, bufferHeight);
  colorizeDensity(densityData, fillData, lineData);
  fillBufCtx.putImageData(fillData, 0, 0);
  lineBufCtx.putImageData(lineData, 0, 0);

  const fieldOpacity = coverageFieldOpacity(zoom);
  const isolineOpacity = coverageIsolineOpacity(zoom);

  fieldCtx.save();
  applyClipPath(fieldCtx, clipRings, state);
  fieldCtx.globalAlpha = fieldOpacity;
  fieldCtx.imageSmoothingEnabled = true;
  fieldCtx.imageSmoothingQuality = "high";
  fieldCtx.drawImage(fillBuffer, 0, 0, width, height);
  fieldCtx.restore();

  overlayCtx.save();
  applyClipPath(overlayCtx, clipRings, state);

  if (isolineOpacity > 0.01) {
    overlayCtx.globalAlpha = isolineOpacity;
    overlayCtx.imageSmoothingEnabled = true;
    overlayCtx.imageSmoothingQuality = "high";
    overlayCtx.drawImage(lineBuffer, 0, 0, width, height);
  }

  overlayCtx.restore();

  strokeClipBorder(overlayCtx, clipRings, state);

  drawCoveragePoints(overlayCtx, points, state);
};

export const drawCoveragePoints = (
  ctx: CanvasRenderingContext2D,
  points: CoveragePoint[],
  state: CoverageRenderState,
) => {
  if (points.length === 0) {
    return;
  }

  const { radiusPx, opacity } = coverageDotStyle(state.zoom);
  const groups = new Map<string, CoveragePoint[]>();

  for (const point of points) {
    const key = point.category ?? "infrastructure";
    const list = groups.get(key);

    if (list) {
      list.push(point);
      continue;
    }

    groups.set(key, [point]);
  }

  ctx.save();
  ctx.globalAlpha = opacity;

  for (const [category, group] of groups) {
    const color =
      coverageDotColorByCategory[category as OsmPoiCategory] ?? "#983224";
    ctx.fillStyle = color;
    ctx.beginPath();

    for (const point of group) {
      const screen = lngLatToScreen([point.longitude, point.latitude], state);

      if (
        screen.x < -radiusPx ||
        screen.y < -radiusPx ||
        screen.x > state.width + radiusPx ||
        screen.y > state.height + radiusPx
      ) {
        continue;
      }

      ctx.moveTo(screen.x + radiusPx, screen.y);
      ctx.arc(screen.x, screen.y, radiusPx, 0, Math.PI * 2);
    }

    ctx.fill();
  }

  if (state.zoom >= 13) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (const point of points) {
      const screen = lngLatToScreen([point.longitude, point.latitude], state);

      if (
        screen.x < -radiusPx ||
        screen.y < -radiusPx ||
        screen.x > state.width + radiusPx ||
        screen.y > state.height + radiusPx
      ) {
        continue;
      }

      ctx.moveTo(screen.x + radiusPx, screen.y);
      ctx.arc(screen.x, screen.y, radiusPx, 0, Math.PI * 2);
    }

    ctx.stroke();
  }

  ctx.restore();
};

export const toCoveragePoints = (pois: OsmPoi[]): CoveragePoint[] =>
  pois.map((poi) => ({
    longitude: poi.longitude,
    latitude: poi.latitude,
    category: poi.category,
  }));

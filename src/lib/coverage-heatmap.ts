import type { LngLat, Projection } from "@yandex/ymaps3-types";

export const COVERAGE_RADIUS_METERS = 1000;
export const COVERAGE_MIN_RADIUS_PX = 14;
export const COVERAGE_SUCCESS_RGB = { r: 61, g: 122, b: 69 } as const;

type WorldPoint = { x: number; y: number };

export type CoveragePoint = {
  longitude: number;
  latitude: number;
};

export type CoverageRenderState = {
  center: LngLat;
  zoom: number;
  width: number;
  height: number;
  projection: Projection;
};

const metersPerPixelAt = (latitude: number, zoom: number) =>
  (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / 2 ** zoom;

export const coverageRadiusPx = (latitude: number, zoom: number) => {
  const metersPerPixel = metersPerPixelAt(latitude, zoom);

  if (!Number.isFinite(metersPerPixel) || metersPerPixel <= 0) {
    return COVERAGE_MIN_RADIUS_PX;
  }

  return Math.max(
    COVERAGE_RADIUS_METERS / metersPerPixel,
    COVERAGE_MIN_RADIUS_PX,
  );
};

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

export const drawCoverageHeatmap = (
  ctx: CanvasRenderingContext2D,
  points: CoveragePoint[],
  clipRings: LngLat[][],
  state: CoverageRenderState,
) => {
  const { width, height } = state;

  ctx.clearRect(0, 0, width, height);

  if (width <= 0 || height <= 0 || points.length === 0) {
    return;
  }

  ctx.save();

  if (clipRings.length > 0) {
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
  }

  const sampleLat = state.center[1];
  const radius = coverageRadiusPx(sampleLat, state.zoom);
  const buffer = radius + 2;

  ctx.globalCompositeOperation = "lighter";

  for (const point of points) {
    const screen = lngLatToScreen([point.longitude, point.latitude], state);

    if (
      screen.x < -buffer ||
      screen.y < -buffer ||
      screen.x > width + buffer ||
      screen.y > height + buffer
    ) {
      continue;
    }

    const gradient = ctx.createRadialGradient(
      screen.x,
      screen.y,
      0,
      screen.x,
      screen.y,
      radius,
    );
    const { r, g, b } = COVERAGE_SUCCESS_RGB;
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.42)`);
    gradient.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, 0.18)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

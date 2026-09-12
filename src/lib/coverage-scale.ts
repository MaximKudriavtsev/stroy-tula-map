import type { OsmPoiCategory } from "@/data/osm-pois";
import { PROGRESS_GREEN, PROGRESS_RED } from "@/lib/progress-tone";

export type Rgb = { r: number; g: number; b: number };

export const COVERAGE_RAMP_FROM = PROGRESS_RED;
export const COVERAGE_RAMP_TO = PROGRESS_GREEN;
export const COVERAGE_LEVEL_COUNT = 6;
export const COVERAGE_LIGHTEN = 0.5;

export const COVERAGE_RADIUS_NEAR_M = 1000;
export const COVERAGE_RADIUS_FAR_M = 8000;
export const COVERAGE_RADIUS_ZOOM_NEAR = 14;
export const COVERAGE_RADIUS_ZOOM_FAR = 9;

export const COVERAGE_TARGET_DENSITY_FAR = 0.5;
export const COVERAGE_TARGET_DENSITY_NEAR = 3;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

const lerpZoom = (
  zoom: number,
  zoomFar: number,
  zoomNear: number,
  valueFar: number,
  valueNear: number,
) => {
  if (zoom <= zoomFar) {
    return valueFar;
  }

  if (zoom >= zoomNear) {
    return valueNear;
  }

  const t = (zoom - zoomFar) / (zoomNear - zoomFar);
  return lerp(valueFar, valueNear, t);
};

const mixRgb = (from: Rgb, to: Rgb, t: number): Rgb => ({
  r: Math.round(lerp(from.r, to.r, t)),
  g: Math.round(lerp(from.g, to.g, t)),
  b: Math.round(lerp(from.b, to.b, t)),
});

const lightenRgb = (color: Rgb, amount: number): Rgb =>
  mixRgb(color, { r: 255, g: 255, b: 255 }, amount);

const rgbToCss = (color: Rgb) => `rgb(${color.r}, ${color.g}, ${color.b})`;

const buildBandColors = (): Rgb[] => {
  const colors: Rgb[] = [];
  const lastIndex = Math.max(1, COVERAGE_LEVEL_COUNT - 1);

  for (let index = 0; index < COVERAGE_LEVEL_COUNT; index += 1) {
    const t = index / lastIndex;
    const ramp = mixRgb(COVERAGE_RAMP_FROM, COVERAGE_RAMP_TO, t);
    colors.push(lightenRgb(ramp, COVERAGE_LIGHTEN));
  }

  return colors;
};

export const coverageBandColors = buildBandColors();

export const coverageBandCssColors = coverageBandColors.map(rgbToCss);

const buildIsolineColors = (): Rgb[] => {
  const colors: Rgb[] = [];
  const lastIndex = Math.max(1, COVERAGE_LEVEL_COUNT - 1);

  for (let index = 0; index < COVERAGE_LEVEL_COUNT; index += 1) {
    const t = index / lastIndex;
    const ramp = mixRgb(COVERAGE_RAMP_FROM, COVERAGE_RAMP_TO, t);
    colors.push(lightenRgb(ramp, 0.2));
  }

  return colors;
};

export const coverageIsolineBandColors = buildIsolineColors();

export const coverageRadiusMeters = (zoom: number) => {
  if (zoom <= COVERAGE_RADIUS_ZOOM_FAR) {
    return COVERAGE_RADIUS_FAR_M;
  }

  if (zoom >= COVERAGE_RADIUS_ZOOM_NEAR) {
    return COVERAGE_RADIUS_NEAR_M;
  }

  const t =
    (zoom - COVERAGE_RADIUS_ZOOM_FAR) /
    (COVERAGE_RADIUS_ZOOM_NEAR - COVERAGE_RADIUS_ZOOM_FAR);

  return (
    COVERAGE_RADIUS_FAR_M *
    (COVERAGE_RADIUS_NEAR_M / COVERAGE_RADIUS_FAR_M) ** t
  );
};

export const coverageTargetDensity = (
  zoom: number,
  filterShare = 1,
) => {
  const base = lerpZoom(
    zoom,
    COVERAGE_RADIUS_ZOOM_FAR,
    COVERAGE_RADIUS_ZOOM_NEAR,
    COVERAGE_TARGET_DENSITY_FAR,
    COVERAGE_TARGET_DENSITY_NEAR,
  );
  const share = Math.max(0.05, Math.min(1, filterShare));

  return base * share;
};

export const coverageFieldOpacity = (zoom: number) =>
  lerpZoom(zoom, 10, 15, 0.85, 0.35);

export const coverageIsolineOpacity = (zoom: number) =>
  lerpZoom(zoom, 10, 13, 0, 0.75);

export const coverageDotStyle = (zoom: number) => ({
  radiusPx: lerpZoom(zoom, 10, 15, 1.3, 4),
  opacity: lerpZoom(zoom, 10, 15, 0.5, 1),
});

/** Design tokens matching filter icon colors from globals.css. */
export const coverageDotColorByCategory: Record<OsmPoiCategory, string> = {
  healthcare: "#b84a39",
  education: "#6e4f35",
  sport: "#6e5a4e",
  infrastructure: "#983224",
  utilitiesAndParks: "#89674c",
};

export const coverageIntensityToLevel = (
  density: number,
  targetDensity: number,
) => {
  if (targetDensity <= 0 || density <= 0) {
    return 0;
  }

  const t = clamp01(Math.sqrt(density / targetDensity));
  const level = Math.min(
    COVERAGE_LEVEL_COUNT - 1,
    Math.floor(t * COVERAGE_LEVEL_COUNT),
  );

  return level;
};

export const coverageAlphaToLevel = (
  alpha: number,
  peakAlpha: number,
) => {
  if (peakAlpha <= 0 || alpha <= 0) {
    return 0;
  }

  const t = clamp01(Math.sqrt(alpha / peakAlpha));
  return Math.min(
    COVERAGE_LEVEL_COUNT - 1,
    Math.floor(t * COVERAGE_LEVEL_COUNT),
  );
};

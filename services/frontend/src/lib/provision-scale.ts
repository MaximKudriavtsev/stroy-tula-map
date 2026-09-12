import { PROGRESS_GREEN, PROGRESS_RED } from "@/lib/progress-tone";

export type Rgb = { r: number; g: number; b: number };

export const PROVISION_LEVEL_COUNT = 6;
export const PROVISION_LIGHTEN = 0.5;

/**
 * Ширина шкалы в log2: обеспеченность 0,25 попадает в начало, 4 — в конец,
 * а норматив (1,0) — точно в середину, на границу третьей и четвёртой полосы.
 */
export const PROVISION_RATIO_LOG_SPAN = 4;

/** Индекс полосы, с которой обеспеченность считается достигнутой. */
export const PROVISION_NORM_LEVEL = PROVISION_LEVEL_COUNT / 2;

/** Состояния пикселя: нейтральные идут до полос, чтобы влезть в один LUT. */
export const PROVISION_STATE_EMPTY = 0;
export const PROVISION_STATE_NOT_REQUIRED = 1;
export const PROVISION_STATE_LEVEL_OFFSET = 2;
export const PROVISION_STATE_COUNT = PROVISION_STATE_LEVEL_OFFSET + PROVISION_LEVEL_COUNT;

/** Территория без жителей: обеспеченность не определена, а не равна нулю. */
export const PROVISION_EMPTY_COLOR: Rgb = { r: 216, g: 213, b: 206 };

/** Жители есть, но норматив объекта здесь не требует. */
export const PROVISION_NOT_REQUIRED_COLOR: Rgb = { r: 235, g: 230, b: 219 };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

const mixRgb = (from: Rgb, to: Rgb, t: number): Rgb => ({
  r: Math.round(lerp(from.r, to.r, t)),
  g: Math.round(lerp(from.g, to.g, t)),
  b: Math.round(lerp(from.b, to.b, t)),
});

const lightenRgb = (color: Rgb, amount: number): Rgb =>
  mixRgb(color, { r: 255, g: 255, b: 255 }, amount);

const rgbToCss = (color: Rgb) => `rgb(${color.r}, ${color.g}, ${color.b})`;

const buildBandColors = (lighten: number): Rgb[] => {
  const colors: Rgb[] = [];
  const lastIndex = Math.max(1, PROVISION_LEVEL_COUNT - 1);

  for (let index = 0; index < PROVISION_LEVEL_COUNT; index += 1) {
    const ramp = mixRgb(PROGRESS_RED, PROGRESS_GREEN, index / lastIndex);
    colors.push(lightenRgb(ramp, lighten));
  }

  return colors;
};

export const provisionBandColors = buildBandColors(PROVISION_LIGHTEN);

export const provisionBandCssColors = provisionBandColors.map(rgbToCss);

export const provisionIsolineBandColors = buildBandColors(0.2);

export const provisionEmptyCssColor = rgbToCss(PROVISION_EMPTY_COLOR);

export const provisionNotRequiredCssColor = rgbToCss(PROVISION_NOT_REQUIRED_COLOR);

export const provisionRatioToLevel = (ratio: number) => {
  if (ratio <= 0) {
    return 0;
  }

  const t = clamp01(0.5 + Math.log2(ratio) / PROVISION_RATIO_LOG_SPAN);

  return Math.min(PROVISION_LEVEL_COUNT - 1, Math.floor(t * PROVISION_LEVEL_COUNT));
};

export const provisionStateForRatio = (ratio: number) =>
  PROVISION_STATE_LEVEL_OFFSET + provisionRatioToLevel(ratio);

const buildStateColors = (bandColors: Rgb[]): Rgb[] => {
  const colors = new Array<Rgb>(PROVISION_STATE_COUNT);
  colors[PROVISION_STATE_EMPTY] = PROVISION_EMPTY_COLOR;
  colors[PROVISION_STATE_NOT_REQUIRED] = PROVISION_NOT_REQUIRED_COLOR;

  for (let level = 0; level < PROVISION_LEVEL_COUNT; level += 1) {
    colors[PROVISION_STATE_LEVEL_OFFSET + level] = bandColors[level];
  }

  return colors;
};

export const provisionStateColors = buildStateColors(provisionBandColors);

export const provisionIsolineStateColors = buildStateColors(provisionIsolineBandColors);

export const provisionFieldOpacity = (zoom: number) => (zoom >= 15 ? 0.4 : 0.85);

export const provisionIsolineOpacity = (zoom: number) => (zoom <= 10 ? 0 : 0.6);

export const PROGRESS_RED = { r: 184, g: 74, b: 57 };
export const PROGRESS_GREEN = { r: 61, g: 122, b: 69 };

export function getProgressTone(progress: number) {
  const t = Math.min(100, Math.max(0, progress)) / 100;
  const r = Math.round(PROGRESS_RED.r + (PROGRESS_GREEN.r - PROGRESS_RED.r) * t);
  const g = Math.round(PROGRESS_RED.g + (PROGRESS_GREEN.g - PROGRESS_RED.g) * t);
  const b = Math.round(PROGRESS_RED.b + (PROGRESS_GREEN.b - PROGRESS_RED.b) * t);

  return {
    color: `rgb(${r} ${g} ${b})`,
    background: `rgb(${r} ${g} ${b} / 0.14)`,
  };
}

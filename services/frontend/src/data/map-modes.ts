export const mapModes = {
  objects: "objects",
  coverage: "coverage",
} as const;

export type MapMode = (typeof mapModes)[keyof typeof mapModes];

export const mapModeLabels: Record<MapMode, string> = {
  objects: "Объекты",
  coverage: "Доступность",
};

export const mapModes = {
  objects: "objects",
  coverage: "coverage",
  provision: "provision",
} as const;

export type MapMode = (typeof mapModes)[keyof typeof mapModes];

export const mapModeLabels: Record<MapMode, string> = {
  objects: "Объекты",
  coverage: "Доступность",
  provision: "Обеспеченность",
};

/** В режимах теплокарты маркеры объектов скрыты, а фильтр считается по POI. */
export const isHeatmapMode = (mode: MapMode) => mode !== mapModes.objects;

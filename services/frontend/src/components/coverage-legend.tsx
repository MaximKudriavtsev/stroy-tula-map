import { coverageBandCssColors } from "@/lib/coverage-scale";

export const CoverageLegend = () => {
  return (
    <div
      aria-label="Легенда доступности"
      className="inline-flex max-w-full items-center gap-sm rounded-full border border-outline-variant bg-surface-container-lowest px-sm py-sm shadow-panel type-body-sm text-on-surface md:px-md md:type-body-md"
    >
      <span className="shrink-0 text-on-surface-variant">Нет доступности</span>
      <span
        aria-hidden="true"
        className="flex h-2.5 w-16 shrink-0 overflow-hidden rounded-full sm:w-32"
      >
        {coverageBandCssColors.map((color, index) => (
          <span
            className="h-full flex-1"
            key={index}
            style={{ backgroundColor: color }}
          />
        ))}
      </span>
      <span className="shrink-0 text-on-surface-variant">Высокая</span>
      <span className="hidden text-on-surface-variant sm:inline">
        · радиус зависит от масштаба
      </span>
    </div>
  );
};

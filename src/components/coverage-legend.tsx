export const CoverageLegend = () => {
  return (
    <div
      aria-label="Легенда доступности"
      className="inline-flex max-w-full items-center gap-sm rounded-full border border-outline-variant bg-surface-container-lowest px-md py-sm shadow-panel type-body-md text-on-surface"
    >
      <span className="shrink-0 text-on-surface-variant">Слабо</span>
      <span
        aria-hidden="true"
        className="h-2.5 w-28 shrink-0 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(61, 122, 69, 0.12), rgba(61, 122, 69, 0.45), rgba(61, 122, 69, 0.9))",
        }}
      />
      <span className="shrink-0 text-on-surface-variant">Сильно</span>
      <span className="hidden text-on-surface-variant sm:inline">
        · радиус 1 км
      </span>
    </div>
  );
};

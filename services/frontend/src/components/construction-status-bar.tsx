type ConstructionStatusBarProps = {
  year: number;
  openingCount: number;
  buildingCount: number;
};

export function ConstructionStatusBar({
  year,
  openingCount,
  buildingCount,
}: ConstructionStatusBarProps) {
  return (
    <div
      aria-label="Сводка по объектам строительства"
      className="flex h-full max-w-full items-center gap-md overflow-hidden rounded-full border border-outline-variant bg-surface-container-lowest px-md shadow-panel"
    >
      <p className="flex min-w-0 items-center gap-sm type-label-md text-success">
        <span
          aria-hidden="true"
          className="size-sm shrink-0 rounded-full bg-success"
        />
        <span className="min-w-0 truncate">
          Открывается в {year}:{" "}
          <span className="tnum font-semibold">{openingCount}</span>
        </span>
      </p>

      <span
        aria-hidden="true"
        className="h-md w-px shrink-0 bg-outline-variant"
      />

      <p className="shrink-0 type-label-md text-on-surface-variant">
        Строится:{" "}
        <span className="tnum font-semibold text-on-surface">
          {buildingCount} {pluralizeObjects(buildingCount)}
        </span>
      </p>
    </div>
  );
}

function pluralizeObjects(count: number) {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;

  if (abs > 10 && abs < 20) {
    return "объектов";
  }

  if (last === 1) {
    return "объект";
  }

  if (last >= 2 && last <= 4) {
    return "объекта";
  }

  return "объектов";
}

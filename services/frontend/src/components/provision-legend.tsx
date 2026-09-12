import {
  provisionBandCssColors,
  provisionEmptyCssColor,
  provisionNotRequiredCssColor,
} from "@/lib/provision-scale";

const neutralStates = [
  { color: provisionEmptyCssColor, label: "Нет населения" },
  { color: provisionNotRequiredCssColor, label: "Норма не требует объекта" },
];

export const ProvisionLegend = () => {
  return (
    <div
      aria-label="Легенда обеспеченности"
      className="inline-flex max-w-full flex-wrap items-center justify-center gap-sm rounded-full border border-outline-variant bg-surface-container-lowest px-md py-sm shadow-panel type-body-md text-on-surface"
    >
      <span className="shrink-0 text-on-surface-variant">Дефицит</span>
      <span className="flex shrink-0 flex-col items-center gap-0.5">
        <span
          aria-hidden="true"
          className="flex h-2.5 w-32 overflow-hidden rounded-full"
        >
          {provisionBandCssColors.map((color, index) => (
            <span
              className="h-full flex-1"
              key={index}
              style={{ backgroundColor: color }}
            />
          ))}
        </span>
        <span className="type-label-sm text-on-surface-variant">норма посередине</span>
      </span>
      <span className="shrink-0 text-on-surface-variant">Профицит</span>

      {neutralStates.map((state) => (
        <span className="flex shrink-0 items-center gap-1.5" key={state.label}>
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-full border border-outline-variant"
            style={{ backgroundColor: state.color }}
          />
          <span className="text-on-surface-variant">{state.label}</span>
        </span>
      ))}
    </div>
  );
};

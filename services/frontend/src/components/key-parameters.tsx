import type { ReactNode } from "react";
import { KeyParameterItem } from "@/components/key-parameter-item";

export type KeyParameter = {
  title: string;
  content: ReactNode;
};

type KeyParametersProps = {
  items: KeyParameter[];
};

export function KeyParameters({ items }: KeyParametersProps) {
  return (
    <section aria-label="Ключевые параметры" className="flex flex-col gap-sm">
      <div className="flex items-center gap-sm">
        <InfoIcon className="size-md shrink-0 text-primary" />
        <h3 className="type-label-md font-semibold uppercase text-on-surface-variant">
          Ключевые параметры
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-sm">
        {items.map((item) => (
          <KeyParameterItem
            content={item.content}
            key={item.title}
            title={item.title}
          />
        ))}
      </div>
    </section>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
    >
      <circle
        cx="10"
        cy="10"
        r="7.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M10 9v4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="6.5" fill="currentColor" r="1" />
    </svg>
  );
}

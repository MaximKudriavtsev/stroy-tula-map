import type { ReactNode } from "react";

type KeyParameterItemProps = {
  title: string;
  content: ReactNode;
};

export function KeyParameterItem({ title, content }: KeyParameterItemProps) {
  return (
    <div className="flex min-h-0 flex-col gap-xs rounded-xl border border-outline-variant bg-surface-container-low p-md">
      <p className="type-body-sm text-on-surface-variant">{title}</p>
      <div className="type-body-sm font-semibold text-on-surface">{content}</div>
    </div>
  );
}

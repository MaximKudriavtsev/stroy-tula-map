"use client";

import type { ReactNode } from "react";
import { Brand } from "@/components/brand";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex h-full min-h-full">
      <aside className="flex w-56 shrink-0 flex-col gap-lg border-r border-outline-variant bg-surface-container-lowest px-md py-lg shadow-panel md:w-64">
        <Brand showTagline={false} />

        <nav aria-label="Админ-навигация" className="flex flex-col gap-xs">
          <button
            aria-current="page"
            className="rounded-full bg-primary px-md py-sm text-left type-label-md text-on-primary"
            type="button"
          >
            Объекты
          </button>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto px-margin py-lg md:px-margin-desktop">
        {children}
      </main>
    </div>
  );
}

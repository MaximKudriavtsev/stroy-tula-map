"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { logout } from "@/lib/api/auth";

export const adminSections = {
  objects: "objects",
  reports: "reports",
} as const;

export type AdminSection = (typeof adminSections)[keyof typeof adminSections];

type AdminShellProps = {
  children: ReactNode;
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
};

const sectionLabels: Record<AdminSection, string> = {
  objects: "Объекты",
  reports: "Обращения",
};

const sectionOrder: AdminSection[] = [
  adminSections.objects,
  adminSections.reports,
];

export function AdminShell({
  children,
  activeSection,
  onSectionChange,
}: AdminShellProps) {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="flex h-full min-h-full">
      <aside className="flex w-56 shrink-0 flex-col gap-lg border-r border-outline-variant bg-surface-container-lowest px-md py-lg shadow-panel md:w-64">
        <Brand showTagline={false} />

        <nav aria-label="Админ-навигация" className="flex flex-1 flex-col gap-xs">
          {sectionOrder.map((section) => {
            const isActive = activeSection === section;

            return (
              <button
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-md py-sm text-left type-label-md transition-colors ${
                  isActive
                    ? "bg-primary text-on-primary"
                    : "text-on-surface hover:bg-surface-container"
                }`}
                key={section}
                onClick={() => onSectionChange(section)}
                type="button"
              >
                {sectionLabels[section]}
              </button>
            );
          })}
        </nav>

        <button
          className="rounded-full border border-outline-variant px-md py-sm text-left type-label-md text-on-surface transition-colors hover:bg-surface-container"
          onClick={handleLogout}
          type="button"
        >
          Выйти
        </button>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto px-margin py-lg md:px-margin-desktop">
        {children}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminShell,
  adminSections,
  type AdminSection,
} from "@/components/admin/admin-shell";
import { ObjectsView } from "@/components/admin/objects-view";
import { ReportsList } from "@/components/admin/reports-list";
import { getAccessToken } from "@/lib/api/auth";

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [section, setSection] = useState<AdminSection>(adminSections.objects);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/admin/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="type-body-md text-on-surface-variant">Загрузка…</p>
      </div>
    );
  }

  return (
    <AdminShell activeSection={section} onSectionChange={setSection}>
      {section === adminSections.reports ? (
        <div className="flex flex-col gap-lg">
          <div>
            <h1 className="type-headline-md">Обращения</h1>
            <p className="mt-xs type-body-md text-on-surface-variant">
              Сообщения из бота MAX
            </p>
          </div>
          <ReportsList />
        </div>
      ) : (
        <ObjectsView />
      )}
    </AdminShell>
  );
}

"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { ObjectsView } from "@/components/admin/objects-view";

export default function AdminPage() {
  return (
    <AdminShell>
      <ObjectsView />
    </AdminShell>
  );
}

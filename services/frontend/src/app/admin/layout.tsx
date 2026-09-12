import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full overflow-auto bg-background text-on-background">
      {children}
    </div>
  );
}

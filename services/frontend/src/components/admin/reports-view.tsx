"use client";

import { useState } from "react";
import { ReportReplyForm } from "@/components/admin/report-reply-form";
import { ReportsList } from "@/components/admin/reports-list";

export function ReportsView() {
  const [replyingReportId, setReplyingReportId] = useState<string | null>(null);

  const openList = () => {
    setReplyingReportId(null);
  };

  if (replyingReportId) {
    return (
      <ReportReplyForm
        onCancel={openList}
        onSuccess={openList}
        reportId={replyingReportId}
      />
    );
  }

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="type-headline-md">Обращения</h1>
        <p className="mt-xs type-body-md text-on-surface-variant">
          Сообщения из бота MAX
        </p>
      </div>
      <ReportsList onSelectReport={setReplyingReportId} />
    </div>
  );
}

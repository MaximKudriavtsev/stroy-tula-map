"use client";

import { FormEvent, useEffect, useState } from "react";
import { fetchReport, replyToReport, type ApiReport } from "@/lib/api/reports";

type ReportReplyFormProps = {
  reportId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      aria-label="Назад к списку"
      className="flex size-xl shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface transition-colors hover:bg-surface-container"
      onClick={onClick}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="size-md"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

export function ReportReplyForm({
  reportId,
  onSuccess,
  onCancel,
}: ReportReplyFormProps) {
  const [report, setReport] = useState<ApiReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError(null);
      setReport(null);

      try {
        const nextReport = await fetchReport(reportId);
        if (!cancelled) {
          setReport(nextReport);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Не удалось загрузить обращение",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [reportId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = reply.trim();
    if (!text) {
      setFormError("Введите текст ответа");
      return;
    }

    setFormError(null);
    setSubmitting(true);

    try {
      await replyToReport(reportId, text);
      setReply("");
      onSuccess?.();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Не удалось отправить ответ",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p className="type-body-md text-on-surface-variant">
        Загрузка обращения…
      </p>
    );
  }

  if (loadError || !report) {
    return (
      <div className="flex flex-col items-start gap-md">
        {onCancel ? <BackButton onClick={onCancel} /> : null}
        <p className="type-body-md text-error">
          {loadError ?? "Обращение не найдено"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center gap-sm">
        {onCancel ? <BackButton onClick={onCancel} /> : null}
        <h2 className="type-headline-md">Ответ на обращение</h2>
      </div>

      <form
        className="flex max-w-4xl flex-col gap-lg rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest p-lg shadow-panel md:p-xl"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-xs">
          <span className="type-label-md text-on-surface-variant">
            Текст обращения
          </span>
          <p className="whitespace-pre-wrap rounded-[1rem] bg-surface-container-low px-md py-md type-body-md text-on-surface">
            {report.text}
          </p>
        </div>

        <label className="flex flex-col gap-xs">
          <span className="type-label-md text-on-surface-variant">Ответ</span>
          <textarea
            className="min-h-32 w-full resize-y rounded-[1rem] border border-outline-variant bg-surface-container-lowest px-md py-md type-body-md text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary"
            disabled={submitting}
            name="reply"
            onChange={(event) => {
              setReply(event.target.value);
              setFormError(null);
            }}
            placeholder="Введите ответ пользователю"
            value={reply}
          />
        </label>

        <div className="flex flex-col items-start gap-sm">
          {formError ? (
            <p className="type-body-md text-error">{formError}</p>
          ) : null}
          <button
            className="h-xl rounded-full bg-primary px-lg type-label-md text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Отправка…" : "Отправить"}
          </button>
        </div>
      </form>
    </div>
  );
}

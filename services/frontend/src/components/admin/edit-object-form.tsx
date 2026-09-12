"use client";

import { useEffect, useState } from "react";
import {
  draftFromApiObject,
  ObjectForm,
  type FormDraft,
} from "@/components/admin/object-form";
import { fetchObject, updateObject } from "@/lib/api/objects";

type EditObjectFormProps = {
  objectId: string;
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

export function EditObjectForm({
  objectId,
  onSuccess,
  onCancel,
}: EditObjectFormProps) {
  const [initialDraft, setInitialDraft] = useState<FormDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setInitialDraft(null);

      try {
        const object = await fetchObject(objectId);
        if (!cancelled) {
          setInitialDraft(draftFromApiObject(object));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Не удалось загрузить объект",
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
  }, [objectId]);

  if (loading) {
    return (
      <p className="type-body-md text-on-surface-variant">Загрузка объекта…</p>
    );
  }

  if (error || !initialDraft) {
    return (
      <div className="flex flex-col items-start gap-md">
        {onCancel ? <BackButton onClick={onCancel} /> : null}
        <p className="type-body-md text-error">
          {error ?? "Объект не найден"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center gap-sm">
        {onCancel ? <BackButton onClick={onCancel} /> : null}
        <h2 className="type-headline-md">Редактирование объекта</h2>
      </div>

      <ObjectForm
        initialDraft={initialDraft}
        key={objectId}
        onSubmit={async (input) => {
          await updateObject(objectId, input);
        }}
        onSuccess={onSuccess}
        submitLabel="Сохранить"
        submittingLabel="Сохранение…"
      />
    </div>
  );
}

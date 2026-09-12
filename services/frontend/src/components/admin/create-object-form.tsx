"use client";

import { createObject } from "@/lib/api/objects";
import { ObjectForm } from "@/components/admin/object-form";

type CreateObjectFormProps = {
  onSuccess?: () => void;
};

export function CreateObjectForm({ onSuccess }: CreateObjectFormProps) {
  return (
    <ObjectForm
      onSubmit={async (input) => {
        await createObject(input);
      }}
      onSuccess={onSuccess}
      resetOnSuccess
      submitLabel="Создать объект"
      submittingLabel="Создание…"
    />
  );
}

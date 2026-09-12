"use client";

import { FormEvent, useState } from "react";
import type { ApiObject } from "@/lib/api/types";
import {
  emptyCreateObjectInput,
  isObjectCategory,
  objectCategories,
  objectCategoryLabels,
  objectCategoryValues,
  validateCreateObject,
  type CreateObjectFieldErrors,
  type CreateObjectInput,
  type ObjectCategory,
} from "@/lib/create-object";

const inputClassName =
  "h-xl w-full rounded-full border border-outline-variant bg-surface-container-lowest px-md type-body-md text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary";

const selectClassName =
  "h-xl w-full appearance-none rounded-full border border-outline-variant bg-surface-container-lowest px-md type-body-md text-on-surface outline-none transition-colors focus:border-primary";

export type StringFieldKey =
  | "grbs"
  | "oksName"
  | "constructionStage"
  | "address"
  | "industry"
  | "status"
  | "ownership"
  | "amo"
  | "customer"
  | "npGpName"
  | "fpName"
  | "projectCode"
  | "expertise"
  | "constructionPeriod"
  | "landTransferDate"
  | "constructionPermitDate"
  | "contractConclusionDate"
  | "contractPeriod"
  | "contractor"
  | "equipmentInstallationDate"
  | "hydraulicTestActDate"
  | "zosDate"
  | "zosNumber"
  | "commissioningActDate"
  | "commissioningActNumber"
  | "photo";

export type NumberFieldKey =
  | "totalArea"
  | "capacity"
  | "startYear"
  | "endYear"
  | "constructionReadiness"
  | "commissioningYear";

export type FormDraft = {
  strings: Record<StringFieldKey, string>;
  numbers: Record<NumberFieldKey, string>;
  category: ObjectCategory;
  longitude: string;
  latitude: string;
};

const STRING_FIELDS: { key: StringFieldKey; label: string }[] = [
  { key: "grbs", label: "ГРБС" },
  { key: "oksName", label: "Наименование ОКС" },
  { key: "constructionStage", label: "Этап строительства" },
  { key: "address", label: "Адрес" },
  { key: "industry", label: "Отрасль" },
  { key: "status", label: "Статус" },
  { key: "ownership", label: "Собственность" },
  { key: "amo", label: "АМО" },
  { key: "customer", label: "Заказчик" },
  { key: "npGpName", label: "Наименование НП/ГП" },
  { key: "fpName", label: "Наименование ФП" },
  { key: "projectCode", label: "Код проекта" },
  { key: "expertise", label: "ЭКСПЕРТИЗА(Ы)" },
  { key: "constructionPeriod", label: "Сроки строительства" },
  { key: "landTransferDate", label: "Дата передачи земельного участка заказчику" },
  {
    key: "constructionPermitDate",
    label: "Дата получения разрешения на строительство (реконструкцию)",
  },
  { key: "contractConclusionDate", label: "Дата заключения контракта" },
  { key: "contractPeriod", label: "Сроки контракта" },
  { key: "contractor", label: "Подрядчик" },
  {
    key: "equipmentInstallationDate",
    label: "Дата установки технологического оборудования",
  },
  { key: "hydraulicTestActDate", label: "Дата акта гидравлических испытаний" },
  { key: "zosDate", label: "ЗОС — дата" },
  { key: "zosNumber", label: "ЗОС — номер" },
  { key: "commissioningActDate", label: "АКТ ВВОДА — дата" },
  { key: "commissioningActNumber", label: "АКТ ВВОДА — номер" },
  { key: "photo", label: "Фото" },
];

const NUMBER_FIELDS: { key: NumberFieldKey; label: string }[] = [
  { key: "totalArea", label: "ОБЩАЯ пл., м2" },
  { key: "capacity", label: "Мощность (кол-во мест)" },
  { key: "startYear", label: "Год начала" },
  { key: "endYear", label: "Год окончания" },
  { key: "constructionReadiness", label: "Строительная готовность" },
  { key: "commissioningYear", label: "Год ввода в эксплуатацию" },
];

const REQUIRED_STRING_KEYS = new Set<StringFieldKey>(["grbs", "oksName"]);

const VALIDATION_FORM_ERROR =
  "Проверьте заполнение формы: есть ошибки в полях";

function stringValue(value?: string | null): string {
  return value ?? "";
}

function numberValue(value?: number | null): string {
  return value === null || value === undefined ? "" : String(value);
}

export function createInitialDraft(): FormDraft {
  const strings = Object.fromEntries(
    STRING_FIELDS.map((field) => [field.key, ""]),
  ) as Record<StringFieldKey, string>;

  const numbers = Object.fromEntries(
    NUMBER_FIELDS.map((field) => [field.key, ""]),
  ) as Record<NumberFieldKey, string>;

  return {
    strings,
    numbers,
    category: objectCategories.all,
    longitude: "",
    latitude: "",
  };
}

export function draftFromApiObject(object: ApiObject): FormDraft {
  const draft = createInitialDraft();

  for (const field of STRING_FIELDS) {
    draft.strings[field.key] = stringValue(
      object[field.key] as string | null | undefined,
    );
  }

  for (const field of NUMBER_FIELDS) {
    draft.numbers[field.key] = numberValue(
      object[field.key] as number | null | undefined,
    );
  }

  draft.category = isObjectCategory(object.category)
    ? object.category
    : objectCategories.all;

  const coordinates = object.coordinates?.coordinates;
  if (coordinates && coordinates.length >= 2) {
    draft.longitude = String(coordinates[0]);
    draft.latitude = String(coordinates[1]);
  }

  return draft;
}

function buildCreateObjectInput(draft: FormDraft): CreateObjectInput {
  const input = emptyCreateObjectInput();
  input.category = draft.category;

  for (const field of STRING_FIELDS) {
    const value = draft.strings[field.key].trim();
    if (REQUIRED_STRING_KEYS.has(field.key) || value) {
      input[field.key] = value;
    }
  }

  for (const field of NUMBER_FIELDS) {
    const raw = draft.numbers[field.key].trim();
    if (!raw) {
      continue;
    }
    input[field.key] = Number(raw);
  }

  const lonRaw = draft.longitude.trim();
  const latRaw = draft.latitude.trim();
  if (lonRaw && latRaw) {
    const lon = Number(lonRaw);
    const lat = Number(latRaw);
    if (!Number.isNaN(lon) && !Number.isNaN(lat)) {
      input.coordinates = {
        type: "Point",
        coordinates: [lon, lat],
      };
    }
  }

  return input;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="type-body-sm text-error">{message}</p>;
}

type ObjectFormProps = {
  initialDraft?: FormDraft;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (input: CreateObjectInput) => Promise<void>;
  onSuccess?: () => void;
  resetOnSuccess?: boolean;
};

export function ObjectForm({
  initialDraft,
  submitLabel,
  submittingLabel,
  onSubmit,
  onSuccess,
  resetOnSuccess = false,
}: ObjectFormProps) {
  const [draft, setDraft] = useState<FormDraft>(
    () => initialDraft ?? createInitialDraft(),
  );
  const [errors, setErrors] = useState<CreateObjectFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clearFormMessages = () => {
    setFormError(null);
  };

  const setString = (key: StringFieldKey, value: string) => {
    setDraft((prev) => ({
      ...prev,
      strings: { ...prev.strings, [key]: value },
    }));
    clearFormMessages();
  };

  const setNumber = (key: NumberFieldKey, value: string) => {
    setDraft((prev) => ({
      ...prev,
      numbers: { ...prev.numbers, [key]: value },
    }));
    clearFormMessages();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const input = buildCreateObjectInput(draft);
    const nextErrors = validateCreateObject(input, {
      longitude: draft.longitude,
      latitude: draft.latitude,
    });

    for (const field of NUMBER_FIELDS) {
      const raw = draft.numbers[field.key].trim();
      if (raw && Number.isNaN(Number(raw))) {
        nextErrors[field.key] = "Укажите число";
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setFormError(VALIDATION_FORM_ERROR);
      return;
    }

    setFormError(null);
    setSubmitting(true);

    try {
      await onSubmit(input);
      if (resetOnSuccess) {
        setDraft(createInitialDraft());
        setErrors({});
      }
      onSuccess?.();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Не удалось сохранить объект",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className="flex max-w-4xl flex-col gap-lg rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest p-lg shadow-panel md:p-xl"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="grid gap-md md:grid-cols-2">
        {STRING_FIELDS.filter((field) => REQUIRED_STRING_KEYS.has(field.key)).map(
          (field) => (
            <label className="flex flex-col gap-xs" key={field.key}>
              <span className="type-label-md text-on-surface-variant">
                {field.label}
                <span className="text-error"> *</span>
              </span>
              <input
                className={inputClassName}
                disabled={submitting}
                name={field.key}
                onChange={(event) => setString(field.key, event.target.value)}
                type="text"
                value={draft.strings[field.key]}
              />
              <FieldError message={errors[field.key]} />
            </label>
          ),
        )}

        <label className="flex flex-col gap-xs">
          <span className="type-label-md text-on-surface-variant">Категория</span>
          <select
            className={selectClassName}
            disabled={submitting}
            name="category"
            onChange={(event) => {
              setDraft((prev) => ({
                ...prev,
                category: event.target.value as ObjectCategory,
              }));
              clearFormMessages();
            }}
            value={draft.category}
          >
            {objectCategoryValues.map((value) => (
              <option key={value} value={value}>
                {objectCategoryLabels[value]}
              </option>
            ))}
          </select>
          <FieldError message={errors.category} />
        </label>

        {STRING_FIELDS.filter((field) => !REQUIRED_STRING_KEYS.has(field.key)).map(
          (field) => (
            <label className="flex flex-col gap-xs" key={field.key}>
              <span className="type-label-md text-on-surface-variant">
                {field.label}
              </span>
              <input
                className={inputClassName}
                disabled={submitting}
                name={field.key}
                onChange={(event) => setString(field.key, event.target.value)}
                type="text"
                value={draft.strings[field.key]}
              />
              <FieldError message={errors[field.key]} />
            </label>
          ),
        )}

        {NUMBER_FIELDS.map((field) => (
          <label className="flex flex-col gap-xs" key={field.key}>
            <span className="type-label-md text-on-surface-variant">
              {field.label}
            </span>
            <input
              className={inputClassName}
              disabled={submitting}
              name={field.key}
              onChange={(event) => setNumber(field.key, event.target.value)}
              type="number"
              value={draft.numbers[field.key]}
            />
            <FieldError message={errors[field.key]} />
          </label>
        ))}

        <label className="flex flex-col gap-xs">
          <span className="type-label-md text-on-surface-variant">
            Долгота (координаты)
          </span>
          <input
            className={inputClassName}
            disabled={submitting}
            name="longitude"
            onChange={(event) => {
              setDraft((prev) => ({ ...prev, longitude: event.target.value }));
              clearFormMessages();
            }}
            step="any"
            type="number"
            value={draft.longitude}
          />
          <FieldError message={errors.longitude} />
        </label>

        <label className="flex flex-col gap-xs">
          <span className="type-label-md text-on-surface-variant">
            Широта (координаты)
          </span>
          <input
            className={inputClassName}
            disabled={submitting}
            name="latitude"
            onChange={(event) => {
              setDraft((prev) => ({ ...prev, latitude: event.target.value }));
              clearFormMessages();
            }}
            step="any"
            type="number"
            value={draft.latitude}
          />
          <FieldError message={errors.latitude} />
        </label>
      </div>

      <div className="flex flex-col items-start gap-sm">
        {formError ? (
          <p className="type-body-md text-error">{formError}</p>
        ) : null}
        <button
          className="h-xl rounded-full bg-primary px-lg type-label-md text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}

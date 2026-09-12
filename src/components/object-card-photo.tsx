import {
  CategoryIcon,
  iconClassByCategory,
} from "@/components/object-category-icon";
import { objectCategoryLabels } from "@/data/object-categories";
import type { ObjectChipCategory } from "@/lib/object-chip";

export const objectCardPhotoSrc = "/object-photo.png";

type ObjectCardPhotoProps = {
  category: ObjectChipCategory;
  name: string;
  onClose: () => void;
};

export function ObjectCardPhoto({
  category,
  name,
  onClose,
}: ObjectCardPhotoProps) {
  const label = objectCategoryLabels[category];
  const categoryClass = iconClassByCategory[category];

  return (
    <figure className="relative shrink-0 overflow-hidden">
      <img
        alt={name}
        className="aspect-[16/9] w-full object-cover"
        src={objectCardPhotoSrc}
      />

      <div className="absolute inset-0 flex flex-col justify-between p-md">
        <div className="flex items-start justify-between gap-sm">
          <div
            className={`inline-flex max-w-[min(100%,14rem)] items-center gap-xs rounded-full bg-surface-container-lowest px-md py-sm shadow-panel ${categoryClass}`}
          >
            <CategoryIcon category={category} className="size-md shrink-0" />
            <span className="truncate type-label-md font-semibold">{label}</span>
          </div>

          <button
            aria-label="Закрыть карточку"
            className="flex size-xl shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-container-lowest text-on-surface shadow-panel transition-colors hover:bg-surface-container-low"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="size-md" />
          </button>
        </div>

        <div className="inline-flex w-fit items-center gap-sm rounded-full bg-inverse-surface px-md py-sm text-inverse-on-surface shadow-panel">
          <EyeIcon className="size-md shrink-0" />
          <span className="type-label-md font-semibold">Фото сейчас</span>
        </div>
      </div>
    </figure>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M6 6l8 8M14 6l-8 8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M2.6 10s2.6-5 7.4-5 7.4 5 7.4 5-2.6 5-7.4 5-7.4-5-7.4-5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

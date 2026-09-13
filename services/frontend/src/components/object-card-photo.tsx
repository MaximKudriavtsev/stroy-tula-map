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
  photoSrc?: string;
  hideClose?: boolean;
  onClose: () => void;
};

export function ObjectCardPhoto({
  category,
  name,
  photoSrc = objectCardPhotoSrc,
  hideClose = false,
  onClose,
}: ObjectCardPhotoProps) {
  const label = objectCategoryLabels[category];
  const categoryClass = iconClassByCategory[category];

  return (
    <figure className="relative shrink-0 overflow-hidden">
      <img
        alt={name}
        className="aspect-[2/1] w-full object-cover md:aspect-[16/9]"
        src={photoSrc}
      />

      <div className="absolute inset-0 flex flex-col justify-between p-md">
        <div className="flex items-start justify-between gap-sm">
          <div
            className={`inline-flex max-w-[min(100%,14rem)] items-center gap-xs rounded-full bg-surface-container-lowest px-md py-sm shadow-panel ${categoryClass}`}
          >
            <CategoryIcon category={category} className="size-md shrink-0" />
            <span className="truncate type-label-md font-semibold">{label}</span>
          </div>

          {hideClose ? null : (
            <button
              aria-label="Закрыть карточку"
              className="flex size-xl shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-container-lowest text-on-surface shadow-panel transition-colors hover:bg-surface-container-low"
              onClick={onClose}
              type="button"
            >
              <CloseIcon className="size-md" />
            </button>
          )}
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

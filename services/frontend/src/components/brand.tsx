import Image from "next/image";

type BrandProps = {
  showTagline?: boolean;
  compactOnMobile?: boolean;
  className?: string;
};

export function BrandMark() {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className="size-xl shrink-0 rounded-full object-cover"
      height={40}
      src="/brand-icon.png"
      width={40}
    />
  );
}

export function Brand({
  showTagline = true,
  compactOnMobile = false,
  className = "",
}: BrandProps) {
  return (
    <div className={`flex shrink-0 items-center gap-sm ${className}`.trim()}>
      <BrandMark />
      <div
        className={`min-w-0 ${compactOnMobile ? "hidden md:block" : ""}`.trim()}
      >
        <p className="type-title-sm">
          <span className="text-primary">Город.</span>
          <span>В Деле</span>
        </p>
        {showTagline ? (
          <p className="type-body-sm text-on-surface-variant">
            Строим для жителей
          </p>
        ) : null}
      </div>
    </div>
  );
}

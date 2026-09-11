"use client";

import { FormEvent, useState } from "react";

type SearchFieldProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (query: string) => void;
  onSearch?: (query: string) => void;
};

export function SearchField({
  value,
  defaultValue = "",
  onChange,
  onSearch,
}: SearchFieldProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const query = value ?? uncontrolledValue;
  const hasQuery = query.length > 0;

  const handleChange = (nextQuery: string) => {
    if (value === undefined) {
      setUncontrolledValue(nextQuery);
    }
    onChange?.(nextQuery);
  };

  const handleClear = () => {
    handleChange("");
    onSearch?.("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch?.(query.trim());
  };

  return (
    <form
      aria-label="Поиск по карте"
      className="relative flex w-72 max-w-full items-center gap-sm md:w-80"
      onSubmit={handleSubmit}
    >
      <SearchIcon className="size-md shrink-0 text-outline" />
      <input
        aria-label="Поиск: больница, школа, парк, мост или адрес"
        className="h-xl min-w-0 flex-1 appearance-none overflow-hidden text-ellipsis whitespace-nowrap bg-transparent type-body-md text-on-surface outline-none placeholder:overflow-hidden placeholder:text-ellipsis placeholder:whitespace-nowrap placeholder:text-outline [&::-webkit-search-cancel-button]:hidden"
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Поиск: больница, школа, парк, мост или адрес..."
        type="search"
        value={query}
      />
      {hasQuery ? (
        <button
          aria-label="Очистить поиск"
          className="flex size-md shrink-0 items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-container hover:text-on-surface"
          onClick={handleClear}
          type="button"
        >
          <ClearIcon className="size-md" />
        </button>
      ) : null}
    </form>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
    >
      <circle
        cx="9"
        cy="9"
        r="5.25"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M13.2 13.2 16.5 16.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ClearIcon({ className }: { className?: string }) {
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

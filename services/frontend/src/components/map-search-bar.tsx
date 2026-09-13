'use client';

import { Brand } from '@/components/brand';
import { SearchField } from '@/components/search-field';

type MapSearchBarProps = {
    value?: string;
    onChange?: (query: string) => void;
    onSearch?: (query: string) => void;
    onCenter?: () => void;
    className?: string;
};

export function MapSearchBar({
    value,
    onChange,
    onSearch,
    onCenter,
    className = '',
}: MapSearchBarProps) {
    return (
        <div
            className={`flex h-12 min-w-0 max-w-full items-center gap-sm rounded-full border border-outline-variant bg-surface-container-lowest py-xs pl-xs pr-md shadow-panel md:gap-md ${className}`.trim()}
        >
            <Brand compactOnMobile />

            <div
                aria-hidden="true"
                className="hidden h-xl w-px shrink-0 bg-outline-variant md:block"
            />

            <div className="min-w-0 flex-1">
                <SearchField onChange={onChange} onSearch={onSearch} value={value} />
            </div>
        </div>
    );
}

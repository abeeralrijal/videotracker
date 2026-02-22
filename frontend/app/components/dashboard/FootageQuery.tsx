"use client";

import { SearchIcon } from "../icons";

/** Props for FootageQuery */
interface FootageQueryProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
}

/** Natural language search input for querying footage. */
export function FootageQuery({
  query,
  onQueryChange,
  onSearch,
}: FootageQueryProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SearchIcon className="h-5 w-5 text-amber-300" />
        <span className="text-sm font-medium text-slate-200">
          Ask about this footage
        </span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder='e.g. "Any fights today?"'
          className="input-field flex-1"
        />
        <button
          type="button"
          onClick={onSearch}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
        >
          <SearchIcon className="h-4 w-4" />
          Search
        </button>
      </div>
    </div>
  );
}

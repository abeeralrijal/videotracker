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
        <SearchIcon className="h-5 w-5 text-zinc-500" />
        <span className="text-sm font-medium text-zinc-700">
          Ask about this footage
        </span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder='e.g. "Any fights today?"'
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        <button
          type="button"
          onClick={onSearch}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          <SearchIcon className="h-4 w-4" />
          Search
        </button>
      </div>
    </div>
  );
}

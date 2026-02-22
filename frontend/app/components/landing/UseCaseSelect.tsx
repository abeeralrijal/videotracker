"use client";

import { ChevronDownIcon } from "../icons";
import { USE_CASES, type UseCaseValue } from "@/lib/constants";

/** Props for UseCaseSelect */
interface UseCaseSelectProps {
  value: UseCaseValue;
  onChange: (value: UseCaseValue) => void;
}

/** Dropdown for selecting monitoring use case (Campus Safety, Traffic Monitor). */
export function UseCaseSelect({ value, onChange }: UseCaseSelectProps) {
  const currentUseCase = USE_CASES.find((u) => u.value === value);

  return (
    <div>
      <label
        htmlFor="use-case"
        className="mb-2 block text-sm font-medium text-slate-300"
      >
        Select Use Case:
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg">
          {currentUseCase?.icon ?? "🏫"}
        </span>
        <select
          id="use-case"
          value={value}
          onChange={(e) => onChange(e.target.value as UseCaseValue)}
          className="select-field py-3 pl-10 pr-10"
        >
          {USE_CASES.map((uc) => (
            <option key={uc.value} value={uc.value}>
              {uc.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
          <ChevronDownIcon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        Options: Campus Safety | Traffic Monitor
      </p>
    </div>
  );
}

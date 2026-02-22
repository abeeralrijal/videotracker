/**
 * Application constants.
 * @module lib/constants
 */

/** Available monitoring use cases */
export const USE_CASES = [
  { value: "campus_safety", label: "Campus Safety", icon: "🏫" },
  { value: "traffic", label: "Traffic Monitor", icon: "🚗" },
] as const;

/** Union type of all use case values */
export type UseCaseValue = (typeof USE_CASES)[number]["value"];

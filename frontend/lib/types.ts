/**
 * Domain types for SentinelAI video intelligence platform.
 * @module lib/types
 */

/** Severity levels for AI-detected alerts */
export type AlertSeverity = "HIGH" | "MED" | "LOW";

/** Severity options when operator reviews an alert */
export type ReviewSeverity = "Low" | "Medium" | "High" | "Critical";

/** AI-detected event requiring operator review */
export interface Alert {
  id: string;
  type: string;
  timestamp: string;
  confidence: number;
  status: "Pending" | "Confirmed" | "Dismissed";
  description: string;
  severity: AlertSeverity;
}

/** Search result from natural language footage query */
export interface SearchResult {
  id: string;
  label: string;
  timestamp: string;
  confidence: number;
}

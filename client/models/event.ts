import { EventCategory } from "./eventCategories";

export const TIME_OF_DAY_RANGES = {
  Mornings: { start: 6, end: 11 }, // 06:00 - 11:59
  Afternoons: { start: 12, end: 16 }, // 12:00 - 16:59
  Evenings: { start: 17, end: 21 }, // 17:00 - 21:59
} as const;

export type TimeOfDay = keyof typeof TIME_OF_DAY_RANGES;

/**
 * Parse event date_time (ISO 8601 datetime or HH:MM format) and determine which part of day it falls in
 *
 * @param dateTime - Time string in ISO 8601 format (e.g., "2026-02-17T09:00:00") or "HH:MM" format (e.g., "09:00", "14:30")
 * @returns TimeOfDay category or null if outside defined ranges
 */
export function getTimeOfDay(dateTime: string): TimeOfDay | null {
  // Handle both ISO 8601 datetime strings and simple HH:MM format
  // Extract time portion: supports "2026-02-17T09:00:00", "2026-02-17T09:00:00", or "09:00"
  const timeMatch = dateTime.match(/(\d{2}):(\d{2})/);
  if (!timeMatch) return null;

  const hour = parseInt(timeMatch[1], 10);

  for (const [period, range] of Object.entries(TIME_OF_DAY_RANGES)) {
    if (hour >= range.start && hour <= range.end) {
      return period as TimeOfDay;
    }
  }

  return null; // Late night events outside defined ranges
}

/**
 * Determine if the given date_time string falls on a weekend (Saturday or Sunday)
 *
 * @param dateTime - Time string in ISO 8601 format (e.g., "2026-02-17T09:00:00")
 * @returns true if the date is Saturday or Sunday, false otherwise, null if parsing fails
 */
export function isWeekend(dateTime: string): boolean | null {
  // Extract date portion from various formats
  // Supports: "2026-02-17T09:00:00", "2026-02-17T09:00:00", "2026-02-17"
  const dateMatch = dateTime.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!dateMatch) return null;

  const year = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10) - 1; // JavaScript months are 0-indexed
  const day = parseInt(dateMatch[3], 10);

  const date = new Date(year, month, day);

  // Validate that the date is valid and wasn't auto-corrected
  if (
    isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  const dayOfWeek = date.getDay();
  // 0 = Sunday, 6 = Saturday
  return dayOfWeek === 0 || dayOfWeek === 6;
}

export interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  /** ISO 8601 datetime string (e.g., "2026-02-17T08:00:00") */
  date_time: string;
  organization_id: number;

  // TODO: none of the following are supported on back-end yet
  category: EventCategory | null;
  time_zone: string;
  signup_count: number;
  user_signed_up: boolean;
}

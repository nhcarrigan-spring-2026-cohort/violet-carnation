import { EventCategory } from "./eventCategories";

export const TIME_OF_DAY_RANGES = {
  Mornings: { start: 6, end: 11 }, // 06:00 - 11:59
  Afternoons: { start: 12, end: 16 }, // 12:00 - 16:59
  Evenings: { start: 17, end: 21 }, // 17:00 - 21:59
} as const;

export type TimeOfDay = keyof typeof TIME_OF_DAY_RANGES;

/**
 * Parse event time (HH:MM format) and determine which part of day it falls in
 * @param time - Time string in "HH:MM" format (e.g., "09:00", "14:30")
 * @returns TimeOfDay category or null if outside defined ranges
 */
export function getTimeOfDay(time: string): TimeOfDay | null {
  const hour = parseInt(time.split(":")[0], 10);

  for (const [period, range] of Object.entries(TIME_OF_DAY_RANGES)) {
    if (hour >= range.start && hour <= range.end) {
      return period as TimeOfDay;
    }
  }

  return null; // Late night events outside defined ranges
}

export interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  category: EventCategory | null;
  date: string;
  time: string;
  time_zone: string;
  organization_id: number;
  signup_count: number;
  user_signed_up: boolean;
  is_weekend: boolean;
}

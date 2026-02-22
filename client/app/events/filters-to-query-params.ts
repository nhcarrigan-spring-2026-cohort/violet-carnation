import { TIME_OF_DAY_RANGES, TimeOfDay } from "@/models/event";
import { Filters } from "@/models/filters";

/**
 * Convert client-side Filters state into URLSearchParams for the /api/events endpoint.
 *
 * The API supports: begin_time, end_time, begin_date, end_date, is_weekday.
 * The API applies all params with AND logic, but the client's availability
 * filter uses OR logic (any matching availability includes the event).
 *
 * Mapping strategy:
 * - When only time-of-day options are selected (Mornings/Afternoons/Evenings),
 *   compute the broadest time range (min start → max end) as begin_time/end_time.
 *   If the range is non-contiguous (e.g. Mornings+Evenings skipping Afternoons),
 *   the server will overfetch and client-side filtering refines the result.
 * - When only "Weekends" is selected, map to is_weekday=false.
 * - When both weekends AND time-of-day options are selected, we cannot express
 *   the OR semantics server-side (API would AND them). In this case we skip
 *   availability query params entirely and rely on client-side filtering.
 * - "Flexible" is a no-op (no server-side filtering).
 * - scope and category are not supported by the API and remain client-side only.
 *
 * @param filters - The current filter state from the UI
 * @returns URLSearchParams to append to the /api/events request
 */
export function filtersToQueryParams(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();

  if (!filters.availability || filters.availability.length === 0) {
    return params;
  }

  const hasWeekends = filters.availability.includes("Weekends");
  const hasFlexible = filters.availability.includes("Flexible");
  const timeSlots = filters.availability.filter(
    (a): a is TimeOfDay =>
      a !== "Weekends" && a !== "Flexible" && a in TIME_OF_DAY_RANGES,
  );

  // "Flexible" means no restrictions — skip all server-side filtering
  if (hasFlexible) {
    return params;
  }

  if (hasWeekends && timeSlots.length > 0) {
    // Can't express "Weekends OR Mornings" with AND-based API.
    // Fall back entirely to client-side filtering.
    return params;
  }

  if (hasWeekends) {
    // Only weekends selected — map directly
    params.set("is_weekday", "false");
    return params;
  }

  if (timeSlots.length > 0) {
    // Compute the broadest time range across all selected time-of-day slots
    const ranges = timeSlots.map((slot) => TIME_OF_DAY_RANGES[slot]);
    const minStart = Math.min(...ranges.map((r) => r.start));
    const maxEnd = Math.max(...ranges.map((r) => r.end));

    params.set("begin_time", `${String(minStart).padStart(2, "0")}:00`);
    params.set("end_time", `${String(maxEnd).padStart(2, "0")}:59`);
  }

  return params;
}

import { TIME_OF_DAY_RANGES, TimeOfDay } from "@/models/event";
import { Filters } from "@/models/filters";
import { Role } from "@/models/roles";

/**
 * Convert client-side Filters state into URLSearchParams for the /api/events endpoint.
 *
 * API filter support:
 * - scope     → organization_id (one per org derived from userRoles; "all" sends none)
 * - availability:
 *   - Weekends only             → is_weekday=false
 *   - Time-of-day only          → begin_time/end_time (broadest range; client refines non-contiguous)
 *   - Weekends + time-of-day    → no params sent; client-side filtering handles it (OR can't be expressed)
 *   - Flexible                  → no-op
 * - category  → category (one param per selected category; OR logic on the server)
 *
 * @param filters - The current filter state from the UI
 * @param userRoles - The current user's roles, used to resolve scope into org IDs
 * @returns URLSearchParams to append to the /api/events request
 */
export function filtersToQueryParams(
  filters: Filters,
  userRoles: Role[] = [],
): URLSearchParams {
  const params = new URLSearchParams();

  // Map scope to organization_id query params
  if (filters.scope === "myOrgs") {
    userRoles
      .map((r) => r.organization_id)
      .forEach((id) => params.append("organization_id", String(id)));
  } else if (filters.scope === "admin") {
    userRoles
      .filter((r) => r.permission_level === "admin")
      .map((r) => r.organization_id)
      .forEach((id) => params.append("organization_id", String(id)));
  }

  // Map selected categories to category query params
  if (filters.categories && filters.categories.length > 0) {
    filters.categories.forEach((cat) => params.append("category", cat));
  }

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

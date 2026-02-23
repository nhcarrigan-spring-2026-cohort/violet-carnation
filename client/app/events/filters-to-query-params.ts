import { TIME_OF_DAY_RANGES, TimeOfDay } from "@/models/event";
import { Filters } from "@/models/filters";
import { Role } from "@/models/roles";

/**
 * Convert client-side Filters state into URLSearchParams for the /api/events endpoint.
 *
 * API filter support:
 * - scope     → organization_id (one per org derived from userRoles; "all" sends none)
 * - availability:
 *   - Weekends   → is_weekday=false
 *   - Time-of-day (Mornings/Afternoons/Evenings) → begin_time/end_time from TIME_OF_DAY_RANGES
 *   - Flexible   → no-op (no restrictions)
 * - category  → category=X query params (one per selected category, OR logic on the API)
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

  // Map category filters → category=X query params
  if (filters.category && filters.category.length > 0) {
    filters.category.forEach((cat) => params.append("category", cat));
  }

  // Map location filter → location query param (substring match on backend)
  if (filters.location) {
    params.set("location", filters.location);
  }

  if (!filters.availability) {
    return params;
  }

  const availability = filters.availability;

  // "Flexible" means no restrictions — skip all server-side filtering
  if (availability === "Flexible") {
    return params;
  }

  if (availability === "Weekends") {
    params.set("is_weekday", "false");
    return params;
  }

  // Time-of-day slot — map to begin_time/end_time
  const range = TIME_OF_DAY_RANGES[availability as TimeOfDay];
  if (range) {
    params.set("begin_time", `${String(range.start).padStart(2, "0")}:00`);
    params.set("end_time", `${String(range.end).padStart(2, "0")}:59`);
  }

  return params;
}

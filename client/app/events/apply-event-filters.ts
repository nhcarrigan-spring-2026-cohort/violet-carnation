import { Event, getTimeOfDay, isWeekend } from "@/models/event";
import { Filters } from "@/models/filters";
import { Role } from "@/models/roles";

/**
 * Temporary client-side filtering, used as an example of using jest to test.
 *
 * @param events The list of all events as-is
 * @param filters the filter state to apply
 * @param userRoles the user's roles
 * @returns the list of events after applying the filters
 */
export function applyEventFilters(
  events: Event[],
  filters: Filters,
  userRoles: Role[],
) {
  let filtered = events;

  //Filter by scope
  if (filters.scope === "myOrgs") {
    filtered = filtered.filter((event) =>
      userRoles.some((role) => role.organization_id === event.organization_id),
    );
  } else if (filters.scope === "admin") {
    filtered = filtered.filter((event) =>
      userRoles.some(
        (role) =>
          role.organization_id === event.organization_id &&
          role.permission_level === "admin",
      ),
    );
  }

  // Filter by category
  if (filters.category) {
    filtered = filtered.filter((event) => event.category === filters.category);
  }

  // Filter by availability
  if (filters.availability && filters.availability.length > 0) {
    filtered = filtered.filter((event) => {
      if (filters.availability!.includes("Weekends") && isWeekend(event.date_time)) {
        return true;
      }

      const eventTimeOfDay = getTimeOfDay(event.date_time);
      if (eventTimeOfDay && filters.availability!.includes(eventTimeOfDay)) {
        return true;
      }

      return false;
    });
  }

  return filtered;
}

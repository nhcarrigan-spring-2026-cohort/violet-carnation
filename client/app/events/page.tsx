"use client";

import { Event } from "@/models/event";
import { Filters } from "@/models/filters";
import { Role } from "@/models/roles";
import { useCallback, useEffect, useState } from "react";
import ActiveFilters from "../../components/ActiveFilters";
import EventCarousel from "../../components/EventCarousel";
import FilterButton from "../../components/FilterButton";
import FilterModal from "../../components/FilterModal";
import NavBar from "../../components/NavBar";
import { filtersToQueryParams } from "./filters-to-query-params";

// Helper functions

function getActiveFilterCount(filters: Filters) {
  let count = 0;
  if (filters.scope !== "all") count++;
  if (filters.availability) count++;
  return count;
}

function removeFilter(filters: Filters, key: string) {
  // Returns new filters object without that key
  return {
    ...filters,
    [key]: key === "scope" ? "all" : null,
  };
}

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    scope: "all",
    availability: null,
  });

  const fetchEvents = useCallback(() => {
    const queryParams = filtersToQueryParams(filters, userRoles);
    const queryString = queryParams.toString();
    const eventsUrl = queryString ? `/api/events?${queryString}` : "/api/events";

    fetch(eventsUrl)
      .then((res) => res.json())
      .then((eventsData) => setEvents(eventsData))
      .catch((error) => console.error("Error fetching events:", error));
  }, [filters, userRoles]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    // TODO: this forces the first user_id for simplicity, this needs to be removed later.
    // in the future the back-end will just know this information.
    fetch("/api/roles?user_id=1")
      .then((res) => res.json())
      .then((rolesData) => setUserRoles(rolesData))
      .catch((error) => console.error("Error fetching roles:", error));
  }, []);

  const handleRemoveFilter = (key: string) => {
    setFilters(removeFilter(filters, key));
  };

  return (
    <div>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Events</h1>
          <FilterButton
            onClick={() => setShowFilters(true)}
            activeCount={getActiveFilterCount(filters)}
          />
        </div>
        <ActiveFilters filters={filters} onRemove={handleRemoveFilter} />
        <EventCarousel events={events} />
      </main>
      {showFilters && (
        <FilterModal
          onClose={() => setShowFilters(false)}
          filters={filters}
          onApply={(newFilters) => {
            setFilters(newFilters);
            setShowFilters(false);
          }}
        />
      )}
    </div>
  );
};

export default EventsPage;

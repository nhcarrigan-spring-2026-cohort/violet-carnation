"use client";

import { Event } from "@/models/event";
import { Filters } from "@/models/filters";
import { Role } from "@/models/roles";
import { useEffect, useState } from "react";
import ActiveFilters from "../../components/ActiveFilters";
import EventCarousel from "../../components/EventCarousel";
import FilterButton from "../../components/FilterButton";
import FilterModal from "../../components/FilterModal";
import NavBar from "../../components/NavBar";
import { applyEventFilters } from "./apply-event-filters";

// Helper functions

function getActiveFilterCount(filters: Filters) {
  let count = 0;
  if (filters.scope !== "all") count++;
  if (filters.category) count++;
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
    category: null,
    availability: null,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/events")
        .then((res) => res.json())
        .catch(() => []),
      fetch("/api/roles")
        .then((res) => res.json())
        .catch(() => []),
    ])
      .then(([eventsData, rolesData]) => {
        setEvents(eventsData);
        setUserRoles(rolesData);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  const filteredEvents = applyEventFilters(events, filters, userRoles);

  const handleRemoveFilter = (key: string) => {
    setFilters(removeFilter(filters, key));
  };

  return (
    <div>
      <NavBar />
      <FilterButton
        onClick={() => setShowFilters(true)}
        activeCount={getActiveFilterCount(filters)}
      />
      <ActiveFilters filters={filters} onRemove={handleRemoveFilter} />
      <EventCarousel events={filteredEvents} />
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

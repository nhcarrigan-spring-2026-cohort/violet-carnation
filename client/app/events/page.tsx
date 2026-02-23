"use client";

import { useRoles } from "@/context/RolesContext";
import { Event } from "@/models/event";
import { Filters } from "@/models/filters";
import { useCallback, useEffect, useState } from "react";
import EventCarousel from "../../components/EventCarousel";
import FilterModal from "../../components/FilterModal";
import NavBar from "../../components/NavBar";
import { filtersToQueryParams } from "./filters-to-query-params";

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const { roles: userRoles } = useRoles();
  const [filters, setFilters] = useState<Filters>({
    scope: "all",
    availability: null,
  });

  const fetchEvents = useCallback(() => {
    const queryParams = filtersToQueryParams(filters, userRoles);
    const queryString = queryParams.toString();
    const eventsUrl = queryString ? `/api/events?${queryString}` : "/api/events";

    fetch(eventsUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((eventsData) => setEvents(eventsData))
      .catch((error) => console.error("Error fetching events:", error));
  }, [filters, userRoles]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Events</h1>
        <FilterModal filters={filters} onChange={setFilters} />
        <EventCarousel events={events} />
      </main>
    </div>
  );
};

export default EventsPage;

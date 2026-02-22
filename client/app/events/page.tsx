"use client";

import { Event } from "@/models/event";
import { Filters } from "@/models/filters";
import { Role } from "@/models/roles";
import { useCallback, useEffect, useState } from "react";
import EventCarousel from "../../components/EventCarousel";
import FilterModal from "../../components/FilterModal";
import NavBar from "../../components/NavBar";
import { filtersToQueryParams } from "./filters-to-query-params";

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
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

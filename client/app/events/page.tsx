"use client";

import React from "react";
import { useState, useEffect } from "react";
import { User } from "@/models/user";
import { Filters } from "@/models/filters";
import { Event } from "@/models/event";
import { Role } from "@/models/roles";
import NavBar from "../components/NavBar";
import FilterButton from "../components/FilterButton";
import FilterModal from "../components/FilterModal";
import ActiveFilters from "../components/ActiveFilters";
import EventCarousel from "../components/EventCarousel";

// Helper functions
function applyFilters(events: Event[], filters: Filters, userRoles: Role[]) {
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
	// TODO: Still need category list
	if (filters.category) {
		filtered = filtered.filter((event) => event.category === filters.category);
	}

	// Filter by radius
	if (filters.radius) {
		// TODO: distance calculation logic
	}

	// Filter by timeFrame
	if (filters.timeFrame) {
		// TODO: time frame filtering logic
	}

	return filtered;
}

function getActiveFilterCount(filters: Filters) {
	let count = 0;
	if (filters.scope !== "all") count++;
	if (filters.category) count++;
	if (filters.radius) count++;
	if (filters.timeFrame) count++;
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
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [events, setEvents] = useState<Event[]>([]);
	const [userRoles, setUserRoles] = useState<Role[]>([]);
	const [showFilters, setShowFilters] = useState(false);
	const [filters, setFilters] = useState<Filters>({
		scope: "all",
		category: null,
		radius: null,
		timeFrame: null,
	});

	useEffect(() => {
		Promise.all([
			fetch("/api/events")
				.then((res) => res.json())
				.catch(() => []),
			fetch("/api/roles")
				.then((res) => res.json())
				.catch(() => []),
			fetch("/api/user")
				.then((res) => res.json())
				.catch(() => null),
		])
			.then(([eventsData, rolesData, userData]) => {
				setEvents(eventsData);
				setUserRoles(rolesData);
				setCurrentUser(userData);
			})
			.catch((error) => console.error("Error:", error));
	}, []);

	const filteredEvents = applyFilters(events, filters, userRoles);

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
			<FilterModal
				isOpen={showFilters}
				onClose={() => setShowFilters(false)}
				filters={filters}
				onApply={(newFilters) => {
					setFilters(newFilters);
					setShowFilters(false);
				}}
			/>
		</div>
	);
};

export default EventsPage;

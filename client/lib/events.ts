import type { Event, EventIn, EventUpdate } from "@/models/event";

const API_BASE = "/api";

/**
 * Creates a new event.
 *
 * @param payload - Event data to create.
 * @returns The newly created event.
 */
export async function createEvent(payload: EventIn): Promise<Event> {
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail ?? "Failed to create event.");
  }

  return res.json() as Promise<Event>;
}

/**
 * Updates an existing event by ID.
 *
 * @param id - The event ID to update.
 * @param payload - Partial event data to apply.
 * @returns The updated event.
 */
export async function updateEvent(id: number, payload: EventUpdate): Promise<Event> {
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail ?? "Failed to update event.");
  }

  return res.json() as Promise<Event>;
}

/**
 * Fetches a single event by ID.
 *
 * @param id - The event ID to retrieve.
 * @returns The matching event.
 */
export async function getEventById(id: number): Promise<Event> {
  const res = await fetch(`${API_BASE}/events/${id}`);

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail ?? "Event not found.");
  }

  return res.json() as Promise<Event>;
}

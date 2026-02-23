"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import EventCarousel from "@/components/EventCarousel";
import { useCurrentUserId } from "@/lib/useCurrentUserId";
import type { Event } from "@/models/event";

/**
 * Client component that fetches and displays personalised event recommendations
 * for the currently logged-in user (identified via the `user_id` cookie).
 *
 * - Not logged in → prompt to sign in
 * - Logged in, fetch in progress → loading indicator
 * - Logged in, no results → prompt to set interests on profile
 * - Results present → renders EventCarousel
 */
export default function RecommendedEvents() {
  const userId = useCurrentUserId();
  // null = not yet fetched; Event[] = fetch complete (may be empty)
  const [events, setEvents] = useState<Event[] | null>(null);

  useEffect(() => {
    // Only schedule the async fetch — no synchronous setState calls in this body
    if (userId === null) return;

    let cancelled = false;

    fetch(`/api/events/recommended?user_id=${userId}&limit=10`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Event[]) => {
        if (!cancelled) setEvents(data);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // User is not logged in
  if (userId === null) {
    return (
      <p className="text-muted-foreground text-center py-8">
        <Link href="/signin" className="underline">
          Sign in
        </Link>{" "}
        to get personalised event recommendations.
      </p>
    );
  }

  // Fetch in progress
  if (events === null) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading recommendations…
      </div>
    );
  }

  // Logged in but no matching events (no interests set or no matches found)
  if (events.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Set your interests on your{" "}
        <Link href="/profile" className="underline">
          profile
        </Link>{" "}
        to get personalised recommendations.
      </p>
    );
  }

  return <EventCarousel events={events} />;
}

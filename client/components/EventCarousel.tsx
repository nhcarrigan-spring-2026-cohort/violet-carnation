"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Event } from "@/models/event";
import { EVENT_CATEGORIES, EventCategory } from "@/models/eventCategories";
import { CalendarDays, MapPin } from "lucide-react";
import { useState } from "react";

interface EventCarouselProps {
  events: Event[];
}

function formatDateTime(dateTime: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateTime));
  } catch {
    return dateTime;
  }
}

const OTHER_CATEGORY = "Other";

const EventCarousel = ({ events }: EventCarouselProps) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  if (events.length === 0) {
    return (
      <p className="text-muted-foreground text-sm mt-6 text-center">
        No events found. Try adjusting your filters.
      </p>
    );
  }

  // Group events by category; events without a category go into "Other"
  const grouped = new Map<EventCategory | typeof OTHER_CATEGORY, Event[]>();
  for (const event of events) {
    const key = event.category ?? OTHER_CATEGORY;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(event);
  }

  // Order sections: defined categories first (in their canonical order), then "Other"
  const orderedCategories: Array<EventCategory | typeof OTHER_CATEGORY> = [
    ...(EVENT_CATEGORIES.filter((c) => grouped.has(c)) as EventCategory[]),
    ...(grouped.has(OTHER_CATEGORY) ? ([OTHER_CATEGORY] as const) : []),
  ];

  return (
    <div className="flex flex-col gap-8">
      {orderedCategories.map((category) => (
        <section key={category} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{category}</h2>
          {/* Horizontal scrollable carousel for this category */}
          <div className="flex overflow-x-auto gap-4 pb-2">
            {grouped.get(category)!.map((event) => (
              <Card
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`min-w-56 max-w-64 cursor-pointer shrink-0 transition-shadow hover:shadow-md ${
                  selectedEvent?.id === event.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base line-clamp-2">{event.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    {formatDateTime(event.date_time)}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}

      {/* Featured / selected event detail */}
      {selectedEvent && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedEvent.name}</CardTitle>
            <CardDescription className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {formatDateTime(selectedEvent.date_time)}
              </span>
              {selectedEvent.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {selectedEvent.location}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {selectedEvent.description || "No description provided."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventCarousel;

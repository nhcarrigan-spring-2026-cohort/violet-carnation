"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Event } from "@/models/event";
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

const EventCarousel = ({ events }: EventCarouselProps) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  if (events.length === 0) {
    return (
      <p className="text-muted-foreground text-sm mt-6 text-center">
        No events found. Try adjusting your filters.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Scrollable event card list */}
      <div className="flex overflow-x-auto gap-4 pb-2">
        {events.map((event) => (
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

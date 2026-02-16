"use client";

import React from "react";
import { useState } from "react";
import { Event } from "@/models/event";

interface EventCarouselProps {
  events: Event[];
}

const EventCarousel = ({ events }: EventCarouselProps) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  return (
    <div>
      <div className="flex overflow-x-auto gap-4">
        {events.map((event) => (
          <div key={event.id} onClick={() => setSelectedEvent(event)}>
            {event.name}
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="featured-card">
          <h2>{selectedEvent.name}</h2>
          <p>{selectedEvent.description}</p>
        </div>
      )}
    </div>
  );
};

export default EventCarousel;

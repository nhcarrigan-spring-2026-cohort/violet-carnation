"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EventRegistrationWithEvent } from "@/models/eventRegistration";
import Link from "next/link";
import { useEffect, useState } from "react";
import NavBar from "../../../components/NavBar";

const PAGE_SIZE = 10;

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isUpcoming(eventDateTime: string): boolean {
  return new Date(eventDateTime) > new Date();
}

const EventHistoryPage = () => {
  // TODO: this forces the first user_id for simplicity, this needs to be removed later.
  // in the future the back-end will just know this information.
  const userId = 1;

  const [registrations, setRegistrations] = useState<EventRegistrationWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const skip = page * PAGE_SIZE;
    fetch(
      `/api/event-registrations?user_id=${userId}&include_event_details=true&skip=${skip}&limit=${PAGE_SIZE}`,
    )
      .then((res) => res.json())
      .then((data: EventRegistrationWithEvent[]) => {
        setRegistrations(data);
        setHasMore(data.length === PAGE_SIZE);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching registration history:", error);
        setLoading(false);
      });
  }, [page]);

  return (
    <div>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">My Registration History</h1>
        <Separator />

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">
            You haven&apos;t registered for any events yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {registrations.map((reg) => (
              <Card key={`${reg.event_id}-${reg.registration_time}`}>
                <CardContent className="py-4 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/events/${reg.event_id}`}
                      className="text-base font-semibold hover:underline"
                    >
                      {reg.event_name}
                    </Link>
                    <Badge
                      variant={
                        isUpcoming(reg.event_date_time) ? "default" : "secondary"
                      }
                    >
                      {isUpcoming(reg.event_date_time) ? "Upcoming" : "Past"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(reg.event_date_time)}
                  </p>
                  <p className="text-sm text-muted-foreground">{reg.event_location}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && (registrations.length > 0 || page > 0) && (
          <div className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() => {
                setLoading(true);
                setPage((p) => p - 1);
              }}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page + 1}</span>
            <Button
              variant="outline"
              disabled={!hasMore}
              onClick={() => {
                setLoading(true);
                setPage((p) => p + 1);
              }}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default EventHistoryPage;

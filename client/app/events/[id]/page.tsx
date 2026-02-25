"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUserId } from "@/lib/useCurrentUserId";
import { Event } from "@/models/event";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

const EventDetailPage = (props: PageProps) => {
  const params = use(props.params);
  const eventId = Number(params.id);
  const userId = useCurrentUserId();
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const eventRes = await fetch(`/api/events/${eventId}`);
        if (eventRes.status === 404) {
          setError("Event not found.");
          return;
        }
        if (!eventRes.ok) {
          setError("Failed to load event.");
          return;
        }
        const eventData: Event = await eventRes.json();
        setEvent(eventData);

        // Check existing registration status for the authenticated user
        if (typeof userId === "number") {
          const regRes = await fetch(
            `/api/event-registrations?event_id=${eventId}&user_id=${userId}`,
          );
          if (regRes.ok) {
            const regData: unknown[] = await regRes.json();
            setIsRegistered(regData.length > 0);
          }
        }
      } catch {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [eventId, userId]);

  const handleRegister = async () => {
    if (!event) return;
    if (typeof userId !== "number") {
      if (userId === null) router.push("/signin");
      return;
    }
    setRegistering(true);
    try {
      const res = await fetch("/api/event-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          organization_id: event.organization_id,
          event_id: event.id,
          user_id: userId,
          registration_time: new Date().toISOString().replace(/\.\d{3}Z$/, ""),
        }),
      });
      if (res.ok) {
        setIsRegistered(true);
        toast.success("Registered for event!");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error((data as { detail?: string }).detail ?? "Failed to register.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!event) return;
    if (typeof userId !== "number") {
      if (userId === null) router.push("/signin");
      return;
    }
    setRegistering(true);
    try {
      const res = await fetch(
        `/api/event-registrations/${event.organization_id}/${event.id}/${userId}`,
        { method: "DELETE", credentials: "include" },
      );
      if (res.ok) {
        setIsRegistered(false);
        toast.success("Unregistered from event.");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error((data as { detail?: string }).detail ?? "Failed to unregister.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-5 w-32 mb-6" />
        <Skeleton className="h-10 w-2/3 mb-3" />
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-5 w-40 mb-6" />
        <Skeleton className="h-24 w-full mb-6" />
        <Skeleton className="h-10 w-32" />
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <p className="text-destructive text-lg">{error ?? "Event not found."}</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/events">Back to Events</Link>
        </Button>
      </main>
    );
  }

  const formattedDate = new Date(event.date_time).toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back navigation */}
      <Link
        href="/events"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block"
      >
        ← Back to Events
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <CardTitle className="text-3xl">{event.name}</CardTitle>
            <div className="flex gap-2 flex-wrap">
              {event.category && <Badge variant="secondary">{event.category}</Badge>}
            </div>
          </div>

          <p className="text-muted-foreground text-sm mt-1">{formattedDate}</p>
          <p className="text-muted-foreground text-sm">{event.location}</p>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6 space-y-6">
          {/* Description */}
          <p className="text-base leading-relaxed">{event.description}</p>

          {/* Organization link */}
          <div>
            <span className="text-sm text-muted-foreground">Organized by: </span>
            <Link
              href={`/organizations/${event.organization_id}`}
              className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground"
            >
              View Organization
            </Link>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {isRegistered ? (
              <Button
                variant="outline"
                onClick={handleUnregister}
                disabled={registering}
              >
                {registering ? "Unregistering…" : "Unregister"}
              </Button>
            ) : (
              <Button onClick={handleRegister} disabled={registering}>
                {registering ? "Registering…" : "Register"}
              </Button>
            )}

            {/* Edit link — shown to all users for now */}
            {/* TODO: gate this to org admins once auth context is available */}
            <Button asChild variant="ghost" size="sm">
              <Link href={`/events/${eventId}/edit`}>Edit Event</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default EventDetailPage;

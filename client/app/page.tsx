import { Building2, Calendar, ClipboardList } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import EventCarousel from "@/components/EventCarousel";
import NavBar from "@/components/NavBar";
import RecommendedEvents from "@/components/RecommendedEvents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getServerSession } from "@/lib/session";
import type { Event } from "@/models/event";

async function UpcomingEvents() {
  const today = new Date().toISOString().split("T")[0];
  // API_URL is a server-side env var; falls back to localhost for local development.
  // Set API_URL in production to the internal API base URL (e.g. http://api:8000).
  const apiUrl = process.env.API_URL ?? "http://localhost:8000";
  let events: Event[] = [];

  try {
    const res = await fetch(`${apiUrl}/api/events?begin_date=${today}&limit=6`, {
      cache: "no-store",
    });
    if (res.ok) {
      events = await res.json();
    }
  } catch {
    // API unavailable — show fallback below
  }

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Upcoming Events</h2>
        <Link href="/events" className="text-sm text-primary hover:underline">
          View all events →
        </Link>
      </div>
      {events.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No upcoming events right now.{" "}
          <Link href="/events" className="underline">
            Browse all events
          </Link>
          .
        </p>
      ) : (
        <EventCarousel events={events} />
      )}
    </section>
  );
}

export default async function Home() {
  const session = await getServerSession();

  return (
    <div>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4">
        {/* Hero Section — only shown to unauthenticated visitors */}
        {!session && (
          <>
            <section className="py-20 text-center">
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Make a Difference in Your Community
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Discover volunteer opportunities, connect with organisations, and track your
                impact — all in one place.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button asChild size="lg">
                  <Link href="/events">Browse Events</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </section>

            <Separator />
          </>
        )}

        {/* Upcoming Events Section */}
        <Suspense
          fallback={
            <div className="py-12 text-center text-muted-foreground">
              Loading upcoming events…
            </div>
          }
        >
          <UpcomingEvents />
        </Suspense>

        <Separator />

        {/* Recommended for You Section */}
        <section className="py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recommended for You</h2>
          </div>
          <RecommendedEvents />
        </section>

        <Separator />

        {/* Feature Highlights */}
        <section className="py-12">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Find Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Browse upcoming volunteer events filtered by time, location, and
                  category.
                </p>
                <Link href="/events" className="text-sm text-primary hover:underline">
                  Browse events →
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Building2 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Join an Organisation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Connect with local nonprofits and community groups looking for
                  volunteers.
                </p>
                <Link
                  href="/organizations"
                  className="text-sm text-primary hover:underline"
                >
                  Browse organisations →
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ClipboardList className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Track Your History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Keep a record of your volunteer contributions and celebrate your
                  impact.
                </p>
                <Link href="/profile" className="text-sm text-primary hover:underline">
                  View profile →
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

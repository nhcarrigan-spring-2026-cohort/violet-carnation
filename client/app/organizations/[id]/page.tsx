"use client";

import EventCarousel from "@/components/EventCarousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUserId } from "@/lib/useCurrentUserId";
import { Event } from "@/models/event";
import { getOrganizationCategoryLabel } from "@/models/organizationCategories";
import { Organization, RoleAndUser } from "@/models/organizations";
import Link from "next/link";
import { use, useEffect, useState } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const IndividualOrganizationPage = (props: PageProps) => {
  const params = use(props.params);
  const orgId = Number(params.id);

  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<RoleAndUser[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const currentUserId = useCurrentUserId();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [orgRes, membersRes, eventsRes] = await Promise.all([
          fetch(`/api/organization/${orgId}`),
          fetch(`/api/organization/${orgId}/users`),
          fetch(`/api/events?organization_id=${orgId}`),
        ]);

        if (orgRes.status === 404) {
          setError("Organization not found.");
          return;
        }
        if (!orgRes.ok) {
          setError("Failed to load organization.");
          return;
        }

        const [orgData, membersData, eventsData] = await Promise.all([
          orgRes.json(),
          membersRes.ok ? membersRes.json() : [],
          eventsRes.ok ? eventsRes.json() : [],
        ]);

        setOrg(orgData);
        setMembers(membersData);
        setEvents(eventsData);
      } catch {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [orgId]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await fetch(`/api/organization/${orgId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ permission_level: "volunteer" }),
      });
      if (res.ok) {
        setJoinSuccess(true);
        // Refresh member list
        const updated = await fetch(`/api/organization/${orgId}/users`);
        if (updated.ok) setMembers(await updated.json());
      }
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-10 w-2/3 mb-4" />
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-5 w-4/5 mb-8" />
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </main>
    );
  }

  if (error || !org) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-destructive text-lg">{error ?? "Organization not found."}</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/organizations">Back to Organizations</Link>
        </Button>
      </main>
    );
  }

  const isAdmin =
    currentUserId != null &&
    members.some((m) => m.user_id === currentUserId && m.permission_level === "admin");
  const isMember = members.some((m) => m.user_id === 1);

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
        <h1 className="text-3xl font-bold">{org.name}</h1>
        <div className="flex gap-2">
          {org.category && (
            <Badge variant="secondary">
              {getOrganizationCategoryLabel(org.category)}
            </Badge>
          )}
          {isAdmin && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/organizations/${orgId}/edit`}>Edit</Link>
            </Button>
          )}
          {!isMember && (
            <Button size="sm" onClick={handleJoin} disabled={joining || joinSuccess}>
              {joinSuccess ? "Joined!" : joining ? "Joining…" : "Join"}
            </Button>
          )}
        </div>
      </div>

      {org.description && (
        <p className="text-muted-foreground mb-6">{org.description}</p>
      )}

      <Separator className="mb-6" />

      <Tabs defaultValue="members">
        <TabsList className="mb-6">
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
        </TabsList>

        {/* Members tab */}
        <TabsContent value="members">
          {members.length === 0 ? (
            <p className="text-muted-foreground text-sm">No members yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {members.map((member) => (
                <Card key={member.user_id} className="py-0">
                  <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                    <CardTitle className="text-base font-medium">
                      {member.name}
                    </CardTitle>
                    <Badge
                      variant={
                        member.permission_level === "admin" ? "default" : "secondary"
                      }
                    >
                      {member.permission_level}
                    </Badge>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Events tab */}
        <TabsContent value="events">
          <EventCarousel events={events} />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default IndividualOrganizationPage;

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoles } from "@/context/RolesContext";
import { createEvent } from "@/lib/events";
import { getOrganizations } from "@/lib/organizations";
import { EVENT_CATEGORIES, type EventCategory } from "@/models/eventCategories";
import type { Organization } from "@/models/organizations";

const NO_CATEGORY = "__none__";

const CreateEventPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // TODO: Once auth is implemented, useRoles() will derive user_id from session.
  // Currently relies on the user_id cookie set by the app (defaulting to user 1).
  const { roles } = useRoles();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [category, setCategory] = useState<EventCategory | typeof NO_CATEGORY>(NO_CATEGORY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Orgs where the current user is an admin
  const adminOrgIds = new Set(
    roles.filter((r) => r.permission_level === "admin").map((r) => r.organization_id),
  );

  useEffect(() => {
    if (adminOrgIds.size === 0) return;

    const preselectedOrgId = searchParams.get("organization_id");

    getOrganizations(100)
      .then((orgs) => {
        const adminOrgs = orgs.filter((o) => adminOrgIds.has(o.organization_id));
        setOrganizations(adminOrgs);
        if (preselectedOrgId && adminOrgs.some((o) => String(o.organization_id) === preselectedOrgId)) {
          setOrganizationId(preselectedOrgId);
        }
      })
      .catch(() => setError("Failed to load organizations."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const dateTime = `${date}T${time}:00`;

    try {
      const event = await createEvent({
        name,
        description,
        location,
        date_time: dateTime,
        organization_id: parseInt(organizationId, 10),
        category: category === NO_CATEGORY ? null : category,
      });
      toast.success("Event created successfully!");
      router.push(`/events/${event.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event.");
    } finally {
      setSubmitting(false);
    }
  };

  if (adminOrgIds.size === 0) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Create Event</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You must be an organization admin to create events.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Create Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Event name"
                required
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the event"
                rows={4}
                required
              />
            </div>

            {/* Location */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Event location"
                required
              />
            </div>

            {/* Date and Time */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="date">Date *</Label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="time">Time *</Label>
                <input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Organization */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="organization">Organization *</Label>
              <Select value={organizationId} onValueChange={setOrganizationId} required>
                <SelectTrigger id="organization">
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem
                      key={org.organization_id}
                      value={String(org.organization_id)}
                    >
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as EventCategory | typeof NO_CATEGORY)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY}>No category</SelectItem>
                  {EVENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !organizationId || !date || !time}
              >
                {submitting ? "Creating…" : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default CreateEventPage;

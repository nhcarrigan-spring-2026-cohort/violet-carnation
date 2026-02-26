"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRoles } from "@/context/RolesContext";
import { useCurrentUserId } from "@/lib/useCurrentUserId";
import {
  ORGANIZATION_CATEGORIES,
  OrganizationCategoryValue,
} from "@/models/organizationCategories";
import type { Organization } from "@/models/organizations";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const EditOrgPage = (props: PageProps) => {
  const params = use(props.params);
  const orgId = Number(params.id);
  const router = useRouter();
  const { roles } = useRoles();
  const currentUserId = useCurrentUserId();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<OrganizationCategoryValue | "">("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const isAdmin = roles.some(
    (r) => r.organization_id === orgId && r.permission_level === "admin",
  );

  useEffect(() => {
    const fetchOrg = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/organization/${orgId}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          setError("Failed to load organization.");
          return;
        }
        const data: Organization = await res.json();
        setName(data.name);
        setDescription(data.description ?? "");
        setCategory(data.category ?? "");
      } catch {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrg();
  }, [orgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (currentUserId === null) {
      setError("You must be signed in to edit an organization.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/organization/${orgId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          description: description || null,
          category,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.detail ?? "Failed to update organization.");
        return;
      }

      router.push(`/organizations/${orgId}`);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-lg">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-lg">
        <p className="text-destructive">Organization not found.</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-lg">
        <p className="text-destructive">
          You do not have permission to edit this organization.
        </p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Edit Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Organization name"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={4}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as OrganizationCategoryValue)} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {ORGANIZATION_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
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

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting || !category}>
                {submitting ? "Saving…" : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/organizations/${orgId}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default EditOrgPage;

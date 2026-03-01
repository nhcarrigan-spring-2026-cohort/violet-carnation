"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

import NavBar from "@/components/NavBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUserId } from "@/lib/useCurrentUserId";
import { useRoles } from "@/context/RolesContext";
import { EVENT_CATEGORIES } from "@/models/eventCategories";
import { AVAILABILITY_OPTIONS, type User } from "@/models/user";
import type { Organization } from "@/models/organizations";

export default function ProfilePage() {
  const userId = useCurrentUserId();
  const { roles } = useRoles();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [orgMap, setOrgMap] = useState<Record<number, Organization>>({});
  const [orgsLoading, setOrgsLoading] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [availability, setAvailability] = useState<string>("");
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    if (userId === null) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/auth/me`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data: User = await res.json();
        setUser(data);
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setAvailability(data.availability ?? "");
        setSkills(data.skills ?? "");
        setInterests(data.interests ?? []);
      } catch {
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  useEffect(() => {
    if (roles.length === 0) return;
    const fetchOrgs = async () => {
      setOrgsLoading(true);
      try {
        const results = await Promise.all(
          roles.map(async (role) => {
            const res = await fetch(`/api/organization/${role.organization_id}`);
            if (!res.ok) {
              console.error(`Failed to load organization ${role.organization_id}`);
              return null;
            }
            return (await res.json()) as Organization;
          }),
        );
        const map: Record<number, Organization> = {};
        for (const org of results) {
          if (org) map[org.organization_id] = org;
        }
        setOrgMap(map);
      } catch {
        toast.error("Failed to load organization details.");
      } finally {
        setOrgsLoading(false);
      }
    };
    fetchOrgs();
  }, [roles]);

  const handleInterestChange = (category: string, checked: boolean) => {
    setInterests((prev) =>
      checked ? [...prev, category] : prev.filter((i) => i !== category),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userId === null) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          availability: availability || null,
          skills,
          interests,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { detail?: string };
        throw new Error(err.detail ?? "Failed to save profile.");
      }
      toast.success("Profile saved successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Loading profile…</p>
        </div>
      </>
    );
  }

  if (userId === null) {
    return (
      <>
        <NavBar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">
            You must be logged in to view your profile.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            {user && <p className="text-sm text-muted-foreground">{user.email}</p>}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <Separator />

              {/* Availability */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label>Availability</Label>
                  {availability && <Badge variant="secondary">{availability}</Badge>}
                </div>
                <RadioGroup
                  value={availability}
                  onValueChange={setAvailability}
                  className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                >
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`avail-${option}`} />
                      <Label
                        htmlFor={`avail-${option}`}
                        className="cursor-pointer font-normal"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. First Aid, Cooking, Teaching…"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple skills with commas.
                </p>
              </div>

              <Separator />

              {/* Interests */}
              <div className="space-y-3">
                <Label>Interests</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {EVENT_CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`interest-${category}`}
                        checked={interests.includes(category)}
                        onCheckedChange={(checked) =>
                          handleInterestChange(category, checked === true)
                        }
                      />
                      <Label
                        htmlFor={`interest-${category}`}
                        className="cursor-pointer text-sm font-normal leading-tight"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving…" : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Organizations */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>My Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            {roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You are not a member of any organizations yet.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {roles.map((role) => {
                  const org = orgMap[role.organization_id];
                  return (
                    <Link
                      key={role.organization_id}
                      href={`/organizations/${role.organization_id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between rounded-md border px-4 py-3 hover:bg-muted transition-colors">
                        <span className="font-medium">
                          {orgsLoading && !org
                            ? "Loading…"
                            : (org?.name ?? "Unknown organization")}
                        </span>
                        <Badge
                          variant={
                            role.permission_level === "admin" ? "default" : "secondary"
                          }
                        >
                          {role.permission_level}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

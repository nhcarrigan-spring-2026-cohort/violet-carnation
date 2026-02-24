"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRoles } from "@/context/RolesContext";
import type { RoleAndUser } from "@/models/organizations";
import type { PermissionLevel } from "@/models/roles";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

const OrgUsersPage = (props: PageProps) => {
  const params = use(props.params);
  const orgId = Number(params.id);
  const { roles } = useRoles();

  const [members, setMembers] = useState<RoleAndUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add user form state
  const [addUserId, setAddUserId] = useState("");
  const [addPermission, setAddPermission] = useState<PermissionLevel>("volunteer");
  const [adding, setAdding] = useState(false);

  const isAdmin = roles.some(
    (r) => r.organization_id === orgId && r.permission_level === "admin",
  );

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/organization/${orgId}/users`);
      if (!res.ok) {
        setError("Failed to load members.");
        return;
      }
      setMembers(await res.json());
    } catch {
      setError("An unexpected error occurred.");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchMembers();
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = parseInt(addUserId, 10);
    if (isNaN(uid)) {
      toast.error("Please enter a valid user ID.");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`/api/organization/${orgId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id: uid, permission_level: addPermission }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.detail ?? "Failed to add user.");
        return;
      }
      toast.success("User added.");
      setAddUserId("");
      setAddPermission("volunteer");
      await fetchMembers();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setAdding(false);
    }
  };

  const handleChangeRole = async (memberId: number, level: PermissionLevel) => {
    try {
      const res = await fetch(`/api/organization/${orgId}/users/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ permission_level: level }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.detail ?? "Failed to update role.");
        return;
      }
      toast.success("Role updated.");
      await fetchMembers();
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  const handleRemoveUser = async (memberId: number) => {
    try {
      const res = await fetch(
        `/api/organization/${orgId}/users/${memberId}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.detail ?? "Failed to remove user.");
        return;
      }
      toast.success("User removed.");
      await fetchMembers();
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <p className="text-destructive">{error}</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-muted-foreground text-sm">No members yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Role</TableHead>
                  {isAdmin && (
                    <>
                      <TableHead>Change Role</TableHead>
                      <TableHead></TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.user_id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.user_id}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.permission_level === "admin" ? "default" : "secondary"
                        }
                      >
                        {member.permission_level}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <>
                        <TableCell>
                          <Select
                            value={member.permission_level}
                            onValueChange={(val) =>
                              handleChangeRole(member.user_id, val as PermissionLevel)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="volunteer">Volunteer</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                Remove
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove member?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove <strong>{member.name}</strong> from
                                  the organization. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveUser(member.user_id)}
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Add Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleAddUser}
              className="flex flex-col gap-4 sm:flex-row sm:items-end"
            >
              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="add-user-id">User ID</Label>
                <Input
                  id="add-user-id"
                  type="number"
                  min={1}
                  value={addUserId}
                  onChange={(e) => setAddUserId(e.target.value)}
                  placeholder="Enter user ID"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="add-permission">Role</Label>
                <Select
                  value={addPermission}
                  onValueChange={(val) => setAddPermission(val as PermissionLevel)}
                >
                  <SelectTrigger id="add-permission" className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={adding}>
                {adding ? "Adding…" : "Add User"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default OrgUsersPage;

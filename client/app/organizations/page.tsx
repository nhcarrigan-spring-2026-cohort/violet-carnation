"use client";

import { Organization } from "@/models/organizations";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const LIMIT = 10;

const OrganizationsPage = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchOrganizations = useCallback(
    async (currentSkip: number, currentSearch: string, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        skip: String(currentSkip),
        limit: String(LIMIT),
      });
      if (currentSearch) {
        params.set("query", currentSearch);
      }

      try {
        const res = await fetch(`/api/organization?${params.toString()}`);
        const data: Organization[] = await res.json();
        if (append) {
          setOrganizations((prev) => [...prev, ...data]);
        } else {
          setOrganizations(data);
        }
        setHasMore(data.length === LIMIT);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  // Initial fetch and re-fetch on search term change
  useEffect(() => {
    setSkip(0);
    fetchOrganizations(0, searchTerm, false);
  }, [searchTerm, fetchOrganizations]);

  const handleSearch = () => {
    setSearchTerm(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLoadMore = () => {
    const nextSkip = skip + LIMIT;
    setSkip(nextSkip);
    fetchOrganizations(nextSkip, searchTerm, true);
  };

  return (
    <div>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Organizations</h1>
          <Button asChild>
            <Link href="/organizations/create">Create Organization</Link>
          </Button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Search organizations..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="max-w-sm"
          />
          <Button variant="secondary" onClick={handleSearch}>
            Search
          </Button>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Organization cards */}
        {!loading && organizations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <Link
                key={org.organization_id}
                href={`/organizations/${org.organization_id}`}
                className="block"
              >
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {org.description ?? "No description provided."}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && organizations.length === 0 && (
          <p className="text-muted-foreground text-sm">No organizations found.</p>
        )}

        {/* Load More */}
        {!loading && hasMore && organizations.length > 0 && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrganizationsPage;

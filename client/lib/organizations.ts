import type { Organization } from "@/models/organizations";

const API_BASE = "/api";

/**
 * Fetches a list of organizations.
 *
 * @param limit - Maximum number of organizations to return (default 100).
 * @returns Array of organizations.
 */
export async function getOrganizations(limit = 100): Promise<Organization[]> {
  const res = await fetch(`${API_BASE}/organization?limit=${limit}`);

  if (!res.ok) {
    throw new Error("Failed to fetch organizations.");
  }

  return res.json() as Promise<Organization[]>;
}

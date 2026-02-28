import type { Role } from "@/models/roles";

/**
 * The base URL for the API.
 * Uses NEXT_PUBLIC_API_URL if set (for different environments),
 * otherwise defaults to the local FastAPI server.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Fetches all roles for the current user
 *
 * This function works in both server (SSR) and client contexts.
 *
 * @returns A promise resolving to the user's roles, or an empty array on failure.
 */
export async function fetchRoles(): Promise<Role[]> {
  const res = await fetch(`${API_BASE_URL}/api/roles`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  return res.json() as Promise<Role[]>;
}

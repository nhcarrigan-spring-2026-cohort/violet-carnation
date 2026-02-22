import type { Role } from "@/models/roles";

/**
 * The base URL for the API.
 * Uses NEXT_PUBLIC_API_URL if set (for different environments),
 * otherwise defaults to the local FastAPI server.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Fetches all roles for a given user from the API.
 *
 * This function works in both server (SSR) and client contexts.
 *
 * TODO: Once authentication is implemented, the user_id should be derived
 * from the session token rather than being passed explicitly.
 *
 * @param userId - The ID of the user whose roles to fetch.
 * @returns A promise resolving to the user's roles, or an empty array on failure.
 */
export async function fetchRoles(userId: number): Promise<Role[]> {
  const res = await fetch(`${API_BASE_URL}/api/roles?user_id=${userId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  return res.json() as Promise<Role[]>;
}

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
 * In SSR contexts, pass the forwarded cookie header so the session is sent
 * to the API — Node.js does not have a browser cookie jar, so
 * `credentials: "include"` alone is not sufficient server-side.
 *
 * @param cookieHeader - Optional raw `Cookie` header string to forward (SSR only).
 * @returns A promise resolving to the user's roles, or an empty array on failure.
 */
export async function fetchRoles(cookieHeader?: string): Promise<Role[]> {
  const url = `${API_BASE_URL}/api/roles`;
  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    headers: cookieHeader ? { Cookie: cookieHeader } : {},
  });

  if (!res.ok) {
    console.error("Failed to fetch roles:", res.statusText, url);
    return [];
  }

  const roles = (await res.json()) as Role[];
  return roles;
}

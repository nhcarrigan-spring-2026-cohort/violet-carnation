"use client";

import { useAuth } from "@/context/AuthContext";

/**
 * Returns the current user's `user_id` from the auth context.
 *
 * Returns `undefined` while the auth check is still in progress,
 * `null` when the user is not authenticated, and the user ID when authenticated.
 */
export function useCurrentUserId(): number | null | undefined {
  const { user, loading } = useAuth();
  if (loading) return undefined;
  return user?.user_id ?? null;
}

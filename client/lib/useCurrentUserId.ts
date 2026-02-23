"use client";

import { useAuth } from "@/context/AuthContext";

/**
 * Returns the current user's `user_id` from the auth context.
 *
 * Returns `null` when the user is not authenticated or the auth check is
 * still in progress.
 */
export function useCurrentUserId(): number | null {
  const { user } = useAuth();
  return user?.user_id ?? null;
}

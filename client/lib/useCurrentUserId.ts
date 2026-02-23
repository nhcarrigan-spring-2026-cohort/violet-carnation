"use client";

import { useMemo } from "react";

/**
 * Returns the current user's `user_id` parsed from the `user_id` cookie.
 *
 * Returns `null` when the cookie is absent or cannot be parsed as an integer.
 *
 * TODO: Replace cookie-based lookup with a proper auth session once
 * authentication is fully implemented.
 */
export function useCurrentUserId(): number | null {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.split("; ").find((row) => row.startsWith("user_id="));
    if (!match) return null;
    const value = match.split("=")[1];
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  }, []);
}

import { cookies } from "next/headers";

export interface SessionPayload {
  /** The authenticated user's ID, extracted from the JWT sub claim. */
  userId: number;
}

/**
 * Decodes a base64url-encoded JWT payload segment and returns the parsed
 * JSON object. Handles missing base64url padding (= characters) that are
 * omitted by the JWT spec.
 *
 * This function is exported for unit testing. All actual auth enforcement
 * happens on the back-end — this is only used for SSR hydration.
 *
 * @returns The parsed payload object, or `null` if decoding fails.
 */
export function decodeJwtPayload(
  segment: string,
): Record<string, unknown> | null {
  try {
    // Convert base64url → base64 (replace URL-safe chars)
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    // Pad to a multiple of 4 characters (JWT omits these)
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decoded = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Reads the httpOnly `session` cookie set by the API on login and decodes
 * the JWT payload to extract the current user's ID.
 *
 * Validation of the token signature is intentionally omitted here — every
 * authenticated API call will be validated on the back-end. This function
 * exists solely to hydrate server-side rendering (e.g. pre-fetching roles
 * in layout.tsx) without making a network request.
 *
 * @returns `{ userId }` when a valid-looking session cookie is present,
 *          or `null` when the cookie is absent or malformed.
 */
export async function getServerSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const payload = decodeJwtPayload(parts[1]);
  if (!payload) return null;

  const sub = payload["sub"];
  if (!sub) return null;

  const userId = parseInt(String(sub), 10);
  if (isNaN(userId)) return null;

  return { userId };
}

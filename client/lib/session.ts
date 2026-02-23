import { cookies } from "next/headers";

export interface SessionPayload {
  /** The authenticated user's ID, extracted from the JWT sub claim. */
  userId: number;
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

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode base64url-encoded JWT payload (no signature verification)
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(padded, "base64").toString("utf8");
    const payload = JSON.parse(decoded) as Record<string, unknown>;

    const sub = payload["sub"];
    if (!sub) return null;

    const userId = parseInt(String(sub), 10);
    if (isNaN(userId)) return null;

    return { userId };
  } catch {
    return null;
  }
}

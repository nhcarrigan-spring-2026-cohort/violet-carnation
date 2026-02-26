"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface AuthUser {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextValue {
  /** The currently authenticated user, or `null` when unauthenticated. */
  user: AuthUser | null;
  /** True while the initial auth check is in progress. */
  loading: boolean;
  /** Re-fetches the current user from /api/auth/me (call after login). */
  refresh: () => Promise<void>;
  /** Clears the auth state (call after logout). */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provides authentication state app-wide by calling GET /api/auth/me on
 * mount. The session cookie is sent automatically via `credentials: "include"`.
 *
 * Wrap the application root (app/layout.tsx) with this provider.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as AuthUser;
        setUser(data);
      } else {
        const data = await res.json().catch(() => null);
        setUser(null);
        if (data?.detail === "Invalid or expired token") {
          try {
            await fetch("/api/auth/logout", {
              method: "POST",
              credentials: "include",
            });
          } catch {
            // Ignore logout errors; proceed with redirect.
          }
          toast.error("Your session has expired. Please sign in again.");
          router.push("/");
        }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchCurrentUser();
  }, [fetchCurrentUser]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Returns the current authentication context.
 *
 * Must be used inside an `AuthProvider`.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

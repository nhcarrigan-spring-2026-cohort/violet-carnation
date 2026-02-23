"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { fetchRoles } from "@/lib/roles";
import type { Role } from "@/models/roles";

interface RolesContextValue {
  /** The current list of roles for the authenticated user. */
  roles: Role[];
  /**
   * Re-fetches and updates the roles for the given user.
   * Call this after login, role changes, or anywhere a fresh role list is needed.
   *
   * TODO: Once authentication is implemented the userId parameter can be
   * removed and the ID derived from the session token inside this function.
   *
   * @param userId - The ID of the user whose roles to reload.
   */
  refreshRoles: (userId: number) => Promise<void>;
}

const RolesContext = createContext<RolesContextValue | null>(null);

interface RolesProviderProps {
  /** Roles pre-fetched on the server via SSR, used as the initial state. */
  initialRoles: Role[];
  children: ReactNode;
}

/**
 * Provides the roles context to the component tree.
 *
 * Wrap your application (or a subtree) with this provider and pass the
 * server-fetched `initialRoles` so the client starts with data already loaded.
 */
export function RolesProvider({ initialRoles, children }: RolesProviderProps) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);

  const refreshRoles = useCallback(async (userId: number) => {
    const updated = await fetchRoles(userId);
    setRoles(updated);
  }, []);

  return (
    <RolesContext.Provider value={{ roles, refreshRoles }}>
      {children}
    </RolesContext.Provider>
  );
}

/**
 * Returns the roles context value.
 * Must be used inside a `<RolesProvider>`.
 *
 * @example
 * const { roles, refreshRoles } = useRoles();
 */
export function useRoles(): RolesContextValue {
  const ctx = useContext(RolesContext);
  if (ctx === null) {
    throw new Error("useRoles must be used inside a <RolesProvider>");
  }
  return ctx;
}

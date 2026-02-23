import { Availability } from "./user";

export const SCOPE_OPTIONS = ["all", "myOrgs", "admin"] as const;

export type Scope = (typeof SCOPE_OPTIONS)[number];
export interface Filters {
  scope: Scope | null;
  // category is not yet supported by the API and has been removed until back-end support is added
  availability: Availability[] | null;
}

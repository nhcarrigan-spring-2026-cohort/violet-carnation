import { OrganizationCategoryValue } from "./organizationCategories";

export interface Organization {
  organization_id: number;
  name: string;
  description: string | null;
  category: OrganizationCategoryValue;
  created_by_user_id: number;
}

export type { RoleAndUser } from "@/models/roles";

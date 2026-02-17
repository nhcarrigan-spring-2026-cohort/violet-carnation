export type PermissionLevel = "admin" | "volunteer";

export interface Role {
  user_id: number;
  organization_id: number;
  permission_level: PermissionLevel;
}

export interface RoleAndUser {
  user_id: number;
  organization_id: number;
  name: string;
  permission_level: PermissionLevel;
}

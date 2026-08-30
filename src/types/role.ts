/** Verified against Swagger RoleResponseDto. */
export type AppRole = {
  id: string;
  name: string | null;
  description: string | null;
  isActive: boolean;
  permissions: string[] | null;
  assignedUserCount: number;
  createdAt: string;
  updatedAt: string | null;
};

/** Verified against Swagger CreateRoleRequestDto / UpdateRoleRequestDto. */
export type RoleRequest = {
  name?: string | null;
  description?: string | null;
  isActive: boolean;
  permissions?: string[] | null;
};

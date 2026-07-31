export interface RoleResponse {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  permissionCount: number;
  createdAt: string;
}

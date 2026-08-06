export type UserRole = 'admin' | 'cartera' | 'coordinador' | 'despachador';

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  enabled: boolean;
  accountNonLocked: boolean;
  accountNonExpired: boolean;
  credentialsNonExpired: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: string;
  enabled?: boolean;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  enabled: boolean;
  name: string;
  avatarInitials: string;
  createdAt: string;
}

export function toUserDisplay(r: UserResponse): User {
  const role = mapRole(r.role);
  const name = `${r.firstName} ${r.lastName}`.trim();
  const initials = ((r.firstName?.charAt(0) ?? '') + (r.lastName?.charAt(0) ?? '')).toUpperCase() || '?';
  return {
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    email: r.email,
    role,
    enabled: r.enabled,
    name,
    avatarInitials: initials,
    createdAt: r.createdAt,
  };
}

export function mapRole(role: string): UserRole {
  const map: Record<string, UserRole> = {
    'ADMIN': 'admin',
    'CARTERA': 'cartera',
    'COORDINADOR': 'coordinador',
    'DESPACHADOR': 'despachador',
  };
  return map[role] || 'admin';
}

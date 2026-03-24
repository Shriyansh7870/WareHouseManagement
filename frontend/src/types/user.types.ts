export type UserRole = 'ADMIN' | 'QA_MANAGER' | 'WAREHOUSE_MANAGER' | 'WAREHOUSE_OPERATOR' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types/user.types';

/**
 * Returns permission helpers based on the current user's role.
 * ADMIN > QA_MANAGER > WAREHOUSE_MANAGER > WAREHOUSE_OPERATOR > VIEWER
 */
export function useRBAC() {
  const role = useAuthStore((s) => s.user?.role ?? 'VIEWER');

  const is = (r: UserRole) => role === r;
  const hasRole = (...roles: UserRole[]) => roles.includes(role);

  /** Can approve / reject / quarantine QA inspections */
  const canApproveQA = hasRole('ADMIN', 'QA_MANAGER');

  /** Can raise / close CAPAs */
  const canManageCAPAs = hasRole('ADMIN', 'QA_MANAGER', 'WAREHOUSE_MANAGER');

  /** Can create GRNs */
  const canCreateGRN = hasRole('ADMIN', 'WAREHOUSE_MANAGER', 'WAREHOUSE_OPERATOR');

  /** Can perform stock adjustments */
  const canAdjustStock = hasRole('ADMIN', 'WAREHOUSE_MANAGER');

  /** Can create / dispatch delivery orders */
  const canDispatch = hasRole('ADMIN', 'WAREHOUSE_MANAGER', 'WAREHOUSE_OPERATOR');

  /** Can access Settings page and user management */
  const canAccessSettings = hasRole('ADMIN', 'QA_MANAGER', 'WAREHOUSE_MANAGER');

  /** Can export / download data */
  const canExport = !is('VIEWER');

  /** Read-only mode — viewer role cannot mutate anything */
  const isReadOnly = is('VIEWER');

  return {
    role,
    is,
    hasRole,
    canApproveQA,
    canManageCAPAs,
    canCreateGRN,
    canAdjustStock,
    canDispatch,
    canAccessSettings,
    canExport,
    isReadOnly,
  };
}

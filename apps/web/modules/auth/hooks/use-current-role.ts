"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { UserRole } from "@workspace/backend/convex/auth";

/**
 * Hook para obtener el rol del usuario actual y verificar permisos
 *
 * Uso:
 * ```tsx
 * const { role, isAdmin, isManager, isCashier, isCustomer, isStaff, hasRole } = useCurrentRole();
 *
 * if (isAdmin) {
 *   // Mostrar opciones de admin
 * }
 *
 * if (hasRole(['admin', 'manager'])) {
 *   // Mostrar opciones de admin o manager
 * }
 * ```
 */
export function useCurrentRole() {
  const currentUser = useQuery(api.users.getCurrent);

  const role = currentUser?.role as UserRole | undefined;

  return {
    // Rol actual
    role,

    // Usuario actual completo
    user: currentUser,

    // Flags de rol específico
    isAdmin: role === "admin",
    isManager: role === "manager",
    isCashier: role === "cashier",
    isViewer: role === "viewer",
    isCustomer: role === "customer",

    // Flags de grupo de roles
    isStaff: role === "admin" || role === "manager" || role === "cashier",
    canManageUsers: role === "admin" || role === "manager",
    canViewReports: role === "admin" || role === "manager",
    canManageInventory: role === "admin" || role === "manager",
    canModifySystemConfig: role === "admin",

    // Función helper para verificar múltiples roles
    hasRole: (allowedRoles: UserRole[]) => {
      return role ? allowedRoles.includes(role) : false;
    },

    // Estado de carga
    isLoading: currentUser === undefined,
  };
}

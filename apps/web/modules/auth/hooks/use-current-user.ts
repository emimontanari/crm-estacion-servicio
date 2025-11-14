"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { useAuth } from "@clerk/nextjs";

/**
 * Hook para obtener el usuario actual de la base de datos
 * Incluye información de Clerk y de Convex
 */
export function useCurrentUser() {
  const { userId, orgId, isLoaded } = useAuth();
  const user = useQuery(api.users.getCurrent, userId ? {} : "skip");
  const permissions = useQuery(api.users.checkPermissions, userId ? {} : "skip");

  return {
    // Datos de Clerk
    clerkUserId: userId,
    clerkOrgId: orgId,
    isClerkLoaded: isLoaded,

    // Datos de Convex
    user,
    permissions,

    // Estados
    isLoading: !isLoaded || user === undefined || permissions === undefined,
    isAuthenticated: !!userId,
    hasOrganization: !!orgId,

    // Roles y permisos
    role: permissions?.role,
    isAdmin: permissions?.role === "admin",
    isManager: permissions?.role === "manager" || permissions?.role === "admin",
    isCashier:
      permissions?.role === "cashier" ||
      permissions?.role === "manager" ||
      permissions?.role === "admin",
    isViewer: permissions?.role === "viewer",

    // Permisos específicos
    canManageUsers: permissions?.permissions?.canManageUsers ?? false,
    canManageProducts: permissions?.permissions?.canManageProducts ?? false,
    canManageCustomers: permissions?.permissions?.canManageCustomers ?? false,
    canProcessSales: permissions?.permissions?.canProcessSales ?? false,
    canViewReports: permissions?.permissions?.canViewReports ?? false,
    canManageSettings: permissions?.permissions?.canManageSettings ?? false,
    canManageOrganization: permissions?.permissions?.canManageOrganization ?? false,
  };
}

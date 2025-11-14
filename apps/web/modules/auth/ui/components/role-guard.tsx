"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export type UserRole = "admin" | "manager" | "cashier" | "viewer";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Componente que protege contenido basándose en roles de usuario
 *
 * @example
 * ```tsx
 * <RoleGuard allowedRoles={["admin", "manager"]}>
 *   <AdminPanel />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallback,
  redirectTo,
}: RoleGuardProps) {
  const router = useRouter();
  const permissions = useQuery(api.users.checkPermissions);

  useEffect(() => {
    if (permissions && !allowedRoles.includes(permissions.role as UserRole)) {
      if (redirectTo) {
        router.push(redirectTo);
      }
    }
  }, [permissions, allowedRoles, redirectTo, router]);

  // Loading state
  if (permissions === undefined) {
    return null;
  }

  // Check if user has required role
  const hasPermission = allowedRoles.includes(permissions.role as UserRole);

  if (!hasPermission) {
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
}

/**
 * Hook para verificar si el usuario tiene un rol específico
 */
export function useRole() {
  const permissions = useQuery(api.users.checkPermissions);

  return {
    role: permissions?.role as UserRole | undefined,
    isAdmin: permissions?.role === "admin",
    isManager: permissions?.role === "manager" || permissions?.role === "admin",
    isCashier:
      permissions?.role === "cashier" ||
      permissions?.role === "manager" ||
      permissions?.role === "admin",
    isViewer: permissions?.role === "viewer",
    permissions: permissions?.permissions,
    isLoading: permissions === undefined,
  };
}

/**
 * Componente para mostrar contenido solo a admins
 */
export function AdminOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["admin"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Componente para mostrar contenido solo a managers y admins
 */
export function ManagerOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["admin", "manager"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Componente para mostrar contenido a todos excepto viewers
 */
export function WriteAccess({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["admin", "manager", "cashier"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

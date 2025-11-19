"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { ReactNode } from "react";
import { UserRole } from "@workspace/backend/convex/auth";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  loading?: ReactNode;
}

/**
 * RoleGuard - Componente para proteger rutas y UI según el rol del usuario
 *
 * Uso:
 * ```tsx
 * <RoleGuard allowedRoles={['admin', 'manager']}>
 *   <AdminPanel />
 * </RoleGuard>
 * ```
 *
 * @param children - Contenido a mostrar si el usuario tiene el rol permitido
 * @param allowedRoles - Array de roles permitidos
 * @param fallback - Contenido a mostrar si el usuario NO tiene permiso (default: mensaje de error)
 * @param loading - Contenido a mostrar mientras se carga (default: "Cargando...")
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallback,
  loading,
}: RoleGuardProps) {
  const { isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const currentUser = useQuery(api.users.getCurrent);

  // Mostrar loading mientras se carga la información
  if (!isClerkLoaded || (isSignedIn && currentUser === undefined)) {
    return (
      <>
        {loading || (
          <div className="flex items-center justify-center p-4">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        )}
      </>
    );
  }

  // Si no está autenticado, no mostrar nada (el middleware redirigirá)
  if (!isSignedIn || !currentUser) {
    return null;
  }

  // Verificar si el usuario tiene uno de los roles permitidos
  const hasPermission = allowedRoles.includes(currentUser.role as UserRole);

  if (!hasPermission) {
    return (
      <>
        {fallback || (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-lg bg-destructive/10 p-6 max-w-md">
              <h2 className="text-lg font-semibold text-destructive mb-2">
                Acceso Denegado
              </h2>
              <p className="text-sm text-muted-foreground">
                No tienes permisos para acceder a esta sección.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Roles requeridos: {allowedRoles.join(", ")}
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}

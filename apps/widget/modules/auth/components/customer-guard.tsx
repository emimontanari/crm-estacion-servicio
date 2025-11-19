"use client";

import { ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { Shield } from "lucide-react";

interface CustomerGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}

/**
 * CustomerGuard protects customer portal routes
 * Ensures only authenticated customers can access
 */
export function CustomerGuard({
  children,
  fallback,
  loading,
}: CustomerGuardProps) {
  const { isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const currentUser = useQuery(api.users.getCurrent);

  // Loading state
  if (!isClerkLoaded || (isSignedIn && currentUser === undefined)) {
    return (
      <>
        {loading || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
      </>
    );
  }

  // Not signed in
  if (!isSignedIn || !currentUser) {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
              <p className="text-muted-foreground mb-4">
                Debes iniciar sesión para acceder al portal del cliente.
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Verify it's a customer role
  if (currentUser.role !== "customer") {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
              <p className="text-muted-foreground mb-4">
                Esta área es solo para clientes.
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}

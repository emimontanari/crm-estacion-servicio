import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Rutas públicas (no requieren autenticación)
 */
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)", // Webhooks de Clerk
]);

/**
 * Rutas que no requieren organización
 */
const isOrgFreeRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/org-selection(.*)",
]);

/**
 * Rutas de API que son públicas
 */
const isPublicApiRoute = createRouteMatcher([
  "/api/webhooks(.*)",
  "/api/health(.*)",
]);

/**
 * Rutas administrativas (solo para admins)
 * Requieren verificación adicional en el componente con RoleGuard
 */
const isAdminRoute = createRouteMatcher([
  "/configuracion/usuarios(.*)",
  "/configuracion/organizacion(.*)",
  "/configuracion/pagos(.*)",
]);

/**
 * Rutas de gestión (para managers y admins)
 * Requieren verificación adicional en el componente con RoleGuard
 */
const isManagerRoute = createRouteMatcher([
  "/configuracion(.*)",
  "/fidelizacion/configuracion(.*)",
  "/reportes(.*)",
  "/inventario(.*)",
]);

/**
 * Rutas operativas (para cashiers, managers y admins)
 * Requieren verificación adicional en el componente con RoleGuard
 */
const isCashierRoute = createRouteMatcher([
  "/ventas(.*)",
  "/clientes(.*)",
]);

/**
 * Rutas de staff interno (cualquier usuario no-customer)
 * Excluye a clientes externos
 */
const isStaffRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/ventas(.*)",
  "/clientes(.*)",
  "/inventario(.*)",
  "/fidelizacion(.*)",
  "/reportes(.*)",
  "/configuracion(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth();

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Proteger todas las rutas que no son públicas
  if (!userId) {
    await auth.protect();
  }

  // Si el usuario está autenticado pero no tiene organización
  // y no está en una ruta libre de org, redirigir a selección de org
  if (userId && !orgId && !isOrgFreeRoute(req)) {
    const searchParams = new URLSearchParams({ redirectUrl: req.url });

    const orgSelection = new URL(
      `/org-selection?${searchParams.toString()}`,
      req.url
    );
    return NextResponse.redirect(orgSelection);
  }

  // Verificación de roles granular
  // NOTA: La verificación detallada de permisos se realiza en el componente
  // usando RoleGuard, ya que el middleware no tiene acceso directo a Convex.
  // Aquí solo hacemos verificaciones básicas de autenticación y organización.

  // Las rutas de staff requieren que el usuario tenga una organización activa
  if (isStaffRoute(req) && userId && !orgId) {
    const forbidden = new URL("/403", req.url);
    return NextResponse.redirect(forbidden);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

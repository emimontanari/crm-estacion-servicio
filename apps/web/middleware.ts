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
 */
const isAdminRoute = createRouteMatcher([
  "/configuracion/usuarios(.*)",
  "/configuracion/organizacion(.*)",
]);

/**
 * Rutas de gestión (para managers y admins)
 */
const isManagerRoute = createRouteMatcher([
  "/configuracion(.*)",
  "/fidelizacion/configuracion(.*)",
  "/reportes/generar(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, orgRole } = await auth();

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

  // TODO: Verificación de roles más granular
  // Esto se puede expandir para verificar roles específicos por ruta
  // Por ahora dejamos que el frontend y las queries de Convex manejen los permisos

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

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Rutas públicas (no requieren autenticación)
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

/**
 * Rutas del portal del cliente (requieren autenticación)
 */
const isCustomerRoute = createRouteMatcher([
  "/servicios(.*)",
  "/promociones(.*)",
  "/mis-puntos(.*)",
  "/mi-historial(.*)",
  "/mi-cuenta(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Proteger rutas del portal del cliente
  if (isCustomerRoute(req) && !userId) {
    await auth.protect();
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

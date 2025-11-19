"use client";

import { ReactNode } from "react";
import { CustomerGuard } from "@/modules/auth/components/customer-guard";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <CustomerGuard>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header del portal de cliente */}
        <header className="border-b bg-card sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Portal del Cliente</h1>
              <div className="flex items-center gap-6">
                <nav className="flex gap-4">
                  <Link
                    href="/servicios"
                    className="text-sm hover:underline hover:text-primary"
                  >
                    Servicios
                  </Link>
                  <Link
                    href="/promociones"
                    className="text-sm hover:underline hover:text-primary"
                  >
                    Promociones
                  </Link>
                  <Link
                    href="/mis-puntos"
                    className="text-sm hover:underline hover:text-primary"
                  >
                    Mis Puntos
                  </Link>
                  <Link
                    href="/mi-historial"
                    className="text-sm hover:underline hover:text-primary"
                  >
                    Historial
                  </Link>
                  <Link
                    href="/mi-cuenta"
                    className="text-sm hover:underline hover:text-primary"
                  >
                    Mi Cuenta
                  </Link>
                </nav>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="container mx-auto px-4 py-8 flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t mt-auto">
          <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
            © 2024 Estación de Servicio. Todos los derechos reservados.
          </div>
        </footer>
      </div>
    </CustomerGuard>
  );
}

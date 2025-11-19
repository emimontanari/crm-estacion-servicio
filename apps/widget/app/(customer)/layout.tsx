import { ReactNode } from "react";

export default function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header del portal de cliente */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Portal del Cliente</h1>
            <nav className="flex gap-4">
              <a href="/" className="text-sm hover:underline">
                Inicio
              </a>
              <a href="/mi-cuenta" className="text-sm hover:underline">
                Mi Cuenta
              </a>
              <a href="/mis-puntos" className="text-sm hover:underline">
                Mis Puntos
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          © 2024 Estación de Servicio. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

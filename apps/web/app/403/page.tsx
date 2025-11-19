import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full px-6 py-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-destructive/10 p-6">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-2">403</h1>
        <h2 className="text-2xl font-semibold mb-4">Acceso Denegado</h2>

        <p className="text-muted-foreground mb-6">
          No tienes los permisos necesarios para acceder a esta página.
          Si crees que esto es un error, contacta al administrador.
        </p>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Ir al Dashboard
          </Link>

          <Link
            href="/"
            className="block w-full py-2 px-4 border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Ir al Inicio
          </Link>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>¿Necesitas ayuda?</p>
          <p className="mt-1">
            Contacta a{" "}
            <a
              href="mailto:soporte@example.com"
              className="text-primary hover:underline"
            >
              soporte@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

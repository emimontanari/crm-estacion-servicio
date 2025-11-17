"use client";

import { useOrganization } from "@/modules/auth/hooks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@workspace/ui";
import {
  Settings,
  Users,
  CreditCard,
  Award,
  Building,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const { organization, stats } = useOrganization();

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const settingsSections = [
    {
      title: "Usuarios",
      description: "Gestiona los usuarios y sus roles de acceso",
      icon: Users,
      href: "/configuracion/usuarios",
      stats: stats ? `${stats.totalUsers} usuarios` : undefined,
    },
    {
      title: "Métodos de Pago",
      description: "Configura los métodos de pago aceptados",
      icon: CreditCard,
      href: "/configuracion/metodos-pago",
      stats: undefined,
    },
    {
      title: "Programa de Fidelización",
      description: "Configura las reglas del programa de puntos",
      icon: Award,
      href: "/configuracion/fidelizacion",
      stats: undefined,
    },
    {
      title: "Organización",
      description: "Información general de la organización",
      icon: Building,
      href: "/configuracion/organizacion",
      stats: undefined,
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
          <p className="text-muted-foreground">
            Administra la configuración del sistema
          </p>
        </div>
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organización
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium mb-1">Nombre</p>
              <p className="text-lg">{organization.name}</p>
            </div>
            {stats && (
              <>
                <div>
                  <p className="text-sm font-medium mb-1">Total Usuarios</p>
                  <p className="text-lg">{stats.totalUsers}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Usuarios Activos</p>
                  <p className="text-lg">{stats.activeUsers}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">
                    Fecha de Creación
                  </p>
                  <p className="text-lg">
                    {new Date(organization.createdAt).toLocaleDateString(
                      "es-AR"
                    )}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      <div className="grid gap-4 md:grid-cols-2">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.href}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(section.href)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {section.title}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {section.description}
                </p>
                {section.stats && (
                  <p className="text-sm font-medium text-primary">
                    {section.stats}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Información del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versión:</span>
              <span className="font-medium">1.0.0 (Fase 5)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última actualización:</span>
              <span className="font-medium">
                {new Date().toLocaleDateString("es-AR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entorno:</span>
              <span className="font-medium">Producción</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

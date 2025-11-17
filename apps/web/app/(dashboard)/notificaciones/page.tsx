import { Metadata } from "next";
import { Bell, Mail, MessageSquare, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui";

export const metadata: Metadata = {
  title: "Notificaciones | CRM Estación de Servicio",
  description: "Sistema de notificaciones multicanal",
};

export default function NotificationsPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notificaciones</h2>
          <p className="text-muted-foreground">
            Gestiona tus notificaciones por email, SMS y push
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enviadas
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de Apertura
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68.5%</div>
            <p className="text-xs text-muted-foreground">
              +5.2% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              SMS Enviados
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              +12.3% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Push Enviadas
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-muted-foreground">
              +8.7% desde el mes pasado
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="campaigns">Campañas</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Notificaciones enviadas en los últimos 7 días
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Gráfico de actividad
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Notificaciones</CardTitle>
              <CardDescription>
                Gestiona las plantillas para tus notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <div className="text-center">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Accede a la gestión de plantillas</p>
                  <a href="/notificaciones/plantillas" className="text-primary hover:underline">
                    Ir a plantillas
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campañas de Notificaciones</CardTitle>
              <CardDescription>
                Crea y gestiona campañas de notificaciones masivas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <div className="text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Próximamente: Campañas masivas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Notificaciones</CardTitle>
              <CardDescription>
                Revisa el historial completo de notificaciones enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Historial completo de notificaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

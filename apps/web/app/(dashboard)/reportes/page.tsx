"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
} from "@workspace/ui";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  FileText,
  BarChart3,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/modules/auth/components/role-guard";

type Period = "today" | "week" | "month" | "year";

const periodLabels: Record<Period, string> = {
  today: "Hoy",
  week: "Esta Semana",
  month: "Este Mes",
  year: "Este Año",
};

export default function ReportsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("today");

  const kpis = useQuery(api.reports.getDashboardKPIs, { period });
  const topProducts = useQuery(api.reports.getTopProducts, {
    startDate: getStartDate(period),
    endDate: Date.now(),
    limit: 5,
  });
  const topCustomers = useQuery(api.reports.getTopCustomers, {
    startDate: getStartDate(period),
    endDate: Date.now(),
    limit: 5,
  });

  if (kpis === undefined || topProducts === undefined || topCustomers === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <RoleGuard
      allowedRoles={["admin", "manager"]}
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground mb-4">
              Solo los administradores y gerentes pueden ver reportes detallados.
            </p>
            <Link href="/dashboard">
              <Button>Volver al Dashboard</Button>
            </Link>
          </div>
        </div>
      }
    >
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reportes</h2>
          <p className="text-muted-foreground">
            Análisis y métricas de tu negocio
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(value: Period) => setPeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(periodLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Ingresos"
          value={`$${kpis.totalRevenue.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
          })}`}
          icon={DollarSign}
          trend={
            kpis.revenueTrend !== undefined
              ? {
                  value: kpis.revenueTrend,
                  label: "vs período anterior",
                }
              : undefined
          }
        />
        <StatCard
          title="Ventas"
          value={kpis.totalSales.toString()}
          icon={ShoppingCart}
          trend={
            kpis.salesTrend !== undefined
              ? {
                  value: kpis.salesTrend,
                  label: "vs período anterior",
                }
              : undefined
          }
        />
        <StatCard
          title="Ticket Promedio"
          value={`$${kpis.averageTicket.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
          })}`}
          icon={TrendingUp}
          trend={
            kpis.averageTicketTrend !== undefined
              ? {
                  value: kpis.averageTicketTrend,
                  label: "vs período anterior",
                }
              : undefined
          }
        />
        <StatCard
          title="Nuevos Clientes"
          value={kpis.newCustomers.toString()}
          icon={Users}
          trend={
            kpis.newCustomersTrend !== undefined
              ? {
                  value: kpis.newCustomersTrend,
                  label: "vs período anterior",
                }
              : undefined
          }
        />
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/reportes/ventas")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Reporte de Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Análisis detallado de ventas por período, producto y método de
              pago
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/reportes/clientes")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Reporte de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Análisis de comportamiento, segmentación y programa de fidelidad
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/reportes/inventario")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Reporte de Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Movimientos de stock, valorización y productos más vendidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products and Customers */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Productos Más Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay datos disponibles
              </p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.totalSold} {product.unit} vendidos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        $
                        {product.totalRevenue.toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        en ventas
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mejores Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCustomers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay datos disponibles
              </p>
            ) : (
              <div className="space-y-3">
                {topCustomers.map((customer, index) => (
                  <div
                    key={customer._id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => router.push(`/clientes/${customer._id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.totalPurchases} compras
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        $
                        {customer.totalSpent.toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        gastado
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {kpis.lowStockProducts > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Alerta de Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700">
                Hay {kpis.lowStockProducts} productos con stock bajo que
                requieren atención
              </p>
              <Link href="/inventario/alertas">
                <Button variant="destructive">Ver Alertas</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </RoleGuard>
  );
}

// Helper function to get start date based on period
function getStartDate(period: Period): number {
  const now = new Date();
  switch (period) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    case "week":
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return weekAgo.getTime();
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    case "year":
      return new Date(now.getFullYear(), 0, 1).getTime();
    default:
      return now.getTime();
  }
}

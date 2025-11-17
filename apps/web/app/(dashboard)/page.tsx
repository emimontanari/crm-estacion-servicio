"use client";

import { DashboardStats } from "./components/dashboard-stats";
import { RecentSales } from "./components/recent-sales";
import { LowStockAlerts } from "./components/low-stock-alerts";
import { SalesTrendChart } from "./components/sales-trend-chart";
import { TopProductsChart } from "./components/top-products-chart";
import { PaymentMethodsChart } from "./components/payment-methods-chart";
import { LoyaltyStatsChart } from "./components/loyalty-stats-chart";
import { useCurrentUser } from "@/modules/auth/hooks";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui";
import { BarChart3, TrendingUp, Package, Award } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Buenos días"
      : currentHour < 18
        ? "Buenas tardes"
        : "Buenas noches";

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header mejorado con gradiente */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            {greeting}, {user?.name} 👋
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Sistema activo</span>
          <span className="mx-2">•</span>
          <span>{new Date().toLocaleDateString("es-AR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          })}</span>
        </div>
      </div>

      {/* KPIs - Métricas principales */}
      <DashboardStats />

      {/* Tabs para organizar visualizaciones */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Ventas</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Productos</span>
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Fidelización</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Resumen General */}
        <TabsContent value="overview" className="space-y-4">
          {/* Gráfico de tendencia de ventas */}
          <SalesTrendChart />

          {/* Grid de 2 columnas con actividad reciente */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-full lg:col-span-4">
              <RecentSales />
            </div>
            <div className="col-span-full lg:col-span-3">
              <LowStockAlerts />
            </div>
          </div>

          {/* Grid de 2 columnas con análisis adicional */}
          <div className="grid gap-4 md:grid-cols-2">
            <PaymentMethodsChart />
            <LoyaltyStatsChart />
          </div>
        </TabsContent>

        {/* Tab: Análisis de Ventas */}
        <TabsContent value="sales" className="space-y-4">
          <SalesTrendChart />
          <div className="grid gap-4 md:grid-cols-2">
            <PaymentMethodsChart />
            <div className="space-y-4">
              <RecentSales />
            </div>
          </div>
        </TabsContent>

        {/* Tab: Análisis de Productos */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TopProductsChart />
            <LowStockAlerts />
          </div>
        </TabsContent>

        {/* Tab: Programa de Fidelización */}
        <TabsContent value="loyalty" className="space-y-4">
          <LoyaltyStatsChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}

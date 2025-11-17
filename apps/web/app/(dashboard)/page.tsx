"use client";

import { DashboardStats } from "./components/dashboard-stats";
import { RecentSales } from "./components/recent-sales";
import { LowStockAlerts } from "./components/low-stock-alerts";
import { useCurrentUser } from "@/modules/auth/hooks";

export default function DashboardPage() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Bienvenido, {user?.name}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <DashboardStats />

      {/* Grid de 2 columnas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Ventas recientes - 4 columnas */}
        <div className="col-span-4">
          <RecentSales />
        </div>

        {/* Alertas de stock - 3 columnas */}
        <div className="col-span-3">
          <LowStockAlerts />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { StatCard } from "@workspace/ui";
import {
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Skeleton } from "@workspace/ui";

export function DashboardStats() {
  const kpis = useQuery(api.reports.getDashboardKPIs, { period: "today" });
  const organizationStats = useQuery(api.organizations.getStats);

  if (kpis === undefined || organizationStats === undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Ventas del día",
      value: `$${kpis.sales.revenue.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
      })}`,
      description: `${kpis.sales.total} transacciones`,
      icon: DollarSign,
      trend: {
        value: 12.5,
        label: "vs ayer",
      },
    },
    {
      title: "Ticket promedio",
      value: `$${kpis.sales.averageTicket.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
      })}`,
      description: "por venta",
      icon: ShoppingCart,
    },
    {
      title: "Clientes nuevos",
      value: kpis.customers.new.toString(),
      description: "del día",
      icon: Users,
      trend: {
        value: 5.2,
        label: "vs ayer",
      },
    },
    {
      title: "Stock bajo",
      value: kpis.inventory.lowStock.toString(),
      description: "productos",
      icon: AlertTriangle,
      trend: kpis.inventory.lowStock > 0 ? { value: -10, label: "" } : undefined,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          trend={stat.trend}
        />
      ))}
    </div>
  );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { Card, CardContent, CardHeader, CardTitle, BarChart } from "@workspace/ui";
import { Skeleton } from "@workspace/ui";
import { Package } from "lucide-react";
import { useMemo } from "react";

export function TopProductsChart() {
  const topProducts = useQuery(api.reports.getTopProducts, {
    startDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // Últimos 30 días
    endDate: Date.now(),
    limit: 10,
  });

  const chartData = useMemo(() => {
    if (!topProducts) return [];

    return topProducts.map((product) => ({
      nombre: product.productName.length > 20
        ? product.productName.substring(0, 20) + "..."
        : product.productName,
      cantidad: product.totalQuantity,
      ingresos: product.totalRevenue,
    }));
  }, [topProducts]);

  const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  if (topProducts === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-chart-2" />
            Top 10 Productos - Últimos 30 días
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Productos más vendidos por ingresos generados
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-muted-foreground">No hay datos disponibles</p>
          </div>
        ) : (
          <BarChart
            data={chartData}
            xAxisKey="nombre"
            bars={[
              {
                dataKey: "ingresos",
                name: "Ingresos ($)",
                color: "hsl(var(--chart-2))",
              },
            ]}
            formatTooltip={(value: any, name: string) => {
              return `$${Number(value).toLocaleString("es-AR", {
                minimumFractionDigits: 2,
              })}`;
            }}
            formatYAxis={(value: any) => {
              if (value >= 1000) {
                return `$${(value / 1000).toFixed(0)}k`;
              }
              return `$${value}`;
            }}
            showGrid
            showLegend={false}
            layout="horizontal"
            minHeight={400}
            colorByIndex={chartColors}
          />
        )}
      </CardContent>
    </Card>
  );
}

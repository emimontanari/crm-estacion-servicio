"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { Card, CardContent, CardHeader, CardTitle, LineChart } from "@workspace/ui";
import { Skeleton } from "@workspace/ui";
import { TrendingUp } from "lucide-react";
import { useMemo } from "react";

export function SalesTrendChart() {
  const salesMetrics = useQuery(api.reports.getSalesMetrics, {
    startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // Últimos 7 días
    endDate: Date.now(),
  });

  const chartData = useMemo(() => {
    if (!salesMetrics?.dailySales) return [];

    return Object.entries(salesMetrics.dailySales)
      .map(([date, data]: [string, any]) => ({
        fecha: new Date(date).toLocaleDateString("es-AR", {
          weekday: "short",
          day: "numeric",
        }),
        ventas: data.count,
        ingresos: data.revenue,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        return dateA.getTime() - dateB.getTime();
      });
  }, [salesMetrics]);

  if (salesMetrics === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-chart-1" />
            Tendencia de Ventas - Últimos 7 días
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Evolución de ingresos y cantidad de transacciones
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[350px]">
            <p className="text-muted-foreground">No hay datos disponibles</p>
          </div>
        ) : (
          <LineChart
            data={chartData}
            xAxisKey="fecha"
            lines={[
              {
                dataKey: "ingresos",
                name: "Ingresos ($)",
                color: "hsl(var(--chart-1))",
                strokeWidth: 3,
              },
              {
                dataKey: "ventas",
                name: "Cantidad de Ventas",
                color: "hsl(var(--chart-2))",
                strokeWidth: 2,
              },
            ]}
            formatTooltip={(value: any, name: string) => {
              if (name === "Ingresos ($)") {
                return `$${Number(value).toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}`;
              }
              return value.toString();
            }}
            formatYAxis={(value: any) => {
              if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}k`;
              }
              return value.toString();
            }}
            showGrid
            showLegend
            curve="monotone"
            minHeight={350}
          />
        )}
      </CardContent>
    </Card>
  );
}

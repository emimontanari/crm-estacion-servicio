"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { Card, CardContent, CardHeader, CardTitle, PieChart } from "@workspace/ui";
import { Skeleton } from "@workspace/ui";
import { CreditCard } from "lucide-react";
import { useMemo } from "react";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Efectivo",
  credit_card: "Tarjeta de Crédito",
  debit_card: "Tarjeta de Débito",
  transfer: "Transferencia",
  qr: "QR/Billetera Digital",
};

export function PaymentMethodsChart() {
  const salesMetrics = useQuery(api.reports.getSalesMetrics, {
    startDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // Últimos 30 días
    endDate: Date.now(),
  });

  const chartData = useMemo(() => {
    if (!salesMetrics?.paymentMethods) return [];

    return Object.entries(salesMetrics.paymentMethods)
      .map(([method, amount]: [string, any]) => ({
        nombre: PAYMENT_METHOD_LABELS[method] || method,
        valor: amount,
      }))
      .filter((item) => item.valor > 0)
      .sort((a, b) => b.valor - a.valor);
  }, [salesMetrics]);

  const totalAmount = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.valor, 0);
  }, [chartData]);

  if (salesMetrics === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pago</CardTitle>
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
            <CreditCard className="h-5 w-5 text-chart-3" />
            Métodos de Pago - Últimos 30 días
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Distribución de ingresos por método de pago
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-muted-foreground">No hay datos disponibles</p>
          </div>
        ) : (
          <div className="space-y-4">
            <PieChart
              data={chartData}
              dataKey="valor"
              nameKey="nombre"
              showLegend
              showLabels
              innerRadius={60}
              minHeight={350}
              formatTooltip={(value: any) => {
                const percent = ((value / totalAmount) * 100).toFixed(1);
                return `$${Number(value).toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })} (${percent}%)`;
              }}
              labelFormatter={(entry: any) => {
                const percent = ((entry.valor / totalAmount) * 100).toFixed(1);
                return `${percent}%`;
              }}
            />
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {item.nombre}
                  </span>
                  <span className="text-sm font-medium">
                    $
                    {item.valor.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

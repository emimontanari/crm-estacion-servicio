"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  LineChart,
  BarChart,
  PieChart,
  ComposedChart,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  ArrowLeft,
  Download,
} from "lucide-react";
import Link from "next/link";

type Period = "week" | "month" | "quarter" | "year";

const periodLabels: Record<Period, string> = {
  week: "Última Semana",
  month: "Último Mes",
  quarter: "Último Trimestre",
  year: "Último Año",
};

const periodDays: Record<Period, number> = {
  week: 7,
  month: 30,
  quarter: 90,
  year: 365,
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Efectivo",
  credit_card: "Tarjeta de Crédito",
  debit_card: "Tarjeta de Débito",
  transfer: "Transferencia",
  qr: "QR/Billetera Digital",
};

export default function SalesReportPage() {
  const [period, setPeriod] = useState<Period>("month");

  const startDate = useMemo(() => {
    return Date.now() - periodDays[period] * 24 * 60 * 60 * 1000;
  }, [period]);

  const salesMetrics = useQuery(api.reports.getSalesMetrics, {
    startDate,
    endDate: Date.now(),
  });

  const topProducts = useQuery(api.reports.getTopProducts, {
    startDate,
    endDate: Date.now(),
    limit: 10,
  });

  // Preparar datos para gráficos
  const dailySalesData = useMemo(() => {
    if (!salesMetrics?.dailySales) return [];

    return Object.entries(salesMetrics.dailySales)
      .map(([date, data]: [string, any]) => ({
        fecha: new Date(date).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "short",
        }),
        ingresos: data.revenue,
        ventas: data.count,
        timestamp: new Date(date).getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [salesMetrics]);

  const paymentMethodsData = useMemo(() => {
    if (!salesMetrics?.paymentMethods) return [];

    return Object.entries(salesMetrics.paymentMethods)
      .map(([method, amount]: [string, any]) => ({
        nombre: PAYMENT_METHOD_LABELS[method] || method,
        valor: amount,
      }))
      .filter((item) => item.valor > 0);
  }, [salesMetrics]);

  const topProductsData = useMemo(() => {
    if (!topProducts) return [];

    return topProducts.slice(0, 8).map((product) => ({
      nombre:
        product.productName.length > 15
          ? product.productName.substring(0, 15) + "..."
          : product.productName,
      ingresos: product.totalRevenue,
      cantidad: product.totalQuantity,
    }));
  }, [topProducts]);

  if (salesMetrics === undefined || topProducts === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/reportes">Reportes</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Ventas</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reporte de Ventas
          </h1>
          <p className="text-muted-foreground mt-1">
            Análisis detallado de ventas y rendimiento
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={period}
            onValueChange={(value: Period) => setPeriod(value)}
          >
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
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Ingresos Totales"
          value={`$${salesMetrics.totalRevenue.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
          })}`}
          icon={DollarSign}
          description={periodLabels[period]}
        />
        <StatCard
          title="Total de Ventas"
          value={salesMetrics.totalSales.toString()}
          icon={ShoppingCart}
          description={`${salesMetrics.totalSales} transacciones`}
        />
        <StatCard
          title="Ticket Promedio"
          value={`$${salesMetrics.averageTicket.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
          })}`}
          icon={TrendingUp}
          description="por venta"
        />
        <StatCard
          title="Total Descuentos"
          value={`$${salesMetrics.totalDiscount.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
          })}`}
          icon={CreditCard}
          description="aplicados"
        />
      </div>

      {/* Gráfico de Tendencia de Ventas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-chart-1" />
            Evolución de Ventas e Ingresos
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Tendencia diaria durante el período seleccionado
          </p>
        </CardHeader>
        <CardContent>
          {dailySalesData.length === 0 ? (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-muted-foreground">No hay datos disponibles</p>
            </div>
          ) : (
            <ComposedChart
              data={dailySalesData}
              xAxisKey="fecha"
              elements={[
                {
                  type: "area",
                  dataKey: "ingresos",
                  name: "Ingresos ($)",
                  color: "hsl(var(--chart-1))",
                  yAxisId: "left",
                },
                {
                  type: "line",
                  dataKey: "ventas",
                  name: "Cantidad de Ventas",
                  color: "hsl(var(--chart-2))",
                  yAxisId: "right",
                },
              ]}
              yAxisLabel="Ingresos ($)"
              secondaryYAxisLabel="Cantidad"
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
                  return `$${(value / 1000).toFixed(0)}k`;
                }
                return `$${value}`;
              }}
              showGrid
              showLegend
              minHeight={400}
            />
          )}
        </CardContent>
      </Card>

      {/* Grid de 2 columnas */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Productos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-chart-2" />
              Top Productos por Ingresos
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Productos que generaron más ingresos
            </p>
          </CardHeader>
          <CardContent>
            {topProductsData.length === 0 ? (
              <div className="flex items-center justify-center h-[350px]">
                <p className="text-muted-foreground">No hay datos disponibles</p>
              </div>
            ) : (
              <BarChart
                data={topProductsData}
                xAxisKey="nombre"
                bars={[
                  {
                    dataKey: "ingresos",
                    name: "Ingresos",
                    color: "hsl(var(--chart-2))",
                  },
                ]}
                formatTooltip={(value: any) => {
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
                minHeight={350}
              />
            )}
          </CardContent>
        </Card>

        {/* Métodos de Pago */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-chart-3" />
              Distribución por Método de Pago
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Preferencias de pago de los clientes
            </p>
          </CardHeader>
          <CardContent>
            {paymentMethodsData.length === 0 ? (
              <div className="flex items-center justify-center h-[350px]">
                <p className="text-muted-foreground">No hay datos disponibles</p>
              </div>
            ) : (
              <PieChart
                data={paymentMethodsData}
                dataKey="valor"
                nameKey="nombre"
                showLegend
                showLabels
                innerRadius={60}
                minHeight={350}
                formatTooltip={(value: any) => {
                  return `$${Number(value).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}`;
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Back Button */}
      <div className="flex justify-start">
        <Link href="/reportes">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Reportes
          </Button>
        </Link>
      </div>
    </div>
  );
}

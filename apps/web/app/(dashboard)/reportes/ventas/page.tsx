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
  Badge,
} from "@workspace/ui";
import { ArrowLeft, Download, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";

type GroupBy = "day" | "week" | "month";

const groupByLabels: Record<GroupBy, string> = {
  day: "Por Día",
  week: "Por Semana",
  month: "Por Mes",
};

export default function SalesReportPage() {
  const [groupBy, setGroupBy] = useState<GroupBy>("day");
  const [daysBack, setDaysBack] = useState(7);

  const startDate = Date.now() - daysBack * 24 * 60 * 60 * 1000;
  const endDate = Date.now();

  const salesByPeriod = useQuery(api.reports.getSalesByPeriod, {
    startDate,
    endDate,
    groupBy,
  });

  const salesByPaymentMethod = useQuery(api.reports.getSalesByPaymentMethod, {
    startDate,
    endDate,
  });

  const topProducts = useQuery(api.reports.getTopProducts, {
    startDate,
    endDate,
    limit: 10,
  });

  const handleExport = () => {
    // TODO: Implement export to CSV/Excel
    alert("Funcionalidad de exportación en desarrollo");
  };

  if (
    salesByPeriod === undefined ||
    salesByPaymentMethod === undefined ||
    topProducts === undefined
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate totals
  const totalRevenue = salesByPeriod.reduce((sum, item) => sum + item.revenue, 0);
  const totalSales = salesByPeriod.reduce((sum, item) => sum + item.count, 0);
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/reportes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Reporte de Ventas
            </h2>
            <p className="text-muted-foreground">
              Análisis detallado de ventas por período
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium">Período</label>
          <Select
            value={daysBack.toString()}
            onValueChange={(value) => setDaysBack(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="15">Últimos 15 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="60">Últimos 60 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Agrupar por</label>
          <Select
            value={groupBy}
            onValueChange={(value: GroupBy) => setGroupBy(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(groupByLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {totalRevenue.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En {daysBack} días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Transacciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Ticket Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {averageTicket.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Por venta</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales by Period */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas por Período</CardTitle>
        </CardHeader>
        <CardContent>
          {salesByPeriod.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay datos disponibles
            </p>
          ) : (
            <div className="space-y-2">
              {salesByPeriod.map((item) => (
                <div
                  key={item.period}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {new Date(item.period).toLocaleDateString("es-AR", {
                          dateStyle: groupBy === "day" ? "short" : "medium",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.count} ventas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lg">
                      $
                      {item.revenue.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Promedio: $
                      {(item.revenue / item.count).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales by Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas por Método de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          {salesByPaymentMethod.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay datos disponibles
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {salesByPaymentMethod.map((item) => {
                const percentage = (item.revenue / totalRevenue) * 100;
                const methodLabels: Record<string, string> = {
                  cash: "Efectivo",
                  credit_card: "Tarjeta de Crédito",
                  debit_card: "Tarjeta de Débito",
                  transfer: "Transferencia",
                };

                return (
                  <div
                    key={item.paymentMethod}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">
                        {methodLabels[item.paymentMethod] || item.paymentMethod}
                      </p>
                      <Badge variant="secondary">{item.count} ventas</Badge>
                    </div>
                    <p className="text-2xl font-bold">
                      $
                      {item.revenue.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{percentage.toFixed(1)}% del total</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay datos disponibles
            </p>
          ) : (
            <div className="space-y-2">
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
    </div>
  );
}

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
  Badge,
} from "@workspace/ui";
import { ArrowLeft, Download, Users, Award, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CustomersReportPage() {
  const router = useRouter();
  const [daysBack] = useState(30);

  const startDate = Date.now() - daysBack * 24 * 60 * 60 * 1000;
  const endDate = Date.now();

  const topCustomers = useQuery(api.reports.getTopCustomers, {
    startDate,
    endDate,
    limit: 20,
  });

  const customerMetrics = useQuery(api.reports.getCustomerMetrics, {
    startDate,
    endDate,
  });

  const handleExport = () => {
    alert("Funcionalidad de exportación en desarrollo");
  };

  if (topCustomers === undefined || customerMetrics === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              Reporte de Clientes
            </h2>
            <p className="text-muted-foreground">
              Análisis de comportamiento y fidelización
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerMetrics.totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Nuevos Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerMetrics.newCustomers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Últimos {daysBack} días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Clientes Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerMetrics.activeCustomers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Con compras en {daysBack} días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Gasto Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {customerMetrics.averageSpent.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Por cliente</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top 20 Mejores Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {topCustomers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay datos disponibles
            </p>
          ) : (
            <div className="space-y-2">
              {topCustomers.map((customer, index) => {
                // Determine tier based on total spent
                let tier = "Bronce";
                let tierColor = "bg-orange-700";
                if (customer.totalSpent >= 100000) {
                  tier = "Platino";
                  tierColor = "bg-slate-400";
                } else if (customer.totalSpent >= 50000) {
                  tier = "Oro";
                  tierColor = "bg-yellow-500";
                } else if (customer.totalSpent >= 20000) {
                  tier = "Plata";
                  tierColor = "bg-gray-400";
                }

                return (
                  <div
                    key={customer._id}
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => router.push(`/clientes/${customer._id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{customer.name}</p>
                          <Badge
                            variant="secondary"
                            className={`${tierColor} text-white`}
                          >
                            {tier}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {customer.phone}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 text-right">
                      <div>
                        <p className="text-xs text-muted-foreground">Compras</p>
                        <p className="font-medium">{customer.totalPurchases}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Puntos</p>
                        <p className="font-medium">{customer.loyaltyPoints}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Total Gastado
                        </p>
                        <p className="font-medium text-lg">
                          $
                          {customer.totalSpent.toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Segmentation */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Segmentación por Nivel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border rounded-lg bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-400" />
                  <span className="font-medium">Platino</span>
                </div>
                <Badge variant="secondary">
                  {
                    topCustomers.filter((c) => c.totalSpent >= 100000).length
                  }{" "}
                  clientes
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Más de $100,000 gastados
              </p>
            </div>

            <div className="p-3 border rounded-lg bg-yellow-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="font-medium">Oro</span>
                </div>
                <Badge variant="secondary">
                  {
                    topCustomers.filter(
                      (c) => c.totalSpent >= 50000 && c.totalSpent < 100000
                    ).length
                  }{" "}
                  clientes
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Entre $50,000 y $100,000
              </p>
            </div>

            <div className="p-3 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="font-medium">Plata</span>
                </div>
                <Badge variant="secondary">
                  {
                    topCustomers.filter(
                      (c) => c.totalSpent >= 20000 && c.totalSpent < 50000
                    ).length
                  }{" "}
                  clientes
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Entre $20,000 y $50,000
              </p>
            </div>

            <div className="p-3 border rounded-lg bg-orange-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-700" />
                  <span className="font-medium">Bronce</span>
                </div>
                <Badge variant="secondary">
                  {topCustomers.filter((c) => c.totalSpent < 20000).length}{" "}
                  clientes
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Menos de $20,000
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Programa de Fidelización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium mb-2">Total de Puntos</p>
              <p className="text-3xl font-bold">
                {topCustomers
                  .reduce((sum, c) => sum + c.loyaltyPoints, 0)
                  .toLocaleString("es-AR")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                En circulación
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium mb-2">Promedio de Puntos</p>
              <p className="text-3xl font-bold">
                {Math.round(
                  topCustomers.reduce((sum, c) => sum + c.loyaltyPoints, 0) /
                    topCustomers.length
                ).toLocaleString("es-AR")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Por cliente activo
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {topCustomers.filter((c) => c.loyaltyPoints > 0).length} de{" "}
                {topCustomers.length} clientes tienen puntos de fidelidad
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

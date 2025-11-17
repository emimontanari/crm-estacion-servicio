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
import {
  ArrowLeft,
  Download,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const categoryLabels: Record<string, string> = {
  fuel: "Combustible",
  lubricant: "Lubricante",
  accessory: "Accesorio",
  food: "Alimento",
  beverage: "Bebida",
  service: "Servicio",
  other: "Otro",
};

export default function InventoryReportPage() {
  const router = useRouter();
  const [daysBack] = useState(30);

  const startDate = Date.now() - daysBack * 24 * 60 * 60 * 1000;
  const endDate = Date.now();

  const inventoryMetrics = useQuery(api.reports.getInventoryMetrics, {
    startDate,
    endDate,
  });

  const topProducts = useQuery(api.reports.getTopProducts, {
    startDate,
    endDate,
    limit: 15,
  });

  const lowStockProducts = useQuery(api.products.getLowStock);
  const allProducts = useQuery(api.products.getAll, { includeInactive: false });

  const handleExport = () => {
    alert("Funcionalidad de exportación en desarrollo");
  };

  if (
    inventoryMetrics === undefined ||
    topProducts === undefined ||
    lowStockProducts === undefined ||
    allProducts === undefined
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate inventory value
  const inventoryValue = allProducts.reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  );

  // Group products by category
  const productsByCategory = allProducts.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = {
        count: 0,
        value: 0,
        stock: 0,
      };
    }
    acc[category].count += 1;
    acc[category].value += product.price * product.stock;
    acc[category].stock += product.stock;
    return acc;
  }, {} as Record<string, { count: number; value: number; stock: number }>);

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
              Reporte de Inventario
            </h2>
            <p className="text-muted-foreground">
              Análisis de stock y movimientos
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
              <Package className="h-4 w-4" />
              Total Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryMetrics.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En inventario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {inventoryValue.toLocaleString("es-AR", {
                minimumFractionDigits: 0,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valorización
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {lowStockProducts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Productos críticos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Rotación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryMetrics.turnoverRate.toFixed(1)}x
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Últimos {daysBack} días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Inventario por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(productsByCategory)
              .sort((a, b) => b[1].value - a[1].value)
              .map(([category, data]) => {
                const percentage = (data.value / inventoryValue) * 100;
                return (
                  <div key={category} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <div>
                          <p className="font-medium">
                            {categoryLabels[category] || category}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {data.count} productos
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">
                          $
                          {data.value.toLocaleString("es-AR", {
                            minimumFractionDigits: 0,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% del total
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Top Products by Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Vendidos (Últimos {daysBack} días)</CardTitle>
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
                      en ingresos
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-2 bg-white rounded border border-red-200"
                >
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Stock: {product.stock} {product.unit} (Min:{" "}
                      {product.minStock})
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/inventario/productos/${product._id}`)
                    }
                  >
                    Reabastecer
                  </Button>
                </div>
              ))}
            </div>
            {lowStockProducts.length > 5 && (
              <div className="flex justify-center">
                <Link href="/inventario/alertas">
                  <Button variant="destructive">
                    Ver Todas las Alertas ({lowStockProducts.length})
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

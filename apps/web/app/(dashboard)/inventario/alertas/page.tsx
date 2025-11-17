"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { DataTable, Button, Badge, ProductCard } from "@workspace/ui";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, AlertTriangle, Package } from "lucide-react";
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

export default function LowStockAlertsPage() {
  const router = useRouter();
  const lowStockProducts = useQuery(api.products.getLowStock);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Producto",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium">{product.name}</p>
              {product.sku && (
                <p className="text-sm text-muted-foreground">
                  SKU: {product.sku}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Categoría",
      cell: ({ row }) => {
        const category = row.original.category;
        return categoryLabels[category] || category;
      },
    },
    {
      accessorKey: "stock",
      header: "Stock Actual",
      cell: ({ row }) => {
        const product = row.original;
        const percentage = (product.stock / product.minStock) * 100;
        return (
          <div>
            <span className="font-medium text-red-600">
              {product.stock} {product.unit}
            </span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${
                  percentage < 50 ? "bg-red-600" : "bg-orange-500"
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "minStock",
      header: "Stock Mínimo",
      cell: ({ row }) => (
        <span>
          {row.original.minStock} {row.original.unit}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Urgencia",
      cell: ({ row }) => {
        const product = row.original;
        const percentage = (product.stock / product.minStock) * 100;

        if (percentage === 0) {
          return <Badge variant="destructive">Sin Stock</Badge>;
        } else if (percentage < 25) {
          return <Badge variant="destructive">Crítico</Badge>;
        } else if (percentage < 50) {
          return (
            <Badge className="bg-orange-500 text-white">Urgente</Badge>
          );
        } else {
          return (
            <Badge className="bg-yellow-500 text-white">Advertencia</Badge>
          );
        }
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/inventario/productos/${product._id}`)}
          >
            Reabastecer
          </Button>
        );
      },
    },
  ];

  if (lowStockProducts === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Categorize by urgency
  const outOfStock = lowStockProducts.filter((p) => p.stock === 0);
  const critical = lowStockProducts.filter(
    (p) => p.stock > 0 && (p.stock / p.minStock) * 100 < 25
  );
  const urgent = lowStockProducts.filter((p) => {
    const percentage = (p.stock / p.minStock) * 100;
    return percentage >= 25 && percentage < 50;
  });
  const warning = lowStockProducts.filter((p) => {
    const percentage = (p.stock / p.minStock) * 100;
    return percentage >= 50;
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/inventario/productos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">
            Alertas de Stock Bajo
          </h2>
          <p className="text-muted-foreground">
            {lowStockProducts.length} productos requieren atención
          </p>
        </div>
      </div>

      {lowStockProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <Package className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Todo el stock está en orden
          </h3>
          <p className="text-muted-foreground">
            No hay productos con stock bajo en este momento
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-900">Sin Stock</span>
              </div>
              <div className="text-3xl font-bold text-red-600">
                {outOfStock.length}
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-900">Crítico</span>
              </div>
              <div className="text-3xl font-bold text-red-600">
                {critical.length}
              </div>
              <p className="text-xs text-red-700 mt-1">&lt; 25% del mínimo</p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-900">Urgente</span>
              </div>
              <div className="text-3xl font-bold text-orange-600">
                {urgent.length}
              </div>
              <p className="text-xs text-orange-700 mt-1">25-50% del mínimo</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Advertencia</span>
              </div>
              <div className="text-3xl font-bold text-yellow-600">
                {warning.length}
              </div>
              <p className="text-xs text-yellow-700 mt-1">50-100% del mínimo</p>
            </div>
          </div>

          {/* Products Table */}
          <DataTable
            columns={columns}
            data={lowStockProducts}
            searchKey="name"
            searchPlaceholder="Buscar productos..."
            onRowClick={(product) =>
              router.push(`/inventario/productos/${product._id}`)
            }
          />

          {/* Product Cards Grid (Alternative View) */}
          {outOfStock.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Productos Sin Stock
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {outOfStock.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={() =>
                      router.push(`/inventario/productos/${product._id}`)
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

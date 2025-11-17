"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { DataTable, Button, Badge, Card, CardContent } from "@workspace/ui";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2, AlertTriangle, Package } from "lucide-react";
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

const categoryColors: Record<string, string> = {
  fuel: "bg-orange-500",
  lubricant: "bg-blue-500",
  accessory: "bg-purple-500",
  food: "bg-green-500",
  beverage: "bg-cyan-500",
  service: "bg-yellow-500",
  other: "bg-gray-500",
};

export default function ProductsPage() {
  const router = useRouter();
  const [includeInactive, setIncludeInactive] = useState(false);
  const products = useQuery(api.products.getAll, { includeInactive });
  const deleteProduct = useMutation(api.products.deleteProduct);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await deleteProduct({ id: id as any });
      } catch (error: any) {
        alert(error.message || "Error al eliminar producto");
      }
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Producto",
      cell: ({ row }) => {
        const product = row.original;
        const isLowStock = product.stock <= product.minStock;
        return (
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{product.name}</p>
                {isLowStock && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
              {product.sku && (
                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
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
        return (
          <Badge
            variant="secondary"
            className={`${categoryColors[category]} text-white`}
          >
            {categoryLabels[category]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ row }) => (
        <span className="font-medium">
          $
          {row.original.price.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const product = row.original;
        const isLowStock = product.stock <= product.minStock;
        return (
          <div>
            <span
              className={`font-medium ${isLowStock ? "text-red-500" : ""}`}
            >
              {product.stock} {product.unit}
            </span>
            <p className="text-xs text-muted-foreground">
              Min: {product.minStock}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/inventario/productos/${product._id}`);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(product._id);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (products === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const lowStockProducts = products.filter(
    (p) => p.stock <= p.minStock
  ).length;
  const totalValue = products.reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Productos</h2>
          <p className="text-muted-foreground">
            Gestiona tu inventario de productos
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/inventario/alertas">
            <Button variant="outline">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Alertas ({lowStockProducts})
            </Button>
          </Link>
          <Link href="/inventario/productos/nuevo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{totalProducts}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total Productos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {activeProducts}
            </div>
            <p className="text-xs text-muted-foreground">Productos Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {lowStockProducts}
            </div>
            <p className="text-xs text-muted-foreground">Stock Bajo</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              $
              {totalValue.toLocaleString("es-AR", {
                minimumFractionDigits: 0,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Valor Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
            className="rounded"
          />
          Incluir productos inactivos
        </label>
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Buscar productos..."
        onRowClick={(product) =>
          router.push(`/inventario/productos/${product._id}`)
        }
      />
    </div>
  );
}

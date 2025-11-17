"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { DataTable, Button, Badge, Card, CardContent } from "@workspace/ui";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Eye, Filter } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SaleStatus = "completed" | "pending" | "cancelled" | "refunded";

const statusColors: Record<SaleStatus, string> = {
  completed: "bg-green-500",
  pending: "bg-yellow-500",
  cancelled: "bg-red-500",
  refunded: "bg-blue-500",
};

const statusLabels: Record<SaleStatus, string> = {
  completed: "Completada",
  pending: "Pendiente",
  cancelled: "Cancelada",
  refunded: "Reembolsada",
};

export default function SalesHistoryPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<SaleStatus | undefined>(
    undefined
  );

  const sales = useQuery(
    api.sales.getAll,
    statusFilter ? { status: statusFilter } : {}
  );

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "_id",
      header: "ID Venta",
      cell: ({ row }) => (
        <span className="font-mono text-sm">#{row.original._id.slice(-8)}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <div>
            <p className="font-medium">
              {date.toLocaleDateString("es-AR")}
            </p>
            <p className="text-sm text-muted-foreground">
              {date.toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "customerName",
      header: "Cliente",
      cell: ({ row }) => row.original.customerName || "Anónimo",
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.items.length}</span>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-medium">
          $
          {row.original.total.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Pago",
      cell: ({ row }) => {
        const method = row.original.paymentMethod;
        const labels: Record<string, string> = {
          cash: "Efectivo",
          credit_card: "Tarjeta Crédito",
          debit_card: "Tarjeta Débito",
          transfer: "Transferencia",
        };
        return labels[method] || method;
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.original.status as SaleStatus;
        return (
          <Badge
            variant="secondary"
            className={`${statusColors[status]} text-white`}
          >
            {statusLabels[status]}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const sale = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/ventas/${sale._id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  if (sales === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate stats
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/ventas">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al POS
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Historial de Ventas
          </h2>
          <p className="text-muted-foreground">
            Consulta todas las ventas realizadas
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">Ventas Totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              $
              {totalRevenue.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Ingresos Totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              $
              {averageTicket.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Ticket Promedio</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filtrar por estado:</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={statusFilter === undefined ? "default" : "outline"}
            onClick={() => setStatusFilter(undefined)}
          >
            Todos
          </Button>
          {Object.entries(statusLabels).map(([status, label]) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status as SaleStatus)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Sales Table */}
      <DataTable
        columns={columns}
        data={sales}
        searchKey="customerName"
        searchPlaceholder="Buscar por cliente..."
        onRowClick={(sale) => router.push(`/ventas/${sale._id}`)}
      />
    </div>
  );
}

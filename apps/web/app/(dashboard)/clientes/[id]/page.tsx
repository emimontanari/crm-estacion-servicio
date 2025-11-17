"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { CustomerCard, Card, CardHeader, CardTitle, CardContent, DataTable } from "@workspace/ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@workspace/ui";
import { ColumnDef } from "@tanstack/react-table";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const customer = useQuery(api.customers.getById, { id: id as any });
  const purchaseHistory = useQuery(api.customers.getPurchaseHistory, {
    customerId: id as any,
    limit: 10,
  });

  if (customer === undefined || purchaseHistory === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("es-AR"),
    },
    {
      accessorKey: "_id",
      header: "ID Venta",
      cell: ({ row }) => `#${row.original._id.slice(-8)}`,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) =>
        `$${row.original.total.toLocaleString("es-AR", {
          minimumFractionDigits: 2,
        })}`,
    },
    {
      accessorKey: "paymentMethod",
      header: "Método de Pago",
      cell: ({ row }) => row.original.paymentMethod.replace("_", " "),
    },
    {
      accessorKey: "loyaltyPointsEarned",
      header: "Puntos Ganados",
      cell: ({ row }) => row.original.loyaltyPointsEarned,
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/clientes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Detalle del Cliente
          </h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <CustomerCard
            customer={{
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              address: customer.address,
              loyaltyPoints: customer.loyaltyPoints,
              totalPurchases: customer.totalPurchases,
              totalSpent: customer.totalSpent,
              vehicleInfo: customer.vehicleInfo,
            }}
          />
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Compras</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={purchaseHistory} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

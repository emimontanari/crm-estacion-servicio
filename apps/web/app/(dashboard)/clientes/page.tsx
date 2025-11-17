"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { DataTable, Button, CustomerCard } from "@workspace/ui";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CustomersPage() {
  const router = useRouter();
  const customers = useQuery(api.customers.getAll, { includeInactive: false });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex items-center gap-3">
            <div>
              <p className="font-medium">{customer.name}</p>
              <p className="text-sm text-muted-foreground">{customer.phone}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || "-",
    },
    {
      accessorKey: "loyaltyPoints",
      header: "Puntos",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.loyaltyPoints}</span>
      ),
    },
    {
      accessorKey: "totalPurchases",
      header: "Compras",
      cell: ({ row }) => row.original.totalPurchases,
    },
    {
      accessorKey: "totalSpent",
      header: "Total Gastado",
      cell: ({ row }) =>
        `$${row.original.totalSpent.toLocaleString("es-AR", {
          minimumFractionDigits: 2,
        })}`,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/clientes/${customer._id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (customers === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground">
            Gestiona tu base de clientes
          </p>
        </div>
        <Link href="/clientes/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchKey="name"
        searchPlaceholder="Buscar clientes..."
        onRowClick={(customer) => router.push(`/clientes/${customer._id}`)}
      />
    </div>
  );
}

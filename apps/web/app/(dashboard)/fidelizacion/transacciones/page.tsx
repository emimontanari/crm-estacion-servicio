"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { DataTable, Button, Badge } from "@workspace/ui";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, TrendingUp, TrendingDown, MinusCircle } from "lucide-react";
import Link from "next/link";

type TransactionType = "earned" | "redeemed" | "expired";

const typeLabels: Record<TransactionType, string> = {
  earned: "Ganados",
  redeemed: "Canjeados",
  expired: "Expirados",
};

const typeColors: Record<TransactionType, string> = {
  earned: "text-green-600",
  redeemed: "text-blue-600",
  expired: "text-red-600",
};

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<TransactionType | undefined>(
    undefined
  );

  const transactions = useQuery(api.loyalty.getRecentTransactions, {
    limit: 100,
    type: typeFilter,
  });

  const columns: ColumnDef<any>[] = [
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
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.customerName}</p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.original.type as TransactionType;
        return (
          <Badge
            variant="secondary"
            className={
              type === "earned"
                ? "bg-green-500 text-white"
                : type === "redeemed"
                ? "bg-blue-500 text-white"
                : "bg-red-500 text-white"
            }
          >
            {typeLabels[type]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "points",
      header: "Puntos",
      cell: ({ row }) => {
        const transaction = row.original;
        const Icon =
          transaction.type === "earned"
            ? TrendingUp
            : transaction.type === "redeemed"
            ? TrendingDown
            : MinusCircle;

        return (
          <div className="flex items-center gap-2">
            <Icon
              className={`h-4 w-4 ${typeColors[transaction.type as TransactionType]}`}
            />
            <span
              className={`font-medium ${typeColors[transaction.type as TransactionType]}`}
            >
              {transaction.type === "earned" ? "+" : "-"}
              {transaction.points}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "reason",
      header: "Motivo",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.reason || "-"}
        </span>
      ),
    },
  ];

  if (transactions === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate stats
  const totalEarned = transactions
    .filter((t) => t.type === "earned")
    .reduce((sum, t) => sum + t.points, 0);

  const totalRedeemed = transactions
    .filter((t) => t.type === "redeemed")
    .reduce((sum, t) => sum + t.points, 0);

  const totalExpired = transactions
    .filter((t) => t.type === "expired")
    .reduce((sum, t) => sum + t.points, 0);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/fidelizacion">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Transacciones de Puntos
          </h2>
          <p className="text-muted-foreground">
            Historial de puntos ganados, canjeados y expirados
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 border rounded-lg bg-green-50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-900">Puntos Ganados</span>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {totalEarned.toLocaleString("es-AR")}
          </div>
          <p className="text-xs text-green-700 mt-1">
            {transactions.filter((t) => t.type === "earned").length}{" "}
            transacciones
          </p>
        </div>

        <div className="p-4 border rounded-lg bg-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">Puntos Canjeados</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {totalRedeemed.toLocaleString("es-AR")}
          </div>
          <p className="text-xs text-blue-700 mt-1">
            {transactions.filter((t) => t.type === "redeemed").length}{" "}
            transacciones
          </p>
        </div>

        <div className="p-4 border rounded-lg bg-red-50">
          <div className="flex items-center gap-2 mb-2">
            <MinusCircle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-900">Puntos Expirados</span>
          </div>
          <div className="text-3xl font-bold text-red-600">
            {totalExpired.toLocaleString("es-AR")}
          </div>
          <p className="text-xs text-red-700 mt-1">
            {transactions.filter((t) => t.type === "expired").length}{" "}
            transacciones
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Filtrar por tipo:</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={typeFilter === undefined ? "default" : "outline"}
            onClick={() => setTypeFilter(undefined)}
          >
            Todos
          </Button>
          <Button
            size="sm"
            variant={typeFilter === "earned" ? "default" : "outline"}
            onClick={() => setTypeFilter("earned")}
          >
            Ganados
          </Button>
          <Button
            size="sm"
            variant={typeFilter === "redeemed" ? "default" : "outline"}
            onClick={() => setTypeFilter("redeemed")}
          >
            Canjeados
          </Button>
          <Button
            size="sm"
            variant={typeFilter === "expired" ? "default" : "outline"}
            onClick={() => setTypeFilter("expired")}
          >
            Expirados
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <DataTable
        columns={columns}
        data={transactions}
        searchKey="customerName"
        searchPlaceholder="Buscar por cliente..."
      />
    </div>
  );
}

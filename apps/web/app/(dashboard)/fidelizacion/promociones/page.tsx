"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { DataTable, Button, Badge } from "@workspace/ui";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Plus, Gift } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PromotionsPage() {
  const router = useRouter();
  const activePromotions = useQuery(api.loyalty.getActivePromotions);
  const allPromotions = useQuery(api.loyalty.getAllPromotions);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.description && (
            <p className="text-sm text-muted-foreground">
              {row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.original.type;
        const labels: Record<string, string> = {
          multiplier: "Multiplicador",
          bonus: "Bonus",
          discount: "Descuento",
        };
        return <Badge variant="secondary">{labels[type] || type}</Badge>;
      },
    },
    {
      accessorKey: "value",
      header: "Valor",
      cell: ({ row }) => {
        const promo = row.original;
        return (
          <span className="font-medium text-lg">
            {promo.type === "multiplier" && `${promo.value}x`}
            {promo.type === "bonus" && `+${promo.value} pts`}
            {promo.type === "discount" && `${promo.value}%`}
          </span>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: "Inicio",
      cell: ({ row }) =>
        new Date(row.original.startDate).toLocaleDateString("es-AR"),
    },
    {
      accessorKey: "endDate",
      header: "Fin",
      cell: ({ row }) =>
        new Date(row.original.endDate).toLocaleDateString("es-AR"),
    },
    {
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ row }) => {
        const now = Date.now();
        const promo = row.original;
        const isActive =
          promo.isActive &&
          now >= promo.startDate &&
          now <= promo.endDate;

        return (
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-green-500" : ""}
          >
            {isActive ? "Activa" : "Inactiva"}
          </Badge>
        );
      },
    },
  ];

  if (activePromotions === undefined || allPromotions === undefined) {
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
          <Link href="/fidelizacion">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Promociones</h2>
            <p className="text-muted-foreground">
              Gestiona promociones de fidelidad
            </p>
          </div>
        </div>
        <Link href="/fidelizacion/promociones/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Promoción
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-5 w-5 text-green-500" />
            <span className="font-medium">Promociones Activas</span>
          </div>
          <div className="text-3xl font-bold">{activePromotions.length}</div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Total Promociones</span>
          </div>
          <div className="text-3xl font-bold">{allPromotions.length}</div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-5 w-5 text-gray-500" />
            <span className="font-medium">Inactivas/Pasadas</span>
          </div>
          <div className="text-3xl font-bold">
            {allPromotions.length - activePromotions.length}
          </div>
        </div>
      </div>

      {/* Promotions Table */}
      <DataTable
        columns={columns}
        data={allPromotions}
        searchKey="name"
        searchPlaceholder="Buscar promociones..."
      />
    </div>
  );
}

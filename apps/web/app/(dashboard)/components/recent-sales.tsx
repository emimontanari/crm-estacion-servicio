"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui";
import { Skeleton } from "@workspace/ui";

export function RecentSales() {
  const sales = useQuery(api.sales.getAll, {
    limit: 5,
    status: "completed",
  });

  if (sales === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Últimas Ventas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (sales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Últimas Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay ventas registradas
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas Ventas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sales.map((sale) => (
          <div
            key={sale._id}
            className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Venta #{sale._id.slice(-8)}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(sale.createdAt).toLocaleString("es-AR")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">
                ${sale.total.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {sale.paymentMethod.replace("_", " ")}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

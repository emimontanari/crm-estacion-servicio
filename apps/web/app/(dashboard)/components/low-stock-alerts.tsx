"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui";
import { ProductCard, Skeleton } from "@workspace/ui";

export function LowStockAlerts() {
  const products = useQuery(api.products.getLowStock);

  if (products === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            ✓ Stock en niveles óptimos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas de Stock ({products.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.slice(0, 5).map((product) => (
          <ProductCard
            key={product._id}
            product={{
              name: product.name,
              price: product.price,
              stock: product.stock,
              minStock: product.minStock,
              unit: product.unit,
            }}
            compact
          />
        ))}
      </CardContent>
    </Card>
  );
}

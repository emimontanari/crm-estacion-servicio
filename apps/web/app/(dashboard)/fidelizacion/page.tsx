"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  LoyaltyBadge,
} from "@workspace/ui";
import { Award, Gift, TrendingUp, Users, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoyaltyPage() {
  const router = useRouter();
  const loyaltyConfig = useQuery(api.loyalty.getProgramConfig);
  const activePromotions = useQuery(api.loyalty.getActivePromotions);
  const recentTransactions = useQuery(api.loyalty.getRecentTransactions, {
    limit: 10,
  });

  if (
    loyaltyConfig === undefined ||
    activePromotions === undefined ||
    recentTransactions === undefined
  ) {
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
          <h2 className="text-3xl font-bold tracking-tight">
            Programa de Fidelización
          </h2>
          <p className="text-muted-foreground">
            Gestiona puntos, promociones y recompensas
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/fidelizacion/promociones/nueva">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Promoción
            </Button>
          </Link>
        </div>
      </div>

      {/* Program Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Configuración del Programa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Puntos por Peso</p>
              <p className="text-3xl font-bold">
                {loyaltyConfig.pointsPerPeso}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Por cada $1 gastado
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Valor del Punto</p>
              <p className="text-3xl font-bold">
                $
                {(1 / loyaltyConfig.pointsPerPeso).toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Por cada punto
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Estado del Programa</p>
              <Badge
                variant={loyaltyConfig.isActive ? "default" : "secondary"}
                className="text-lg"
              >
                {loyaltyConfig.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>

          {loyaltyConfig.description && (
            <div className="mt-4 p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground">
                {loyaltyConfig.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {activePromotions.length}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Promociones Activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {recentTransactions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Transacciones Recientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {recentTransactions
                .filter((t) => t.type === "earned")
                .reduce((sum, t) => sum + t.points, 0)
                .toLocaleString("es-AR")}
            </div>
            <p className="text-xs text-muted-foreground">
              Puntos Otorgados (Total)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {recentTransactions
                .filter((t) => t.type === "redeemed")
                .reduce((sum, t) => sum + t.points, 0)
                .toLocaleString("es-AR")}
            </div>
            <p className="text-xs text-muted-foreground">
              Puntos Canjeados (Total)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Promotions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Promociones Activas
            </CardTitle>
            <Link href="/fidelizacion/promociones">
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {activePromotions.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay promociones activas
              </p>
              <Link href="/fidelizacion/promociones/nueva">
                <Button className="mt-4" variant="outline">
                  Crear Primera Promoción
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activePromotions.slice(0, 4).map((promo) => (
                <div
                  key={promo._id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() =>
                    router.push(`/fidelizacion/promociones/${promo._id}`)
                  }
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{promo.name}</h3>
                      <Badge
                        variant="secondary"
                        className="mt-1 bg-green-500 text-white"
                      >
                        {promo.type === "multiplier" && "Multiplicador"}
                        {promo.type === "bonus" && "Bonus"}
                        {promo.type === "discount" && "Descuento"}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {promo.type === "multiplier" && `${promo.value}x`}
                        {promo.type === "bonus" && `+${promo.value}`}
                        {promo.type === "discount" && `${promo.value}%`}
                      </p>
                    </div>
                  </div>
                  {promo.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {promo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {new Date(promo.startDate).toLocaleDateString("es-AR")}
                    </span>
                    <span>-</span>
                    <span>
                      {new Date(promo.endDate).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Transacciones Recientes
            </CardTitle>
            <Link href="/fidelizacion/transacciones">
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay transacciones recientes
            </p>
          ) : (
            <div className="space-y-2">
              {recentTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        transaction.type === "earned"
                          ? "bg-green-500"
                          : transaction.type === "redeemed"
                          ? "bg-blue-500"
                          : "bg-red-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{transaction.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.reason || "Sin descripción"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        transaction.type === "earned"
                          ? "text-green-600"
                          : transaction.type === "redeemed"
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "earned" ? "+" : "-"}
                      {transaction.points} pts
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString(
                        "es-AR"
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

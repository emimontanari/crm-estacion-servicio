"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { Card, CardContent, CardHeader, CardTitle, AreaChart } from "@workspace/ui";
import { Skeleton } from "@workspace/ui";
import { Award } from "lucide-react";
import { useMemo } from "react";

export function LoyaltyStatsChart() {
  const loyaltyStats = useQuery(api.reports.getLoyaltyStats, {
    startDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // Últimos 30 días
    endDate: Date.now(),
  });

  const chartData = useMemo(() => {
    if (!loyaltyStats) return [];

    return [
      {
        categoria: "Puntos Ganados",
        valor: loyaltyStats.pointsEarned || 0,
      },
      {
        categoria: "Puntos Canjeados",
        valor: loyaltyStats.pointsRedeemed || 0,
      },
      {
        categoria: "Saldo Disponible",
        valor: (loyaltyStats.pointsEarned || 0) - (loyaltyStats.pointsRedeemed || 0),
      },
    ];
  }, [loyaltyStats]);

  if (loyaltyStats === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Programa de Fidelización</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const participationRate = loyaltyStats.participationRate || 0;
  const redemptionRate = loyaltyStats.redemptionRate || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-chart-4" />
            Programa de Fidelización
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Últimos 30 días - {loyaltyStats.customersWithPoints} clientes activos
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPIs de Fidelización */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm text-muted-foreground">Tasa de Participación</p>
            <p className="text-2xl font-bold text-chart-4 mt-1">
              {participationRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {loyaltyStats.customersWithPoints} de {loyaltyStats.totalCustomers} clientes
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm text-muted-foreground">Tasa de Canje</p>
            <p className="text-2xl font-bold text-chart-5 mt-1">
              {redemptionRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {loyaltyStats.pointsRedeemed?.toLocaleString()} pts canjeados
            </p>
          </div>
        </div>

        {/* Resumen de Puntos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-chart-1/10 border border-chart-1/20">
            <span className="text-sm font-medium">Puntos Ganados</span>
            <span className="text-lg font-bold text-chart-1">
              {loyaltyStats.pointsEarned?.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
            <span className="text-sm font-medium">Puntos Canjeados</span>
            <span className="text-lg font-bold text-chart-2">
              {loyaltyStats.pointsRedeemed?.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-chart-3/10 border border-chart-3/20">
            <span className="text-sm font-medium">Saldo Total Disponible</span>
            <span className="text-lg font-bold text-chart-3">
              {((loyaltyStats.pointsEarned || 0) - (loyaltyStats.pointsRedeemed || 0)).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Indicador de Engagement */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Engagement del Programa</span>
            <span className="text-sm font-medium">
              {((participationRate + redemptionRate) / 2).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-chart-4 to-chart-5 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(((participationRate + redemptionRate) / 2), 100)}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

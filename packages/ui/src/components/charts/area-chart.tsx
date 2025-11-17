"use client";

import * as React from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer } from "./chart-container";

export interface AreaChartProps {
  data: any[];
  areas: {
    dataKey: string;
    name?: string;
    color?: string;
    fillOpacity?: number;
  }[];
  xAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
  minHeight?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  curve?: "monotone" | "linear" | "step" | "natural";
  formatTooltip?: (value: any, name: string) => string;
  formatYAxis?: (value: any) => string;
}

/**
 * Gráfico de áreas avanzado
 * Ideal para: Volúmenes acumulados, tendencias suaves, comparación de magnitudes
 */
export function AreaChart({
  data,
  areas,
  xAxisKey,
  xAxisLabel,
  yAxisLabel,
  className = "",
  minHeight = 350,
  showGrid = true,
  showLegend = true,
  stacked = false,
  curve = "monotone",
  formatTooltip,
  formatYAxis,
}: AreaChartProps) {
  const defaultColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <ChartContainer className={className} minHeight={minHeight}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          {areas.map((area, index) => {
            const color = area.color || defaultColors[index % defaultColors.length];
            return (
              <linearGradient
                key={area.dataKey}
                id={`gradient-${area.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            );
          })}
        </defs>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted"
            opacity={0.3}
          />
        )}
        <XAxis
          dataKey={xAxisKey}
          label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -5 } : undefined}
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickFormatter={formatYAxis}
        />
        <Tooltip
          formatter={formatTooltip}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }}
          />
        )}
        {areas.map((area, index) => (
          <Area
            key={area.dataKey}
            type={curve}
            dataKey={area.dataKey}
            name={area.name || area.dataKey}
            stroke={area.color || defaultColors[index % defaultColors.length]}
            fill={`url(#gradient-${area.dataKey})`}
            fillOpacity={area.fillOpacity !== undefined ? area.fillOpacity : 1}
            strokeWidth={2}
            stackId={stacked ? "stack" : undefined}
            animationDuration={1000}
          />
        ))}
      </RechartsAreaChart>
    </ChartContainer>
  );
}

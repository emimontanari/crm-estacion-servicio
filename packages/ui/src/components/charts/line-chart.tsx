"use client";

import * as React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer } from "./chart-container";

export interface LineChartProps {
  data: any[];
  lines: {
    dataKey: string;
    name?: string;
    color?: string;
    strokeWidth?: number;
  }[];
  xAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
  minHeight?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  curve?: "monotone" | "linear" | "step" | "natural";
  formatTooltip?: (value: any, name: string) => string;
  formatYAxis?: (value: any) => string;
}

/**
 * Gráfico de líneas avanzado con múltiples series
 * Ideal para: Tendencias de ventas, evolución temporal, comparaciones de períodos
 */
export function LineChart({
  data,
  lines,
  xAxisKey,
  xAxisLabel,
  yAxisLabel,
  className = "",
  minHeight = 350,
  showGrid = true,
  showLegend = true,
  curve = "monotone",
  formatTooltip,
  formatYAxis,
}: LineChartProps) {
  const defaultColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <ChartContainer className={className} minHeight={minHeight}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            iconType="line"
          />
        )}
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type={curve}
            dataKey={line.dataKey}
            name={line.name || line.dataKey}
            stroke={line.color || defaultColors[index % defaultColors.length]}
            strokeWidth={line.strokeWidth || 2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={1000}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
}

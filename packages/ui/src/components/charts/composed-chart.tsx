"use client";

import * as React from "react";
import {
  ComposedChart as RechartsComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer } from "./chart-container";

export type ChartElement = {
  type: "line" | "bar" | "area";
  dataKey: string;
  name?: string;
  color?: string;
  yAxisId?: string;
};

export interface ComposedChartProps {
  data: any[];
  elements: ChartElement[];
  xAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  secondaryYAxisLabel?: string;
  className?: string;
  minHeight?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  formatTooltip?: (value: any, name: string) => string;
  formatYAxis?: (value: any) => string;
}

/**
 * Gráfico combinado avanzado (líneas + barras + áreas)
 * Ideal para: Análisis multidimensionales, correlaciones, comparaciones complejas
 */
export function ComposedChart({
  data,
  elements,
  xAxisKey,
  xAxisLabel,
  yAxisLabel,
  secondaryYAxisLabel,
  className = "",
  minHeight = 350,
  showGrid = true,
  showLegend = true,
  formatTooltip,
  formatYAxis,
}: ComposedChartProps) {
  const defaultColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const hasSecondaryAxis = elements.some(el => el.yAxisId === "right");

  return (
    <ChartContainer className={className} minHeight={minHeight}>
      <RechartsComposedChart
        data={data}
        margin={{ top: 5, right: hasSecondaryAxis ? 30 : 20, left: 20, bottom: 5 }}
      >
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
          yAxisId="left"
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickFormatter={formatYAxis}
        />
        {hasSecondaryAxis && (
          <YAxis
            yAxisId="right"
            orientation="right"
            label={secondaryYAxisLabel ? { value: secondaryYAxisLabel, angle: 90, position: "insideRight" } : undefined}
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
        )}
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
        {elements.map((element, index) => {
          const color = element.color || defaultColors[index % defaultColors.length];
          const yAxisId = element.yAxisId || "left";

          switch (element.type) {
            case "bar":
              return (
                <Bar
                  key={element.dataKey}
                  dataKey={element.dataKey}
                  name={element.name || element.dataKey}
                  fill={color}
                  yAxisId={yAxisId}
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                />
              );
            case "area":
              return (
                <Area
                  key={element.dataKey}
                  type="monotone"
                  dataKey={element.dataKey}
                  name={element.name || element.dataKey}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.3}
                  yAxisId={yAxisId}
                  animationDuration={1000}
                />
              );
            case "line":
            default:
              return (
                <Line
                  key={element.dataKey}
                  type="monotone"
                  dataKey={element.dataKey}
                  name={element.name || element.dataKey}
                  stroke={color}
                  strokeWidth={2}
                  yAxisId={yAxisId}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                />
              );
          }
        })}
      </RechartsComposedChart>
    </ChartContainer>
  );
}

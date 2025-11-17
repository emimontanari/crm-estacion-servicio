"use client";

import * as React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { ChartContainer } from "./chart-container";

export interface BarChartProps {
  data: any[];
  bars: {
    dataKey: string;
    name?: string;
    color?: string;
  }[];
  xAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
  minHeight?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  layout?: "horizontal" | "vertical";
  formatTooltip?: (value: any, name: string) => string;
  formatYAxis?: (value: any) => string;
  colorByIndex?: string[];
}

/**
 * Gráfico de barras avanzado
 * Ideal para: Comparaciones, rankings, distribuciones categóricas
 */
export function BarChart({
  data,
  bars,
  xAxisKey,
  xAxisLabel,
  yAxisLabel,
  className = "",
  minHeight = 350,
  showGrid = true,
  showLegend = true,
  layout = "horizontal",
  formatTooltip,
  formatYAxis,
  colorByIndex,
}: BarChartProps) {
  const defaultColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <ChartContainer className={className} minHeight={minHeight}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted"
            opacity={0.3}
          />
        )}
        {layout === "horizontal" ? (
          <>
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
          </>
        ) : (
          <>
            <XAxis
              type="number"
              label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -5 } : undefined}
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={formatYAxis}
            />
            <YAxis
              type="category"
              dataKey={xAxisKey}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
          </>
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
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name || bar.dataKey}
            fill={bar.color || defaultColors[index % defaultColors.length]}
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          >
            {colorByIndex &&
              data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={colorByIndex[idx % colorByIndex.length]} />
              ))}
          </Bar>
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
}

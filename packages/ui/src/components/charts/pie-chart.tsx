"use client";

import * as React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface PieChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  className?: string;
  minHeight?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  colors?: string[];
  formatTooltip?: (value: any, name: string) => string;
  showLabels?: boolean;
  labelFormatter?: (entry: any) => string;
}

/**
 * Gráfico circular/dona avanzado
 * Ideal para: Distribuciones, proporciones, composición porcentual
 */
export function PieChart({
  data,
  dataKey,
  nameKey,
  className = "",
  minHeight = 350,
  showLegend = true,
  innerRadius = 0,
  outerRadius,
  colors,
  formatTooltip,
  showLabels = true,
  labelFormatter,
}: PieChartProps) {
  const defaultColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const chartColors = colors || defaultColors;

  const renderLabel = (entry: any) => {
    if (!showLabels) return null;
    if (labelFormatter) return labelFormatter(entry);

    const total = data.reduce((sum, item) => sum + item[dataKey], 0);
    const percent = ((entry[dataKey] / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <div className={`w-full ${className}`} style={{ minHeight: `${minHeight}px` }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={minHeight}>
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius || minHeight * 0.3}
            label={renderLabel}
            labelLine={showLabels}
            animationDuration={1000}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chartColors[index % chartColors.length]}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              />
            ))}
          </Pie>
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
              iconType="circle"
              layout="horizontal"
              verticalAlign="bottom"
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

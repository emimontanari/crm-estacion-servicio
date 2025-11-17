"use client";

import * as React from "react";
import { ResponsiveContainer } from "recharts";

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  minHeight?: number;
}

/**
 * Contenedor base para todos los gráficos que proporciona:
 * - Responsividad automática
 * - Altura mínima consistente
 * - Estilos base para dark mode
 */
export function ChartContainer({
  children,
  className = "",
  minHeight = 350,
}: ChartContainerProps) {
  return (
    <div className={`w-full ${className}`} style={{ minHeight: `${minHeight}px` }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={minHeight}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "../lib/utils";
import { LucideIcon } from "lucide-react";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  loading?: boolean;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    { className, title, value, description, icon: Icon, trend, loading, ...props },
    ref
  ) => {
    const trendColor = trend
      ? trend.value > 0
        ? "text-green-600"
        : trend.value < 0
        ? "text-red-600"
        : "text-gray-600"
      : "";

    return (
      <Card ref={ref} className={cn("", className)} {...props}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold">{value}</div>
              {(description || trend) && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {trend && (
                    <span className={cn("font-medium", trendColor)}>
                      {trend.value > 0 ? "+" : ""}
                      {trend.value}%
                    </span>
                  )}
                  {description && <span>{description}</span>}
                  {trend?.label && <span>{trend.label}</span>}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";

export { StatCard };

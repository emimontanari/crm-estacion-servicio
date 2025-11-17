import * as React from "react";
import { Badge } from "../badge";
import { cn } from "../../lib/utils";
import { Star } from "lucide-react";

export interface LoyaltyBadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  points: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-0.5",
  lg: "text-base px-3 py-1",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const LoyaltyBadge = React.forwardRef<HTMLDivElement, LoyaltyBadgeProps>(
  ({ className, points, showLabel = true, size = "md", ...props }, ref) => {
    const variant = getVariantByPoints(points);

    return (
      <Badge
        ref={ref}
        variant={variant}
        className={cn(
          "inline-flex items-center gap-1.5",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <Star className={cn("fill-current", iconSizes[size])} />
        <span className="font-semibold">{points.toLocaleString()}</span>
        {showLabel && <span>puntos</span>}
      </Badge>
    );
  }
);

LoyaltyBadge.displayName = "LoyaltyBadge";

function getVariantByPoints(points: number): "default" | "secondary" | "success" {
  if (points >= 10000) return "success";
  if (points >= 5000) return "default";
  return "secondary";
}

export { LoyaltyBadge };

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
          className
        )}
        {...props}
      >
        {Icon && (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

export { EmptyState };

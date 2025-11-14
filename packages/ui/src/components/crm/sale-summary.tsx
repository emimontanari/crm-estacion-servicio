import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";
import { Separator } from "../separator";
import { cn } from "../../lib/utils";
import { Calendar, CreditCard, User } from "lucide-react";

export interface SaleSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  sale: {
    id: string;
    date: Date;
    customerName?: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: string;
    status: "completed" | "cancelled" | "refunded";
  };
}

const SaleSummary = React.forwardRef<HTMLDivElement, SaleSummaryProps>(
  ({ className, sale, ...props }, ref) => {
    const statusVariant = {
      completed: "success" as const,
      cancelled: "destructive" as const,
      refunded: "warning" as const,
    };

    const statusLabel = {
      completed: "Completada",
      cancelled: "Cancelada",
      refunded: "Reembolsada",
    };

    return (
      <Card ref={ref} className={cn("", className)} {...props}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>Venta #{sale.id.slice(-8)}</CardTitle>
            <Badge variant={statusVariant[sale.status]}>
              {statusLabel[sale.status]}
            </Badge>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{sale.date.toLocaleDateString("es-AR")}</span>
            </div>
            {sale.customerName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{sale.customerName}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>{sale.paymentMethod}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items */}
          <div className="space-y-2">
            {sale.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div className="flex-1">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground ml-2">
                    x{item.quantity}
                  </span>
                </div>
                <span className="font-medium">${item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento</span>
                <span>-${sale.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Impuestos</span>
              <span>${sale.tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${sale.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

SaleSummary.displayName = "SaleSummary";

export { SaleSummary };

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { Badge } from "../badge";
import { cn } from "../../lib/utils";
import { Mail, Phone, MapPin, Car } from "lucide-react";

export interface CustomerCardProps extends React.HTMLAttributes<HTMLDivElement> {
  customer: {
    name: string;
    email?: string;
    phone: string;
    avatar?: string;
    loyaltyPoints?: number;
    totalPurchases?: number;
    totalSpent?: number;
    address?: string;
    vehicleInfo?: {
      plate?: string;
      brand?: string;
      model?: string;
    };
  };
  compact?: boolean;
}

const CustomerCard = React.forwardRef<HTMLDivElement, CustomerCardProps>(
  ({ className, customer, compact = false, ...props }, ref) => {
    const initials = customer.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    if (compact) {
      return (
        <Card ref={ref} className={cn("", className)} {...props}>
          <CardContent className="flex items-center gap-4 p-4">
            <Avatar>
              <AvatarImage src={customer.avatar} alt={customer.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{customer.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {customer.phone}
              </p>
            </div>
            {customer.loyaltyPoints !== undefined && (
              <Badge variant="secondary">{customer.loyaltyPoints} pts</Badge>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card ref={ref} className={cn("", className)} {...props}>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={customer.avatar} alt={customer.name} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl">{customer.name}</CardTitle>
              {customer.loyaltyPoints !== undefined && (
                <div className="mt-2">
                  <Badge variant="default">{customer.loyaltyPoints} puntos</Badge>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {customer.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
            {customer.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{customer.address}</span>
              </div>
            )}
            {customer.vehicleInfo?.plate && (
              <div className="flex items-center gap-2 text-sm">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span>
                  {customer.vehicleInfo.plate}
                  {customer.vehicleInfo.brand &&
                    ` - ${customer.vehicleInfo.brand} ${customer.vehicleInfo.model || ""}`}
                </span>
              </div>
            )}
          </div>

          {(customer.totalPurchases !== undefined ||
            customer.totalSpent !== undefined) && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              {customer.totalPurchases !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">Compras</p>
                  <p className="text-2xl font-bold">{customer.totalPurchases}</p>
                </div>
              )}
              {customer.totalSpent !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">Total gastado</p>
                  <p className="text-2xl font-bold">
                    ${customer.totalSpent.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

CustomerCard.displayName = "CustomerCard";

export { CustomerCard };

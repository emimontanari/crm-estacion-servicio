import * as React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";
import { cn } from "../../lib/utils";
import { Package, AlertTriangle } from "lucide-react";

export interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  product: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    minStock?: number;
    category?: string;
    imageUrl?: string;
    unit?: string;
  };
  onAddToCart?: () => void;
  compact?: boolean;
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ className, product, onAddToCart, compact = false, ...props }, ref) => {
    const isLowStock =
      product.minStock !== undefined && product.stock <= product.minStock;

    if (compact) {
      return (
        <Card
          ref={ref}
          className={cn("cursor-pointer hover:shadow-md transition-shadow", className)}
          onClick={onAddToCart}
          {...props}
        >
          <CardContent className="flex items-center gap-4 p-4">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-12 w-12 rounded object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                ${product.price.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                Stock: {product.stock} {product.unit || "un"}
              </p>
              {isLowStock && (
                <Badge variant="warning" className="mt-1">
                  Bajo
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card ref={ref} className={cn("overflow-hidden", className)} {...props}>
        <CardHeader className="p-0">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-48 w-full object-cover"
            />
          ) : (
            <div className="flex h-48 items-center justify-center bg-muted">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            {product.category && (
              <Badge variant="secondary" className="shrink-0">
                {product.category}
              </Badge>
            )}
          </div>
          {product.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">
                por {product.unit || "unidad"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                Stock: {product.stock}
              </p>
              {isLowStock && (
                <div className="mt-1 flex items-center gap-1 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs">Bajo stock</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        {onAddToCart && (
          <CardFooter className="p-4 pt-0">
            <button
              onClick={onAddToCart}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
            </button>
          </CardFooter>
        )}
      </Card>
    );
  }
);

ProductCard.displayName = "ProductCard";

export { ProductCard };

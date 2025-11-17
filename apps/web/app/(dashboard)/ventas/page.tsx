"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
  ProductCard,
  Badge,
} from "@workspace/ui";
import { Search, ShoppingCart, Trash2, Plus, Minus, User } from "lucide-react";
import { PaymentDialog } from "./components/payment-dialog";
import { CustomerSelector } from "./components/customer-selector";
import { useRouter } from "next/navigation";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  maxStock: number;
}

export default function POSPage() {
  const router = useRouter();
  const products = useQuery(api.products.getAll, { includeInactive: false });
  const createSale = useMutation(api.sales.createSale);

  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter products by search term
  const filteredProducts = products?.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add product to cart
  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.productId === product._id);

    if (existingItem) {
      // Check if we can add more
      if (existingItem.quantity >= product.stock) {
        alert("No hay suficiente stock disponible");
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      if (product.stock <= 0) {
        alert("Producto sin stock");
        return;
      }
      setCart([
        ...cart,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          category: product.category,
          maxStock: product.stock,
        },
      ]);
    }
  };

  // Update quantity
  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.productId === productId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return null;
            if (newQuantity > item.maxStock) {
              alert("No hay suficiente stock disponible");
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.21; // 21% IVA
  const total = subtotal + tax;

  // Handle sale completion
  const handleCompleteSale = async (paymentData: {
    paymentMethod: string;
    cashReceived?: number;
    discountPercentage?: number;
    loyaltyPointsUsed?: number;
  }) => {
    if (cart.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    setIsProcessing(true);
    try {
      const saleId = await createSale({
        customerId: selectedCustomer?._id,
        items: cart.map((item) => ({
          productId: item.productId as any,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        paymentMethod: paymentData.paymentMethod as any,
        cashReceived: paymentData.cashReceived,
        discountPercentage: paymentData.discountPercentage,
        loyaltyPointsUsed: paymentData.loyaltyPointsUsed,
      });

      // Clear cart and customer
      setCart([]);
      setSelectedCustomer(null);
      setShowPaymentDialog(false);

      // Redirect to sale detail
      router.push(`/ventas/${saleId}`);
    } catch (error: any) {
      alert(error.message || "Error al procesar la venta");
    } finally {
      setIsProcessing(false);
    }
  };

  if (products === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Punto de Venta</h2>
          <p className="text-muted-foreground">
            Registra ventas y cobra a tus clientes
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/ventas/historial")}
        >
          Ver Historial
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Products Section */}
        <div className="md:col-span-2 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos por nombre, SKU o código de barras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts?.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>

          {filteredProducts?.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  No se encontraron productos
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          {/* Customer Selection */}
          <CustomerSelector
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setSelectedCustomer}
          />

          {/* Shopping Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrito ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Carrito vacío
                </p>
              ) : (
                <>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-2 p-2 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${item.price.toLocaleString("es-AR")}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.productId, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.productId, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            $
                            {(item.price * item.quantity).toLocaleString(
                              "es-AR"
                            )}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.productId)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${subtotal.toLocaleString("es-AR")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>IVA (21%):</span>
                      <span>${tax.toLocaleString("es-AR")}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>
                        $
                        {total.toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setShowPaymentDialog(true)}
                    disabled={cart.length === 0}
                  >
                    Procesar Pago
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        total={total}
        customer={selectedCustomer}
        onConfirm={handleCompleteSale}
        isProcessing={isProcessing}
      />
    </div>
  );
}

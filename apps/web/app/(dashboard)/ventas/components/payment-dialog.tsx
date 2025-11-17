"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Label,
  Input,
  CurrencyInput,
  PaymentMethodSelector,
  Badge,
} from "@workspace/ui";
import { CreditCard, Coins } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  customer: any;
  onConfirm: (data: {
    paymentMethod: string;
    cashReceived?: number;
    discountPercentage?: number;
    loyaltyPointsUsed?: number;
  }) => Promise<void>;
  isProcessing: boolean;
}

export function PaymentDialog({
  open,
  onOpenChange,
  total,
  customer,
  onConfirm,
  isProcessing,
}: PaymentDialogProps) {
  const paymentMethods = useQuery(api.payments.getPaymentMethods);
  const loyaltyConfig = useQuery(api.loyalty.getProgramConfig);

  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState<number>(0);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setPaymentMethod("cash");
      setCashReceived(0);
      setDiscountPercentage(0);
      setLoyaltyPointsUsed(0);
    }
  }, [open]);

  // Calculate discount
  const discountAmount = (total * discountPercentage) / 100;

  // Calculate loyalty points discount
  const pointsValue = loyaltyConfig
    ? (loyaltyPointsUsed / loyaltyConfig.pointsPerPeso)
    : 0;

  // Final total after discounts
  const finalTotal = Math.max(0, total - discountAmount - pointsValue);

  // Change to return
  const change = paymentMethod === "cash" ? Math.max(0, cashReceived - finalTotal) : 0;

  // Max loyalty points that can be used
  const maxLoyaltyPoints = customer?.loyaltyPoints || 0;
  const maxPointsValue = loyaltyConfig
    ? Math.floor((total * 0.5) / (1 / loyaltyConfig.pointsPerPeso)) // Max 50% of total
    : 0;
  const maxUsablePoints = Math.min(maxLoyaltyPoints, maxPointsValue);

  const handleConfirm = async () => {
    if (paymentMethod === "cash" && cashReceived < finalTotal) {
      alert("El efectivo recibido es insuficiente");
      return;
    }

    await onConfirm({
      paymentMethod,
      cashReceived: paymentMethod === "cash" ? cashReceived : undefined,
      discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
      loyaltyPointsUsed: loyaltyPointsUsed > 0 ? loyaltyPointsUsed : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Procesar Pago</DialogTitle>
          <DialogDescription>
            Selecciona el método de pago y completa la transacción
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Customer Info */}
          {customer && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{customer.name}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary">
                  <Coins className="h-3 w-3 mr-1" />
                  {customer.loyaltyPoints} puntos disponibles
                </Badge>
              </div>
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <Label>Método de Pago</Label>
            {paymentMethods && (
              <PaymentMethodSelector
                methods={paymentMethods}
                value={paymentMethod}
                onChange={setPaymentMethod}
              />
            )}
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <Label htmlFor="discount">Descuento (%)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              value={discountPercentage || ""}
              onChange={(e) =>
                setDiscountPercentage(
                  e.target.value ? parseFloat(e.target.value) : 0
                )
              }
              placeholder="0"
            />
          </div>

          {/* Loyalty Points */}
          {customer && maxUsablePoints > 0 && (
            <div className="space-y-2">
              <Label htmlFor="loyalty">
                Usar Puntos de Fidelidad (máx: {maxUsablePoints})
              </Label>
              <Input
                id="loyalty"
                type="number"
                min="0"
                max={maxUsablePoints}
                value={loyaltyPointsUsed || ""}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : 0;
                  setLoyaltyPointsUsed(Math.min(value, maxUsablePoints));
                }}
                placeholder="0"
              />
              {loyaltyPointsUsed > 0 && (
                <p className="text-sm text-muted-foreground">
                  Descuento: ${pointsValue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
          )}

          {/* Cash Received (only for cash payments) */}
          {paymentMethod === "cash" && (
            <div className="space-y-2">
              <Label htmlFor="cashReceived">Efectivo Recibido</Label>
              <CurrencyInput
                id="cashReceived"
                value={cashReceived}
                onChange={setCashReceived}
                currency="ARS"
              />
            </div>
          )}

          {/* Totals Summary */}
          <div className="border-t pt-4 space-y-2">
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Descuento ({discountPercentage}%):</span>
                <span className="text-red-600">
                  -${discountAmount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {loyaltyPointsUsed > 0 && (
              <div className="flex justify-between text-sm">
                <span>Puntos usados ({loyaltyPointsUsed}):</span>
                <span className="text-red-600">
                  -${pointsValue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Total a Pagar:</span>
              <span>
                ${finalTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {paymentMethod === "cash" && cashReceived > 0 && (
              <div className="flex justify-between text-sm">
                <span>Cambio:</span>
                <span className="font-medium">
                  ${change.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? "Procesando..." : "Confirmar Pago"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

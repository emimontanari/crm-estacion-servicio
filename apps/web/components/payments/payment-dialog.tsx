"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/ui/dialog";
import { StripePaymentWrapper } from "./stripe-payment-wrapper";
import { Alert, AlertDescription } from "@workspace/ui/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientSecret: string | null;
  amount: number;
  currency: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

/**
 * Diálogo modal para procesar pagos con Stripe
 */
export function PaymentDialog({
  open,
  onOpenChange,
  clientSecret,
  amount,
  currency,
  onSuccess,
  onError,
}: PaymentDialogProps) {
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSuccess = (paymentIntentId: string) => {
    setPaymentSuccess(true);
    onSuccess?.(paymentIntentId);

    // Cerrar el diálogo después de 2 segundos
    setTimeout(() => {
      onOpenChange(false);
      setPaymentSuccess(false);
    }, 2000);
  };

  const handleError = (error: string) => {
    onError?.(error);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Procesar Pago</DialogTitle>
          <DialogDescription>
            Completa los datos de tu tarjeta para procesar el pago de forma segura
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {paymentSuccess ? (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ¡Pago procesado exitosamente!
              </AlertDescription>
            </Alert>
          ) : clientSecret ? (
            <StripePaymentWrapper
              clientSecret={clientSecret}
              amount={amount}
              currency={currency}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          ) : (
            <Alert>
              <AlertDescription>
                Preparando formulario de pago...
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

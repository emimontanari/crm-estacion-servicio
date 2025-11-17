"use client";

import { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@workspace/ui/components/ui/button";
import { Alert, AlertDescription } from "@workspace/ui/components/ui/alert";
import { Loader2 } from "lucide-react";

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  returnUrl?: string;
}

/**
 * Formulario de pago con Stripe
 * Maneja el proceso de pago con tarjeta usando Stripe Elements
 */
export function StripePaymentForm({
  amount,
  currency,
  onSuccess,
  onError,
  returnUrl,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }

    // El PaymentElement se renderiza automáticamente
  }, [stripe, elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage("Stripe aún no ha cargado. Por favor, intenta de nuevo.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirmar el pago
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl || `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      });

      if (error) {
        // Error durante el pago
        setErrorMessage(error.message || "Ocurrió un error durante el pago");
        onError?.(error.message || "Error desconocido");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Pago exitoso
        onSuccess?.(paymentIntent.id);
      } else if (paymentIntent) {
        // El pago requiere acción adicional o está en proceso
        setErrorMessage(`El pago está en estado: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error("Error al procesar el pago:", err);
      setErrorMessage("Error inesperado al procesar el pago");
      onError?.("Error inesperado");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Total a pagar</h3>
          <p className="text-2xl font-bold text-primary">
            {formatAmount(amount, currency)}
          </p>
        </div>

        <div className="space-y-4">
          <PaymentElement
            options={{
              layout: "tabs",
              paymentMethodOrder: ["card", "apple_pay", "google_pay"],
            }}
          />
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando pago...
          </>
        ) : (
          `Pagar ${formatAmount(amount, currency)}`
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Tus pagos son procesados de forma segura por Stripe
      </p>
    </form>
  );
}

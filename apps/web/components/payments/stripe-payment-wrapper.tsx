"use client";

import { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { StripeElementsOptions } from "@stripe/stripe-js";
import { getStripe } from "../../lib/stripe";
import { StripePaymentForm } from "./stripe-payment-form";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@workspace/ui/components/ui/alert";

interface StripePaymentWrapperProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  returnUrl?: string;
}

/**
 * Wrapper para el formulario de pago de Stripe
 * Inicializa Stripe Elements con el client secret
 */
export function StripePaymentWrapper({
  clientSecret,
  amount,
  currency,
  onSuccess,
  onError,
  returnUrl,
}: StripePaymentWrapperProps) {
  const [stripe, setStripe] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initStripe = async () => {
      try {
        const stripeInstance = await getStripe();
        setStripe(stripeInstance);
      } catch (err) {
        console.error("Error al inicializar Stripe:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Error al inicializar el sistema de pagos"
        );
      }
    };

    initStripe();
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stripe || !clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando sistema de pagos...</span>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#0070f3",
        colorBackground: "#ffffff",
        colorText: "#30313d",
        colorDanger: "#df1b41",
        fontFamily: "system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
    locale: "es",
  };

  return (
    <Elements stripe={stripe} options={options}>
      <StripePaymentForm
        amount={amount}
        currency={currency}
        onSuccess={onSuccess}
        onError={onError}
        returnUrl={returnUrl}
      />
    </Elements>
  );
}

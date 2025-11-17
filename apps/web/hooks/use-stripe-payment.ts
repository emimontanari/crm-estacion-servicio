"use client";

import { useState, useCallback } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { Id } from "@workspace/backend/convex/_generated/dataModel";

interface UseStripePaymentOptions {
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

/**
 * Hook personalizado para manejar pagos con Stripe
 * Gestiona la creación de Payment Intents y confirmación de pagos
 */
export function useStripePayment(options?: UseStripePaymentOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Actions de Convex
  const createPaymentIntent = useAction(api.payments.createStripePaymentIntent);
  const confirmPayment = useAction(api.payments.confirmStripePayment);

  /**
   * Crear un Payment Intent en Stripe
   */
  const createPayment = useCallback(
    async ({
      amount,
      currency,
      saleId,
      customerId,
      description,
    }: {
      amount: number;
      currency: string;
      saleId: Id<"sales">;
      customerId?: Id<"customers">;
      description?: string;
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await createPaymentIntent({
          amount,
          currency,
          saleId,
          customerId,
          description,
        });

        setClientSecret(result.clientSecret || null);
        setPaymentIntentId(result.paymentIntentId);

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al crear el pago";
        setError(errorMessage);
        options?.onError?.(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [createPaymentIntent, options]
  );

  /**
   * Confirmar un pago ya procesado
   */
  const confirmPaymentStatus = useCallback(
    async (intentId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await confirmPayment({
          paymentIntentId: intentId,
        });

        if (result.success) {
          options?.onSuccess?.(intentId);
        } else {
          const errorMsg = result.error || "Error al confirmar el pago";
          setError(errorMsg);
          options?.onError?.(errorMsg);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al confirmar el pago";
        setError(errorMessage);
        options?.onError?.(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [confirmPayment, options]
  );

  /**
   * Reiniciar el estado
   */
  const reset = useCallback(() => {
    setClientSecret(null);
    setPaymentIntentId(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    // Estado
    isLoading,
    clientSecret,
    paymentIntentId,
    error,

    // Métodos
    createPayment,
    confirmPaymentStatus,
    reset,
  };
}

/**
 * Hook para procesar reembolsos
 */
export function useStripeRefund(options?: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processRefund = useAction(api.payments.processStripeRefund);

  const refundPayment = useCallback(
    async ({
      paymentId,
      amount,
      reason,
    }: {
      paymentId: Id<"payments">;
      amount?: number;
      reason?: string;
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await processRefund({
          paymentId,
          amount,
          reason,
        });

        options?.onSuccess?.();
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al procesar el reembolso";
        setError(errorMessage);
        options?.onError?.(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [processRefund, options]
  );

  return {
    isLoading,
    error,
    refundPayment,
  };
}

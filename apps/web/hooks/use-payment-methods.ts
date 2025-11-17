"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend";

/**
 * Hook para obtener métodos de pago configurados
 */
export function usePaymentMethods() {
  const paymentMethods = useQuery(api.payments.getPaymentMethods);

  return {
    paymentMethods: paymentMethods || [],
    isLoading: paymentMethods === undefined,
  };
}

/**
 * Hook para configurar métodos de pago
 */
export function useConfigurePaymentMethod() {
  const configureMethod = useMutation(api.payments.configurePaymentMethod);

  return {
    configureMethod,
  };
}

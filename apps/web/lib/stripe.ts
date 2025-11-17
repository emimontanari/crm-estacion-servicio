import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

/**
 * Obtener instancia de Stripe
 * Singleton para evitar crear múltiples instancias
 */
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      throw new Error(
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined. Please add it to your .env.local file."
      );
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

/**
 * Formatear cantidad para Stripe (convertir a centavos)
 */
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Formatear cantidad desde Stripe (convertir de centavos a unidades)
 */
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100;
};

/**
 * Formatear moneda
 */
export const formatCurrency = (amount: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
};

/**
 * Obtener configuración de Stripe desde variables de entorno
 */
export const getStripeConfig = () => {
  return {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    currency: process.env.NEXT_PUBLIC_STRIPE_CURRENCY || "USD",
    country: process.env.NEXT_PUBLIC_STRIPE_COUNTRY || "US",
  };
};

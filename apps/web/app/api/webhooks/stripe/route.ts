import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { fetchAction } from "convex/nextjs";
import { api } from "@workspace/backend";

/**
 * Webhook handler para eventos de Stripe
 *
 * Eventos manejados:
 * - payment_intent.succeeded: Pago completado exitosamente
 * - payment_intent.payment_failed: Pago falló
 * - payment_intent.processing: Pago en proceso
 * - payment_intent.canceled: Pago cancelado
 * - charge.refunded: Reembolso procesado
 */
export async function POST(req: Request) {
  // Obtener el webhook secret de las variables de entorno
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return new NextResponse("Webhook Error: Missing STRIPE_WEBHOOK_SECRET", {
      status: 500,
    });
  }

  // Inicializar Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27.acacia",
  });

  // Obtener la firma del webhook
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return new NextResponse("Webhook Error: Missing stripe-signature header", {
      status: 400,
    });
  }

  let event: Stripe.Event;

  try {
    // Verificar el webhook
    const body = await req.text();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new NextResponse(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      { status: 400 }
    );
  }

  // Obtener el tipo de evento
  const eventType = event.type;

  console.log(`Stripe webhook received: ${eventType}`);

  try {
    switch (eventType) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.processing":
        await handlePaymentIntentProcessing(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.canceled":
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
  } catch (error) {
    console.error(`Error handling ${eventType}:`, error);
    return new NextResponse(
      `Webhook Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 }
    );
  }

  return new NextResponse(JSON.stringify({ received: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Manejar pago exitoso
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment Intent succeeded: ${paymentIntent.id}`);

  await fetchAction(api.payments.handleStripeWebhook, {
    eventType: "payment_intent.succeeded",
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
    chargeId: paymentIntent.latest_charge as string,
  });
}

/**
 * Manejar pago fallido
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment Intent failed: ${paymentIntent.id}`);

  await fetchAction(api.payments.handleStripeWebhook, {
    eventType: "payment_intent.payment_failed",
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
  });
}

/**
 * Manejar pago en proceso
 */
async function handlePaymentIntentProcessing(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment Intent processing: ${paymentIntent.id}`);

  await fetchAction(api.payments.handleStripeWebhook, {
    eventType: "payment_intent.processing",
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
  });
}

/**
 * Manejar pago cancelado
 */
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment Intent canceled: ${paymentIntent.id}`);

  await fetchAction(api.payments.handleStripeWebhook, {
    eventType: "payment_intent.canceled",
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
  });
}

/**
 * Manejar reembolso
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log(`Charge refunded: ${charge.id}`);

  // El reembolso se maneja en el lado del servidor cuando se solicita
  // Aquí solo logueamos para auditoría
  console.log(`Refund amount: ${charge.amount_refunded / 100} ${charge.currency}`);
}

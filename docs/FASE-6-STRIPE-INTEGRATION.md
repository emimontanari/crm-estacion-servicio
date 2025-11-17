# Fase 6: Integración de Stripe para Pagos con Tarjeta

## Descripción General

Esta fase implementa la integración completa de Stripe para procesar pagos con tarjeta de crédito/débito en el CRM de Estación de Servicio. Incluye:

- ✅ Procesamiento de pagos con tarjeta
- ✅ Webhooks para eventos de Stripe
- ✅ Reembolsos
- ✅ Gestión de estados de pago
- ✅ Interfaz de usuario para pagos

## Configuración Inicial

### 1. Obtener Credenciales de Stripe

1. Crea una cuenta en [Stripe](https://dashboard.stripe.com/register)
2. Accede a [API Keys](https://dashboard.stripe.com/apikeys)
3. Copia las claves de prueba (comienzan con `sk_test_` y `pk_test_`)

### 2. Configurar Variables de Entorno

Edita el archivo `.env.local` en la raíz del proyecto:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_aqui

# Stripe Webhook Secret (obtenido después de configurar webhooks)
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui

# Configuración
NEXT_PUBLIC_STRIPE_CURRENCY=usd
NEXT_PUBLIC_STRIPE_COUNTRY=US
```

### 3. Configurar Webhooks en Stripe

1. Ve a [Webhooks](https://dashboard.stripe.com/webhooks) en Stripe Dashboard
2. Haz clic en "Add endpoint"
3. URL del endpoint: `https://tu-dominio.com/api/webhooks/stripe`
4. Selecciona los siguientes eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.processing`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Copia el "Signing secret" y agrégalo a `STRIPE_WEBHOOK_SECRET`

**Para desarrollo local:** Usa [Stripe CLI](https://stripe.com/docs/stripe-cli) para reenviar webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Arquitectura

### Backend (Convex)

**Archivo:** `packages/backend/convex/payments.ts`

Funciones principales:

- `createStripePaymentIntent`: Crea un Payment Intent en Stripe
- `confirmStripePayment`: Confirma el estado de un pago
- `processStripeRefund`: Procesa reembolsos
- `handleStripeWebhook`: Maneja eventos de webhooks
- `updateStripeInfo`: Actualiza información de Stripe en la BD

### Frontend (Next.js)

**Componentes:**

- `StripePaymentForm`: Formulario de pago con Stripe Elements
- `StripePaymentWrapper`: Wrapper con contexto de Elements
- `PaymentDialog`: Modal para procesar pagos

**Hooks:**

- `useStripePayment`: Hook para crear y confirmar pagos
- `useStripeRefund`: Hook para procesar reembolsos
- `usePaymentMethods`: Hook para gestionar métodos de pago

**Utilidades:**

- `lib/stripe.ts`: Funciones de utilidad para Stripe

### API Routes

**Webhook:** `app/api/webhooks/stripe/route.ts`

Maneja eventos de Stripe y actualiza el estado de los pagos en la base de datos.

## Uso en el Código

### Ejemplo 1: Procesar un Pago

```tsx
"use client";

import { useState } from "react";
import { useStripePayment } from "@/hooks/use-stripe-payment";
import { PaymentDialog } from "@/components/payments";

export function CheckoutPage() {
  const [showPayment, setShowPayment] = useState(false);
  const { createPayment, clientSecret, isLoading, error } = useStripePayment({
    onSuccess: (intentId) => {
      console.log("Pago exitoso:", intentId);
    },
    onError: (error) => {
      console.error("Error en pago:", error);
    },
  });

  const handlePayWithCard = async () => {
    try {
      await createPayment({
        amount: 100.50,
        currency: "USD",
        saleId: "sale_id_here", // ID de la venta
        customerId: "customer_id_here", // Opcional
        description: "Venta #123",
      });
      setShowPayment(true);
    } catch (err) {
      console.error("Error al iniciar pago:", err);
    }
  };

  return (
    <>
      <button onClick={handlePayWithCard} disabled={isLoading}>
        Pagar con Tarjeta
      </button>

      <PaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        clientSecret={clientSecret}
        amount={100.50}
        currency="USD"
        onSuccess={(intentId) => {
          console.log("Pago completado:", intentId);
          setShowPayment(false);
        }}
      />
    </>
  );
}
```

### Ejemplo 2: Procesar un Reembolso

```tsx
"use client";

import { useStripeRefund } from "@/hooks/use-stripe-payment";

export function RefundButton({ paymentId }: { paymentId: string }) {
  const { refundPayment, isLoading } = useStripeRefund({
    onSuccess: () => {
      console.log("Reembolso procesado exitosamente");
    },
    onError: (error) => {
      console.error("Error al procesar reembolso:", error);
    },
  });

  const handleRefund = async () => {
    try {
      await refundPayment({
        paymentId,
        amount: 50.25, // Opcional, reembolso parcial
        reason: "Cliente solicitó devolución",
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button onClick={handleRefund} disabled={isLoading}>
      Procesar Reembolso
    </button>
  );
}
```

## Flujo de Pago

1. **Cliente inicia pago:**
   - Frontend llama a `createStripePaymentIntent`
   - Backend crea Payment Intent en Stripe
   - Retorna `clientSecret` al frontend

2. **Cliente completa formulario:**
   - Se muestra el componente `PaymentDialog`
   - Cliente ingresa datos de tarjeta
   - Stripe valida y procesa el pago

3. **Confirmación del pago:**
   - Si es exitoso, Stripe envía webhook `payment_intent.succeeded`
   - Backend actualiza estado del pago a "completed"
   - Frontend muestra confirmación

4. **En caso de error:**
   - Stripe envía webhook `payment_intent.payment_failed`
   - Backend actualiza estado a "failed"
   - Frontend muestra mensaje de error

## Esquema de Base de Datos

El schema ya incluye los campos necesarios en la tabla `payments`:

```typescript
payments: {
  // ... otros campos
  stripePaymentIntentId: v.optional(v.string()),
  stripeChargeId: v.optional(v.string()),
  status: v.union(
    v.literal("pending"),
    v.literal("processing"),
    v.literal("completed"),
    v.literal("failed"),
    v.literal("refunded"),
    v.literal("cancelled")
  ),
  // ...
}
```

## Seguridad

- ✅ Las claves secretas nunca se exponen al cliente
- ✅ Los webhooks se verifican con firma criptográfica
- ✅ Todos los pagos requieren autenticación del usuario
- ✅ Multi-tenancy: Cada organización solo puede acceder a sus pagos
- ✅ HTTPS requerido en producción

## Testing

### Tarjetas de Prueba

Stripe proporciona tarjetas de prueba para desarrollo:

- **Éxito:** `4242 4242 4242 4242`
- **Requiere autenticación:** `4000 0025 0000 3155`
- **Rechazada:** `4000 0000 0000 9995`

Usa cualquier fecha futura y cualquier CVC de 3 dígitos.

### Probar Webhooks

```bash
# Instalar Stripe CLI
brew install stripe/stripe-brew/stripe

# Login
stripe login

# Escuchar webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger eventos de prueba
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

## Próximos Pasos

1. ✅ Configurar credenciales de Stripe en `.env.local`
2. ✅ Configurar webhooks en Stripe Dashboard
3. 🔄 Integrar componentes de pago en el módulo de ventas
4. 🔄 Probar flujo completo de pago
5. 🔄 Configurar métodos de pago en el panel de administración
6. 🔄 Implementar reportes de pagos con Stripe

## Recursos Adicionales

- [Documentación de Stripe](https://stripe.com/docs)
- [Stripe Elements](https://stripe.com/docs/payments/elements)
- [Webhooks de Stripe](https://stripe.com/docs/webhooks)
- [Tarjetas de prueba](https://stripe.com/docs/testing)

## Soporte

Para problemas o preguntas:

1. Revisa los logs de Convex y Stripe Dashboard
2. Verifica que las credenciales estén correctamente configuradas
3. Asegúrate de que los webhooks estén funcionando
4. Consulta la documentación de Stripe

---

**Última actualización:** Fase 6 - Noviembre 2025

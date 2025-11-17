# Configuración de Stripe - Guía Rápida

## 🚀 Inicio Rápido

### 1. Obtener Credenciales

1. Regístrate en [Stripe](https://dashboard.stripe.com/register)
2. Ve a [API Keys](https://dashboard.stripe.com/apikeys)
3. Copia tus claves de prueba

### 2. Configurar Variables de Entorno

Crea o actualiza el archivo `.env.local` en la raíz del proyecto:

```bash
# Stripe - Claves de Prueba
STRIPE_SECRET_KEY=sk_test_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Configuración
NEXT_PUBLIC_STRIPE_CURRENCY=usd
NEXT_PUBLIC_STRIPE_COUNTRY=US
```

### 3. Configurar Webhooks (Producción)

1. Ve a [Webhooks](https://dashboard.stripe.com/webhooks)
2. Añade endpoint: `https://tu-dominio.com/api/webhooks/stripe`
3. Selecciona eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.processing`
   - `payment_intent.canceled`
   - `charge.refunded`
4. Copia el "Signing secret" a `STRIPE_WEBHOOK_SECRET`

### 4. Desarrollo Local

Instala Stripe CLI:

```bash
# macOS
brew install stripe/stripe-brew/stripe

# Windows
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/vX.XX.X/stripe_X.XX.X_linux_x86_64.tar.gz
tar -xvf stripe_*.tar.gz
```

Inicia el reenvío de webhooks:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 5. Probar Pagos

Usa estas tarjetas de prueba:

| Tarjeta              | Número              | Resultado              |
|---------------------|---------------------|------------------------|
| Visa exitosa        | 4242 4242 4242 4242 | Pago exitoso           |
| Requiere 3D Secure  | 4000 0025 0000 3155 | Requiere autenticación |
| Declinada           | 4000 0000 0000 9995 | Pago rechazado         |

- **Fecha:** Cualquier fecha futura
- **CVC:** Cualquier 3 dígitos
- **ZIP:** Cualquier código postal

## 📁 Archivos Implementados

```
├── .env.local                              # Variables de entorno
├── packages/backend/convex/
│   └── payments.ts                         # Lógica de pagos con Stripe
├── apps/web/
│   ├── app/api/webhooks/stripe/
│   │   └── route.ts                        # Webhook handler
│   ├── components/payments/
│   │   ├── stripe-payment-form.tsx         # Formulario de pago
│   │   ├── stripe-payment-wrapper.tsx      # Wrapper de Elements
│   │   └── payment-dialog.tsx              # Modal de pago
│   ├── hooks/
│   │   ├── use-stripe-payment.ts           # Hook de pagos
│   │   └── use-payment-methods.ts          # Hook de métodos
│   └── lib/
│       └── stripe.ts                       # Utilidades de Stripe
└── docs/
    └── FASE-6-STRIPE-INTEGRATION.md        # Documentación completa
```

## 🔧 Uso Básico

```tsx
import { useStripePayment } from "@/hooks/use-stripe-payment";
import { PaymentDialog } from "@/components/payments";

function MiComponente() {
  const { createPayment, clientSecret } = useStripePayment({
    onSuccess: (intentId) => console.log("Pago exitoso:", intentId),
  });

  const handlePagar = async () => {
    await createPayment({
      amount: 100,
      currency: "USD",
      saleId: "...",
    });
  };

  return (
    <PaymentDialog
      open={true}
      onOpenChange={() => {}}
      clientSecret={clientSecret}
      amount={100}
      currency="USD"
    />
  );
}
```

## 📚 Documentación Completa

Ver [FASE-6-STRIPE-INTEGRATION.md](./docs/FASE-6-STRIPE-INTEGRATION.md) para:
- Arquitectura detallada
- Ejemplos de código
- Flujo de pagos
- Seguridad
- Testing avanzado

## ❓ Solución de Problemas

### Error: "STRIPE_SECRET_KEY is not configured"

Asegúrate de que `.env.local` existe y contiene la clave correcta.

### Webhooks no funcionan

1. Verifica que Stripe CLI esté corriendo
2. Revisa la URL del webhook en Stripe Dashboard
3. Confirma que el secret está correcto

### Pagos fallan inmediatamente

1. Verifica las credenciales en `.env.local`
2. Revisa la consola del navegador
3. Comprueba los logs en Stripe Dashboard

## 🔒 Seguridad

- ⚠️ **NUNCA** commits el archivo `.env.local`
- ⚠️ **NUNCA** expongas `STRIPE_SECRET_KEY` en el cliente
- ✅ Usa HTTPS en producción
- ✅ Verifica firmas de webhooks

## 🎯 Siguiente Paso

Integra los componentes de pago en tu módulo de ventas. Ver ejemplos en la documentación completa.

# @workspace/utils

Paquete de utilidades compartidas para el CRM de Estación de Servicio.

## Estructura

```
src/
├── constants/       # Constantes del sistema
├── validators/      # Validadores Zod
└── formatters/      # Funciones de formateo
```

## Constantes

### Tipos de Combustible

```typescript
import { FUEL_TYPES, FUEL_INFO } from '@workspace/utils/constants/fuel-types';

// Usar tipos de combustible
const fuelType = FUEL_TYPES.PREMIUM;

// Obtener información del combustible
const info = FUEL_INFO[FUEL_TYPES.PREMIUM];
console.log(info.name); // "Premium"
console.log(info.octanaje); // 95
```

### Métodos de Pago

```typescript
import { PAYMENT_METHODS, PAYMENT_METHOD_INFO } from '@workspace/utils/constants/payment-methods';

const method = PAYMENT_METHODS.CREDIT_CARD;
const info = PAYMENT_METHOD_INFO[method];
console.log(info.fee); // 0.029 (2.9%)
```

### Roles de Usuario

```typescript
import { USER_ROLES, hasPermission } from '@workspace/utils/constants/user-roles';

const canEdit = hasPermission(USER_ROLES.CASHIER, 'customers.update');
```

## Validadores

Todos los validadores usan Zod para validación de esquemas.

### Validador de Clientes

```typescript
import { createCustomerSchema } from '@workspace/utils/validators/customer.validator';

const result = createCustomerSchema.safeParse({
  name: 'Juan Pérez',
  phone: '5551234567',
  email: 'juan@example.com',
});

if (result.success) {
  // Datos válidos
  console.log(result.data);
}
```

### Validador de Productos

```typescript
import { createProductSchema } from '@workspace/utils/validators/product.validator';
import { PRODUCT_CATEGORIES } from '@workspace/utils/constants/transaction-types';

const product = {
  name: 'Coca Cola',
  category: PRODUCT_CATEGORIES.STORE,
  price: 15.00,
  stock: 100,
  minStock: 10,
};

const result = createProductSchema.parse(product);
```

### Validador de Ventas

```typescript
import { createSaleSchema } from '@workspace/utils/validators/sale.validator';
import { PAYMENT_METHODS } from '@workspace/utils/constants/payment-methods';

const sale = {
  items: [
    {
      productId: '123',
      productName: 'Producto',
      quantity: 2,
      unitPrice: 50,
    }
  ],
  paymentMethod: PAYMENT_METHODS.CASH,
};

const result = createSaleSchema.parse(sale);
```

## Formatters

### Formateo de Moneda

```typescript
import { formatCurrency, formatCurrencyCompact } from '@workspace/utils/formatters/currency.formatter';

formatCurrency(1234.56); // "$1,234.56"
formatCurrencyCompact(1234567); // "$1.2M"
```

### Formateo de Fechas

```typescript
import {
  formatDate,
  formatDateTime,
  formatRelativeTime
} from '@workspace/utils/formatters/date.formatter';

const now = new Date();

formatDate(now); // "12 de noviembre de 2025"
formatDateTime(now); // "12 de noviembre de 2025, 10:30"
formatRelativeTime(now); // "hace unos segundos"
```

### Formateo de Teléfono

```typescript
import { formatPhone, cleanPhone } from '@workspace/utils/formatters/phone.formatter';

formatPhone('5551234567'); // "(555) 123-4567"
cleanPhone('(555) 123-4567'); // "5551234567"
```

### Formateo de Números

```typescript
import {
  formatNumber,
  formatNumberCompact,
  roundTo
} from '@workspace/utils/formatters/number.formatter';

formatNumber(1234567, 2); // "1,234,567.00"
formatNumberCompact(1234567); // "1.2M"
roundTo(3.14159, 2); // 3.14
```

### Formateo de Texto

```typescript
import {
  capitalize,
  toTitleCase,
  slugify,
  getInitials
} from '@workspace/utils/formatters/text.formatter';

capitalize('hello world'); // "Hello world"
toTitleCase('hello world'); // "Hello World"
slugify('Hello World!'); // "hello-world"
getInitials('Juan Pérez'); // "JP"
```

## TypeScript

Todos los validadores exportan tipos TypeScript inferidos:

```typescript
import type { CreateCustomerInput } from '@workspace/utils/validators/customer.validator';
import type { CreateSaleInput } from '@workspace/utils/validators/sale.validator';
import type { UserRole } from '@workspace/utils/constants/user-roles';
```

## Desarrollo

```bash
# Instalar dependencias
pnpm install

# Type check
pnpm typecheck
```

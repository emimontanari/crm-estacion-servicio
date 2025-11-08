# Guía de Desarrollo: CRM para Estación de Servicio

## Descripción del Proyecto

Sistema CRM (Customer Relationship Management) a medida para una estación de servicio. El objetivo principal es optimizar la gestión de clientes, mejorar la experiencia de usuario y agilizar las operaciones diarias.

### Funcionalidades Principales

- Gestión completa de perfiles de clientes, incluyendo historial de compras y preferencias
- Sistema de fidelización de clientes (puntos, descuentos, promociones)
- Registro y seguimiento de transacciones de combustible y productos de tienda
- Integración con pasarelas de pago (tarjetas de crédito/débito, pagos móviles)
- Generación de informes sobre ventas, comportamiento del cliente y rendimiento
- Gestión de diferentes tipos de combustible y servicios adicionales (lavado de autos, tienda)

---

## Stack Tecnológico

### Frontend
- **Next.js 15.4.5** - Framework React con App Router
- **React 19.1.1** - Librería UI
- **TypeScript 5.9.2** - Type safety
- **Tailwind CSS 4.1.11** - Styling
- **Radix UI** - Componentes primitivos accesibles
- **Lucide React** - Sistema de iconos
- **Zod** - Validación de esquemas
- **React Hook Form** - Manejo de formularios
- **Recharts** - Gráficos y visualización de datos

### Backend
- **Convex 1.25.4** - Backend serverless
  - Database (MongoDB)
  - Real-time sync
  - Type-safe queries/mutations
  - File storage
  - Scheduled jobs (cron)

### Autenticación
- **Clerk 6.34.2** - Gestión de usuarios
  - Multi-tenancy (organizaciones)
  - Roles y permisos
  - Sign in/Sign up
  - Profile management

### Pagos
- **Stripe** - Pasarela de pagos
  - Tarjetas de crédito/débito
  - Pagos móviles
  - Webhooks para sincronización
  - Dashboard de transacciones

### Monitoreo
- **Sentry** - Error tracking y performance monitoring

### Build y Tooling
- **Turborepo 2.5.5** - Orquestación de monorepo
- **pnpm 10.4.1** - Package manager
- **ESLint** - Linting
- **Prettier** - Code formatting

---

## Arquitectura Monorepo

```
crm-estacion-servicio/
│
├── apps/
│   ├── web/                    # Aplicación principal del CRM
│   │   ├── app/
│   │   │   ├── (auth)/         # Rutas de autenticación
│   │   │   ├── (dashboard)/    # Rutas del dashboard
│   │   │   │   ├── clientes/   # Gestión de clientes
│   │   │   │   ├── ventas/     # POS y transacciones
│   │   │   │   ├── fidelizacion/ # Programa de puntos
│   │   │   │   ├── inventario/ # Gestión de productos
│   │   │   │   ├── reportes/   # Analytics e informes
│   │   │   │   └── configuracion/ # Settings
│   │   │   └── api/            # API routes
│   │   └── modules/            # Módulos de features
│   │
│   └── widget/                 # Widget para integración externa
│       └── app/                # Consulta de puntos, promociones
│
├── packages/
│   ├── backend/                # Convex backend
│   │   └── convex/
│   │       ├── schema.ts       # Esquema de base de datos
│   │       ├── auth.config.ts  # Configuración de autenticación
│   │       ├── customers.ts    # Funciones de clientes
│   │       ├── sales.ts        # Funciones de ventas
│   │       ├── loyalty.ts      # Funciones de fidelización
│   │       ├── products.ts     # Funciones de productos
│   │       ├── payments.ts     # Funciones de pagos
│   │       ├── reports.ts      # Funciones de reportes
│   │       └── webhooks.ts     # Handlers de webhooks
│   │
│   ├── ui/                     # Componentes compartidos
│   │   └── src/
│   │       ├── components/     # Componentes reutilizables
│   │       ├── hooks/          # Custom hooks
│   │       └── styles/         # Estilos globales
│   │
│   └── utils/                  # Utilidades compartidas
│       └── src/
│           ├── validators/     # Esquemas de validación Zod
│           ├── formatters/     # Formateadores (moneda, fecha, etc.)
│           └── constants/      # Constantes globales
│
└── config/                     # Configuraciones compartidas
```

---

## Plan de Desarrollo por Etapas

### FASE 1: Fundamentos y Estructura Base (Semana 1)

**Objetivo**: Establecer la estructura del proyecto y definir el esquema de base de datos.

#### Tareas:

1. **Configurar estructura de paquetes**
   - Crear paquete `@workspace/utils` para utilidades compartidas
   - Configurar exports en package.json

2. **Definir esquema de base de datos completo** (`packages/backend/convex/schema.ts`)

   Tablas a crear:
   - `users` - Usuarios del sistema (empleados, admin)
   - `organizations` - Estaciones de servicio
   - `customers` - Clientes
   - `products` - Productos y servicios
   - `fuelTypes` - Tipos de combustible
   - `sales` - Ventas/Transacciones
   - `saleItems` - Items de venta (relación)
   - `loyaltyProgram` - Configuración del programa de fidelización
   - `loyaltyTransactions` - Transacciones de puntos
   - `promotions` - Promociones activas
   - `payments` - Registro de pagos
   - `paymentMethods` - Métodos de pago disponibles
   - `reports` - Reportes generados

3. **Crear validadores Zod** (`packages/utils/src/validators/`)
   - `customer.validator.ts` - Validaciones de clientes
   - `sale.validator.ts` - Validaciones de ventas
   - `product.validator.ts` - Validaciones de productos
   - `loyalty.validator.ts` - Validaciones de fidelización
   - `payment.validator.ts` - Validaciones de pagos

4. **Definir constantes** (`packages/utils/src/constants/`)
   - `fuel-types.ts` - Tipos de combustible (Premium, Regular, Diesel, etc.)
   - `payment-methods.ts` - Métodos de pago
   - `transaction-types.ts` - Tipos de transacciones
   - `user-roles.ts` - Roles de usuarios

**Archivos a crear/modificar**:
```
packages/backend/convex/schema.ts (modificar)
packages/utils/package.json (crear)
packages/utils/src/validators/*.ts (crear)
packages/utils/src/constants/*.ts (crear)
packages/utils/src/formatters/*.ts (crear)
```

**Orden de desarrollo**:
1. Crear paquete utils con estructura básica
2. Definir constantes
3. Crear validadores Zod
4. Definir esquema completo en Convex
5. Ejecutar `pnpm -F @workspace/backend dev` para generar tipos

---

### FASE 2: Backend - Funciones de Convex (Semana 2-3)

**Objetivo**: Implementar todas las queries y mutations necesarias para el CRM.

#### Tareas:

1. **Módulo de Clientes** (`packages/backend/convex/customers.ts`)
   - `query: getAll()` - Listar todos los clientes
   - `query: getById(id)` - Obtener cliente por ID
   - `query: searchByPhone(phone)` - Buscar por teléfono
   - `query: searchByName(name)` - Buscar por nombre
   - `mutation: create()` - Crear cliente
   - `mutation: update(id, data)` - Actualizar cliente
   - `mutation: delete(id)` - Eliminar cliente (soft delete)
   - `query: getPurchaseHistory(customerId)` - Historial de compras
   - `query: getLoyaltyPoints(customerId)` - Puntos de fidelización

2. **Módulo de Productos** (`packages/backend/convex/products.ts`)
   - `query: getAll()` - Listar productos
   - `query: getByCategory(category)` - Filtrar por categoría
   - `query: getFuelTypes()` - Obtener tipos de combustible
   - `mutation: create()` - Crear producto
   - `mutation: update(id, data)` - Actualizar producto
   - `mutation: updateStock(id, quantity)` - Actualizar stock
   - `mutation: delete(id)` - Eliminar producto

3. **Módulo de Ventas/POS** (`packages/backend/convex/sales.ts`)
   - `query: getAll(filters)` - Listar ventas con filtros
   - `query: getById(id)` - Obtener venta por ID
   - `query: getByCustomer(customerId)` - Ventas de un cliente
   - `query: getDailySales(date)` - Ventas del día
   - `mutation: createSale(items, customer, payment)` - Registrar venta
   - `mutation: cancelSale(id)` - Cancelar venta
   - `mutation: applyDiscount(saleId, discount)` - Aplicar descuento

4. **Módulo de Fidelización** (`packages/backend/convex/loyalty.ts`)
   - `query: getProgramConfig()` - Configuración del programa
   - `query: getCustomerPoints(customerId)` - Puntos del cliente
   - `query: getPointsHistory(customerId)` - Historial de puntos
   - `mutation: addPoints(customerId, points, reason)` - Agregar puntos
   - `mutation: redeemPoints(customerId, points)` - Canjear puntos
   - `mutation: updateProgramConfig(config)` - Actualizar configuración
   - `query: getActivePromotions()` - Promociones activas

5. **Módulo de Pagos** (`packages/backend/convex/payments.ts`)
   - `query: getByPaymentId(paymentId)` - Obtener pago
   - `query: getBySale(saleId)` - Pagos de una venta
   - `mutation: createPaymentIntent(amount, customer)` - Crear intento de pago
   - `mutation: confirmPayment(paymentId)` - Confirmar pago
   - `mutation: refundPayment(paymentId, amount)` - Reembolso
   - `action: createStripePaymentIntent()` - Integración con Stripe

6. **Módulo de Reportes** (`packages/backend/convex/reports.ts`)
   - `query: getSalesByPeriod(startDate, endDate)` - Ventas por período
   - `query: getTopCustomers(limit)` - Mejores clientes
   - `query: getTopProducts(limit)` - Productos más vendidos
   - `query: getFuelSales(startDate, endDate)` - Ventas de combustible
   - `query: getLoyaltyStats()` - Estadísticas de fidelización
   - `query: getRevenue(period)` - Ingresos por período
   - `mutation: generateReport(type, params)` - Generar reporte

**Orden de desarrollo**:
1. Productos (base para ventas)
2. Clientes (base para ventas y fidelización)
3. Ventas/POS (core del sistema)
4. Fidelización (depende de ventas)
5. Pagos (integrado con ventas)
6. Reportes (consume datos de todos los módulos)

---

### FASE 3: Autenticación y Autorización (Semana 3)

**Objetivo**: Implementar sistema de roles y permisos.

#### Tareas:

1. **Configurar Clerk para multi-tenancy**
   - Configurar organizaciones (cada estación = organización)
   - Definir metadata de organizaciones
   - Configurar roles personalizados

2. **Implementar sistema de roles** (`packages/backend/convex/auth.config.ts`)
   - Admin: Acceso completo
   - Manager: Gestión de empleados, reportes, configuración
   - Cashier: POS, ventas, clientes
   - Viewer: Solo lectura de reportes

3. **Crear helpers de autorización** (`packages/backend/convex/auth.ts`)
   - `requireAuth()` - Verificar autenticación
   - `requireRole(role)` - Verificar rol
   - `requireOrg()` - Verificar organización
   - `isAdmin()`, `isManager()`, `isCashier()` - Helpers de roles

4. **Proteger funciones de Convex**
   - Agregar verificación de roles a mutations
   - Filtrar queries por organización
   - Implementar soft deletes para auditoría

**Archivos a crear/modificar**:
```
packages/backend/convex/auth.config.ts (modificar)
packages/backend/convex/auth.ts (crear)
apps/web/middleware.ts (modificar)
```

---

### FASE 4: Frontend - Componentes UI (Semana 4)

**Objetivo**: Crear biblioteca de componentes reutilizables.

#### Tareas:

1. **Componentes de formulario** (`packages/ui/src/components/`)
   - `form.tsx` - Wrapper de React Hook Form
   - `select.tsx` - Select con búsqueda
   - `date-picker.tsx` - Selector de fechas
   - `currency-input.tsx` - Input para moneda
   - `phone-input.tsx` - Input de teléfono
   - `textarea.tsx` - Textarea
   - `checkbox.tsx` - Checkbox
   - `radio-group.tsx` - Radio buttons
   - `file-upload.tsx` - Upload de archivos

2. **Componentes de datos** (`packages/ui/src/components/`)
   - `data-table.tsx` - Tabla con sorting, filtros, paginación
   - `card.tsx` - Card para mostrar información
   - `badge.tsx` - Badge para estados
   - `avatar.tsx` - Avatar de usuario
   - `stat-card.tsx` - Card de estadísticas
   - `chart.tsx` - Wrapper de Recharts

3. **Componentes de navegación** (`packages/ui/src/components/`)
   - `sidebar.tsx` - Sidebar del dashboard
   - `navbar.tsx` - Navbar superior
   - `breadcrumb.tsx` - Breadcrumbs
   - `tabs.tsx` - Tabs

4. **Componentes de feedback** (`packages/ui/src/components/`)
   - `alert.tsx` - Alertas
   - `dialog.tsx` - Modal/Dialog
   - `toast.tsx` - Toasts con sonner
   - `loading-spinner.tsx` - Spinner
   - `skeleton.tsx` - Skeleton loaders
   - `empty-state.tsx` - Estado vacío

5. **Componentes específicos del CRM** (`packages/ui/src/components/crm/`)
   - `customer-card.tsx` - Tarjeta de cliente
   - `sale-summary.tsx` - Resumen de venta
   - `product-card.tsx` - Tarjeta de producto
   - `loyalty-badge.tsx` - Badge de puntos
   - `payment-method-selector.tsx` - Selector de método de pago
   - `fuel-selector.tsx` - Selector de combustible

**Orden de desarrollo**:
1. Componentes de formulario (base)
2. Componentes de datos (tablas, cards)
3. Componentes de navegación
4. Componentes de feedback
5. Componentes específicos del CRM

---

### FASE 5: Frontend - Módulos Core (Semana 5-7)

**Objetivo**: Desarrollar las pantallas principales del CRM.

#### Tareas:

1. **Módulo Dashboard Principal** (`apps/web/app/(dashboard)/page.tsx`)
   - Vista general con KPIs
   - Gráficos de ventas del día
   - Últimas transacciones
   - Clientes recientes
   - Alertas de stock bajo

2. **Módulo de Clientes** (`apps/web/app/(dashboard)/clientes/`)
   - `page.tsx` - Lista de clientes con búsqueda y filtros
   - `[id]/page.tsx` - Perfil de cliente
   - `[id]/historial/page.tsx` - Historial de compras
   - `nuevo/page.tsx` - Formulario de nuevo cliente
   - `[id]/editar/page.tsx` - Editar cliente

   Componentes:
   - `components/customer-list.tsx`
   - `components/customer-form.tsx`
   - `components/customer-profile.tsx`
   - `components/purchase-history-table.tsx`

3. **Módulo de POS/Ventas** (`apps/web/app/(dashboard)/ventas/`)
   - `page.tsx` - Interfaz de punto de venta
   - `historial/page.tsx` - Historial de ventas
   - `[id]/page.tsx` - Detalle de venta

   Componentes:
   - `components/pos-interface.tsx` - Pantalla principal del POS
   - `components/product-search.tsx` - Búsqueda de productos
   - `components/cart.tsx` - Carrito de compra
   - `components/payment-dialog.tsx` - Dialog de pago
   - `components/sale-receipt.tsx` - Recibo de venta
   - `components/sales-history-table.tsx`

4. **Módulo de Fidelización** (`apps/web/app/(dashboard)/fidelizacion/`)
   - `page.tsx` - Dashboard de fidelización
   - `configuracion/page.tsx` - Configurar programa
   - `promociones/page.tsx` - Gestión de promociones
   - `promociones/nueva/page.tsx` - Nueva promoción

   Componentes:
   - `components/loyalty-dashboard.tsx`
   - `components/loyalty-config-form.tsx`
   - `components/promotions-list.tsx`
   - `components/promotion-form.tsx`
   - `components/points-calculator.tsx`

5. **Módulo de Inventario** (`apps/web/app/(dashboard)/inventario/`)
   - `page.tsx` - Lista de productos
   - `nuevo/page.tsx` - Nuevo producto
   - `[id]/editar/page.tsx` - Editar producto
   - `combustibles/page.tsx` - Gestión de combustibles

   Componentes:
   - `components/products-table.tsx`
   - `components/product-form.tsx`
   - `components/fuel-management.tsx`
   - `components/stock-alerts.tsx`

6. **Módulo de Reportes** (`apps/web/app/(dashboard)/reportes/`)
   - `page.tsx` - Dashboard de reportes
   - `ventas/page.tsx` - Reportes de ventas
   - `clientes/page.tsx` - Reportes de clientes
   - `inventario/page.tsx` - Reportes de inventario

   Componentes:
   - `components/sales-chart.tsx`
   - `components/revenue-chart.tsx`
   - `components/customer-analytics.tsx`
   - `components/top-products.tsx`
   - `components/date-range-picker.tsx`
   - `components/export-button.tsx` - Exportar a PDF/Excel

7. **Módulo de Configuración** (`apps/web/app/(dashboard)/configuracion/`)
   - `page.tsx` - Configuración general
   - `usuarios/page.tsx` - Gestión de usuarios
   - `metodos-pago/page.tsx` - Métodos de pago

   Componentes:
   - `components/org-settings-form.tsx`
   - `components/users-table.tsx`
   - `components/payment-methods-config.tsx`

**Orden de desarrollo**:
1. Dashboard principal (overview)
2. Módulo de Inventario (necesario para POS)
3. Módulo de Clientes (necesario para POS)
4. Módulo de POS/Ventas (core funcional)
5. Módulo de Fidelización (depende de ventas)
6. Módulo de Reportes (consume datos de todos)
7. Módulo de Configuración (admin)

---

### FASE 6: Integración de Pagos (Semana 7-8)

**Objetivo**: Implementar integración completa con Stripe.

#### Tareas:

1. **Configurar Stripe**
   - Crear cuenta de Stripe
   - Configurar webhooks
   - Obtener API keys (test y production)

2. **Backend de pagos** (`packages/backend/convex/stripe.ts`)
   - `action: createPaymentIntent(amount, customer)` - Crear intento
   - `action: confirmPayment(paymentIntentId)` - Confirmar
   - `action: refund(paymentIntentId, amount)` - Reembolsar
   - `action: handleWebhook(event)` - Handler de webhook

3. **Frontend de pagos** (`apps/web/app/(dashboard)/ventas/components/`)
   - `payment-form.tsx` - Formulario con Stripe Elements
   - `card-input.tsx` - Input de tarjeta
   - `payment-status.tsx` - Estado del pago
   - `payment-history.tsx` - Historial de pagos

4. **Configurar webhooks** (`apps/web/app/api/webhooks/stripe/route.ts`)
   - Endpoint para recibir eventos de Stripe
   - Validación de firma
   - Sincronización con Convex

5. **Testing de pagos**
   - Probar con tarjetas de test
   - Probar flujos de error
   - Verificar webhooks

**Archivos a crear**:
```
packages/backend/convex/stripe.ts
apps/web/app/api/webhooks/stripe/route.ts
apps/web/app/(dashboard)/ventas/components/payment-form.tsx
apps/web/lib/stripe.ts (cliente de Stripe)
```

**Variables de entorno a configurar**:
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

### FASE 7: Reportes y Analytics (Semana 8-9)

**Objetivo**: Implementar sistema completo de reportes y gráficos.

#### Tareas:

1. **Configurar Recharts**
   - Instalar recharts
   - Crear componentes wrapper
   - Definir paleta de colores

2. **Gráficos de ventas** (`apps/web/app/(dashboard)/reportes/components/`)
   - `revenue-chart.tsx` - Gráfico de ingresos (línea)
   - `sales-by-category.tsx` - Ventas por categoría (barras)
   - `sales-by-fuel-type.tsx` - Ventas por combustible (pie)
   - `daily-sales-trend.tsx` - Tendencia diaria (área)
   - `monthly-comparison.tsx` - Comparación mensual (barras agrupadas)

3. **Gráficos de clientes** (`apps/web/app/(dashboard)/reportes/components/`)
   - `customer-growth.tsx` - Crecimiento de clientes (línea)
   - `top-customers.tsx` - Mejores clientes (barras horizontales)
   - `customer-frequency.tsx` - Frecuencia de visitas (heatmap)
   - `loyalty-adoption.tsx` - Adopción del programa (pie)

4. **KPIs y métricas** (`apps/web/app/(dashboard)/components/`)
   - `kpi-card.tsx` - Tarjeta de KPI
   - `metric-change.tsx` - Cambio porcentual
   - `goal-progress.tsx` - Progreso hacia meta

5. **Exportación de reportes**
   - Implementar exportación a PDF (react-pdf)
   - Implementar exportación a Excel (xlsx)
   - Generar reportes programados (Convex cron)

6. **Queries de analytics** (`packages/backend/convex/analytics.ts`)
   - `query: getDashboardKPIs(period)` - KPIs del dashboard
   - `query: getSalesMetrics(startDate, endDate)` - Métricas de ventas
   - `query: getCustomerMetrics(startDate, endDate)` - Métricas de clientes
   - `query: getInventoryMetrics()` - Métricas de inventario
   - `query: getLoyaltyMetrics()` - Métricas de fidelización

**Librerías a instalar**:
```bash
pnpm add recharts
pnpm add @react-pdf/renderer
pnpm add xlsx
pnpm add date-fns
```

---

### FASE 8: Widget Externo (Semana 9)

**Objetivo**: Desarrollar widget embebible para clientes.

#### Tareas:

1. **Funcionalidades del widget** (`apps/widget/app/`)
   - `page.tsx` - Landing del widget
   - `puntos/page.tsx` - Consulta de puntos
   - `promociones/page.tsx` - Ver promociones activas
   - `historial/page.tsx` - Historial de compras

2. **Componentes del widget** (`apps/widget/components/`)
   - `points-checker.tsx` - Verificador de puntos
   - `promotions-list.tsx` - Lista de promociones
   - `purchase-history.tsx` - Historial
   - `qr-scanner.tsx` - Escáner QR (opcional)

3. **API pública para widget** (`packages/backend/convex/public.ts`)
   - `query: getCustomerByPhone(phone)` - Obtener cliente
   - `query: getPromotions()` - Promociones públicas
   - `query: getPublicPurchaseHistory(customerId)` - Historial público

4. **Configuración de embedding**
   - Crear script de embed
   - Documentar integración
   - Configurar CORS

**Archivo de integración**:
```
apps/widget/public/embed.js
```

Ejemplo de uso:
```html
<script src="https://widget.crm.com/embed.js"></script>
<div id="crm-widget"></div>
```

---

### FASE 9: Testing y Optimización (Semana 10)

**Objetivo**: Asegurar calidad y performance del sistema.

#### Tareas:

1. **Testing unitario**
   - Instalar Vitest
   - Tests de validadores Zod
   - Tests de formatters
   - Tests de componentes UI

2. **Testing de integración**
   - Tests de flujos completos
   - Tests de Convex functions
   - Tests de APIs

3. **Testing E2E**
   - Instalar Playwright
   - Tests de flujo de venta
   - Tests de gestión de clientes
   - Tests de reportes

4. **Optimización de performance**
   - Lazy loading de componentes
   - Optimización de queries
   - Implementar React.memo donde sea necesario
   - Optimizar imágenes

5. **Accesibilidad**
   - Auditoría con Lighthouse
   - Teclado navigation
   - Screen reader support
   - Contraste de colores

6. **Seguridad**
   - Auditoría de dependencias
   - Validación de inputs
   - Sanitización de datos
   - Rate limiting
   - HTTPS obligatorio

**Librerías a instalar**:
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
pnpm add -D playwright @playwright/test
pnpm add -D @axe-core/react
```

---

### FASE 10: Deploy y Producción (Semana 11)

**Objetivo**: Preparar y desplegar el sistema en producción.

#### Tareas:

1. **Configuración de producción**
   - Configurar variables de entorno de producción
   - Configurar Convex production deployment
   - Configurar Clerk production instance
   - Configurar Stripe production keys

2. **Deploy de frontend** (Vercel)
   - Conectar repositorio
   - Configurar build settings
   - Configurar dominios
   - Configurar redirects y headers

3. **Deploy de backend** (Convex)
   - `npx convex deploy` - Deploy a producción
   - Configurar scheduled functions
   - Verificar webhooks

4. **Configuración de monitoreo**
   - Configurar Sentry para producción
   - Configurar alertas
   - Configurar performance monitoring
   - Dashboards de Sentry

5. **Backups y recuperación**
   - Configurar backups automáticos de Convex
   - Documentar proceso de recuperación
   - Plan de disaster recovery

6. **Documentación**
   - Manual de usuario
   - Documentación técnica
   - Guías de troubleshooting
   - Changelog

7. **Capacitación**
   - Capacitar a usuarios finales
   - Capacitar a administradores
   - Crear videos tutoriales

---

## Guía de Desarrollo Paso a Paso

### Iniciar el proyecto

```bash
# Clonar el repositorio
git clone <repo-url>
cd crm-estacion-servicio

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
```

### Configurar variables de entorno

Crear `.env.local` en `apps/web/`:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
CLERK_JWT_ISSUER_DOMAIN=your-domain.clerk.accounts.dev

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Sentry
SENTRY_AUTH_TOKEN=...
```

### Flujo de desarrollo

```bash
# Iniciar Convex dev
pnpm -F @workspace/backend dev

# En otra terminal, iniciar Next.js
pnpm -F web dev

# O iniciar todo junto
pnpm dev
```

### Crear nuevo componente UI

```bash
# En packages/ui/src/components/
# 1. Crear archivo del componente
# 2. Exportarlo en package.json

# Ejemplo:
# packages/ui/src/components/new-component.tsx
```

```typescript
import { cn } from '../lib/utils'

interface NewComponentProps {
  className?: string
}

export function NewComponent({ className }: NewComponentProps) {
  return (
    <div className={cn('', className)}>
      {/* content */}
    </div>
  )
}
```

### Crear nueva función de Convex

```typescript
// packages/backend/convex/ejemplo.ts
import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { requireAuth } from "./auth"

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx)
    return await ctx.db
      .query("table")
      .filter((q) => q.eq(q.field("orgId"), auth.orgId))
      .collect()
  },
})

export const create = mutation({
  args: {
    field: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx)
    return await ctx.db.insert("table", {
      ...args,
      orgId: auth.orgId,
      createdAt: Date.now(),
    })
  },
})
```

### Usar función de Convex en frontend

```typescript
"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@workspace/backend"

export function Component() {
  const items = useQuery(api.ejemplo.getAll)
  const create = useMutation(api.ejemplo.create)

  const handleCreate = async () => {
    await create({ field: "value" })
  }

  return (
    <div>
      {items?.map((item) => (
        <div key={item._id}>{item.field}</div>
      ))}
      <button onClick={handleCreate}>Create</button>
    </div>
  )
}
```

---

## Arquitectura de Datos

### Relaciones entre tablas

```
organizations
    ↓ (1:N)
├── users (empleados)
├── customers
├── products
├── fuelTypes
├── sales
│   ↓ (1:N)
│   └── saleItems
│       ↓ (N:1)
│       └── products
├── loyaltyProgram (1:1)
├── loyaltyTransactions
│   ↓ (N:1)
│   └── customers
├── promotions
└── payments
    ↓ (N:1)
    └── sales
```

### Flujo de una venta

1. **Cajero inicia venta en POS**
   - Busca/crea cliente
   - Agrega productos al carrito
   - Aplica descuentos/promociones

2. **Procesamiento**
   - Calcula subtotal
   - Calcula puntos de fidelización
   - Calcula descuentos aplicables

3. **Pago**
   - Selecciona método de pago
   - Si es tarjeta: integración con Stripe
   - Registra pago en Convex

4. **Finalización**
   - Crea registro de venta
   - Actualiza stock de productos
   - Agrega puntos al cliente
   - Genera recibo
   - Sincroniza en tiempo real

---

## Comandos Útiles

```bash
# Desarrollo
pnpm dev                          # Iniciar todo
pnpm -F web dev                   # Solo web
pnpm -F widget dev                # Solo widget
pnpm -F @workspace/backend dev    # Solo Convex

# Build
pnpm build                        # Build todo
pnpm -F web build                 # Build web

# Linting y formateo
pnpm lint                         # Lint todo
pnpm format                       # Formatear todo

# TypeScript
pnpm -F web typecheck             # Type check

# Testing
pnpm test                         # Ejecutar tests
pnpm test:e2e                     # Tests E2E

# Convex
npx convex dev                    # Modo desarrollo
npx convex deploy                 # Deploy a producción
npx convex dashboard              # Abrir dashboard
npx convex import                 # Importar datos
npx convex export                 # Exportar datos

# Paquetes
pnpm add <package>                # Agregar a root
pnpm add <package> -F web         # Agregar a web
pnpm add <package> -F @workspace/ui # Agregar a UI
```

---

## Mejores Prácticas

### Convex
- Siempre usar `requireAuth()` en mutations
- Filtrar queries por `orgId` para multi-tenancy
- Usar validación con `v` object
- Preferir queries sobre actions cuando sea posible
- Implementar soft deletes para auditoría

### Frontend
- Componentes pequeños y reutilizables
- Separar lógica de presentación (hooks)
- Usar TypeScript estricto
- Validar formularios con Zod + React Hook Form
- Manejar estados de carga y error
- Implementar optimistic updates

### Seguridad
- Nunca exponer API keys en frontend
- Validar inputs en backend
- Implementar rate limiting
- Sanitizar datos de usuario
- Usar HTTPS en producción
- Implementar CORS correctamente

### Performance
- Lazy load de rutas pesadas
- Memoizar componentes caros
- Optimizar queries (índices)
- Usar React Server Components cuando sea posible
- Comprimir imágenes
- Implementar caché adecuadamente

---

## Recursos Adicionales

### Documentación
- [Next.js 15](https://nextjs.org/docs)
- [Convex](https://docs.convex.dev)
- [Clerk](https://clerk.com/docs)
- [Stripe](https://stripe.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [Turborepo](https://turbo.build/repo/docs)

### Comunidad
- [Convex Discord](https://discord.gg/convex)
- [Clerk Discord](https://discord.gg/clerk)
- [Next.js Discord](https://discord.gg/nextjs)

---

## Notas Finales

Este plan está diseñado para ser seguido secuencialmente, pero puede adaptarse según las necesidades del proyecto. Cada fase construye sobre la anterior, asegurando una base sólida antes de avanzar.

Recuerda:
- Hacer commits frecuentes con mensajes descriptivos
- Crear branches para features (`feature/nombre-feature`)
- Hacer code review antes de merge
- Mantener la documentación actualizada
- Escribir tests para funcionalidad crítica
- Monitorear errores en producción con Sentry

**Tiempo estimado total**: 10-11 semanas para MVP completo

¡Buena suerte con el desarrollo! 🚀

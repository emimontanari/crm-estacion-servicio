# Roadmap CRM Estación de Servicio

## Estado Actual del Proyecto

### ✅ **Fases Completadas (1-4)**

#### **Fase 1: Fundamentos** ✅ COMPLETADA
- ✅ Esquema de base de datos completo (Convex)
- ✅ Validadores Zod
- ✅ Constantes y utilidades
- ✅ Formatters (moneda, teléfono, etc.)

#### **Fase 2: Backend** ✅ COMPLETADA
- ✅ 69+ queries y mutations en Convex
- ✅ Módulos: products, customers, sales, loyalty, payments, reports
- ✅ Autenticación y autorización base
- ✅ Multi-tenancy completo

#### **Fase 3: Autenticación Avanzada** ✅ COMPLETADA
- ✅ Sistema de roles (Admin, Manager, Cashier, Viewer)
- ✅ Webhooks de Clerk
- ✅ Guards y hooks de autenticación
- ✅ Middleware de protección de rutas
- ✅ Gestión de organizaciones y usuarios

#### **Fase 4: Componentes UI** ✅ COMPLETADA
- ✅ 26 componentes reutilizables
- ✅ Componentes de formulario (8)
- ✅ Componentes de datos (5)
- ✅ Componentes de navegación (3)
- ✅ Componentes de feedback (5)
- ✅ Componentes CRM específicos (5)

---

## 🚀 **Fases Futuras**

### **Fase 5: Frontend Core** 🔄 EN PROGRESO (25%)

**Objetivo**: Implementar todas las pantallas principales del CRM

#### Módulos a Implementar:

##### ✅ 1. Dashboard Principal (COMPLETADO)
- ✅ KPIs en tiempo real
- ✅ Gráficos de ventas del día
- ✅ Últimas transacciones
- ✅ Alertas de stock bajo

##### ✅ 2. Módulo de Clientes (COMPLETADO)
- ✅ Lista de clientes con búsqueda
- ✅ Perfil detallado de cliente
- ✅ Formulario nuevo cliente
- ✅ Historial de compras

##### 🔄 3. Módulo POS/Ventas (PENDIENTE - 40% trabajo)
**Prioridad: ALTA**

Archivos necesarios:
- `app/(dashboard)/ventas/page.tsx` - Interfaz de POS
- `app/(dashboard)/ventas/historial/page.tsx` - Historial
- `app/(dashboard)/ventas/[id]/page.tsx` - Detalle de venta
- `app/(dashboard)/ventas/components/pos-interface.tsx` - POS principal
- `app/(dashboard)/ventas/components/product-search.tsx` - Buscador de productos
- `app/(dashboard)/ventas/components/cart.tsx` - Carrito de compra
- `app/(dashboard)/ventas/components/payment-dialog.tsx` - Dialog de pago

Funcionalidades:
- [ ] Búsqueda rápida de productos (por nombre, código, barcode)
- [ ] Carrito de compra con cantidades
- [ ] Cálculo automático de totales, impuestos, descuentos
- [ ] Selección de cliente (opcional o búsqueda rápida)
- [ ] Aplicar puntos de fidelización
- [ ] Múltiples métodos de pago
- [ ] Generación de recibo
- [ ] Historial de ventas con filtros
- [ ] Cancelación de ventas

**Estimación**: 2-3 días de desarrollo

##### 🔄 4. Módulo de Inventario (PENDIENTE - 30% trabajo)
**Prioridad: ALTA**

Archivos necesarios:
- `app/(dashboard)/inventario/page.tsx` - Lista de productos
- `app/(dashboard)/inventario/nuevo/page.tsx` - Nuevo producto
- `app/(dashboard)/inventario/[id]/editar/page.tsx` - Editar producto
- `app/(dashboard)/inventario/combustibles/page.tsx` - Gestión de combustibles
- `app/(dashboard)/inventario/components/products-table.tsx`
- `app/(dashboard)/inventario/components/product-form.tsx`
- `app/(dashboard)/inventario/components/stock-alerts.tsx`

Funcionalidades:
- [ ] CRUD de productos
- [ ] Categorías de productos
- [ ] Gestión de stock (entrada/salida)
- [ ] Alertas de stock bajo
- [ ] Gestión de tipos de combustible
- [ ] Actualización de precios masiva
- [ ] Historial de movimientos de stock
- [ ] Importación/exportación de productos (CSV/Excel)

**Estimación**: 2 días de desarrollo

##### 🔄 5. Módulo de Fidelización (PENDIENTE - 35% trabajo)
**Prioridad: MEDIA**

Archivos necesarios:
- `app/(dashboard)/fidelizacion/page.tsx` - Dashboard
- `app/(dashboard)/fidelizacion/configuracion/page.tsx` - Config programa
- `app/(dashboard)/fidelizacion/promociones/page.tsx` - Promociones
- `app/(dashboard)/fidelizacion/promociones/nueva/page.tsx` - Nueva promoción
- `app/(dashboard)/fidelizacion/components/loyalty-dashboard.tsx`
- `app/(dashboard)/fidelizacion/components/promotions-list.tsx`

Funcionalidades:
- [ ] Configuración del programa de puntos
- [ ] Gestión de promociones
- [ ] Vista de clientes por tier
- [ ] Estadísticas de participación
- [ ] Canjes de puntos
- [ ] Bonos especiales (cumpleaños, referidos)
- [ ] Historial de transacciones de puntos

**Estimación**: 1.5 días de desarrollo

##### 🔄 6. Módulo de Reportes (PENDIENTE - 40% trabajo)
**Prioridad: MEDIA-ALTA**

Archivos necesarios:
- `app/(dashboard)/reportes/page.tsx` - Dashboard de reportes
- `app/(dashboard)/reportes/ventas/page.tsx` - Reportes de ventas
- `app/(dashboard)/reportes/clientes/page.tsx` - Analytics de clientes
- `app/(dashboard)/reportes/inventario/page.tsx` - Reportes de inventario
- `app/(dashboard)/reportes/components/sales-chart.tsx` - Gráfico de ventas
- `app/(dashboard)/reportes/components/revenue-chart.tsx` - Gráfico de ingresos
- `app/(dashboard)/reportes/components/date-range-picker.tsx`
- `app/(dashboard)/reportes/components/export-button.tsx`

Funcionalidades:
- [ ] Gráficos de ventas (día/semana/mes/año)
- [ ] Top productos vendidos
- [ ] Top clientes
- [ ] Análisis de ventas por categoría
- [ ] Análisis de combustibles
- [ ] Comparativas de períodos
- [ ] Exportación a PDF/Excel
- [ ] Reportes programados (email automático)
- [ ] Dashboard personalizable

**Estimación**: 2-3 días de desarrollo

##### 🔄 7. Módulo de Configuración (PENDIENTE - 25% trabajo)
**Prioridad: MEDIA**

Archivos necesarios:
- `app/(dashboard)/configuracion/page.tsx` - Configuración general
- `app/(dashboard)/configuracion/usuarios/page.tsx` - Gestión de usuarios
- `app/(dashboard)/configuracion/organizacion/page.tsx` - Datos de la org
- `app/(dashboard)/configuracion/metodos-pago/page.tsx` - Métodos de pago
- `app/(dashboard)/configuracion/components/org-settings-form.tsx`
- `app/(dashboard)/configuracion/components/users-table.tsx`

Funcionalidades:
- [ ] Configuración de organización
- [ ] Gestión de usuarios y roles
- [ ] Configuración de métodos de pago
- [ ] Configuración de impuestos
- [ ] Preferencias del sistema
- [ ] Integrations (APIs externas)

**Estimación**: 1.5 días de desarrollo

**Total Fase 5**: ~11-14 días de desarrollo

---

### **Fase 6: Integración de Pagos con Stripe** 🔜 PRÓXIMA

**Objetivo**: Implementar integración completa con Stripe para pagos con tarjeta

**Prioridad**: ALTA

#### Tareas:

1. **Backend de Pagos**
   - [ ] Crear `convex/stripe.ts` con actions
   - [ ] `createPaymentIntent()` - Crear intento de pago
   - [ ] `confirmPayment()` - Confirmar pago
   - [ ] `refund()` - Procesar reembolsos
   - [ ] `handleWebhook()` - Handler de webhooks

2. **Frontend de Pagos**
   - [ ] Integrar Stripe Elements
   - [ ] Formulario de tarjeta
   - [ ] 3D Secure / SCA
   - [ ] Historial de pagos
   - [ ] Gestión de reembolsos

3. **Webhooks de Stripe**
   - [ ] `app/api/webhooks/stripe/route.ts`
   - [ ] Eventos: payment_intent.succeeded, payment_intent.failed
   - [ ] Sincronización con Convex

4. **Testing**
   - [ ] Probar con tarjetas de test
   - [ ] Probar errores y rechazos
   - [ ] Verificar webhooks

**Variables de entorno**:
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Estimación**: 3-4 días de desarrollo

---

### **Fase 7: Analytics y Reportes Avanzados** 📊

**Objetivo**: Sistema completo de reportes y gráficos con Recharts

**Prioridad**: MEDIA

#### Tareas:

1. **Configurar Recharts**
   - [ ] Instalar recharts
   - [ ] Crear componentes wrapper
   - [ ] Definir paleta de colores

2. **Gráficos de Ventas**
   - [ ] Gráfico de ingresos (línea)
   - [ ] Ventas por categoría (barras)
   - [ ] Ventas por combustible (pie)
   - [ ] Tendencia diaria (área)
   - [ ] Comparación mensual (barras agrupadas)

3. **Gráficos de Clientes**
   - [ ] Crecimiento de clientes (línea)
   - [ ] Top clientes (barras horizontales)
   - [ ] Frecuencia de visitas (heatmap)
   - [ ] Adopción del programa (pie)

4. **Exportación**
   - [ ] Exportación a PDF (react-pdf)
   - [ ] Exportación a Excel (xlsx)
   - [ ] Reportes programados (Convex cron)

**Dependencias**:
```bash
pnpm add recharts @react-pdf/renderer xlsx date-fns
```

**Estimación**: 3-4 días de desarrollo

---

### **Fase 8: Widget Externo** 🔌

**Objetivo**: Widget embebible para clientes (consulta de puntos, promociones)

**Prioridad**: BAJA

#### Tareas:

1. **Funcionalidades del Widget**
   - [ ] Landing del widget
   - [ ] Consulta de puntos (por teléfono)
   - [ ] Ver promociones activas
   - [ ] Historial de compras simplificado

2. **API Pública**
   - [ ] `convex/public.ts` con queries públicas
   - [ ] Seguridad: rate limiting, validación

3. **Configuración de Embedding**
   - [ ] Script de embed
   - [ ] Documentación de integración
   - [ ] CORS configurado

**Ejemplo de uso**:
```html
<script src="https://widget.crm.com/embed.js"></script>
<div id="crm-widget"></div>
```

**Estimación**: 2-3 días de desarrollo

---

### **Fase 9: Testing y Optimización** 🧪

**Objetivo**: Asegurar calidad y performance del sistema

**Prioridad**: ALTA

#### Tareas:

1. **Testing Unitario**
   - [ ] Instalar Vitest y React Testing Library
   - [ ] Tests de validadores Zod
   - [ ] Tests de formatters
   - [ ] Tests de componentes UI (26 componentes)
   - [ ] Coverage mínimo: 80%

2. **Testing de Integración**
   - [ ] Tests de flujos completos
   - [ ] Tests de Convex functions
   - [ ] Tests de APIs

3. **Testing E2E**
   - [ ] Instalar Playwright
   - [ ] Test: Flujo completo de venta
   - [ ] Test: Gestión de clientes
   - [ ] Test: Reportes
   - [ ] Test: Autenticación y roles

4. **Optimización de Performance**
   - [ ] Lazy loading de componentes pesados
   - [ ] Optimización de queries (índices)
   - [ ] React.memo donde sea necesario
   - [ ] Optimizar imágenes
   - [ ] Code splitting

5. **Accesibilidad**
   - [ ] Auditoría con Lighthouse (score >90)
   - [ ] Keyboard navigation
   - [ ] Screen reader support
   - [ ] Contraste de colores (WCAG AA)

6. **Seguridad**
   - [ ] Auditoría de dependencias (npm audit)
   - [ ] Validación de inputs
   - [ ] Sanitización de datos
   - [ ] Rate limiting
   - [ ] HTTPS obligatorio
   - [ ] CSP headers

**Dependencias**:
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
pnpm add -D playwright @playwright/test
pnpm add -D @axe-core/react
```

**Estimación**: 5-7 días de desarrollo

---

### **Fase 10: Deploy y Producción** 🚀

**Objetivo**: Preparar y desplegar en producción

**Prioridad**: ALTA (al finalizar desarrollo)

#### Tareas:

1. **Configuración de Producción**
   - [ ] Variables de entorno de producción
   - [ ] Convex production deployment
   - [ ] Clerk production instance
   - [ ] Stripe production keys

2. **Deploy de Frontend (Vercel)**
   - [ ] Conectar repositorio
   - [ ] Configurar build settings
   - [ ] Configurar dominios
   - [ ] Configurar redirects y headers
   - [ ] Preview deployments

3. **Deploy de Backend (Convex)**
   - [ ] `npx convex deploy`
   - [ ] Configurar scheduled functions
   - [ ] Verificar webhooks
   - [ ] Migration de datos si es necesario

4. **Monitoreo**
   - [ ] Configurar Sentry para producción
   - [ ] Configurar alertas
   - [ ] Performance monitoring
   - [ ] Error tracking
   - [ ] Dashboards de métricas

5. **Backups y Recuperación**
   - [ ] Configurar backups automáticos
   - [ ] Documentar proceso de recuperación
   - [ ] Plan de disaster recovery
   - [ ] Runbooks de operación

6. **Documentación**
   - [ ] Manual de usuario final
   - [ ] Documentación técnica
   - [ ] Guías de troubleshooting
   - [ ] Changelog
   - [ ] API documentation (si aplica)

7. **Capacitación**
   - [ ] Capacitar usuarios finales
   - [ ] Capacitar administradores
   - [ ] Videos tutoriales
   - [ ] FAQ

**Estimación**: 3-4 días de configuración y deploy

---

## 🔮 **Fases Post-MVP (Opcional)**

### **Fase 11: Funcionalidades Avanzadas**

1. **Notificaciones Push**
   - Web push notifications
   - Email notifications
   - SMS notifications (Twilio)

2. **App Móvil**
   - React Native o Flutter
   - Versión simplificada del POS
   - Consulta de reportes

3. **Integraciones**
   - Contabilidad (Xero, QuickBooks)
   - WhatsApp Business API
   - Facturación electrónica (AFIP Argentina)
   - Google Maps (ubicación de clientes)

4. **BI y Data Analytics**
   - Dashboard personalizable
   - Machine Learning (predicciones)
   - Forecasting de ventas
   - Segmentación avanzada de clientes

5. **Multi-sucursal**
   - Gestión de múltiples estaciones
   - Transferencias entre sucursales
   - Reportes consolidados
   - Inventario centralizado

---

## 📊 **Métricas de Progreso**

### Estado Actual:
```
Total Fases Planeadas: 10 fases core
Fases Completadas: 4/10 (40%)
Módulos Backend: 7/7 (100%)
Módulos Frontend: 2/7 (28%)
Componentes UI: 26/26 (100%)
Tests: 0% (por iniciar)
```

### Horas Estimadas Restantes:
```
Fase 5 (Frontend Core): ~80-100 horas
Fase 6 (Stripe): ~24-32 horas
Fase 7 (Analytics): ~24-32 horas
Fase 8 (Widget): ~16-24 horas
Fase 9 (Testing): ~40-56 horas
Fase 10 (Deploy): ~24-32 horas
---
TOTAL: ~208-276 horas (~5-7 semanas a tiempo completo)
```

---

## 🎯 **Prioridades Inmediatas**

### Sprint 1 (Próximas 2 semanas):
1. ✅ Completar Dashboard (HECHO)
2. ✅ Completar Módulo de Clientes (HECHO)
3. 🔄 **Implementar POS/Ventas** (CRÍTICO)
4. 🔄 Implementar Inventario

### Sprint 2 (Semanas 3-4):
5. Implementar Reportes básicos
6. Implementar Fidelización
7. Implementar Configuración
8. Testing básico

### Sprint 3 (Semanas 5-6):
9. Integración Stripe
10. Analytics avanzados
11. Testing completo
12. Deploy a staging

### Sprint 4 (Semana 7):
13. Bug fixes
14. Performance optimization
15. Deploy a producción
16. Capacitación

---

## 📝 **Notas Técnicas**

### Deuda Técnica Actual:
- [ ] Agregar tests (0% coverage actualmente)
- [ ] Mejorar manejo de errores en formularios
- [ ] Agregar validación en tiempo real
- [ ] Optimizar queries (algunos N+1 posibles)
- [ ] Agregar logs de auditoría
- [ ] Implementar rate limiting
- [ ] Agregar i18n (internacionalización)

### Mejoras de UX Pendientes:
- [ ] Loaders y skeletons en todas las pantallas
- [ ] Toast notifications
- [ ] Confirmación en acciones destructivas
- [ ] Atajos de teclado
- [ ] Modo offline (PWA)
- [ ] Dark mode completo

---

## 🔧 **Stack Tecnológico Final**

### Frontend:
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Radix UI
- TanStack Table
- Recharts (por agregar)
- React Hook Form
- Zod

### Backend:
- Convex (Database + Backend)
- Clerk (Auth)
- Stripe (Payments)

### Testing:
- Vitest
- React Testing Library
- Playwright
- Axe (Accessibility)

### DevOps:
- Vercel (Frontend)
- Convex (Backend)
- GitHub Actions (CI/CD)
- Sentry (Monitoring)

---

## 📞 **Contacto y Soporte**

Para continuar el desarrollo:
1. Revisar este roadmap
2. Priorizar según necesidades de negocio
3. Estimar recursos necesarios
4. Planificar sprints

**Estado del proyecto**: FUNCIONAL - Listo para desarrollo de módulos core

---

*Última actualización: ${new Date().toLocaleDateString("es-AR")}*

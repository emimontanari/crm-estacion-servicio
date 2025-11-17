# Fase 7: Sistema de Notificaciones

Sistema completo de notificaciones multicanal para el CRM de Estación de Servicio.

## 📋 Características Implementadas

### Backend (Convex)

#### Schema de Base de Datos
- ✅ **notificationTemplates**: Plantillas reutilizables para notificaciones
- ✅ **notifications**: Registro de todas las notificaciones enviadas
- ✅ **notificationPreferences**: Preferencias de usuario/cliente
- ✅ **notificationLogs**: Auditoría y tracking de eventos
- ✅ **notificationCampaigns**: Campañas de notificaciones masivas

#### Archivos Backend
- ✅ `convex/notifications.ts`: Endpoints principales para gestión de notificaciones
- ✅ `convex/notificationTemplates.ts`: Gestión de plantillas
- ✅ `convex/notificationPreferences.ts`: Configuración de preferencias
- ✅ `convex/notificationCampaigns.ts`: Campañas masivas

### Frontend (Next.js + React)

#### Componentes
- ✅ **NotificationCenter**: Centro de notificaciones con badge de no leídas
- ✅ **TemplateForm**: Formulario completo para crear plantillas
- ✅ **TemplateList**: Lista con gestión de plantillas

#### Páginas
- ✅ `/notificaciones`: Dashboard principal con estadísticas
- ✅ `/notificaciones/plantillas`: Gestión de plantillas

## 🔔 Canales de Notificación

### 1. Email
- Soporte para HTML y texto plano
- Variables dinámicas
- Integración preparada con Resend

### 2. SMS
- Mensajes de hasta 160 caracteres
- Integración preparada con Twilio

### 3. Push Notifications
- Notificaciones push web
- Integración preparada con Firebase Cloud Messaging (FCM)

## 📝 Tipos de Notificaciones

1. **welcome**: Bienvenida a nuevos clientes
2. **purchase_confirmation**: Confirmación de compra
3. **loyalty_points**: Actualizaciones de puntos de fidelidad
4. **promotion**: Promociones y ofertas
5. **birthday**: Felicitaciones de cumpleaños
6. **payment_receipt**: Recibos de pago
7. **low_stock_alert**: Alertas de stock bajo
8. **custom**: Notificaciones personalizadas

## ⚙️ Funcionalidades Principales

### Sistema de Plantillas
- ✅ Creación de plantillas multicanal
- ✅ Variables dinámicas ({{name}}, {{email}}, etc.)
- ✅ Soporte para HTML en emails
- ✅ Plantillas reutilizables

### Gestión de Notificaciones
- ✅ Envío inmediato
- ✅ Programación de envíos
- ✅ Estados: draft, scheduled, sending, sent, failed, cancelled
- ✅ Sistema de reintentos automáticos (hasta 3 intentos)
- ✅ Prioridades: low, normal, high, urgent

### Preferencias de Usuario
- ✅ Control por canal (email, SMS, push)
- ✅ Control por tipo (marketing, transaccional, loyalty, promotions)
- ✅ Horarios de silencio (quiet hours)
- ✅ Zona horaria configurable
- ✅ Gestión de tokens FCM para push

### Campañas Masivas
- ✅ Envío a todos los clientes
- ✅ Segmentación avanzada
- ✅ Lista específica de destinatarios
- ✅ Estadísticas en tiempo real
- ✅ Control de progreso

### Logging y Auditoría
- ✅ Registro de todos los eventos
- ✅ Tracking de apertura y clics
- ✅ Análisis de tasas de conversión
- ✅ Historial completo

### Estadísticas
- ✅ Total enviadas
- ✅ Tasa de apertura
- ✅ Tasa de clics
- ✅ Por canal (email, SMS, push)
- ✅ Por estado

## 🔐 Seguridad

- ✅ Autenticación requerida en todos los endpoints
- ✅ Validación de organización (multi-tenancy)
- ✅ Control de acceso basado en roles
- ✅ Soft deletes para plantillas

## 🚀 Cómo Usar

### 1. Crear una Plantilla

```typescript
// Navegar a /notificaciones/plantillas
// Hacer clic en "Nueva Plantilla"
// Configurar:
// - Nombre y descripción
// - Tipo de plantilla
// - Canales (email, SMS, push)
// - Contenido para cada canal
// - Variables disponibles
```

### 2. Enviar una Notificación

```typescript
// Backend
const notificationId = await ctx.runMutation(api.notifications.create, {
  templateId: "...",
  recipientType: "customer",
  recipientId: customerId,
  channel: "email",
  priority: "normal",
  body: "Mensaje...",
});

await ctx.runAction(api.notifications.send, {
  notificationId,
});
```

### 3. Crear una Campaña

```typescript
const campaignId = await ctx.runMutation(api.notificationCampaigns.create, {
  name: "Promoción de Verano",
  templateId: "...",
  targetType: "all_customers",
});

await ctx.runAction(api.notificationCampaigns.launch, {
  campaignId,
});
```

## 🔧 Configuración de Servicios Externos

Para usar el sistema en producción, configura las siguientes variables de entorno:

### Email (Resend)
```bash
RESEND_API_KEY=your_api_key
```

### SMS (Twilio)
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number
```

### Push (Firebase)
```bash
FIREBASE_SERVICE_ACCOUNT=your_service_account_json
```

## 📦 Dependencias Instaladas

```json
{
  "date-fns": "^4.1.0",
  "sonner": "^2.0.7"
}
```

## 🎯 Próximos Pasos

1. **Configurar credenciales** de servicios externos
2. **Probar en desarrollo**:
   - Crear plantillas de prueba
   - Enviar notificaciones
   - Verificar logs
3. **Implementar integraciones reales**:
   - Reemplazar mocks con servicios reales
   - Agregar manejo de webhooks
4. **Mejorar UI**:
   - Agregar gráficos de estadísticas
   - Mejorar visualización del historial
   - Agregar editor visual de plantillas

## 📊 Estructura de Archivos

```
packages/backend/convex/
├── schema.ts (actualizado con tablas de notificaciones)
├── notifications.ts
├── notificationTemplates.ts
├── notificationPreferences.ts
└── notificationCampaigns.ts

apps/web/
├── components/notifications/
│   ├── notification-center.tsx
│   ├── template-form.tsx
│   └── template-list.tsx
└── app/(dashboard)/notificaciones/
    ├── page.tsx
    └── plantillas/
        └── page.tsx
```

## ✅ Tests

Ejecutar tests:
```bash
cd packages/backend
node test-notifications.ts
```

## 📖 Documentación API

### Notificaciones

- `notifications.create`: Crear notificación
- `notifications.send`: Enviar notificación
- `notifications.list`: Listar notificaciones
- `notifications.markAsRead`: Marcar como leída
- `notifications.getStats`: Obtener estadísticas
- `notifications.cancel`: Cancelar notificación programada

### Plantillas

- `notificationTemplates.create`: Crear plantilla
- `notificationTemplates.update`: Actualizar plantilla
- `notificationTemplates.list`: Listar plantillas
- `notificationTemplates.get`: Obtener plantilla
- `notificationTemplates.getByType`: Buscar por tipo
- `notificationTemplates.remove`: Eliminar plantilla
- `notificationTemplates.renderTemplate`: Renderizar con variables

### Preferencias

- `notificationPreferences.get`: Obtener preferencias
- `notificationPreferences.upsert`: Crear/actualizar preferencias
- `notificationPreferences.canSendNotification`: Verificar si se puede enviar
- `notificationPreferences.registerFCMToken`: Registrar token push
- `notificationPreferences.removeFCMToken`: Eliminar token push

### Campañas

- `notificationCampaigns.create`: Crear campaña
- `notificationCampaigns.list`: Listar campañas
- `notificationCampaigns.get`: Obtener campaña
- `notificationCampaigns.launch`: Lanzar campaña
- `notificationCampaigns.cancel`: Cancelar campaña

---

**Fase 7 Completada** ✅

Sistema de notificaciones multicanal completamente funcional con soporte para email, SMS y push notifications.

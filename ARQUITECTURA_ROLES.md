# Arquitectura de Roles y Pantallas - CRM Estación de Servicio

**Fecha:** 2025-11-19
**Versión:** 1.0 - Fase 1
**Autor:** Diseño de Sistema de Roles

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Roles de Usuario](#roles-de-usuario)
3. [Mapeo de Roles Técnicos](#mapeo-de-roles-técnicos)
4. [Estructura de Pantallas por Rol](#estructura-de-pantallas-por-rol)
5. [Permisos y Restricciones](#permisos-y-restricciones)
6. [Flujos de Trabajo](#flujos-de-trabajo)
7. [Recomendaciones de Implementación](#recomendaciones-de-implementación)

---

## 🎯 Resumen Ejecutivo

El sistema CRM para estación de servicio tendrá **3 tipos principales de usuarios**, cada uno con diferentes niveles de acceso y pantallas específicas:

| Tipo de Usuario | Roles Técnicos | Nivel de Acceso | Pantallas |
|-----------------|----------------|-----------------|-----------|
| **👨‍🔧 Mecánicos** | `cashier` | Operativo | Ventas, Clientes, Inventario (consulta) |
| **👥 Clientes** | `viewer` (nuevo rol `customer`) | Solo lectura | Portal del cliente, Historial, Puntos |
| **🔐 Administración** | `admin`, `manager` | Completo | Todas las pantallas + Configuración |

---

## 👥 Roles de Usuario

### 1. 👨‍🔧 MECÁNICOS (Operadores/Cajeros)

**Descripción:**
Personal que atiende directamente a los clientes, realiza ventas, registra servicios y consulta información básica.

**Características:**
- Acceso operativo al sistema
- Pueden crear y modificar ventas
- Consultan información de clientes e inventario
- No pueden modificar configuración del sistema
- No tienen acceso a reportes financieros completos

**Rol técnico:** `cashier`

**Permisos:**
- ✅ Crear/editar ventas
- ✅ Ver y buscar clientes
- ✅ Consultar inventario
- ✅ Ver historial de compras del cliente
- ✅ Aplicar promociones y descuentos
- ✅ Procesar pagos
- ❌ Modificar precios
- ❌ Ver reportes completos
- ❌ Configurar sistema
- ❌ Gestionar usuarios

---

### 2. 👥 CLIENTES (Usuarios Externos)

**Descripción:**
Clientes de la estación de servicio que acceden a un portal personalizado para ver su información, puntos de fidelización y historial.

**Características:**
- Acceso externo (widget o portal público)
- Solo pueden ver su propia información
- Acceso de solo lectura
- Pueden canjear puntos de fidelización
- Ven ofertas y promociones personalizadas

**Rol técnico:** `viewer` o nuevo rol `customer`

**Permisos:**
- ✅ Ver su propio perfil
- ✅ Ver historial de compras
- ✅ Ver puntos de fidelización
- ✅ Canjear puntos
- ✅ Ver promociones disponibles
- ✅ Ver ofertas personalizadas
- ❌ Ver información de otros clientes
- ❌ Realizar ventas
- ❌ Modificar precios o inventario
- ❌ Acceso al dashboard administrativo

---

### 3. 🔐 ADMINISTRACIÓN (Gerentes/Administradores)

**Descripción:**
Personal con acceso completo al sistema, pueden configurar, ver reportes completos y gestionar todos los aspectos del negocio.

**Características:**
- Acceso completo a todas las funcionalidades
- Pueden ver reportes financieros y analíticos
- Gestionan usuarios y permisos
- Configuran el sistema
- Supervisan operaciones

**Roles técnicos:** `admin` (máximo acceso) y `manager` (acceso de gestión)

#### 3.1. Admin (Administrador Principal)

**Permisos:**
- ✅ **TODO:** Acceso completo sin restricciones
- ✅ Gestionar usuarios y roles
- ✅ Configurar sistema completo
- ✅ Ver todos los reportes
- ✅ Gestionar múltiples organizaciones (si aplica)
- ✅ Configurar métodos de pago
- ✅ Configurar sistema de fidelización
- ✅ Exportar datos

#### 3.2. Manager (Gerente)

**Permisos:**
- ✅ Ver todos los reportes
- ✅ Gestionar inventario
- ✅ Gestionar clientes
- ✅ Gestionar promociones
- ✅ Ver configuración (solo lectura algunas secciones)
- ✅ Supervisar ventas
- ⚠️ Gestionar usuarios (limitado)
- ❌ Cambiar configuración crítica del sistema
- ❌ Eliminar datos de organización

---

## 🔧 Mapeo de Roles Técnicos

### Roles Existentes en el Backend

```typescript
type UserRole = "admin" | "manager" | "cashier" | "viewer";
```

### Mapeo Propuesto

| Rol Técnico | Tipo de Usuario | Descripción |
|-------------|-----------------|-------------|
| `admin` | 🔐 Administración | Administrador principal con acceso completo |
| `manager` | 🔐 Administración | Gerente con acceso de gestión |
| `cashier` | 👨‍🔧 Mecánico | Operador/cajero con acceso operativo |
| `viewer` | 👥 Cliente | Cliente externo (solo lectura propia info) |

### Nuevo Rol Recomendado

Se recomienda crear un nuevo rol `customer` para diferenciar clientes externos de viewers internos:

```typescript
type UserRole = "admin" | "manager" | "cashier" | "viewer" | "customer";
```

**Diferencia:**
- `viewer`: Usuario interno con acceso de solo lectura a todo
- `customer`: Cliente externo con acceso solo a su propia información

---

## 📱 Estructura de Pantallas por Rol

### Pantallas Existentes

```
apps/web/app/(dashboard)/
├── clientes/           # Gestión de clientes
├── configuracion/      # Configuración del sistema
├── fidelizacion/       # Sistema de puntos
├── inventario/         # Gestión de inventario
├── notificaciones/     # Centro de notificaciones
├── reportes/           # Reportes y analíticas
└── ventas/            # Punto de venta
```

---

### 🔐 ADMINISTRACIÓN (admin, manager)

#### Dashboard Principal
- **Ruta:** `/`
- **Componentes:**
  - Resumen de ventas del día
  - Estadísticas de inventario
  - Alertas de stock bajo
  - Gráficos de rendimiento
  - Actividad reciente

#### 1. Ventas
- **Ruta:** `/ventas`
- **Acceso:** `admin`, `manager`, `cashier`
- **Funcionalidades:**
  - ✅ Crear nueva venta
  - ✅ Ver historial de ventas
  - ✅ Ver detalles de venta
  - ✅ Procesar pagos
  - ✅ Aplicar descuentos (admin/manager pueden descuentos mayores)
  - ✅ Cancelar/anular ventas (solo admin/manager)

#### 2. Clientes
- **Ruta:** `/clientes`
- **Acceso:** `admin`, `manager`, `cashier`
- **Funcionalidades:**
  - ✅ Ver lista de clientes
  - ✅ Buscar clientes
  - ✅ Ver perfil de cliente
  - ✅ Ver historial de compras
  - ✅ Crear nuevo cliente
  - ✅ Editar cliente (admin/manager)
  - ✅ Ver puntos de fidelización
  - ✅ Ver estadísticas del cliente

#### 3. Inventario
- **Ruta:** `/inventario`
- **Acceso:** `admin`, `manager` (consulta: `cashier`)
- **Funcionalidades:**

##### 3.1. Productos
- ✅ Ver lista de productos
- ✅ Crear producto (admin/manager)
- ✅ Editar producto (admin/manager)
- ✅ Ver detalles de producto
- ✅ Ajustar stock (admin/manager)
- ✅ Ver historial de movimientos

##### 3.2. Combustibles
- ✅ Ver tanques de combustible
- ✅ Monitorear niveles
- ✅ Registrar reabastecimiento (admin/manager)
- ✅ Ver historial de ventas por combustible
- ✅ Alertas de nivel bajo

##### 3.3. Alertas
- ✅ Ver productos con stock bajo
- ✅ Configurar umbrales de alerta (admin/manager)
- ✅ Recibir notificaciones

#### 4. Reportes
- **Ruta:** `/reportes`
- **Acceso:** `admin`, `manager`
- **Funcionalidades:**

##### 4.1. Reportes de Ventas
- ✅ Ventas por período
- ✅ Ventas por producto
- ✅ Ventas por empleado
- ✅ Ventas por método de pago
- ✅ Comparativas (mes anterior, año anterior)
- ✅ Gráficos y tendencias
- ✅ Exportar a Excel/PDF

##### 4.2. Reportes de Inventario
- ✅ Rotación de productos
- ✅ Productos más vendidos
- ✅ Productos con bajo stock
- ✅ Valor de inventario
- ✅ Historial de movimientos

##### 4.3. Reportes de Clientes
- ✅ Clientes más frecuentes
- ✅ Clientes con más puntos
- ✅ Análisis de segmentación
- ✅ Clientes nuevos vs recurrentes

#### 5. Fidelización
- **Ruta:** `/fidelizacion`
- **Acceso:** `admin`, `manager`
- **Funcionalidades:**

##### 5.1. Programa de Puntos
- ✅ Configurar reglas de puntos
- ✅ Ver transacciones de puntos
- ✅ Ver ranking de clientes
- ✅ Ajustar puntos manualmente (admin)

##### 5.2. Promociones
- ✅ Crear promociones
- ✅ Editar promociones
- ✅ Activar/desactivar promociones
- ✅ Ver uso de promociones
- ✅ Programar promociones

#### 6. Configuración
- **Ruta:** `/configuracion`
- **Acceso:** `admin` (lectura: `manager`)
- **Funcionalidades:**

##### 6.1. General
- ✅ Configuración de la organización
- ✅ Datos de contacto
- ✅ Logo y branding

##### 6.2. Usuarios
- ✅ Gestionar usuarios
- ✅ Asignar roles
- ✅ Activar/desactivar usuarios
- ✅ Permisos personalizados

##### 6.3. Métodos de Pago
- ✅ Configurar métodos de pago
- ✅ Integración con Stripe
- ✅ Configurar monedas

##### 6.4. Fidelización
- ✅ Configurar sistema de puntos
- ✅ Configurar niveles/tiers
- ✅ Configurar beneficios por nivel

##### 6.5. Notificaciones
- ✅ Configurar plantillas de email
- ✅ Configurar notificaciones push
- ✅ Configurar triggers automáticos

#### 7. Notificaciones
- **Ruta:** `/notificaciones`
- **Acceso:** `admin`, `manager`
- **Funcionalidades:**
  - ✅ Centro de notificaciones
  - ✅ Ver historial
  - ✅ Crear notificaciones manuales
  - ✅ Configurar automatizaciones

---

### 👨‍🔧 MECÁNICOS (cashier)

#### Dashboard Principal
- **Ruta:** `/`
- **Componentes:**
  - Resumen de ventas del día (propias)
  - Ventas pendientes
  - Alertas de stock bajo
  - Clientes del día

#### 1. Ventas (Principal)
- **Ruta:** `/ventas`
- **Acceso:** COMPLETO
- **Funcionalidades:**
  - ✅ Crear nueva venta
  - ✅ Ver historial de ventas (propias)
  - ✅ Ver detalles de venta
  - ✅ Procesar pagos
  - ✅ Aplicar descuentos (limitados)
  - ✅ Buscar productos
  - ✅ Seleccionar cliente
  - ❌ Cancelar ventas (solo solicitar)
  - ❌ Modificar precios

#### 2. Clientes
- **Ruta:** `/clientes`
- **Acceso:** SOLO LECTURA + Crear
- **Funcionalidades:**
  - ✅ Ver lista de clientes
  - ✅ Buscar clientes
  - ✅ Ver perfil de cliente
  - ✅ Ver historial de compras
  - ✅ Crear nuevo cliente (registro rápido)
  - ✅ Ver puntos de fidelización
  - ❌ Editar cliente (solo campos básicos)
  - ❌ Eliminar cliente
  - ❌ Ajustar puntos manualmente

#### 3. Inventario
- **Ruta:** `/inventario`
- **Acceso:** SOLO LECTURA
- **Funcionalidades:**
  - ✅ Ver lista de productos
  - ✅ Buscar productos
  - ✅ Ver detalles de producto
  - ✅ Ver stock disponible
  - ✅ Ver alertas de stock bajo
  - ❌ Crear/editar productos
  - ❌ Ajustar stock
  - ❌ Modificar precios

#### 4. Reportes
- **Ruta:** `/reportes`
- **Acceso:** LIMITADO (solo propias ventas)
- **Funcionalidades:**
  - ✅ Ver ventas propias del día
  - ✅ Ver resumen de ventas propias
  - ❌ Ver ventas de otros empleados
  - ❌ Ver reportes financieros completos
  - ❌ Exportar reportes

#### Pantallas NO disponibles:
- ❌ Configuración
- ❌ Fidelización (gestión)
- ❌ Notificaciones (gestión)
- ❌ Usuarios

---

### 👥 CLIENTES (customer)

**Nota:** Los clientes accederán a través del **Widget** o **Portal Público**, NO al dashboard administrativo.

#### Portal del Cliente
- **Ruta:** Widget app (`apps/widget`)
- **URL:** `https://portal.estacion.com` (ejemplo)

#### 1. Mi Cuenta
- **Funcionalidades:**
  - ✅ Ver perfil
  - ✅ Editar información de contacto
  - ✅ Cambiar contraseña
  - ✅ Ver datos de vehículo(s)
  - ✅ Agregar/editar vehículos

#### 2. Mi Historial
- **Funcionalidades:**
  - ✅ Ver historial de compras
  - ✅ Ver detalles de cada compra
  - ✅ Ver servicios realizados
  - ✅ Filtrar por fecha
  - ✅ Descargar facturas

#### 3. Mis Puntos
- **Funcionalidades:**
  - ✅ Ver saldo de puntos
  - ✅ Ver historial de puntos ganados
  - ✅ Ver historial de puntos canjeados
  - ✅ Ver puntos próximos a vencer
  - ✅ Ver nivel/tier actual
  - ✅ Ver beneficios del nivel
  - ✅ Ver progreso al siguiente nivel
  - ✅ Canjear puntos (con límites)

#### 4. Promociones
- **Funcionalidades:**
  - ✅ Ver promociones activas
  - ✅ Ver promociones personalizadas
  - ✅ Ver descuentos disponibles
  - ✅ Ver cupones activos
  - ✅ Activar promociones

#### 5. Servicios
- **Funcionalidades:**
  - ✅ Ver servicios disponibles
  - ✅ Solicitar turno/cita (futuro)
  - ✅ Ver historial de servicios

#### 6. Notificaciones
- **Funcionalidades:**
  - ✅ Ver notificaciones personales
  - ✅ Ver ofertas
  - ✅ Configurar preferencias de notificación

#### Pantallas NO disponibles:
- ❌ Dashboard administrativo
- ❌ Gestión de otros clientes
- ❌ Inventario
- ❌ Reportes
- ❌ Configuración del sistema
- ❌ Gestión de ventas

---

## 🔒 Permisos y Restricciones

### Matriz de Permisos

| Funcionalidad | Admin | Manager | Mechanic | Customer |
|---------------|-------|---------|----------|----------|
| **Ventas** |
| Crear venta | ✅ | ✅ | ✅ | ❌ |
| Ver todas las ventas | ✅ | ✅ | ⚠️ Propias | ⚠️ Propias |
| Cancelar venta | ✅ | ✅ | ❌ | ❌ |
| Modificar precio | ✅ | ✅ | ❌ | ❌ |
| Descuentos grandes | ✅ | ✅ | ❌ | ❌ |
| Descuentos pequeños | ✅ | ✅ | ✅ | ❌ |
| **Clientes** |
| Ver clientes | ✅ | ✅ | ✅ | ⚠️ Propio |
| Crear cliente | ✅ | ✅ | ✅ | ❌ |
| Editar cliente | ✅ | ✅ | ⚠️ Limitado | ⚠️ Propio |
| Eliminar cliente | ✅ | ⚠️ | ❌ | ❌ |
| Ajustar puntos | ✅ | ✅ | ❌ | ❌ |
| **Inventario** |
| Ver productos | ✅ | ✅ | ✅ | ❌ |
| Crear producto | ✅ | ✅ | ❌ | ❌ |
| Editar producto | ✅ | ✅ | ❌ | ❌ |
| Eliminar producto | ✅ | ⚠️ | ❌ | ❌ |
| Ajustar stock | ✅ | ✅ | ❌ | ❌ |
| Modificar precio | ✅ | ✅ | ❌ | ❌ |
| **Reportes** |
| Ver reportes financieros | ✅ | ✅ | ❌ | ❌ |
| Ver reportes propios | ✅ | ✅ | ✅ | ⚠️ Historial |
| Exportar reportes | ✅ | ✅ | ❌ | ⚠️ Propio |
| **Fidelización** |
| Configurar sistema | ✅ | ⚠️ | ❌ | ❌ |
| Ver transacciones | ✅ | ✅ | ⚠️ Cliente actual | ⚠️ Propias |
| Canjear puntos | ✅ | ✅ | ✅ | ✅ |
| Ajustar puntos | ✅ | ✅ | ❌ | ❌ |
| **Configuración** |
| Ver configuración | ✅ | ⚠️ Lectura | ❌ | ❌ |
| Modificar configuración | ✅ | ❌ | ❌ | ❌ |
| Gestionar usuarios | ✅ | ⚠️ Limitado | ❌ | ❌ |
| Configurar pagos | ✅ | ❌ | ❌ | ❌ |

**Leyenda:**
- ✅ Acceso completo
- ⚠️ Acceso limitado o condicional
- ❌ Sin acceso

---

## 🔄 Flujos de Trabajo

### Flujo 1: Venta Completa (Mecánico)

```
1. Mecánico → Login al sistema
2. Navega a /ventas
3. Click "Nueva Venta"
4. Busca/selecciona cliente (o crea uno nuevo)
5. Agrega productos al carrito
6. Aplica descuentos si corresponde
7. Selecciona método de pago
8. Procesa pago
9. Sistema registra puntos automáticamente
10. Imprime/envía recibo
```

### Flujo 2: Consulta de Puntos (Mecánico)

```
1. Mecánico → Busca cliente en /clientes
2. Ve perfil del cliente
3. Ve saldo de puntos actual
4. Ve historial de puntos
5. Cliente solicita canje
6. Mecánico aplica canje en la venta
```

### Flujo 3: Cliente Consulta Portal

```
1. Cliente → Accede al portal (widget)
2. Login con credenciales
3. Ve dashboard con resumen
4. Navega a "Mis Puntos"
5. Ve saldo y nivel actual
6. Ve promociones disponibles
7. Activa una promoción para próxima visita
```

### Flujo 4: Administrador Gestiona Inventario

```
1. Admin → Login al sistema
2. Navega a /inventario/productos
3. Ve alerta de stock bajo
4. Edita producto con stock bajo
5. Ajusta cantidad de stock
6. Sistema registra movimiento
7. Actualiza precio si es necesario
8. Guarda cambios
```

### Flujo 5: Manager Crea Promoción

```
1. Manager → Login al sistema
2. Navega a /fidelizacion/promociones
3. Click "Nueva Promoción"
4. Define:
   - Nombre y descripción
   - Tipo de descuento
   - Productos aplicables
   - Fecha inicio/fin
   - Condiciones
5. Guarda promoción
6. Sistema la activa automáticamente
7. Clientes reciben notificación
```

---

## 💡 Recomendaciones de Implementación

### Fase 1: Prioridades

#### 1. Implementar Guard de Roles ✅

```typescript
// modules/auth/components/role-guard.tsx
<RoleGuard allowedRoles={['admin', 'manager']}>
  <ConfigurationPage />
</RoleGuard>
```

#### 2. Crear Layout por Rol

```typescript
// apps/web/app/(dashboard)/layout.tsx
// Renderizar sidebar dinámico según rol
```

#### 3. Rutas Protegidas

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar acceso según rol
  if (pathname.startsWith('/configuracion')) {
    // Solo admin
  }
  if (pathname.startsWith('/reportes')) {
    // admin, manager
  }
}
```

#### 4. UI Condicional

```typescript
// Mostrar/ocultar elementos según rol
{isAdmin(auth) && (
  <Button onClick={deleteProduct}>Eliminar</Button>
)}

{isCashier(auth) && (
  <Button onClick={createSale}>Nueva Venta</Button>
)}
```

### Fase 2: Portal del Cliente

1. **Crear aplicación separada en Widget**
   - Autenticación independiente
   - UI simplificada
   - Solo queries de lectura (excepto canje)

2. **Implementar autenticación de cliente**
   - Clerk o sistema propio
   - Link con customer en DB

3. **Crear pantallas de cliente**
   - Mi cuenta
   - Historial
   - Puntos
   - Promociones

### Fase 3: Características Avanzadas

1. **Permisos granulares**
   - Permisos personalizados por usuario
   - Grupos de permisos

2. **Auditoría**
   - Log de acciones por rol
   - Historial de cambios

3. **Notificaciones por rol**
   - Alertas específicas según rol
   - Canal de comunicación entre roles

---

## 📋 Checklist de Implementación

### Backend

- [ ] Agregar rol `customer` a `UserRole` type
- [ ] Crear funciones de verificación de permisos granulares
- [ ] Implementar middleware de autorización en queries/mutations
- [ ] Crear tabla de permisos personalizados (opcional)
- [ ] Agregar campos de rol en respuestas de API

### Frontend - Dashboard

- [ ] Crear componente `RoleGuard`
- [ ] Implementar sidebar dinámico según rol
- [ ] Ocultar/mostrar elementos según permisos
- [ ] Crear rutas protegidas
- [ ] Implementar middleware de Next.js para rutas
- [ ] Crear página 403 (Forbidden)
- [ ] Mostrar indicador de rol actual en UI

### Frontend - Widget (Portal Cliente)

- [ ] Crear estructura de app en `apps/widget`
- [ ] Implementar autenticación de cliente
- [ ] Crear dashboard de cliente
- [ ] Crear pantalla "Mi Cuenta"
- [ ] Crear pantalla "Mi Historial"
- [ ] Crear pantalla "Mis Puntos"
- [ ] Crear pantalla "Promociones"
- [ ] Implementar canje de puntos

### Testing

- [ ] Tests de permisos en backend
- [ ] Tests de guards en frontend
- [ ] Tests de flujos por rol
- [ ] Tests E2E por tipo de usuario

### Documentación

- [ ] Guía de usuario por rol
- [ ] Manual de administración
- [ ] Documentación de API de permisos

---

## 📝 Notas Importantes

### Seguridad

1. **Siempre validar permisos en el backend**
   - No confiar solo en UI ocultada
   - Verificar en cada query/mutation

2. **Logging de acciones sensibles**
   - Registrar quién hace qué
   - Especialmente: cambios de precios, ajustes de stock, modificaciones de usuarios

3. **Rate limiting por rol**
   - Clientes: límite más restrictivo
   - Mecánicos: límite medio
   - Admin: menos restrictivo pero monitoreado

### UX

1. **Mensajes claros de permisos**
   - "No tienes permiso para realizar esta acción"
   - "Contacta al administrador para obtener acceso"

2. **Dashboard personalizado**
   - Cada rol ve información relevante para su trabajo
   - No abrumar con datos irrelevantes

3. **Flujos optimizados por rol**
   - Mecánico: flujo rápido de venta
   - Cliente: fácil consulta de puntos
   - Admin: vista completa del negocio

---

## 🔄 Próximas Iteraciones

### V2: Características Adicionales

- [ ] Roles personalizados
- [ ] Permisos granulares por módulo
- [ ] Múltiples organizaciones
- [ ] Delegación de permisos temporales
- [ ] Aprobaciones de flujo (ej: descuento >X% requiere aprobación)

### V3: Analytics por Rol

- [ ] Dashboard de performance por mecánico
- [ ] Analytics de uso de app por clientes
- [ ] Reportes de actividad por rol

---

**Última actualización:** 2025-11-19
**Versión:** 1.0 - Fase 1
**Estado:** Documento de Diseño - Listo para Implementación

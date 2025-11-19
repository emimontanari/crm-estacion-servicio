# Implementación de Roles - Fase 1

**Fecha:** 2025-11-19
**Estado:** ✅ Estructura Base Completada

---

## 📋 Resumen de Cambios

Se ha completado la implementación de la estructura base de roles y la organización de directorios para la Fase 1 del proyecto. Todos los cambios están alineados con la arquitectura definida en `ARQUITECTURA_ROLES.md`.

---

## ✅ Cambios Realizados en Backend

### 1. Actualización de Roles (`packages/backend/convex/auth.ts`)

**Cambio principal:** Agregado nuevo rol `customer`

```typescript
// ANTES
type UserRole = "admin" | "manager" | "cashier" | "viewer";

// AHORA
type UserRole = "admin" | "manager" | "cashier" | "viewer" | "customer";
```

**Documentación agregada:**
```typescript
/**
 * - admin: Administrador con acceso completo al sistema
 * - manager: Gerente con acceso de gestión (sin config crítica)
 * - cashier: Mecánico/operador con acceso operativo (ventas, clientes consulta)
 * - viewer: Usuario interno con acceso de solo lectura
 * - customer: Cliente externo con acceso solo a su propia información
 */
```

### 2. Nuevas Funciones de Verificación

Se agregaron **6 nuevas funciones** para facilitar la verificación de permisos:

```typescript
// ✅ Verificar si es cliente
isCustomer(auth: AuthInfo): boolean

// ✅ Verificar si es staff (admin, manager o cashier)
isStaff(auth: AuthInfo): boolean

// ✅ Verificar si puede gestionar usuarios
canManageUsers(auth: AuthInfo): boolean

// ✅ Verificar si puede ver reportes completos
canViewReports(auth: AuthInfo): boolean

// ✅ Verificar si puede modificar configuración del sistema
canModifySystemConfig(auth: AuthInfo): boolean

// ✅ Verificar si puede gestionar inventario
canManageInventory(auth: AuthInfo): boolean
```

**Actualización de función existente:**
```typescript
// requireWriteAccess() ahora también excluye a customers
export function requireWriteAccess(auth: AuthInfo): void {
  if (auth.role === "viewer" || auth.role === "customer") {
    throw new Error("Read-only access. Cannot modify data.");
  }
}
```

### 3. Actualización del Schema (`packages/backend/convex/schema.ts`)

**Campo `role` actualizado:**
```typescript
users: defineTable({
  // ...
  role: v.union(
    v.literal("admin"),
    v.literal("manager"),
    v.literal("cashier"),
    v.literal("viewer"),
    v.literal("customer")  // ✅ NUEVO
  ),
  // ...
})
```

---

## ✅ Cambios Realizados en Frontend

### 1. Estructura de Módulos en Web App

**Creada nueva estructura en `apps/web/modules/auth/`:**

```
apps/web/modules/auth/
├── components/
│   ├── role-guard.tsx          ✅ Componente para proteger rutas/UI
│   └── index.ts
├── hooks/
│   ├── use-current-role.ts     ✅ Hook para obtener rol y verificar permisos
│   ├── use-current-user.ts     (existente)
│   ├── use-organization.ts     (existente)
│   ├── use-users.ts            (existente)
│   └── index.ts
└── utils/
    └── permissions.ts          ✅ Definición centralizada de permisos
```

### 2. Componente RoleGuard

**Archivo:** `apps/web/modules/auth/components/role-guard.tsx`

**Uso:**
```tsx
<RoleGuard allowedRoles={['admin', 'manager']}>
  <AdminPanel />
</RoleGuard>
```

**Características:**
- ✅ Muestra loading mientras se carga la información
- ✅ Redirige si no está autenticado
- ✅ Muestra mensaje de error personalizable si no tiene permiso
- ✅ Soporta fallback y loading personalizados

### 3. Hook useCurrentRole

**Archivo:** `apps/web/modules/auth/hooks/use-current-role.ts`

**Uso:**
```tsx
const {
  role,
  isAdmin,
  isManager,
  isCashier,
  isCustomer,
  isStaff,
  hasRole,
  canManageUsers,
  canViewReports,
} = useCurrentRole();

// Uso directo
if (isAdmin) {
  // Mostrar opciones de admin
}

// Uso con múltiples roles
if (hasRole(['admin', 'manager'])) {
  // Mostrar opciones de admin o manager
}
```

**Retorna:**
- `role`: Rol actual del usuario
- `user`: Usuario completo
- Flags por rol: `isAdmin`, `isManager`, `isCashier`, `isViewer`, `isCustomer`
- Flags de permisos: `canManageUsers`, `canViewReports`, etc.
- `hasRole()`: Función para verificar múltiples roles
- `isLoading`: Estado de carga

### 4. Sistema de Permisos Centralizado

**Archivo:** `apps/web/modules/auth/utils/permissions.ts`

**Define permisos por funcionalidad:**
```typescript
export const PERMISSIONS = {
  // Ventas
  SALES_CREATE: ["admin", "manager", "cashier"],
  SALES_VIEW_ALL: ["admin", "manager"],
  SALES_CANCEL: ["admin", "manager"],

  // Clientes
  CUSTOMERS_VIEW: ["admin", "manager", "cashier"],
  CUSTOMERS_EDIT: ["admin", "manager"],

  // Inventario
  INVENTORY_EDIT: ["admin", "manager"],
  INVENTORY_ADJUST_STOCK: ["admin", "manager"],

  // Reportes
  REPORTS_VIEW_ALL: ["admin", "manager"],

  // Configuración
  CONFIG_MODIFY: ["admin"],

  // Y muchos más...
};
```

**Funciones útiles:**
```typescript
// Verificar permiso
hasPermission(role, PERMISSIONS.SALES_CREATE)

// Obtener todos los permisos de un rol
getRolePermissions('cashier')

// Verificar acceso a ruta
canAccessRoute(role, '/configuracion')
```

---

## ✅ Portal del Cliente (Widget)

### 1. Estructura de Directorios

**Creada estructura en `apps/widget/app/(customer)/`:**

```
apps/widget/
├── app/
│   ├── (customer)/
│   │   ├── layout.tsx           ✅ Layout del portal
│   │   ├── mi-cuenta/
│   │   │   └── page.tsx         ✅ Perfil del cliente
│   │   ├── mi-historial/
│   │   │   └── page.tsx         ✅ Historial de compras
│   │   ├── mis-puntos/
│   │   │   └── page.tsx         ✅ Puntos de fidelización
│   │   ├── promociones/
│   │   │   └── page.tsx         ✅ Promociones disponibles
│   │   └── servicios/
│   │       └── page.tsx         ✅ Servicios disponibles
│   └── page.tsx                 (existente)
└── components/
    └── customer/                ✅ Componentes específicos
```

### 2. Páginas del Portal

#### Mi Cuenta (`/mi-cuenta`)
- Ver información personal
- Ver datos del vehículo
- Editar perfil (futuro)

#### Mi Historial (`/mi-historial`)
- Ver historial completo de compras
- Ver detalles de cada transacción
- Ver puntos ganados por compra

#### Mis Puntos (`/mis-puntos`)
- Ver saldo actual de puntos
- Ver nivel/tier actual
- Ver puntos próximos a vencer
- Ver historial de puntos

#### Promociones (`/promociones`)
- Ver promociones activas
- Ver promociones personalizadas
- Canjear promociones
- Ver requisitos de puntos

#### Servicios (`/servicios`)
- Ver servicios disponibles
- Ver precios
- Solicitar servicio (futuro)

### 3. Layout del Portal

**Características:**
- Header con navegación
- Enlaces a secciones principales
- Footer con información
- Diseño responsive
- Theme-aware (dark/light mode)

---

## 📂 Estructura de Archivos Creados

### Backend
```
packages/backend/convex/
├── auth.ts                       ✅ Actualizado (nuevo rol + funciones)
└── schema.ts                     ✅ Actualizado (rol customer en schema)
```

### Frontend - Web App
```
apps/web/modules/auth/
├── components/
│   ├── role-guard.tsx            ✅ NUEVO
│   └── index.ts                  ✅ NUEVO
├── hooks/
│   ├── use-current-role.ts       ✅ NUEVO
│   └── index.ts                  ✅ ACTUALIZADO
└── utils/
    └── permissions.ts            ✅ NUEVO
```

### Frontend - Widget (Portal Cliente)
```
apps/widget/
├── app/(customer)/
│   ├── layout.tsx                ✅ NUEVO
│   ├── mi-cuenta/page.tsx        ✅ NUEVO
│   ├── mi-historial/page.tsx     ✅ NUEVO
│   ├── mis-puntos/page.tsx       ✅ NUEVO
│   ├── promociones/page.tsx      ✅ NUEVO
│   └── servicios/page.tsx        ✅ NUEVO
└── components/customer/          ✅ NUEVO (vacío por ahora)
```

---

## 🔄 Uso de los Componentes

### Ejemplo 1: Proteger una Ruta

```tsx
// En una página administrativa
import { RoleGuard } from "@/modules/auth/components";

export default function ConfiguracionPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div>
        <h1>Configuración del Sistema</h1>
        {/* Solo los admin pueden ver esto */}
      </div>
    </RoleGuard>
  );
}
```

### Ejemplo 2: Mostrar/Ocultar Elementos

```tsx
import { useCurrentRole } from "@/modules/auth/hooks";

export default function VentasPage() {
  const { isAdmin, isManager, canManageInventory } = useCurrentRole();

  return (
    <div>
      <h1>Ventas</h1>

      {/* Solo admin y manager */}
      {(isAdmin || isManager) && (
        <button>Ver Todas las Ventas</button>
      )}

      {/* Usando función de permiso */}
      {canManageInventory && (
        <button>Ajustar Inventario</button>
      )}
    </div>
  );
}
```

### Ejemplo 3: Verificar Permisos Específicos

```tsx
import { useCurrentRole } from "@/modules/auth/hooks";
import { PERMISSIONS, hasPermission } from "@/modules/auth/utils/permissions";

export default function ClientesPage() {
  const { role } = useCurrentRole();

  const canEdit = hasPermission(role, PERMISSIONS.CUSTOMERS_EDIT);
  const canDelete = hasPermission(role, PERMISSIONS.CUSTOMERS_DELETE);

  return (
    <div>
      <h1>Clientes</h1>

      {canEdit && <button>Editar</button>}
      {canDelete && <button>Eliminar</button>}
    </div>
  );
}
```

---

## 🚀 Próximos Pasos

### Fase 1.1: Integración y Testing

- [ ] Probar RoleGuard en rutas existentes
- [ ] Implementar middleware de Next.js para proteger rutas
- [ ] Agregar tests unitarios para funciones de permisos
- [ ] Agregar tests de integración para RoleGuard

### Fase 1.2: UI Adaptativa

- [ ] Crear sidebar dinámico según rol
- [ ] Actualizar navegación según permisos
- [ ] Agregar indicador de rol en header
- [ ] Implementar página 403 (Forbidden)

### Fase 1.3: Portal del Cliente

- [ ] Conectar páginas del widget con Convex
- [ ] Implementar autenticación de clientes
- [ ] Agregar funcionalidad de canje de puntos
- [ ] Implementar notificaciones para clientes

### Fase 1.4: Refinamiento

- [ ] Agregar permisos granulares personalizables
- [ ] Implementar sistema de auditoría
- [ ] Agregar logging de acciones sensibles
- [ ] Documentar patrones de uso

---

## 📚 Documentos Relacionados

- **ARQUITECTURA_ROLES.md**: Especificación completa de roles y pantallas
- **SETUP_VERIFICATION.md**: Verificación del setup del proyecto
- **REPORTE_ERRORES.md**: Errores corregidos en setup inicial
- **PLAN_CORRECCION.md**: Plan de corrección de errores

---

## 💡 Notas Importantes

### Seguridad

1. **Siempre validar en backend**: No confiar solo en guards del frontend
2. **Verificar permisos en cada query/mutation**: Usar funciones de `auth.ts`
3. **Logging**: Registrar acciones sensibles (cambios de precio, ajustes de stock)

### Performance

1. **useCurrentRole es ligero**: Solo hace una query que se cachea
2. **RoleGuard es óptimo**: Solo renderiza cuando cambia el usuario
3. **Permisos centralizados**: Fácil de mantener y actualizar

### Mantenimiento

1. **Un solo lugar para definir permisos**: `utils/permissions.ts`
2. **Fácil agregar nuevos roles**: Solo actualizar type y schema
3. **Fácil agregar nuevos permisos**: Agregar a PERMISSIONS object

---

## ✅ Checklist de Implementación

### Backend
- [x] Agregar rol `customer` a UserRole type
- [x] Actualizar schema con nuevo rol
- [x] Crear funciones de verificación
- [x] Actualizar requireWriteAccess

### Frontend - Core
- [x] Crear componente RoleGuard
- [x] Crear hook useCurrentRole
- [x] Crear sistema de permisos centralizado
- [x] Exportar todo correctamente

### Frontend - Widget
- [x] Crear estructura de directorios
- [x] Crear layout del portal
- [x] Crear página Mi Cuenta
- [x] Crear página Mi Historial
- [x] Crear página Mis Puntos
- [x] Crear página Promociones
- [x] Crear página Servicios

### Testing (Pendiente)
- [ ] Tests unitarios backend
- [ ] Tests de componentes
- [ ] Tests de hooks
- [ ] Tests E2E por rol

---

**Última actualización:** 2025-11-19
**Estado:** ✅ Estructura Base Completada
**Próximo paso:** Integración y testing de componentes

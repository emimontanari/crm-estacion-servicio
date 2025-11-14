# Sistema de Autenticación y Autorización

## Descripción General

El CRM utiliza **Clerk** para autenticación y **Convex** para autorización basada en roles. El sistema soporta multi-tenancy completo con organizaciones aisladas.

---

## Roles de Usuario

### 1. **Admin** (Administrador)
- Acceso completo al sistema
- Puede gestionar usuarios y roles
- Puede configurar la organización
- Puede eliminar datos
- Acceso a todas las funcionalidades

**Permisos:**
- ✅ Gestión de usuarios
- ✅ Gestión de productos
- ✅ Gestión de clientes
- ✅ Procesamiento de ventas
- ✅ Reportes y analytics
- ✅ Configuración del sistema
- ✅ Configuración de organización

### 2. **Manager** (Gerente)
- Puede gestionar productos e inventario
- Puede configurar programas de fidelización
- Puede generar reportes
- Puede gestionar usuarios (excepto otros admins)
- No puede eliminar datos permanentemente

**Permisos:**
- ✅ Gestión de usuarios (limitada)
- ✅ Gestión de productos
- ✅ Gestión de clientes
- ✅ Procesamiento de ventas
- ✅ Reportes y analytics
- ✅ Configuración del sistema
- ❌ Configuración de organización

### 3. **Cashier** (Cajero)
- Enfocado en operaciones diarias
- Puede procesar ventas y pagos
- Puede gestionar clientes
- Puede ver productos y precios
- Solo lectura en reportes

**Permisos:**
- ❌ Gestión de usuarios
- ❌ Gestión de productos
- ✅ Gestión de clientes
- ✅ Procesamiento de ventas
- ✅ Reportes (solo lectura)
- ❌ Configuración del sistema
- ❌ Configuración de organización

### 4. **Viewer** (Observador)
- Solo lectura
- Puede ver reportes y analytics
- Puede consultar información de clientes
- No puede modificar ningún dato

**Permisos:**
- ❌ Gestión de usuarios
- ❌ Gestión de productos
- ✅ Gestión de clientes (solo lectura)
- ❌ Procesamiento de ventas
- ✅ Reportes (solo lectura)
- ❌ Configuración del sistema
- ❌ Configuración de organización

---

## Arquitectura

### Backend (Convex)

#### Módulos de Autenticación

1. **`auth.ts`** - Helpers de autenticación y autorización
   - `requireAuth()` - Verifica autenticación
   - `requireRole()` - Verifica rol específico
   - `isAdmin()`, `isManager()`, `isCashier()` - Helpers de roles
   - `requireWriteAccess()` - Verifica permisos de escritura

2. **`users.ts`** - Gestión de usuarios
   - CRUD completo de usuarios
   - Cambio de roles
   - Activar/desactivar usuarios
   - Sincronización con Clerk

3. **`organizations.ts`** - Gestión de organizaciones
   - CRUD de organizaciones
   - Configuración de la organización
   - Estadísticas
   - Sincronización con Clerk

4. **`invitations.ts`** - Sistema de invitaciones
   - Invitar nuevos usuarios
   - Gestión de invitaciones pendientes

### Frontend (Next.js)

#### Middleware

El middleware (`apps/web/middleware.ts`) protege las rutas:
- Rutas públicas: sign-in, sign-up, webhooks
- Rutas protegidas: Todo el dashboard
- Redirección automática a org-selection si no tiene organización

#### Componentes de Guards

**RoleGuard** - Protege contenido por rol:
```tsx
<RoleGuard allowedRoles={["admin", "manager"]}>
  <AdminPanel />
</RoleGuard>
```

**AdminOnly** - Solo para admins:
```tsx
<AdminOnly>
  <DeleteButton />
</AdminOnly>
```

**ManagerOnly** - Para managers y admins:
```tsx
<ManagerOnly>
  <ConfigPanel />
</ManagerOnly>
```

**WriteAccess** - Para todos excepto viewers:
```tsx
<WriteAccess>
  <EditForm />
</WriteAccess>
```

#### Hooks de Autenticación

**useCurrentUser** - Usuario actual con permisos:
```tsx
const { user, role, isAdmin, canManageUsers } = useCurrentUser();
```

**useOrganization** - Organización actual:
```tsx
const { organization, stats, config } = useOrganization();
```

**useUsers** - Gestión de usuarios:
```tsx
const { users, updateRole, toggleActive } = useUsers();
```

**useRole** - Información de rol:
```tsx
const { role, isAdmin, permissions } = useRole();
```

---

## Webhooks de Clerk

Endpoint: `/api/webhooks/clerk`

### Eventos Manejados

1. **`user.created`** - Cuando se crea un usuario en Clerk
   - Crea registro en Convex
   - Asigna rol por defecto (primer usuario = admin, resto = cashier)

2. **`user.updated`** - Cuando se actualiza un usuario en Clerk
   - Sincroniza datos en Convex

3. **`organization.created`** - Cuando se crea una organización
   - Crea registro en Convex
   - Configura métodos de pago por defecto
   - Crea programa de fidelización por defecto

4. **`organization.updated`** - Cuando se actualiza una organización
   - Sincroniza datos en Convex

5. **`organizationMembership.created`** - Cuando un usuario se une a una org
   - Crea registro de usuario en Convex para esa organización

### Configuración

Variables de entorno requeridas:
```env
CLERK_WEBHOOK_SECRET=whsec_...
```

---

## Multi-tenancy

### Aislamiento de Datos

- Cada organización tiene sus propios datos
- Todas las queries filtran por `orgId`
- Los usuarios pueden pertenecer a múltiples organizaciones
- Los datos son completamente independientes entre organizaciones

### Primer Usuario

- El primer usuario de una organización se convierte en **admin** automáticamente
- Usuarios subsecuentes son **cashier** por defecto
- El admin puede cambiar roles posteriormente

### Protecciones

1. **No se puede eliminar el último admin**
2. **No se puede auto-eliminar**
3. **No se puede auto-desactivar**
4. **Solo admins pueden eliminar usuarios**
5. **Solo managers y admins pueden cambiar roles**

---

## Flujo de Autenticación

### 1. Usuario Nuevo

```
Usuario → Sign Up (Clerk)
  → Webhook: user.created
  → Convex: crea usuario
  → Asigna rol por defecto
  → Redirige a org-selection
```

### 2. Usuario se une a Organización

```
Usuario → Clerk: join organization
  → Webhook: organizationMembership.created
  → Convex: crea registro de usuario para esa org
  → Usuario puede acceder al dashboard
```

### 3. Acceso al Dashboard

```
Usuario → Login (Clerk)
  → Middleware: verifica autenticación
  → Middleware: verifica organización
  → Convex: obtiene usuario y permisos
  → Renderiza dashboard según rol
```

---

## Ejemplos de Uso

### Proteger una Ruta Completa

```tsx
// app/(dashboard)/admin/page.tsx
export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={["admin"]} redirectTo="/">
      <AdminContent />
    </RoleGuard>
  );
}
```

### Mostrar Contenido Condicional

```tsx
export function UserActions({ userId }) {
  const { canManageUsers } = useCurrentUser();

  return (
    <div>
      <ViewUserButton userId={userId} />

      {canManageUsers && (
        <>
          <EditUserButton userId={userId} />
          <DeleteUserButton userId={userId} />
        </>
      )}
    </div>
  );
}
```

### Verificar Permisos en Mutation

```tsx
export function ProductForm() {
  const { canManageProducts } = useCurrentUser();
  const createProduct = useMutation(api.products.create);

  const handleSubmit = async (data) => {
    if (!canManageProducts) {
      toast.error("No tienes permisos para crear productos");
      return;
    }

    await createProduct(data);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Backend: Proteger Query/Mutation

```ts
export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    if (!isManager(auth)) {
      throw new Error("Only managers can delete products");
    }

    // ... lógica de eliminación
  },
});
```

---

## Seguridad

### Mejores Prácticas

1. ✅ **Siempre usar `requireAuth()`** en todas las mutations y queries
2. ✅ **Filtrar por orgId** en todas las queries
3. ✅ **Verificar ownership** antes de modificar datos
4. ✅ **Usar soft deletes** para auditoría
5. ✅ **Validar inputs** con Zod
6. ✅ **Nunca confiar solo en el frontend** - siempre validar en backend
7. ✅ **Logs de auditoría** para acciones críticas

### Prevención de Ataques

- **SQL Injection**: No aplica (Convex no usa SQL)
- **XSS**: React escapa automáticamente
- **CSRF**: Clerk maneja los tokens
- **Privilege Escalation**: Verificación de roles en backend
- **Data Leaks**: Aislamiento por orgId

---

## Configuración Inicial

### 1. Configurar Clerk

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### 2. Configurar Webhooks en Clerk

1. Ir a Clerk Dashboard → Webhooks
2. Agregar endpoint: `https://tu-dominio.com/api/webhooks/clerk`
3. Seleccionar eventos:
   - `user.created`
   - `user.updated`
   - `organization.created`
   - `organization.updated`
   - `organizationMembership.created`

### 3. Crear Primera Organización

1. El primer usuario debe crear una organización en Clerk
2. El webhook creará automáticamente la organización en Convex
3. El usuario se convertirá en admin automáticamente

---

## Troubleshooting

### Usuario no aparece en la base de datos

- Verificar que los webhooks estén configurados
- Revisar logs de `/api/webhooks/clerk`
- Verificar que `CLERK_WEBHOOK_SECRET` sea correcto

### Usuario no tiene permisos

- Verificar el rol asignado con `useCurrentUser()`
- Revisar en Convex que el usuario exista
- Verificar que esté en la organización correcta

### No se puede cambiar rol

- Solo managers y admins pueden cambiar roles
- No se puede quitar el rol admin del último admin
- Verificar permisos con `canManageUsers`

---

## Próximos Pasos

- [ ] Implementar sistema completo de invitaciones por email
- [ ] Agregar logs de auditoría
- [ ] Implementar 2FA (Clerk lo soporta)
- [ ] Dashboard de actividad de usuarios
- [ ] Permisos granulares por feature

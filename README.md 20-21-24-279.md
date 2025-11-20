# Echo SaaS - Documentación Completa del Proyecto

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
4. [Estructura del Repositorio](#estructura-del-repositorio)
5. [Configuración y Desarrollo](#configuración-y-desarrollo)
6. [Sistema de Autenticación](#sistema-de-autenticación)
7. [Backend con Convex](#backend-con-convex)
8. [Frontend](#frontend)
9. [Componentes Compartidos](#componentes-compartidos)
10. [Flujos de Trabajo Comunes](#flujos-de-trabajo-comunes)
11. [Variables de Entorno](#variables-de-entorno)

---

## 📖 Descripción General

**Echo SaaS** es una aplicación SaaS construida como un **monorepo con Turborepo**. El proyecto incluye dos aplicaciones Next.js que comparten un backend centralizado con Convex, autenticación mediante Clerk, y una biblioteca de componentes basada en shadcn/ui.

### Características Principales

- ✅ Arquitectura de monorepo escalable
- ✅ Backend serverless con Convex
- ✅ Autenticación completa con soporte para organizaciones
- ✅ Componentes UI reutilizables
- ✅ TypeScript con type-safety completo
- ✅ Hot Module Replacement (HMR) con Turbopack

---

## 🛠 Tecnologías Utilizadas

### Build System y Gestión de Paquetes

- **Turborepo** (v2.5.5) - Sistema de build para monorepos
- **pnpm** (v10.4.1) - Gestor de paquetes rápido y eficiente
- **pnpm workspaces** - Gestión de dependencias compartidas

### Frontend

- **Next.js 15** - Framework React con App Router
- **React 19** - Biblioteca UI
- **Turbopack** - Bundler de próxima generación para desarrollo
- **TypeScript 5.7.3** - Superset tipado de JavaScript

### Backend

- **Convex 1.25.4** - Backend serverless con base de datos en tiempo real
- Funciones serverless (queries, mutations, actions)
- Sincronización de datos en tiempo real

### Autenticación

- **Clerk v6.34.2** - Autenticación y gestión de usuarios
- Soporte para organizaciones
- JWT para autenticación con Convex

### UI y Estilos

- **shadcn/ui** - Componentes UI accesibles y personalizables
- **Tailwind CSS v4** - Framework CSS utility-first
- **Radix UI** - Primitivas UI accesibles
- **class-variance-authority** - Gestión de variantes de componentes
- **next-themes** - Soporte para temas (dark/light mode)
- **Lucide React** - Iconos

### Utilidades

- **zod** - Validación de schemas
- **clsx** - Utilidad para classNames condicionales
- **tailwind-merge** - Fusión inteligente de clases Tailwind

### Herramientas de Desarrollo

- **Prettier** - Formateo de código
- **ESLint** - Linting
- **TypeScript** - Verificación de tipos

---

## 🏗 Arquitectura del Proyecto

### Arquitectura de Monorepo

El proyecto utiliza una arquitectura de monorepo con **Turborepo**, que permite:

- 🔄 Builds incrementales y caching inteligente
- ⚡ Ejecución paralela de tareas
- 📦 Compartir código entre aplicaciones
- 🎯 Gestión centralizada de dependencias

### Patrón de Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    Turborepo Root                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Web App    │  │  Widget App  │  │   Packages   │   │
│  │  (Next.js)   │  │  (Next.js)   │  │              │   │
│  │  Port 3000   │  │  Port 3001   │  │  - Backend   │   │
│  │              │  │              │  │  - UI        │   │
│  │  + Clerk     │  │  Sin Auth    │  │  - Math      │   │
│  │  + Auth Flow │  │              │  │  - Config    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                  │                  │         │
│         └──────────────────┴──────────────────┘         │
│                            │                            │
│                    ┌───────▼────────┐                   │
│                    │  Convex Backend│                   │
│                    │  (Serverless)  │                   │
│                    └────────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Datos

1. **Cliente** → Realiza una query/mutation
2. **Convex Provider** → Gestiona la comunicación con Convex
3. **Clerk Auth** → Valida el JWT del usuario
4. **Convex Backend** → Procesa la función y accede a la DB
5. **Respuesta** → Datos sincronizados en tiempo real al cliente

---

## 📁 Estructura del Repositorio

```
echo-saas/
│
├── apps/                              # Aplicaciones del monorepo
│   ├── web/                          # Aplicación principal (puerto 3000)
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── (auth)/              # Grupo de rutas de autenticación
│   │   │   │   ├── sign-in/         # Página de inicio de sesión
│   │   │   │   ├── sign-up/         # Página de registro
│   │   │   │   ├── org-selection/   # Selección de organización
│   │   │   │   └── layout.tsx       # Layout para rutas de auth
│   │   │   ├── (dashboard)/         # Grupo de rutas protegidas
│   │   │   │   ├── page.tsx         # Dashboard principal
│   │   │   │   └── layout.tsx       # Layout con guards de auth
│   │   │   └── layout.tsx           # Root layout con providers
│   │   ├── components/              # Componentes de la app
│   │   │   └── providers.tsx        # Convex + Clerk providers
│   │   ├── modules/                 # Módulos de features
│   │   │   └── auth/                # Módulo de autenticación
│   │   │       └── ui/
│   │   │           ├── components/  # Auth guards
│   │   │           ├── layouts/     # Layouts de auth
│   │   │           └── views/       # Vistas de auth
│   │   ├── middleware.ts            # Middleware de Clerk
│   │   └── package.json
│   │
│   └── widget/                       # App widget embebible (puerto 3001)
│       ├── app/
│       │   ├── layout.tsx
│       │   └── page.tsx
│       └── package.json
│
├── packages/                         # Paquetes compartidos
│   ├── backend/                     # Backend Convex compartido
│   │   └── convex/
│   │       ├── _generated/          # Tipos auto-generados
│   │       ├── auth.config.ts       # Configuración de Clerk
│   │       ├── schema.ts            # Schema de la base de datos
│   │       └── users.ts             # Funciones de usuarios
│   │
│   ├── ui/                          # Librería de componentes
│   │   └── src/
│   │       ├── components/          # Componentes shadcn/ui
│   │       │   ├── button.tsx
│   │       │   └── input.tsx
│   │       ├── hooks/               # Custom hooks
│   │       ├── lib/                 # Utilidades (cn, etc.)
│   │       └── styles/              # Estilos globales
│   │           └── globals.css
│   │
│   ├── math/                        # Utilidades compartidas (ejemplo)
│   │   └── src/
│   │       ├── add.ts
│   │       └── subtract.ts
│   │
│   ├── eslint-config/               # Configuración ESLint compartida
│   ├── typescript-config/           # Configuración TS compartida
│
├── turbo.json                       # Configuración de Turborepo
├── pnpm-workspace.yaml              # Configuración de workspaces
├── package.json                     # Root package.json
├── CLAUDE.md                        # Guía para Claude Code
└── DOCUMENTACION.md                 # Esta documentación
```

---

## ⚙️ Configuración y Desarrollo

### Requisitos Previos

- **Node.js** ≥ 20
- **pnpm** v10.4.1

### Instalación

```bash
# Instalar dependencias
pnpm install

# Configurar el backend de Convex (solo la primera vez)
cd packages/backend
pnpm setup
cd ../..
```

### Comandos de Desarrollo

#### Comandos a Nivel Root (Turborepo)

```bash
# Iniciar todos los servicios en modo desarrollo
pnpm dev

# Construir todas las aplicaciones y paquetes
pnpm build

# Ejecutar linting en todo el monorepo
pnpm lint

# Formatear código con Prettier
pnpm format
```

#### Comandos de la Aplicación Web (apps/web)

```bash
cd apps/web

# Iniciar servidor de desarrollo (puerto 3000)
pnpm dev

# Construir para producción
pnpm build

# Iniciar servidor de producción
pnpm start

# Ejecutar linting
pnpm lint

# Auto-corregir problemas de linting
pnpm lint:fix

# Verificar tipos sin construir
pnpm typecheck
```

#### Comandos de la Aplicación Widget (apps/widget)

```bash
cd apps/widget

# Iniciar servidor de desarrollo (puerto 3001)
pnpm dev

# Construir para producción
pnpm build

# Iniciar servidor de producción
pnpm start
```

#### Comandos del Backend (packages/backend)

```bash
cd packages/backend

# Iniciar Convex en modo desarrollo con hot reload
pnpm dev

# Inicializar backend de Convex (primera vez)
pnpm setup
```

### Agregar Componentes shadcn/ui

```bash
# Desde la raíz del proyecto
pnpm dlx shadcn@latest add <nombre-componente> -c apps/web

# Ejemplos:
pnpm dlx shadcn@latest add button -c apps/web
pnpm dlx shadcn@latest add dialog -c apps/web
```

Los componentes se instalan en `packages/ui/src/components` para uso compartido en todo el workspace.

---

## 🔐 Sistema de Autenticación

### Flujo de Autenticación

La aplicación utiliza **Clerk** para gestionar la autenticación con soporte completo para organizaciones:

```
┌─────────────────────────────────────────────────────────┐
│                   Flujo de Usuario                       │
└─────────────────────────────────────────────────────────┘

1. Usuario visita la aplicación
   │
   ├─→ No autenticado ─→ /sign-in o /sign-up
   │                     │
   │                     └─→ Clerk maneja la autenticación
   │                         │
   └─────────────────────────┘

2. Usuario autenticado (userId ✓)
   │
   ├─→ No tiene organización ─→ /org-selection
   │                            │
   │                            └─→ Selecciona/crea org
   │                                │
   └────────────────────────────────┘

3. Usuario autenticado con organización (userId ✓, orgId ✓)
   │
   └─→ Acceso al dashboard y rutas protegidas
```

### Middleware de Clerk

El archivo `middleware.ts` en la aplicación web implementa la lógica de protección de rutas:

```typescript
// Rutas públicas (sin autenticación)
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

// Rutas que no requieren organización
const isOrgFreeRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/org-selection(.*)",
]);
```

**Lógica del Middleware:**

1. Si la ruta NO es pública → Requiere autenticación (`auth.protect()`)
2. Si el usuario está autenticado pero NO tiene organización → Redirige a `/org-selection`
3. Solo permite acceso al dashboard si el usuario tiene `userId` Y `orgId`

### Guards de Autenticación

La aplicación implementa guards a nivel de layout para proteger rutas:

#### AuthGuard

Ubicación: `apps/web/modules/auth/ui/components/auth-guard.tsx`

- Verifica que el usuario esté autenticado
- Usado en el layout del dashboard

#### OrganizationGuard

Ubicación: `apps/web/modules/auth/ui/components/organization-guard.tsx`

- Verifica que el usuario pertenezca a una organización
- Usado en conjunto con AuthGuard

### Integración Clerk + Convex

**En el Frontend (apps/web/components/providers.tsx):**

```typescript
<ClerkProvider>
  <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
    {children}
  </ConvexProviderWithClerk>
</ClerkProvider>
```

**En el Backend (packages/backend/convex/auth.config.ts):**

```typescript
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
};
```

Clerk emite un JWT que Convex valida para autenticar las requests.

---

## 🗄 Backend con Convex

### ¿Qué es Convex?

Convex es una plataforma de backend serverless que proporciona:

- ⚡ Base de datos en tiempo real
- 🔄 Sincronización automática de datos
- 🛡️ Type-safety completo
- 📡 Funciones serverless (queries, mutations, actions)
- 🔐 Autenticación integrada

### Estructura del Backend

```
packages/backend/convex/
├── _generated/          # Tipos auto-generados (NO editar)
├── auth.config.ts       # Configuración de autenticación
├── schema.ts            # Schema de la base de datos
└── users.ts             # Funciones de ejemplo
```

### Schema de la Base de Datos

**Archivo:** `packages/backend/convex/schema.ts`

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
  }),
});
```

### Tipos de Funciones

#### 1. Queries (Lectura)

```typescript
import { query } from "./_generated/server";

export const getMany = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users;
  },
});
```

- Solo lectura de datos
- Se ejecutan reactivamente (se actualizan automáticamente)
- Se usan con el hook `useQuery` en el frontend

#### 2. Mutations (Escritura)

```typescript
import { mutation } from "./_generated/server";

export const add = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userId = await ctx.db.insert("users", {
      name: "Emiliano",
    });

    return userId;
  },
});
```

- Modifican datos (insert, update, delete)
- Pueden leer datos también
- Se usan con el hook `useMutation` en el frontend

#### 3. Actions (Operaciones Externas)

Actions se usan para llamadas a APIs externas, operaciones que no pueden ser determinísticas, etc.

### Uso en el Frontend

**Importar las funciones:**

```typescript
import { api } from "@workspace/backend/_generated/api";
import { useQuery, useMutation } from "convex/react";
```

**Usar queries:**

```typescript
const users = useQuery(api.users.getMany);
// users se actualiza automáticamente
```

**Usar mutations:**

```typescript
const addUser = useMutation(api.users.add);

// Llamar la mutation
const handleClick = () => {
  addUser(); // fire and forget

  // O esperar el resultado
  addUser().then((result) => console.log(result));
};
```

### Autenticación en Funciones

Todas las funciones de Convex tienen acceso a `ctx.auth`:

```typescript
const identity = await ctx.auth.getUserIdentity();

if (identity === null) {
  throw new Error("Not authenticated");
}

const orgId = identity.orgId as string;
```

### Generación de Tipos

Los tipos se generan automáticamente cuando ejecutas:

```bash
pnpm dev
```

Convex observa los cambios en las funciones y regenera los tipos en `convex/_generated/`.

---

## 💻 Frontend

### Aplicación Web (apps/web)

#### Arquitectura de Rutas

La aplicación utiliza el **App Router** de Next.js 15 con grupos de rutas:

**Rutas de Autenticación (auth):**

- `/sign-in` - Inicio de sesión
- `/sign-up` - Registro
- `/org-selection` - Selección de organización

**Rutas Protegidas (dashboard):**

- `/` - Dashboard principal (requiere auth + org)

#### Arquitectura Modular

La aplicación organiza las features en módulos bajo `apps/web/modules/`:

```
modules/
└── auth/
    └── ui/
        ├── components/      # AuthGuard, OrganizationGuard
        ├── layouts/         # AuthLayout
        └── views/           # Vistas de auth
```

**Beneficios:**

- 📦 Aislamiento de features
- 🔍 Código más fácil de encontrar
- 🧹 Mejor organización
- ♻️ Reutilización de lógica

#### Providers

**Archivo:** `apps/web/components/providers.tsx`

Configura los providers necesarios:

- `ClerkProvider` - Autenticación
- `ConvexProviderWithClerk` - Backend + Auth

#### Ejemplo de Página

**Dashboard:** `apps/web/app/(dashboard)/page.tsx`

```typescript
"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

export default function Page() {
  const users = useQuery(api.users.getMany);
  const addUser = useMutation(api.users.add);

  return (
    <div>
      <UserButton />
      <OrganizationSwitcher hidePersonal />
      <Button onClick={() => addUser()}>Add</Button>
      {JSON.stringify(users, null, 2)}
    </div>
  );
}
```

### Aplicación Widget (apps/widget)

La aplicación widget es una versión simplificada sin autenticación:

```typescript
"use client";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

export default function Page() {
  const users = useQuery(api.users.getMany);

  return (
    <div>
      <p>Widget APP</p>
      {JSON.stringify(users, null, 2)}
    </div>
  );
}
```

**Características:**

- Puerto 3001
- Sin autenticación
- Comparte el mismo backend Convex
- Diseñada para ser embebida

---

## 🎨 Componentes Compartidos

### Paquete UI (packages/ui)

El paquete UI contiene todos los componentes compartidos basados en shadcn/ui.

#### Estructura

```
packages/ui/src/
├── components/          # Componentes UI
│   ├── button.tsx
│   └── input.tsx
├── hooks/              # Custom hooks compartidos
├── lib/                # Utilidades
│   └── utils.ts        # Función cn() para classNames
└── styles/
    └── globals.css     # Estilos globales + Tailwind
```

#### Exportaciones

**Archivo:** `packages/ui/package.json`

```json
{
  "exports": {
    "./globals.css": "./src/styles/globals.css",
    "./postcss.config": "./postcss.config.mjs",
    "./lib/*": "./src/lib/*.ts",
    "./components/*": "./src/components/*.tsx",
    "./hooks/*": "./src/hooks/*.ts"
  }
}
```

#### Uso de Componentes

```typescript
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
```

#### Componentes Disponibles

- **Button** - Botón con múltiples variantes
- **Input** - Campo de entrada
- Y más componentes de shadcn/ui según necesidad

#### Añadir Nuevos Componentes

```bash
pnpm dlx shadcn@latest add <componente> -c apps/web
```

Los componentes se agregan automáticamente a `packages/ui/src/components`.

### Estilos Globales

**Archivo:** `packages/ui/src/styles/globals.css`

Contiene:

- Configuración de Tailwind CSS v4
- Variables CSS personalizadas
- Estilos base

**Importación:**

```typescript
import "@workspace/ui/globals.css";
```

---

## 🔧 Flujos de Trabajo Comunes

### 1. Crear una Nueva Función de Convex

**Paso 1:** Crear archivo en `packages/backend/convex/`

```bash
touch packages/backend/convex/posts.ts
```

**Paso 2:** Definir schema en `schema.ts`

```typescript
export default defineSchema({
  posts: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.string(),
  }),
});
```

**Paso 3:** Crear funciones en el nuevo archivo

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("posts").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db.insert("posts", {
      ...args,
      authorId: identity.subject,
    });
  },
});
```

**Paso 4:** Usar en el frontend

```typescript
import { api } from "@workspace/backend/_generated/api";

const posts = useQuery(api.posts.list);
const createPost = useMutation(api.posts.create);
```

### 2. Crear una Nueva Ruta Protegida

**Paso 1:** Crear la ruta en `apps/web/app/(dashboard)/`

```bash
mkdir -p apps/web/app/(dashboard)/settings
touch apps/web/app/(dashboard)/settings/page.tsx
```

**Paso 2:** Implementar la página

```typescript
export default function SettingsPage() {
  return <div>Settings Page</div>;
}
```

La ruta heredará automáticamente los guards de autenticación del layout `(dashboard)`.

### 3. Crear una Ruta Pública

**Paso 1:** Crear la ruta fuera de `(dashboard)`

```bash
mkdir -p apps/web/app/about
touch apps/web/app/about/page.tsx
```

**Paso 2:** Agregar al matcher de rutas públicas en `middleware.ts`

```typescript
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/about", // Nueva ruta pública
]);
```

### 4. Crear un Nuevo Workspace Package

**Paso 1:** Crear directorio

```bash
mkdir -p packages/utils/src
```

**Paso 2:** Crear `package.json`

```json
{
  "name": "@workspace/utils",
  "type": "module",
  "exports": {
    "./string": "./src/string.ts"
  },
  "devDependencies": {
    "@workspace/typescript-config": "workspace:*",
    "typescript": "latest"
  }
}
```

**Paso 3:** Crear funciones

```typescript
// packages/utils/src/string.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

**Paso 4:** Agregar a las dependencias de las apps

```json
{
  "dependencies": {
    "@workspace/utils": "workspace:*"
  }
}
```

**Paso 5:** Usar en la app

```typescript
import { capitalize } from "@workspace/utils/string";
```

### 5. Agregar un Módulo de Feature

**Paso 1:** Crear estructura del módulo

```bash
mkdir -p apps/web/modules/blog/{ui,logic,types}
mkdir -p apps/web/modules/blog/ui/{components,views,layouts}
```

**Paso 2:** Crear componentes del módulo

```
modules/blog/
├── ui/
│   ├── components/      # Componentes del blog
│   ├── views/          # Vistas principales
│   └── layouts/        # Layouts del blog
├── logic/              # Lógica de negocio
└── types/              # Tipos TypeScript
```

---

## 🔑 Variables de Entorno

### Aplicación Web (apps/web)

Crear archivo `.env.local`:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://tu-proyecto.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Backend Convex (packages/backend)

Configurar en el **Convex Dashboard** (https://dashboard.convex.dev):

```
CLERK_JWT_ISSUER_DOMAIN=tu-dominio.clerk.accounts.dev
```

**Obtener el CLERK_JWT_ISSUER_DOMAIN:**

1. Ir a Clerk Dashboard
2. Navegar a "JWT Templates"
3. Crear/seleccionar template "convex"
4. Copiar el Issuer Domain

### Aplicación Widget (apps/widget)

Crear archivo `.env.local`:

```env
# Convex (compartido con web)
NEXT_PUBLIC_CONVEX_URL=https://tu-proyecto.convex.cloud
```

---

## 📝 Notas Adicionales

### Configuración de Turborepo

**Archivo:** `turbo.json`

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Workspaces de pnpm

**Archivo:** `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Versionado de Node

Requiere Node.js ≥ 20 (especificado en `package.json`)

---

## 🚀 Despliegue

### Desplegar Backend Convex

```bash
cd packages/backend
npx convex deploy
```

### Desplegar Frontend

Las aplicaciones Next.js pueden desplegarse en:

- **Vercel** (recomendado)
- **Netlify**
- **Railway**
- Cualquier plataforma que soporte Next.js

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables de entorno en tu plataforma de hosting.

---

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🤝 Contribuir

Para contribuir al proyecto:

1. Crear una nueva rama
2. Hacer cambios
3. Ejecutar `pnpm lint` y `pnpm typecheck`
4. Crear un Pull Request

---

**Última actualización:** Noviembre 2025

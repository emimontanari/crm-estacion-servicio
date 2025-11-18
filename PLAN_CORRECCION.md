# Plan de Corrección de Errores - CRM Estación de Servicio

**Fecha de creación:** 2025-11-18
**Basado en:** REPORTE_ERRORES.md
**Estado:** Por iniciar

---

## 🎯 Objetivo

Corregir todos los errores críticos identificados en el test exhaustivo para que la aplicación pueda compilar, ejecutar tests y funcionar correctamente.

---

## 📋 Tareas Ordenadas por Prioridad

### 🔴 FASE 1: Errores Críticos (DEBE completarse primero)

#### Tarea 1.1: Corregir error en jest.setup.ts
**Archivos:** `apps/web/jest.setup.ts`
**Estimación:** 15 minutos
**Prioridad:** CRÍTICA

**Pasos:**
1. Abrir `apps/web/jest.setup.ts`
2. Reemplazar todos los componentes JSX con funciones que retornen null o strings:
   - Línea 41: `UserButton: () => 'UserButton'`
   - Línea 42: `OrganizationSwitcher: () => 'OrgSwitcher'`
   - Líneas 59-62: Reemplazar JSX de Recharts
3. Alternativamente, agregar `jsx: "react-jsx"` al tsconfig o excluir jest.setup.ts
4. Verificar con: `cd apps/web && pnpm typecheck`
5. Verificar tests: `cd apps/web && pnpm test`

**Criterio de éxito:**
- ✅ `pnpm typecheck` pasa sin errores en apps/web
- ✅ `pnpm test` ejecuta los tests sin errores de sintaxis

---

#### Tarea 1.2: Corregir problema de Google Fonts en Widget
**Archivos:** `apps/widget/app/layout.tsx`
**Estimación:** 20 minutos
**Prioridad:** CRÍTICA

**Opción A: Usar fuentes locales (RECOMENDADO)**

**Pasos:**
1. Descargar fuentes Geist localmente o usar fuentes del sistema
2. Modificar `apps/widget/app/layout.tsx`:
   ```typescript
   // Opción 1: Usar fuentes del sistema
   const fontSans = {
     variable: "--font-sans",
     className: "font-sans"
   }

   const fontMono = {
     variable: "--font-mono",
     className: "font-mono"
   }

   // Opción 2: Usar localFont de next/font/local
   import localFont from 'next/font/local'

   const fontSans = localFont({
     src: './fonts/GeistVF.woff',
     variable: '--font-sans',
   })
   ```
3. Actualizar CSS para incluir fallbacks
4. Verificar con: `cd apps/widget && pnpm build`

**Opción B: Configurar offline fonts**

**Pasos:**
1. Agregar configuración en `next.config.mjs` para usar fallback
2. Configurar timeout y retry para Google Fonts

**Criterio de éxito:**
- ✅ `pnpm build` completa exitosamente para widget
- ✅ No hay errores de red al buildear

---

#### Tarea 1.3: Crear archivo .env.local con variables de entorno
**Archivos:** `apps/web/.env.local`, `packages/backend/.env.local`
**Estimación:** 30 minutos
**Prioridad:** CRÍTICA

**Pasos:**

1. **Para apps/web:**
   ```bash
   cd apps/web
   cp ../../.env.example .env.local
   ```

2. **Editar .env.local y agregar valores de prueba:**
   ```env
   # Stripe - Claves de prueba
   STRIPE_SECRET_KEY=sk_test_51...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_CURRENCY=usd
   NEXT_PUBLIC_STRIPE_COUNTRY=US

   # Clerk - Claves de prueba
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   CLERK_WEBHOOK_SECRET=whsec_...

   # Convex - URL de desarrollo
   CONVEX_DEPLOYMENT=dev:...
   NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud

   # Sentry (opcional para desarrollo)
   SENTRY_AUTH_TOKEN=...
   ```

3. **Para packages/backend:**
   ```bash
   cd packages/backend
   # Crear .env con variables de Convex si es necesario
   echo "CONVEX_DEPLOYMENT=dev:..." > .env
   ```

4. **Documentar variables:**
   - Crear README con instrucciones de cómo obtener cada clave
   - Marcar cuáles son opcionales vs requeridas

**Criterio de éxito:**
- ✅ Archivo `.env.local` existe en `apps/web`
- ✅ Todas las variables requeridas tienen valores (aunque sean mock)
- ✅ La app puede iniciar sin errores de variables faltantes

---

### 🟡 FASE 2: Limpieza de Código (RECOMENDADO)

#### Tarea 2.1: Eliminar uso de 'any' types
**Archivos:** Múltiples (75 instancias)
**Estimación:** 2-3 horas
**Prioridad:** MEDIA

**Estrategia:**
1. Priorizar archivos con más instancias de `any`
2. Crear tipos específicos para cada caso
3. Usar `unknown` cuando el tipo sea verdaderamente desconocido

**Top 5 archivos a corregir primero:**
1. `app/(dashboard)/inventario/productos/[id]/page.tsx` (7 any)
2. `app/(dashboard)/reportes/ventas/page.tsx` (8 any)
3. `app/(dashboard)/ventas/page.tsx` (7 any)
4. `app/api/webhooks/clerk/route.ts` (7 any)
5. `components/notifications/*.tsx` (6 any combinados)

**Ejemplo de corrección:**
```typescript
// ❌ Antes
const handleSubmit = (data: any) => { ... }

// ✅ Después
interface FormData {
  name: string;
  price: number;
  // ... otros campos
}
const handleSubmit = (data: FormData) => { ... }
```

**Criterio de éxito:**
- ✅ Reducir warnings de `@typescript-eslint/no-explicit-any` a menos de 10
- ✅ Todos los handlers y funciones tienen tipos específicos

---

#### Tarea 2.2: Eliminar imports y variables no utilizados
**Archivos:** Múltiples (20 instancias)
**Estimación:** 30 minutos
**Prioridad:** MEDIA

**Pasos:**
1. Ejecutar `pnpm lint:fix` en apps/web para auto-corregir algunos
2. Revisar manualmente los que quedan
3. Eliminar imports y variables marcadas como no utilizadas

**Archivos específicos:**
- `app/(dashboard)/clientes/page.tsx`: Eliminar CustomerCard, MoreHorizontal, Edit, Trash
- `app/(dashboard)/configuracion/page.tsx`: Eliminar Button, Link
- `app/(dashboard)/fidelizacion/page.tsx`: Eliminar LoyaltyBadge, Users
- `app/(dashboard)/ventas/[id]/page.tsx`: Usar o eliminar router, useMutation, RefreshCw
- `app/(dashboard)/ventas/page.tsx`: Eliminar Badge, User
- Y otros...

**Criterio de éxito:**
- ✅ 0 warnings de `@typescript-eslint/no-unused-vars`
- ✅ Código más limpio y mantenible

---

#### Tarea 2.3: Agregar variables de entorno a turbo.json
**Archivos:** `turbo.json`
**Estimación:** 10 minutos
**Prioridad:** MEDIA

**Pasos:**
1. Abrir `turbo.json`
2. Agregar sección de `env` o actualizar existente:
   ```json
   {
     "$schema": "https://turbo.build/schema.json",
     "globalEnv": [
       "CLERK_WEBHOOK_SECRET",
       "STRIPE_WEBHOOK_SECRET",
       "STRIPE_SECRET_KEY",
       "NEXT_PUBLIC_CONVEX_URL",
       "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
       "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
     ],
     "tasks": {
       // ... resto de configuración
     }
   }
   ```

**Criterio de éxito:**
- ✅ 0 warnings de `turbo/no-undeclared-env-vars`
- ✅ Turbo puede trackear dependencias de env correctamente

---

### 🟢 FASE 3: Mejoras de Seguridad (RECOMENDADO)

#### Tarea 3.1: Agregar rel="noreferrer" a enlaces externos
**Archivos:** `app/sentry-example-page/page.tsx`
**Estimación:** 5 minutos
**Prioridad:** BAJA-MEDIA

**Pasos:**
1. Buscar todos los `<a target="_blank">`
2. Agregar `rel="noreferrer noopener"` a cada uno

**Ejemplo:**
```tsx
// ❌ Antes
<a href="https://example.com" target="_blank">Link</a>

// ✅ Después
<a href="https://example.com" target="_blank" rel="noreferrer noopener">Link</a>
```

**Criterio de éxito:**
- ✅ 0 warnings de `react/jsx-no-target-blank`
- ✅ Enlaces externos seguros contra tabnapping

---

### 🔵 FASE 4: Testing y Cobertura (OPCIONAL - Largo Plazo)

#### Tarea 4.1: Agregar tests unitarios
**Estimación:** Varias semanas (proyecto continuo)
**Prioridad:** BAJA (pero importante a largo plazo)

**Objetivos:**
- Aumentar cobertura de tests de ~0% a 60%
- Tests para componentes críticos
- Tests para funciones de negocio

**Áreas prioritarias:**
1. Módulos de autenticación
2. Componentes de ventas
3. Lógica de inventario
4. Cálculos de fidelización
5. Procesamiento de pagos

---

#### Tarea 4.2: Configurar tests E2E
**Estimación:** 2-3 días
**Prioridad:** BAJA

**Pasos:**
1. Playwright ya está instalado
2. Crear tests en carpeta `e2e/`
3. Tests para flujos críticos:
   - Login/Logout
   - Crear venta
   - Gestionar inventario
   - Procesar pago

---

## 🚀 Orden de Ejecución Recomendado

### Sprint 1 (Día 1 - Errores Críticos)
1. ✅ Instalar dependencias (Completado)
2. ⏳ Tarea 1.1: Corregir jest.setup.ts (15 min)
3. ⏳ Tarea 1.2: Corregir Google Fonts (20 min)
4. ⏳ Tarea 1.3: Crear .env.local (30 min)
5. ⏳ Verificar que build completa exitosamente

**Total estimado: ~1.5 horas**

### Sprint 2 (Día 2 - Limpieza)
6. ⏳ Tarea 2.2: Eliminar imports no utilizados (30 min)
7. ⏳ Tarea 2.3: Agregar env a turbo.json (10 min)
8. ⏳ Tarea 3.1: Fix security warnings (5 min)

**Total estimado: ~45 minutos**

### Sprint 3 (Días 3-5 - Tipos)
9. ⏳ Tarea 2.1: Eliminar any types (2-3 horas, puede dividirse)

**Total estimado: 2-3 horas distribuidas**

### Sprints futuros (Opcional)
10. ⏳ Tareas 4.1 y 4.2: Tests y cobertura

---

## ✅ Checklist de Verificación Final

Después de completar todas las tareas de FASE 1:

- [ ] `pnpm install` completa sin errores
- [ ] `pnpm lint` muestra menos de 20 warnings
- [ ] `pnpm typecheck` (en apps/web) pasa sin errores
- [ ] `pnpm test` (en apps/web) ejecuta tests exitosamente
- [ ] `pnpm build` completa para todas las apps
- [ ] `pnpm dev` inicia la app correctamente
- [ ] Archivo `.env.local` configurado con todas las variables
- [ ] Documentación actualizada con instrucciones de setup

---

## 📞 Soporte

Si encuentras problemas durante la corrección:
1. Revisar logs detallados de errores
2. Consultar documentación de Next.js 15
3. Verificar versiones de dependencias
4. Revisar issues en GitHub del proyecto

---

## 📝 Notas Adicionales

- **Respaldo:** Antes de iniciar, asegúrate de tener un commit limpio
- **Testing:** Probar cada cambio individualmente antes de continuar
- **Documentación:** Actualizar README.md con nuevas instrucciones si es necesario
- **Git:** Hacer commits pequeños y descriptivos por cada tarea completada

---

**Última actualización:** 2025-11-18
**Creado por:** Claude Code - Test Exhaustivo Automated Report

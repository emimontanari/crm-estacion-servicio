# 🚀 Nuevas Fases de Desarrollo - CRM Estación de Servicio

Este documento detalla las **nuevas fases de desarrollo** propuestas para expandir y mejorar el CRM de Estación de Servicio, basándose en un análisis exhaustivo del proyecto actual.

---

## 📊 Estado Actual del Proyecto

### Completado (60%)
- ✅ Backend completo con 69+ funciones
- ✅ Sistema de autenticación con 4 roles
- ✅ Dashboard con gráficos interactivos
- ✅ Sistema de notificaciones multicanal
- ✅ Programa de fidelización avanzado
- ✅ Integración con Stripe (75%)
- ✅ 35+ componentes UI reutilizables

### En Progreso (40%)
- 🔄 Módulos frontend (POS, Inventario, Reportes)
- 🔄 Testing (15% de cobertura)

---

## 🎯 NUEVAS FASES PROPUESTAS

---

## **FASE 11: Sistema de Turnos y Caja Diaria** 💰

### Prioridad: ALTA
### Duración Estimada: 1-2 semanas
### Dependencias: Fase 5 (Frontend Core) al 100%

### Objetivo
Implementar un sistema completo de gestión de turnos de trabajo, apertura/cierre de caja, y arqueo de efectivo para llevar un control preciso de las operaciones diarias de cada cajero.

### Funcionalidades

#### 1. Gestión de Turnos
- **Apertura de turno**: Registro de cajero, fecha/hora, monto inicial de caja
- **Cierre de turno**: Conteo de efectivo, arqueo, generación de reporte
- **Turnos múltiples**: Soporte para varios turnos por día (mañana, tarde, noche)
- **Historial de turnos**: Consulta de turnos anteriores con filtros

#### 2. Control de Caja
- **Monto inicial**: Registro del dinero base al abrir
- **Ingresos por venta**: Tracking automático de ventas del turno
- **Egresos**: Registro de gastos, retiros, devoluciones
- **Movimientos de caja**: Log completo de todas las operaciones
- **Arqueo automático**: Cálculo esperado vs real
- **Diferencias**: Alertas cuando hay faltantes o sobrantes

#### 3. Reportes de Turno
- **Resumen de ventas**: Total vendido, cantidad de transacciones
- **Desglose por método de pago**: Efectivo, tarjeta, transferencia
- **Productos vendidos**: Detalle de productos por turno
- **Combustible despachado**: Litros/galones por tipo
- **Faltantes/sobrantes**: Registro de diferencias
- **Comparativas**: Comparación entre turnos, cajeros

### Nuevas Tablas en Schema

```typescript
// shifts (turnos)
shifts: defineTable({
  orgId: v.id("organizations"),
  cashierId: v.id("users"),
  cashierName: v.string(),
  startTime: v.number(), // timestamp
  endTime: v.optional(v.number()),
  status: v.union(v.literal("open"), v.literal("closed")),
  initialCash: v.number(),
  finalCash: v.optional(v.number()),
  expectedCash: v.optional(v.number()),
  difference: v.optional(v.number()),
  notes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_org_and_cashier", ["orgId", "cashierId"])
  .index("by_org_and_status", ["orgId", "status"])
  .index("by_org_and_date", ["orgId", "startTime"]),

// cashMovements (movimientos de caja)
cashMovements: defineTable({
  orgId: v.id("organizations"),
  shiftId: v.id("shifts"),
  type: v.union(
    v.literal("initial"), // monto inicial
    v.literal("sale"), // venta
    v.literal("refund"), // devolución
    v.literal("expense"), // gasto
    v.literal("withdrawal"), // retiro
    v.literal("deposit") // depósito
  ),
  amount: v.number(),
  paymentMethod: v.optional(v.string()),
  saleId: v.optional(v.id("sales")),
  description: v.string(),
  createdBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_shift", ["shiftId"])
  .index("by_org", ["orgId"])
  .index("by_org_and_type", ["orgId", "type"]),
```

### Archivos Frontend

```
app/(dashboard)/caja/
├── page.tsx                          # Dashboard de caja actual
├── turnos/
│   ├── page.tsx                     # Lista de turnos
│   ├── abrir/page.tsx              # Abrir turno
│   ├── cerrar/page.tsx             # Cerrar turno
│   └── [id]/page.tsx               # Detalle de turno
├── movimientos/page.tsx             # Movimientos de caja
└── components/
    ├── shift-opener.tsx             # Componente para abrir turno
    ├── shift-closer.tsx             # Componente para cerrar turno
    ├── cash-count.tsx               # Conteo de efectivo
    ├── shift-summary.tsx            # Resumen de turno
    └── movements-table.tsx          # Tabla de movimientos
```

### Beneficios
- ✅ Control preciso de efectivo por cajero
- ✅ Reducción de pérdidas por faltantes
- ✅ Auditoría completa de operaciones
- ✅ Identificación de patrones y problemas
- ✅ Mayor transparencia y responsabilidad

---

## **FASE 12: Gestión Avanzada de Combustibles** ⛽

### Prioridad: ALTA
### Duración Estimada: 1.5-2 semanas
### Dependencias: Ninguna

### Objetivo
Crear un sistema especializado para la gestión de combustibles que incluya control de tanques, calibración de surtidores, lecturas diarias, y detección de pérdidas.

### Funcionalidades

#### 1. Gestión de Tanques
- **Inventario de tanques**: Capacidad, tipo de combustible, ubicación
- **Lecturas de varilla**: Registro manual de niveles
- **Lecturas automáticas**: Integración con sensores (si están disponibles)
- **Alertas de nivel bajo**: Notificaciones cuando el nivel es crítico
- **Historial de niveles**: Gráficos de consumo y reposiciones
- **Control de temperatura**: Ajuste por expansión térmica

#### 2. Gestión de Surtidores
- **Configuración de surtidores**: Número, tipo de combustible, estado
- **Lecturas diarias**: Lectura inicial y final de totalizadores
- **Calibración**: Registro de calibraciones y ajustes
- **Mantenimiento**: Programación de mantenimientos preventivos
- **Bloqueo/desbloqueo**: Control remoto de surtidores (si es posible)

#### 3. Control de Despachos
- **Registro de despachos**: Vinculación con ventas
- **Diferencias de inventario**: Detección de pérdidas o fugas
- **Reconciliación diaria**: Comparación entre ventas y consumo de tanque
- **Alertas de discrepancias**: Notificaciones cuando hay diferencias > umbral
- **Reportes de pérdidas**: Análisis de mermas y evaporación

#### 4. Recepciones de Combustible
- **Registro de entregas**: Proveedor, cantidad, fecha, factura
- **Verificación de cantidad**: Comparación entre facturado y recibido
- **Actualización automática de inventario**: Suma al tanque correspondiente
- **Documentación**: Almacenamiento de facturas y albaranes
- **Historial de proveedores**: Evaluación de proveedores

### Nuevas Tablas en Schema

```typescript
// fuelTanks (tanques de combustible)
fuelTanks: defineTable({
  orgId: v.id("organizations"),
  name: v.string(), // "Tanque 1 - Premium"
  fuelTypeId: v.id("fuelTypes"),
  capacity: v.number(), // litros
  currentLevel: v.number(), // litros
  minLevel: v.number(), // nivel mínimo antes de alerta
  location: v.optional(v.string()),
  status: v.union(v.literal("active"), v.literal("inactive"), v.literal("maintenance")),
  lastReading: v.optional(v.number()), // timestamp
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_fuel_type", ["fuelTypeId"]),

// fuelPumps (surtidores)
fuelPumps: defineTable({
  orgId: v.id("organizations"),
  number: v.string(), // "Surtidor 1"
  tankId: v.id("fuelTanks"),
  status: v.union(v.literal("active"), v.literal("inactive"), v.literal("maintenance")),
  totalizer: v.number(), // lectura del totalizador
  lastCalibration: v.optional(v.number()), // timestamp
  nextMaintenance: v.optional(v.number()), // timestamp
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_tank", ["tankId"]),

// fuelReadings (lecturas diarias)
fuelReadings: defineTable({
  orgId: v.id("organizations"),
  date: v.string(), // "2024-01-15"
  tankId: v.id("fuelTanks"),
  pumpId: v.optional(v.id("fuelPumps")),
  readingType: v.union(v.literal("tank"), v.literal("pump")),
  previousReading: v.number(),
  currentReading: v.number(),
  difference: v.number(), // litros despachados/consumidos
  temperature: v.optional(v.number()),
  notes: v.optional(v.string()),
  readBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_org_and_date", ["orgId", "date"])
  .index("by_tank", ["tankId"])
  .index("by_pump", ["pumpId"]),

// fuelDeliveries (recepciones de combustible)
fuelDeliveries: defineTable({
  orgId: v.id("organizations"),
  tankId: v.id("fuelTanks"),
  supplier: v.string(),
  invoiceNumber: v.string(),
  quantity: v.number(), // litros
  pricePerUnit: v.number(),
  totalCost: v.number(),
  deliveryDate: v.number(), // timestamp
  receivedBy: v.id("users"),
  notes: v.optional(v.string()),
  documentUrl: v.optional(v.string()), // URL del documento almacenado
  createdAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_tank", ["tankId"])
  .index("by_org_and_date", ["orgId", "deliveryDate"]),

// fuelReconciliation (reconciliación diaria)
fuelReconciliation: defineTable({
  orgId: v.id("organizations"),
  date: v.string(), // "2024-01-15"
  tankId: v.id("fuelTanks"),
  initialLevel: v.number(),
  deliveries: v.number(), // litros recibidos
  sales: v.number(), // litros vendidos (según POS)
  finalLevel: v.number(),
  expectedLevel: v.number(), // inicial + entregas - ventas
  difference: v.number(), // esperado - real
  percentageLoss: v.number(),
  status: v.union(v.literal("ok"), v.literal("minor"), v.literal("critical")),
  notes: v.optional(v.string()),
  createdBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_org_and_date", ["orgId", "date"])
  .index("by_tank", ["tankId"]),
```

### Archivos Frontend

```
app/(dashboard)/combustibles/
├── page.tsx                          # Dashboard de combustibles
├── tanques/
│   ├── page.tsx                     # Lista de tanques
│   ├── nuevo/page.tsx              # Nuevo tanque
│   ├── [id]/page.tsx               # Detalle/editar tanque
│   └── lecturas/page.tsx           # Lecturas de tanques
├── surtidores/
│   ├── page.tsx                     # Lista de surtidores
│   ├── nuevo/page.tsx              # Nuevo surtidor
│   └── [id]/page.tsx               # Detalle/editar surtidor
├── entregas/
│   ├── page.tsx                     # Lista de recepciones
│   └── nueva/page.tsx              # Nueva recepción
├── reconciliacion/
│   ├── page.tsx                     # Reconciliaciones diarias
│   └── [date]/page.tsx             # Detalle de reconciliación
└── components/
    ├── tank-gauge.tsx               # Indicador visual de nivel
    ├── pump-status.tsx              # Estado de surtidor
    ├── reading-form.tsx             # Formulario de lectura
    ├── delivery-form.tsx            # Formulario de entrega
    ├── reconciliation-chart.tsx     # Gráfico de reconciliación
    └── loss-alerts.tsx              # Alertas de pérdidas
```

### Beneficios
- ✅ Control preciso de inventario de combustibles
- ✅ Detección temprana de fugas o robos
- ✅ Optimización de pedidos a proveedores
- ✅ Reducción de pérdidas por evaporación
- ✅ Cumplimiento de normativas ambientales
- ✅ Mantenimiento preventivo de equipos

---

## **FASE 13: Gestión de Empleados y Recursos Humanos** 👥

### Prioridad: MEDIA-ALTA
### Duración Estimada: 2-3 semanas
### Dependencias: Fase 11 (Turnos)

### Objetivo
Implementar un módulo de recursos humanos para gestionar empleados, horarios, asistencia, permisos, y nómina básica.

### Funcionalidades

#### 1. Gestión de Empleados
- **Perfil completo**: Datos personales, contacto, documentos
- **Información laboral**: Puesto, salario, fecha de ingreso, departamento
- **Documentos**: Almacenamiento de contratos, certificados
- **Historial laboral**: Cambios de puesto, aumentos salariales
- **Evaluaciones de desempeño**: Registro de evaluaciones
- **Capacitaciones**: Historial de cursos y certificaciones

#### 2. Control de Asistencia
- **Registro de entrada/salida**: Check-in/out con timestamp
- **Integración con turnos**: Vinculación con sistema de turnos
- **Tardanzas**: Detección automática de retrasos
- **Ausencias**: Justificadas y no justificadas
- **Horas extras**: Registro y cálculo automático
- **Reportes de asistencia**: Por empleado, departamento, período

#### 3. Gestión de Horarios
- **Turnos rotativos**: Configuración de rotaciones
- **Horarios flexibles**: Soporte para diferentes esquemas
- **Calendario de turnos**: Vista mensual con asignaciones
- **Intercambio de turnos**: Solicitudes entre empleados
- **Guardias**: Asignación de responsables por turno

#### 4. Permisos y Vacaciones
- **Solicitud de permisos**: Workflow de aprobación
- **Días de vacaciones**: Cálculo de días disponibles
- **Licencias médicas**: Registro con documentación
- **Días personales**: Gestión de días libres
- **Historial de ausencias**: Consulta completa
- **Aprobaciones**: Sistema de aprobación multi-nivel

#### 5. Nómina Básica
- **Cálculo de salarios**: Salario base + horas extras + bonos
- **Descuentos**: Impuestos, seguro social, adelantos
- **Bonos**: Por desempeño, puntualidad, ventas
- **Recibos de pago**: Generación automática de recibos
- **Reportes fiscales**: Preparación de reportes para impuestos
- **Historial de pagos**: Registro completo de nóminas

### Nuevas Tablas en Schema

```typescript
// employees (empleados - extensión de users)
employees: defineTable({
  orgId: v.id("organizations"),
  userId: v.id("users"),
  employeeCode: v.string(), // código único
  department: v.union(v.literal("sales"), v.literal("management"), v.literal("maintenance"), v.literal("admin")),
  position: v.string(), // "Cajero", "Gerente", etc.
  hireDate: v.number(), // timestamp
  salary: v.number(),
  salaryType: v.union(v.literal("hourly"), v.literal("monthly"), v.literal("daily")),
  emergencyContact: v.object({
    name: v.string(),
    phone: v.string(),
    relationship: v.string(),
  }),
  status: v.union(v.literal("active"), v.literal("inactive"), v.literal("on_leave"), v.literal("terminated")),
  documents: v.optional(v.array(v.object({
    name: v.string(),
    type: v.string(),
    url: v.string(),
    uploadedAt: v.number(),
  }))),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_user", ["userId"])
  .index("by_org_and_code", ["orgId", "employeeCode"])
  .index("by_org_and_department", ["orgId", "department"]),

// attendance (asistencia)
attendance: defineTable({
  orgId: v.id("organizations"),
  employeeId: v.id("employees"),
  date: v.string(), // "2024-01-15"
  checkIn: v.optional(v.number()), // timestamp
  checkOut: v.optional(v.number()),
  shiftId: v.optional(v.id("shifts")),
  scheduledStart: v.number(),
  scheduledEnd: v.number(),
  hoursWorked: v.optional(v.number()),
  overtime: v.optional(v.number()),
  status: v.union(v.literal("present"), v.literal("absent"), v.literal("late"), v.literal("on_leave")),
  notes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_employee", ["employeeId"])
  .index("by_org_and_date", ["orgId", "date"]),

// schedules (horarios)
schedules: defineTable({
  orgId: v.id("organizations"),
  employeeId: v.id("employees"),
  dayOfWeek: v.number(), // 0-6 (domingo-sábado)
  startTime: v.string(), // "08:00"
  endTime: v.string(), // "16:00"
  effectiveFrom: v.number(), // timestamp
  effectiveTo: v.optional(v.number()),
  isActive: v.boolean(),
  createdAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_employee", ["employeeId"]),

// leaveRequests (solicitudes de permiso)
leaveRequests: defineTable({
  orgId: v.id("organizations"),
  employeeId: v.id("employees"),
  type: v.union(
    v.literal("vacation"),
    v.literal("sick_leave"),
    v.literal("personal"),
    v.literal("maternity"),
    v.literal("unpaid")
  ),
  startDate: v.string(),
  endDate: v.string(),
  days: v.number(),
  reason: v.string(),
  status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  approvedBy: v.optional(v.id("users")),
  approvalDate: v.optional(v.number()),
  rejectionReason: v.optional(v.string()),
  documents: v.optional(v.array(v.string())), // URLs
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_employee", ["employeeId"])
  .index("by_org_and_status", ["orgId", "status"]),

// payroll (nómina)
payroll: defineTable({
  orgId: v.id("organizations"),
  employeeId: v.id("employees"),
  period: v.string(), // "2024-01"
  baseSalary: v.number(),
  overtime: v.number(),
  bonuses: v.number(),
  deductions: v.number(),
  netPay: v.number(),
  hoursWorked: v.number(),
  paymentDate: v.number(), // timestamp
  status: v.union(v.literal("draft"), v.literal("approved"), v.literal("paid")),
  notes: v.optional(v.string()),
  receiptUrl: v.optional(v.string()),
  createdBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_employee", ["employeeId"])
  .index("by_org_and_period", ["orgId", "period"]),
```

### Archivos Frontend

```
app/(dashboard)/empleados/
├── page.tsx                          # Lista de empleados
├── nuevo/page.tsx                    # Nuevo empleado
├── [id]/
│   ├── page.tsx                     # Perfil del empleado
│   ├── asistencia/page.tsx         # Asistencia del empleado
│   ├── permisos/page.tsx           # Permisos del empleado
│   └── nomina/page.tsx             # Nómina del empleado
├── asistencia/
│   ├── page.tsx                     # Dashboard de asistencia
│   ├── registro/page.tsx           # Registro de entrada/salida
│   └── reportes/page.tsx           # Reportes de asistencia
├── horarios/
│   ├── page.tsx                     # Gestión de horarios
│   └── calendario/page.tsx         # Calendario de turnos
├── permisos/
│   ├── page.tsx                     # Lista de solicitudes
│   └── nueva/page.tsx              # Nueva solicitud
├── nomina/
│   ├── page.tsx                     # Dashboard de nómina
│   ├── generar/page.tsx            # Generar nómina
│   └── historial/page.tsx          # Historial de nóminas
└── components/
    ├── employee-card.tsx            # Tarjeta de empleado
    ├── attendance-clock.tsx         # Reloj de entrada/salida
    ├── schedule-calendar.tsx        # Calendario de horarios
    ├── leave-request-form.tsx       # Formulario de permiso
    ├── payroll-calculator.tsx       # Calculadora de nómina
    └── performance-chart.tsx        # Gráfico de desempeño
```

### Beneficios
- ✅ Automatización de procesos de RR.HH.
- ✅ Control preciso de asistencia y puntualidad
- ✅ Reducción de errores en cálculo de nómina
- ✅ Mejor planificación de recursos
- ✅ Cumplimiento de normativas laborales
- ✅ Mejora en comunicación interna

---

## **FASE 14: Sistema de Mantenimiento Preventivo** 🔧

### Prioridad: MEDIA
### Duración Estimada: 1-2 semanas
### Dependencias: Fase 12 (Combustibles)

### Objetivo
Implementar un sistema de gestión de mantenimiento preventivo y correctivo para equipos, surtidores, tanques, y vehículos de la estación.

### Funcionalidades

#### 1. Gestión de Equipos
- **Inventario de equipos**: Catálogo completo de activos
- **Fichas técnicas**: Especificaciones, manuales, garantías
- **Ubicación**: Tracking de ubicación física
- **Estado**: Operativo, en mantenimiento, fuera de servicio
- **Vida útil**: Cálculo de depreciación

#### 2. Mantenimiento Preventivo
- **Calendario de mantenimientos**: Programación automática
- **Alertas**: Notificaciones de mantenimientos próximos
- **Listas de verificación**: Checklists por tipo de equipo
- **Frecuencia**: Configuración de intervalos (días, horas de uso, km)
- **Proveedores**: Gestión de proveedores de servicio

#### 3. Mantenimiento Correctivo
- **Registro de fallas**: Reporte de problemas
- **Órdenes de trabajo**: Asignación a técnicos
- **Seguimiento**: Estados de reparación
- **Costos**: Tracking de gastos por equipo
- **Historial**: Registro completo de intervenciones

#### 4. Gestión de Repuestos
- **Inventario de repuestos**: Stock de partes y consumibles
- **Alertas de stock**: Notificaciones de repuestos bajos
- **Asociación**: Vincular repuestos con equipos
- **Proveedores**: Catálogo de proveedores de repuestos
- **Costos**: Control de gastos en repuestos

### Nuevas Tablas en Schema

```typescript
// equipment (equipos)
equipment: defineTable({
  orgId: v.id("organizations"),
  name: v.string(),
  type: v.union(
    v.literal("pump"), // surtidor
    v.literal("tank"), // tanque
    v.literal("compressor"), // compresor
    v.literal("vehicle"), // vehículo
    v.literal("pos"), // punto de venta
    v.literal("other")
  ),
  brand: v.optional(v.string()),
  model: v.optional(v.string()),
  serialNumber: v.optional(v.string()),
  purchaseDate: v.optional(v.number()),
  warrantyExpiry: v.optional(v.number()),
  location: v.string(),
  status: v.union(v.literal("operational"), v.literal("maintenance"), v.literal("out_of_service")),
  manualUrl: v.optional(v.string()),
  notes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_type", ["type"])
  .index("by_org_and_status", ["orgId", "status"]),

// maintenanceSchedules (programación de mantenimientos)
maintenanceSchedules: defineTable({
  orgId: v.id("organizations"),
  equipmentId: v.id("equipment"),
  name: v.string(), // "Cambio de filtros"
  description: v.string(),
  frequency: v.number(), // días
  frequencyType: v.union(v.literal("days"), v.literal("hours"), v.literal("kilometers")),
  lastMaintenance: v.optional(v.number()), // timestamp
  nextMaintenance: v.number(), // timestamp
  checklist: v.array(v.string()),
  isActive: v.boolean(),
  createdAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_equipment", ["equipmentId"])
  .index("by_next_maintenance", ["nextMaintenance"]),

// maintenanceRecords (registros de mantenimiento)
maintenanceRecords: defineTable({
  orgId: v.id("organizations"),
  equipmentId: v.id("equipment"),
  scheduleId: v.optional(v.id("maintenanceSchedules")),
  type: v.union(v.literal("preventive"), v.literal("corrective")),
  date: v.number(), // timestamp
  performedBy: v.string(), // técnico
  description: v.string(),
  checklistCompleted: v.optional(v.array(v.boolean())),
  partsUsed: v.optional(v.array(v.object({
    partId: v.id("spare_parts"),
    quantity: v.number(),
  }))),
  cost: v.number(),
  duration: v.optional(v.number()), // minutos
  status: v.union(v.literal("completed"), v.literal("pending"), v.literal("in_progress")),
  notes: v.optional(v.string()),
  createdBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_equipment", ["equipmentId"])
  .index("by_org_and_date", ["orgId", "date"]),

// spare_parts (repuestos)
spare_parts: defineTable({
  orgId: v.id("organizations"),
  name: v.string(),
  sku: v.string(),
  category: v.string(),
  compatibleEquipment: v.array(v.id("equipment")),
  stock: v.number(),
  minStock: v.number(),
  unitCost: v.number(),
  supplier: v.optional(v.string()),
  location: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_sku", ["sku"]),
```

### Archivos Frontend

```
app/(dashboard)/mantenimiento/
├── page.tsx                          # Dashboard de mantenimiento
├── equipos/
│   ├── page.tsx                     # Lista de equipos
│   ├── nuevo/page.tsx              # Nuevo equipo
│   └── [id]/page.tsx               # Detalle de equipo
├── programacion/
│   ├── page.tsx                     # Calendario de mantenimientos
│   └── nueva/page.tsx              # Nueva programación
├── ordenes/
│   ├── page.tsx                     # Órdenes de trabajo
│   └── nueva/page.tsx              # Nueva orden
├── repuestos/
│   ├── page.tsx                     # Inventario de repuestos
│   └── nuevo/page.tsx              # Nuevo repuesto
└── components/
    ├── equipment-card.tsx           # Tarjeta de equipo
    ├── maintenance-calendar.tsx     # Calendario de mantenimientos
    ├── work-order-form.tsx         # Formulario de orden
    ├── checklist.tsx               # Lista de verificación
    └── parts-inventory.tsx         # Inventario de repuestos
```

### Beneficios
- ✅ Reducción de fallas inesperadas
- ✅ Mayor vida útil de equipos
- ✅ Cumplimiento de normativas de seguridad
- ✅ Optimización de costos de mantenimiento
- ✅ Mejor planificación de recursos

---

## **FASE 15: Sistema de Proveedores y Compras** 🛒

### Prioridad: MEDIA
### Duración Estimada: 2 semanas
### Dependencias: Fase 4 (Inventario completo)

### Objetivo
Implementar un módulo completo de gestión de proveedores, órdenes de compra, recepciones, y cuentas por pagar.

### Funcionalidades

#### 1. Gestión de Proveedores
- **Catálogo de proveedores**: Datos completos de contacto
- **Categorización**: Por tipo de producto/servicio
- **Evaluación**: Rating y comentarios
- **Condiciones comerciales**: Plazos de pago, descuentos
- **Historial**: Compras anteriores y estadísticas
- **Documentos**: Contratos, certificaciones

#### 2. Órdenes de Compra
- **Creación de OC**: Generación automática o manual
- **Aprobación workflow**: Sistema de aprobaciones multi-nivel
- **Seguimiento**: Estado de la orden
- **Alertas**: Notificaciones de OC pendientes
- **Conversión**: De solicitud a orden a recepción

#### 3. Recepciones
- **Registro de recepciones**: Verificación de mercancía
- **Control de calidad**: Inspección y aprobación
- **Diferencias**: Registro de faltantes o sobrantes
- **Actualización de inventario**: Automática al recibir
- **Documentación**: Adjuntar albaranes y facturas

#### 4. Cuentas por Pagar
- **Registro de facturas**: Con vencimientos
- **Pagos**: Registro de pagos realizados
- **Saldos**: Control de deudas con proveedores
- **Reportes de envejecimiento**: Facturas vencidas
- **Proyecciones**: Cash flow proyectado

### Nuevas Tablas en Schema

```typescript
// suppliers (proveedores)
suppliers: defineTable({
  orgId: v.id("organizations"),
  name: v.string(),
  taxId: v.string(), // RFC, CUIT, etc.
  category: v.union(v.literal("fuel"), v.literal("store"), v.literal("maintenance"), v.literal("services")),
  contact: v.object({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
  }),
  paymentTerms: v.string(), // "30 días", "60 días", etc.
  rating: v.optional(v.number()), // 1-5
  isActive: v.boolean(),
  notes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_category", ["category"]),

// purchaseOrders (órdenes de compra)
purchaseOrders: defineTable({
  orgId: v.id("organizations"),
  orderNumber: v.string(),
  supplierId: v.id("suppliers"),
  status: v.union(
    v.literal("draft"),
    v.literal("pending_approval"),
    v.literal("approved"),
    v.literal("sent"),
    v.literal("received"),
    v.literal("cancelled")
  ),
  orderDate: v.number(),
  expectedDelivery: v.optional(v.number()),
  subtotal: v.number(),
  tax: v.number(),
  total: v.number(),
  notes: v.optional(v.string()),
  approvedBy: v.optional(v.id("users")),
  createdBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_supplier", ["supplierId"])
  .index("by_org_and_status", ["orgId", "status"]),

// purchaseOrderItems (items de OC)
purchaseOrderItems: defineTable({
  orderId: v.id("purchaseOrders"),
  productId: v.id("products"),
  productName: v.string(), // denormalizado
  quantity: v.number(),
  unitPrice: v.number(),
  subtotal: v.number(),
})
  .index("by_order", ["orderId"]),

// receptions (recepciones)
receptions: defineTable({
  orgId: v.id("organizations"),
  orderId: v.id("purchaseOrders"),
  receptionNumber: v.string(),
  receptionDate: v.number(),
  receivedBy: v.id("users"),
  status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  notes: v.optional(v.string()),
  documentUrl: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_order", ["orderId"]),

// receptionItems (items recibidos)
receptionItems: defineTable({
  receptionId: v.id("receptions"),
  orderItemId: v.id("purchaseOrderItems"),
  productId: v.id("products"),
  orderedQuantity: v.number(),
  receivedQuantity: v.number(),
  status: v.union(v.literal("ok"), v.literal("partial"), v.literal("damaged")),
  notes: v.optional(v.string()),
})
  .index("by_reception", ["receptionId"]),

// accountsPayable (cuentas por pagar)
accountsPayable: defineTable({
  orgId: v.id("organizations"),
  supplierId: v.id("suppliers"),
  invoiceNumber: v.string(),
  orderId: v.optional(v.id("purchaseOrders")),
  amount: v.number(),
  dueDate: v.number(),
  paidAmount: v.number(),
  status: v.union(v.literal("pending"), v.literal("partial"), v.literal("paid"), v.literal("overdue")),
  paymentDate: v.optional(v.number()),
  notes: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_supplier", ["supplierId"])
  .index("by_org_and_status", ["orgId", "status"]),
```

### Archivos Frontend

```
app/(dashboard)/compras/
├── page.tsx                          # Dashboard de compras
├── proveedores/
│   ├── page.tsx                     # Lista de proveedores
│   ├── nuevo/page.tsx              # Nuevo proveedor
│   └── [id]/page.tsx               # Detalle de proveedor
├── ordenes/
│   ├── page.tsx                     # Lista de órdenes
│   ├── nueva/page.tsx              # Nueva orden
│   └── [id]/page.tsx               # Detalle de orden
├── recepciones/
│   ├── page.tsx                     # Lista de recepciones
│   └── nueva/page.tsx              # Nueva recepción
├── cuentas-pagar/
│   ├── page.tsx                     # Cuentas por pagar
│   └── pago/page.tsx               # Registrar pago
└── components/
    ├── supplier-card.tsx            # Tarjeta de proveedor
    ├── purchase-order-form.tsx     # Formulario de OC
    ├── reception-form.tsx          # Formulario de recepción
    ├── payment-tracker.tsx         # Seguimiento de pagos
    └── aging-report.tsx            # Reporte de envejecimiento
```

### Beneficios
- ✅ Mejor control de compras
- ✅ Optimización de inventario
- ✅ Negociación mejorada con proveedores
- ✅ Control de cash flow
- ✅ Reducción de faltantes

---

## **FASE 16: Business Intelligence y Analytics Avanzado** 📊

### Prioridad: MEDIA
### Duración Estimada: 2-3 semanas
### Dependencias: Todas las fases de datos completadas

### Objetivo
Implementar un sistema de BI con dashboards personalizables, análisis predictivo, y visualizaciones avanzadas.

### Funcionalidades

#### 1. Dashboards Personalizables
- **Drag & drop**: Construcción visual de dashboards
- **Widgets**: Biblioteca de componentes (KPIs, gráficos, tablas)
- **Filtros globales**: Período, sucursal, categoría
- **Guardado de vistas**: Dashboards predefinidos y personalizados
- **Compartir**: Exportar y compartir dashboards

#### 2. Análisis Predictivo
- **Forecasting de ventas**: Predicción basada en históricos
- **Análisis de tendencias**: Identificación de patrones
- **Detección de anomalías**: Alertas de comportamientos inusuales
- **Segmentación de clientes**: Clustering automático
- **Análisis de churn**: Predicción de abandono de clientes

#### 3. Reportes Avanzados
- **Comparativas multi-período**: Año vs año, mes vs mes
- **Análisis de cohorts**: Comportamiento por grupos de clientes
- **Análisis de canasta**: Productos frecuentemente comprados juntos
- **Análisis de margen**: Rentabilidad por producto/categoría
- **Análisis ABC**: Clasificación de productos y clientes

#### 4. Visualizaciones Avanzadas
- **Mapas de calor**: Ventas por hora, día, producto
- **Gráficos de Sankey**: Flujo de ventas
- **Treemaps**: Distribución jerárquica
- **Gráficos de radar**: Comparativas multi-dimensionales
- **Gráficos de burbujas**: Relaciones entre 3 variables

### Nuevas Tablas en Schema

```typescript
// dashboards (dashboards personalizados)
dashboards: defineTable({
  orgId: v.id("organizations"),
  name: v.string(),
  createdBy: v.id("users"),
  isPublic: v.boolean(),
  layout: v.string(), // JSON de la configuración
  filters: v.optional(v.string()), // JSON de filtros
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_creator", ["createdBy"]),

// analyticsCache (caché de analytics)
analyticsCache: defineTable({
  orgId: v.id("organizations"),
  metricType: v.string(), // "sales_forecast", "churn_prediction", etc.
  parameters: v.string(), // JSON
  result: v.string(), // JSON
  expiresAt: v.number(),
  createdAt: v.number(),
})
  .index("by_org_and_metric", ["orgId", "metricType"])
  .index("by_expires", ["expiresAt"]),
```

### Archivos Frontend

```
app/(dashboard)/analytics/
├── page.tsx                          # Dashboard principal de analytics
├── custom/
│   ├── page.tsx                     # Dashboards personalizados
│   ├── nuevo/page.tsx              # Crear dashboard
│   └── [id]/page.tsx               # Ver/editar dashboard
├── predictivo/
│   ├── page.tsx                     # Analytics predictivo
│   ├── ventas/page.tsx             # Forecast de ventas
│   └── clientes/page.tsx           # Análisis de clientes
├── reportes-avanzados/
│   ├── page.tsx                     # Reportes avanzados
│   ├── cohortes/page.tsx           # Análisis de cohorts
│   ├── canasta/page.tsx            # Market basket analysis
│   └── abc/page.tsx                # Análisis ABC
└── components/
    ├── dashboard-builder.tsx        # Constructor de dashboards
    ├── widget-library.tsx           # Biblioteca de widgets
    ├── forecast-chart.tsx          # Gráfico de forecast
    ├── heatmap.tsx                 # Mapa de calor
    ├── sankey-diagram.tsx          # Diagrama de Sankey
    └── treemap.tsx                 # Treemap
```

### Algoritmos a Implementar

```typescript
// Forecasting simple con moving average
function forecastSales(historicalData: number[], periods: number): number[] {
  // Implementación de suavizado exponencial
}

// Segmentación de clientes (K-means)
function segmentCustomers(customers: Customer[]): CustomerSegment[] {
  // Clustering por RFM (Recency, Frequency, Monetary)
}

// Detección de anomalías
function detectAnomalies(data: number[]): Anomaly[] {
  // Z-score o IQR method
}

// Market basket analysis (Apriori algorithm)
function findAssociations(transactions: Transaction[]): Association[] {
  // Frequent itemset mining
}
```

### Beneficios
- ✅ Toma de decisiones basada en datos
- ✅ Identificación temprana de problemas
- ✅ Optimización de inventario
- ✅ Mejora en estrategias de marketing
- ✅ Maximización de rentabilidad

---

## **FASE 17: Integración con WhatsApp Business** 💬

### Prioridad: MEDIA-ALTA
### Duración Estimada: 1-2 semanas
### Dependencias: Fase 7 (Notificaciones)

### Objetivo
Integrar WhatsApp Business API para comunicación bidireccional con clientes y notificaciones automatizadas.

### Funcionalidades

#### 1. Notificaciones por WhatsApp
- **Confirmaciones de compra**: Envío automático de recibos
- **Puntos de fidelización**: Notificación de puntos ganados
- **Promociones**: Envío de ofertas personalizadas
- **Recordatorios**: Mantenimiento de vehículo, cumpleaños
- **Alertas**: Stock de productos favoritos

#### 2. Chat Bidireccional
- **Consultas de clientes**: Respuestas a preguntas frecuentes
- **Bot automatizado**: Respuestas automáticas con IA
- **Handoff a humano**: Transferencia a agente cuando es necesario
- **Historial de conversaciones**: Registro completo
- **Inbox unificado**: Panel de gestión de chats

#### 3. Funcionalidades de Autoservicio
- **Consulta de puntos**: Cliente puede consultar su saldo
- **Historial de compras**: Ver últimas compras
- **Promociones vigentes**: Consultar ofertas disponibles
- **Ubicación y horarios**: Información de la estación

#### 4. Campañas de Marketing
- **Broadcasts**: Envíos masivos segmentados
- **Listas de distribución**: Grupos por interés/segmento
- **Templates aprobados**: Plantillas certificadas por WhatsApp
- **Métricas**: Tasa de entrega, lectura, respuesta

### Nuevas Tablas en Schema

```typescript
// whatsappConversations (conversaciones)
whatsappConversations: defineTable({
  orgId: v.id("organizations"),
  customerId: v.optional(v.id("customers")),
  phoneNumber: v.string(),
  status: v.union(v.literal("active"), v.literal("closed"), v.literal("pending")),
  assignedTo: v.optional(v.id("users")),
  lastMessageAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_customer", ["customerId"])
  .index("by_org_and_status", ["orgId", "status"]),

// whatsappMessages (mensajes)
whatsappMessages: defineTable({
  conversationId: v.id("whatsappConversations"),
  messageId: v.string(), // ID de WhatsApp
  direction: v.union(v.literal("inbound"), v.literal("outbound")),
  type: v.union(v.literal("text"), v.literal("image"), v.literal("document"), v.literal("template")),
  content: v.string(),
  mediaUrl: v.optional(v.string()),
  status: v.union(v.literal("sent"), v.literal("delivered"), v.literal("read"), v.literal("failed")),
  sentBy: v.optional(v.id("users")), // si es outbound
  timestamp: v.number(),
})
  .index("by_conversation", ["conversationId"])
  .index("by_message_id", ["messageId"]),

// whatsappTemplates (plantillas)
whatsappTemplates: defineTable({
  orgId: v.id("organizations"),
  name: v.string(),
  category: v.union(v.literal("marketing"), v.literal("utility"), v.literal("authentication")),
  language: v.string(), // "es", "en", etc.
  content: v.string(),
  variables: v.array(v.string()),
  status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  whatsappTemplateId: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_org", ["orgId"]),
```

### Archivos Frontend

```
app/(dashboard)/whatsapp/
├── page.tsx                          # Dashboard de WhatsApp
├── inbox/
│   ├── page.tsx                     # Inbox de mensajes
│   └── [conversationId]/page.tsx   # Vista de conversación
├── plantillas/
│   ├── page.tsx                     # Gestión de plantillas
│   └── nueva/page.tsx              # Nueva plantilla
├── campanas/
│   ├── page.tsx                     # Campañas de WhatsApp
│   └── nueva/page.tsx              # Nueva campaña
└── components/
    ├── chat-window.tsx              # Ventana de chat
    ├── message-bubble.tsx           # Burbuja de mensaje
    ├── template-editor.tsx          # Editor de plantillas
    ├── quick-replies.tsx            # Respuestas rápidas
    └── broadcast-composer.tsx       # Compositor de broadcasts
```

### Integración Técnica

```typescript
// Convex action para enviar mensaje
export const sendWhatsAppMessage = action({
  args: {
    to: v.string(),
    message: v.string(),
    templateId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Integración con WhatsApp Business API
    const response = await fetch("https://graph.facebook.com/v17.0/PHONE_NUMBER_ID/messages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: args.to,
        type: "text",
        text: { body: args.message }
      })
    });
    // Guardar mensaje en BD
  }
});

// Webhook para recibir mensajes
export const whatsappWebhook = httpAction(async (ctx, request) => {
  const payload = await request.json();
  // Procesar mensaje entrante
  // Guardar en BD
  // Trigger respuesta automática si corresponde
});
```

### Beneficios
- ✅ Canal de comunicación preferido por clientes
- ✅ Mayor engagement que email o SMS
- ✅ Automatización de atención al cliente
- ✅ Reducción de costos operativos
- ✅ Mejor experiencia del cliente

---

## **FASE 18: Facturación Electrónica** 🧾

### Prioridad: ALTA (según país)
### Duración Estimada: 3-4 semanas
### Dependencias: Fase 3 (Ventas completo)

### Objetivo
Implementar sistema de facturación electrónica cumpliendo con las normativas fiscales locales (AFIP Argentina, SAT México, DIAN Colombia, etc.).

### Funcionalidades

#### 1. Generación de Comprobantes
- **Tipos de comprobantes**: Facturas A, B, C, notas de crédito, débito
- **Numeración automática**: Control de secuencias
- **Validación de CUIT/RUC/RFC**: Verificación en línea
- **CAE/CAI**: Autorización electrónica
- **Código QR**: Generación automática
- **PDF oficial**: Generación con formato legal

#### 2. Integración con Ente Fiscal
- **AFIP (Argentina)**: Web Services SOAP
- **SAT (México)**: Facturación 4.0 CFDI
- **DIAN (Colombia)**: Factura electrónica
- **SRI (Ecuador)**: Comprobantes electrónicos
- **SUNAT (Perú)**: Factura electrónica

#### 3. Gestión de Comprobantes
- **Emisión en tiempo real**: Desde el POS
- **Reimpresión**: Copia de comprobantes emitidos
- **Anulación**: Notas de crédito automáticas
- **Corrección**: Notas de débito
- **Envío automático**: Email con PDF y XML

#### 4. Reportes Fiscales
- **Libro IVA**: Ventas y compras
- **Declaraciones**: Preparación de declaraciones mensuales
- **Listados**: Exportación para contadores
- **Auditoría**: Log de todas las operaciones

### Nuevas Tablas en Schema

```typescript
// invoices (facturas)
invoices: defineTable({
  orgId: v.id("organizations"),
  invoiceType: v.union(v.literal("A"), v.literal("B"), v.literal("C"), v.literal("E")),
  pointOfSale: v.number(),
  invoiceNumber: v.number(),
  fullNumber: v.string(), // "0001-00000123"
  saleId: v.id("sales"),
  customerId: v.optional(v.id("customers")),
  customerTaxId: v.optional(v.string()),
  customerName: v.string(),
  customerAddress: v.optional(v.string()),
  issueDate: v.number(),
  dueDate: v.optional(v.number()),
  subtotal: v.number(),
  tax: v.number(),
  total: v.number(),
  cae: v.optional(v.string()), // Código de autorización electrónica
  caeExpiry: v.optional(v.number()),
  qrCode: v.optional(v.string()),
  pdfUrl: v.optional(v.string()),
  xmlUrl: v.optional(v.string()),
  status: v.union(v.literal("draft"), v.literal("authorized"), v.literal("cancelled"), v.literal("rejected")),
  rejectionReason: v.optional(v.string()),
  createdBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_sale", ["saleId"])
  .index("by_org_and_number", ["orgId", "fullNumber"])
  .index("by_org_and_date", ["orgId", "issueDate"]),

// creditNotes (notas de crédito)
creditNotes: defineTable({
  orgId: v.id("organizations"),
  originalInvoiceId: v.id("invoices"),
  creditNoteType: v.union(v.literal("A"), v.literal("B"), v.literal("C")),
  pointOfSale: v.number(),
  creditNoteNumber: v.number(),
  fullNumber: v.string(),
  reason: v.string(),
  amount: v.number(),
  cae: v.optional(v.string()),
  caeExpiry: v.optional(v.number()),
  pdfUrl: v.optional(v.string()),
  status: v.union(v.literal("authorized"), v.literal("rejected")),
  createdBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_invoice", ["originalInvoiceId"]),

// fiscalConfig (configuración fiscal)
fiscalConfig: defineTable({
  orgId: v.id("organizations"),
  country: v.string(), // "AR", "MX", "CO", etc.
  taxId: v.string(), // CUIT, RFC, etc.
  legalName: v.string(),
  address: v.string(),
  pointsOfSale: v.array(v.object({
    number: v.number(),
    description: v.string(),
    isActive: v.boolean(),
  })),
  certificates: v.optional(v.object({
    certificateUrl: v.string(),
    keyUrl: v.string(),
    expiryDate: v.number(),
  })),
  apiCredentials: v.optional(v.string()), // JSON encriptado
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_org", ["orgId"]),
```

### Archivos Frontend

```
app/(dashboard)/facturacion/
├── page.tsx                          # Dashboard de facturación
├── emitir/
│   ├── page.tsx                     # Emitir factura
│   └── [saleId]/page.tsx           # Facturar venta específica
├── comprobantes/
│   ├── page.tsx                     # Lista de comprobantes
│   └── [id]/page.tsx               # Detalle de comprobante
├── notas-credito/
│   ├── page.tsx                     # Notas de crédito
│   └── nueva/page.tsx              # Nueva nota de crédito
├── configuracion/
│   ├── page.tsx                     # Configuración fiscal
│   └── puntos-venta/page.tsx       # Puntos de venta
├── reportes/
│   ├── page.tsx                     # Reportes fiscales
│   ├── libro-iva/page.tsx          # Libro IVA
│   └── declaraciones/page.tsx      # Declaraciones
└── components/
    ├── invoice-form.tsx             # Formulario de factura
    ├── invoice-preview.tsx          # Vista previa
    ├── qr-generator.tsx             # Generador de QR
    ├── fiscal-reports.tsx           # Reportes fiscales
    └── cae-validator.tsx            # Validador de CAE
```

### Integraciones por País

```typescript
// Argentina - AFIP
export const afipAuthorize = action(async (ctx, invoice) => {
  // SOAP request a WSFE
  // Obtener CAE
  // Generar QR
  // Retornar datos de autorización
});

// México - SAT
export const satStamp = action(async (ctx, invoice) => {
  // Generar XML CFDI 4.0
  // Timbrar con PAC
  // Obtener UUID
  // Retornar datos de timbrado
});

// Colombia - DIAN
export const dianAuthorize = action(async (ctx, invoice) => {
  // Generar XML UBL
  // Firmar digitalmente
  // Enviar a DIAN
  // Obtener CUFE
});
```

### Beneficios
- ✅ Cumplimiento legal obligatorio
- ✅ Reducción de errores fiscales
- ✅ Automatización de procesos contables
- ✅ Trazabilidad completa
- ✅ Integración con software contable

---

## **FASE 19: Sistema Multi-Sucursal** 🏪

### Prioridad: MEDIA
### Duración Estimada: 3-4 semanas
### Dependencias: Todas las fases core completadas

### Objetivo
Extender el sistema para soportar múltiples sucursales con inventarios independientes, transferencias entre sucursales, y reportes consolidados.

### Funcionalidades

#### 1. Gestión de Sucursales
- **Registro de sucursales**: Múltiples ubicaciones por organización
- **Configuración independiente**: Cada sucursal con sus settings
- **Usuarios por sucursal**: Asignación de empleados
- **Horarios por sucursal**: Diferentes horarios de operación

#### 2. Inventario Multi-Sucursal
- **Stock por sucursal**: Inventario independiente
- **Transferencias**: Movimiento de productos entre sucursales
- **Consolidación**: Vista global de inventario
- **Alertas por sucursal**: Stock bajo por ubicación
- **Costos por sucursal**: Control de costos diferenciados

#### 3. Transferencias Entre Sucursales
- **Solicitud de transferencia**: Request de productos
- **Aprobación**: Workflow de aprobación
- **Envío**: Registro de salida
- **Recepción**: Confirmación de llegada
- **Tracking**: Estado en tránsito
- **Documentación**: Guías y albaranes

#### 4. Reportes Consolidados
- **Ventas consolidadas**: Todas las sucursales
- **Comparativas**: Performance entre sucursales
- **Ranking**: Mejores/peores sucursales
- **Inventario global**: Vista consolidada
- **Transferencias**: Movimientos entre sucursales

### Modificaciones al Schema

```typescript
// branches (sucursales)
branches: defineTable({
  orgId: v.id("organizations"),
  code: v.string(), // "SUC001"
  name: v.string(),
  address: v.string(),
  phone: v.string(),
  email: v.string(),
  manager: v.optional(v.id("users")),
  settings: v.object({
    timezone: v.string(),
    currency: v.string(),
    taxRate: v.number(),
  }),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_code", ["code"]),

// Modificar tablas existentes para agregar branchId
// products -> agregar stockByBranch
products: defineTable({
  // ... campos existentes
  stockByBranch: v.array(v.object({
    branchId: v.id("branches"),
    stock: v.number(),
    minStock: v.number(),
  })),
}),

// transfers (transferencias)
transfers: defineTable({
  orgId: v.id("organizations"),
  transferNumber: v.string(),
  fromBranch: v.id("branches"),
  toBranch: v.id("branches"),
  status: v.union(
    v.literal("draft"),
    v.literal("pending"),
    v.literal("approved"),
    v.literal("in_transit"),
    v.literal("received"),
    v.literal("cancelled")
  ),
  requestedBy: v.id("users"),
  approvedBy: v.optional(v.id("users")),
  sentBy: v.optional(v.id("users")),
  receivedBy: v.optional(v.id("users")),
  requestDate: v.number(),
  approvalDate: v.optional(v.number()),
  shipDate: v.optional(v.number()),
  receiveDate: v.optional(v.number()),
  notes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_org", ["orgId"])
  .index("by_from_branch", ["fromBranch"])
  .index("by_to_branch", ["toBranch"])
  .index("by_org_and_status", ["orgId", "status"]),

// transferItems (items de transferencia)
transferItems: defineTable({
  transferId: v.id("transfers"),
  productId: v.id("products"),
  productName: v.string(),
  requestedQuantity: v.number(),
  approvedQuantity: v.optional(v.number()),
  receivedQuantity: v.optional(v.number()),
  notes: v.optional(v.string()),
})
  .index("by_transfer", ["transferId"]),
```

### Archivos Frontend

```
app/(dashboard)/sucursales/
├── page.tsx                          # Dashboard multi-sucursal
├── lista/
│   ├── page.tsx                     # Lista de sucursales
│   ├── nueva/page.tsx              # Nueva sucursal
│   └── [id]/page.tsx               # Detalle de sucursal
├── transferencias/
│   ├── page.tsx                     # Lista de transferencias
│   ├── nueva/page.tsx              # Nueva transferencia
│   └── [id]/page.tsx               # Detalle de transferencia
├── inventario-consolidado/
│   └── page.tsx                     # Inventario global
├── reportes-consolidados/
│   └── page.tsx                     # Reportes de todas las sucursales
└── components/
    ├── branch-selector.tsx          # Selector de sucursal
    ├── transfer-form.tsx            # Formulario de transferencia
    ├── stock-by-branch.tsx         # Stock por sucursal
    ├── branch-comparison.tsx        # Comparativa de sucursales
    └── consolidated-dashboard.tsx   # Dashboard consolidado
```

### Beneficios
- ✅ Escalabilidad del negocio
- ✅ Control centralizado
- ✅ Optimización de inventario
- ✅ Mejor distribución de recursos
- ✅ Comparativas de performance

---

## **FASE 20: Progressive Web App (PWA) y Modo Offline** 📱

### Prioridad: MEDIA
### Duración Estimada: 2 semanas
### Dependencias: Frontend Core al 100%

### Objetivo
Convertir la aplicación en una PWA instalable con capacidades offline para asegurar continuidad del negocio sin conexión.

### Funcionalidades

#### 1. Instalación como App
- **Instalable en dispositivos**: Android, iOS, Desktop
- **Splash screen**: Pantalla de carga personalizada
- **Íconos de app**: Diferentes tamaños para cada plataforma
- **Standalone mode**: App independiente del navegador
- **Updates automáticos**: Service worker con estrategia de actualización

#### 2. Modo Offline
- **Caché de datos críticos**: Productos, clientes, configuración
- **Ventas offline**: Registro de ventas sin conexión
- **Cola de sincronización**: Sync automático cuando vuelve conexión
- **Detección de conectividad**: UI que indica estado online/offline
- **Resolución de conflictos**: Strategy para datos modificados offline

#### 3. Optimización de Performance
- **Lazy loading**: Carga diferida de rutas
- **Code splitting**: División del bundle
- **Image optimization**: WebP, lazy load, responsive
- **Precaching**: Recursos críticos pre-cacheados
- **Runtime caching**: Estrategias por tipo de recurso

#### 4. Push Notifications Nativas
- **Notificaciones locales**: Sin necesidad de servidor
- **Background sync**: Sincronización en segundo plano
- **Badges**: Contador de notificaciones
- **Actions**: Acciones desde la notificación

### Archivos a Crear/Modificar

```typescript
// next.config.js - Configurar PWA
import withPWA from 'next-pwa';

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.+\.convex\.cloud\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'convex-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
  ],
});

// public/manifest.json
{
  "name": "CRM Estación de Servicio",
  "short_name": "CRM",
  "description": "Sistema de gestión para estaciones de servicio",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}

// app/lib/offline-manager.ts
export class OfflineManager {
  async saveSaleOffline(sale: Sale): Promise<void> {
    // Guardar en IndexedDB
    await localDB.sales.add(sale);
  }

  async syncPendingSales(): Promise<void> {
    // Sincronizar ventas pendientes
    const pendingSales = await localDB.sales.toArray();
    for (const sale of pendingSales) {
      try {
        await api.sales.create(sale);
        await localDB.sales.delete(sale.id);
      } catch (error) {
        // Mantener en cola
      }
    }
  }

  onOnline(callback: () => void): void {
    window.addEventListener('online', callback);
  }

  onOffline(callback: () => void): void {
    window.addEventListener('offline', callback);
  }
}
```

### Estrategias de Caché

```typescript
// Cache-First: Para assets estáticos
{
  urlPattern: /\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2)$/,
  handler: 'CacheFirst',
}

// Network-First: Para datos dinámicos
{
  urlPattern: /^https:\/\/.+\.convex\.cloud\/.*/i,
  handler: 'NetworkFirst',
  options: {
    networkTimeoutSeconds: 3,
    cacheName: 'api-cache',
  },
}

// Stale-While-Revalidate: Para datos que pueden estar desactualizados
{
  urlPattern: /\/api\/products/,
  handler: 'StaleWhileRevalidate',
}
```

### Beneficios
- ✅ Continuidad del negocio sin internet
- ✅ Experiencia de app nativa
- ✅ Instalable en dispositivos móviles
- ✅ Performance mejorado
- ✅ Menor consumo de datos
- ✅ Acceso rápido desde home screen

---

## 📊 Resumen de Nuevas Fases

| Fase | Nombre | Prioridad | Duración | Complejidad |
|------|--------|-----------|----------|-------------|
| 11 | Sistema de Turnos y Caja | ALTA | 1-2 sem | Media |
| 12 | Gestión de Combustibles | ALTA | 1.5-2 sem | Media-Alta |
| 13 | Recursos Humanos | MEDIA-ALTA | 2-3 sem | Alta |
| 14 | Mantenimiento Preventivo | MEDIA | 1-2 sem | Media |
| 15 | Proveedores y Compras | MEDIA | 2 sem | Media |
| 16 | Business Intelligence | MEDIA | 2-3 sem | Alta |
| 17 | WhatsApp Business | MEDIA-ALTA | 1-2 sem | Media |
| 18 | Facturación Electrónica | ALTA* | 3-4 sem | Alta |
| 19 | Multi-Sucursal | MEDIA | 3-4 sem | Alta |
| 20 | PWA y Offline | MEDIA | 2 sem | Media |

\* Prioridad depende del país y requerimientos legales

---

## 🎯 Roadmap Sugerido

### Trimestre 1 (Próximos 3 meses)
1. **Completar Fase 5**: Frontend Core al 100%
2. **Fase 11**: Sistema de Turnos (crítico para operación)
3. **Fase 12**: Gestión de Combustibles (core business)
4. **Fase 9**: Testing al 80% de cobertura

### Trimestre 2 (Meses 4-6)
5. **Fase 18**: Facturación Electrónica (si aplica)
6. **Fase 13**: Recursos Humanos
7. **Fase 17**: WhatsApp Business
8. **Fase 10**: Deploy a producción

### Trimestre 3 (Meses 7-9)
9. **Fase 15**: Proveedores y Compras
10. **Fase 14**: Mantenimiento Preventivo
11. **Fase 20**: PWA y Modo Offline
12. **Fase 16**: Business Intelligence

### Trimestre 4 (Meses 10-12)
13. **Fase 19**: Multi-Sucursal
14. Optimizaciones y mejoras
15. Features basadas en feedback de usuarios

---

## 💡 Recomendaciones

### Priorización
1. **Completar lo iniciado**: Terminar Fases 5 y 9 antes de empezar nuevas
2. **Valor de negocio**: Priorizar fases con mayor ROI
3. **Complejidad**: Mezclar fases complejas con simples
4. **Dependencias**: Respetar el orden de dependencias

### Recursos
- **Equipo**: Se recomienda al menos 2 desarrolladores para este roadmap
- **Testing**: Dedicar 20-30% del tiempo a testing
- **Documentación**: Mantener docs actualizadas en cada fase

### Métricas de Éxito
- Cobertura de tests > 80%
- Performance (Lighthouse) > 90
- Uptime > 99.5%
- Satisfacción de usuario > 4.5/5

---

## 🔄 Mantenimiento Continuo

Además de las fases nuevas, considerar:
- **Actualizaciones de dependencias**: Mensualmente
- **Parches de seguridad**: Inmediatamente
- **Refactoring**: 10% del tiempo
- **Mejoras de UX**: Basadas en feedback
- **Optimización de queries**: Trimestral

---

**Total de Nuevas Fases**: 10 fases adicionales
**Tiempo Estimado Total**: 22-30 semanas (~6-8 meses)
**Esfuerzo Estimado**: 880-1200 horas de desarrollo

---

*Este roadmap es una guía sugerida y puede ajustarse según las prioridades del negocio, recursos disponibles, y feedback de usuarios.*

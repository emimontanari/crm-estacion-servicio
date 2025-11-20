import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Esquema completo de base de datos para CRM de Estación de Servicio
 *
 * Arquitectura:
 * - Multi-tenancy: Cada organización tiene sus propios datos
 * - Soft deletes: Los registros se marcan como eliminados en lugar de borrarse
 * - Timestamps: createdAt y updatedAt en todas las tablas
 * - Relaciones: IDs para relacionar tablas
 */

export default defineSchema({
  // ============================================
  // USUARIOS Y ORGANIZACIONES
  // ============================================

  /**
   * Organizaciones (Estaciones de servicio)
   * Multi-tenancy: Cada estación es una organización
   */
  organizations: defineTable({
    clerkOrgId: v.string(), // ID de Clerk
    name: v.string(),
    slug: v.string(), // URL-friendly identifier
    email: v.string(),
    phone: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    logo: v.optional(v.string()), // URL del logo
    settings: v.optional(v.object({
      currency: v.string(), // ISO 4217
      locale: v.string(),
      timezone: v.string(),
      taxRate: v.number(), // Tasa de impuesto predeterminada
    })),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_org_id", ["clerkOrgId"])
    .index("by_slug", ["slug"]),

  /**
   * Usuarios del sistema (Empleados)
   * Vinculados con Clerk para autenticación
   */
  users: defineTable({
    clerkUserId: v.string(), // ID de Clerk
    orgId: v.id("organizations"),
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("cashier"),
      v.literal("viewer")
    ),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_org", ["orgId"])
    .index("by_org_and_email", ["orgId", "email"])
    .index("by_org_and_role", ["orgId", "role"]),

  // ============================================
  // CLIENTES
  // ============================================

  /**
   * Clientes de la estación de servicio
   */
  customers: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    birthDate: v.optional(v.number()), // timestamp
    vehicleInfo: v.optional(v.object({
      plate: v.optional(v.string()),
      brand: v.optional(v.string()),
      model: v.optional(v.string()),
      year: v.optional(v.number()),
      color: v.optional(v.string()),
    })),
    loyaltyPoints: v.number(), // Puntos acumulados
    totalSpent: v.number(), // Total gastado histórico
    totalPurchases: v.number(), // Número de compras
    lastPurchaseAt: v.optional(v.number()), // Última compra
    notes: v.optional(v.string()),
    isActive: v.boolean(),
    deletedAt: v.optional(v.number()), // Soft delete
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_and_phone", ["orgId", "phone"])
    .index("by_org_and_email", ["orgId", "email"])
    .index("by_org_and_active", ["orgId", "isActive"])
    .searchIndex("search_by_name", {
      searchField: "name",
      filterFields: ["orgId", "isActive"],
    }),

  // ============================================
  // PRODUCTOS Y COMBUSTIBLES
  // ============================================

  /**
   * Productos y servicios
   */
  products: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("fuel"),
      v.literal("store"),
      v.literal("service"),
      v.literal("car_wash"),
      v.literal("maintenance"),
      v.literal("accessories")
    ),
    price: v.number(),
    cost: v.optional(v.number()),
    sku: v.optional(v.string()),
    barcode: v.optional(v.string()),
    stock: v.number(),
    minStock: v.number(),
    maxStock: v.optional(v.number()),
    unit: v.string(), // 'unit', 'liters', 'kg', etc.
    taxRate: v.number(),
    isActive: v.boolean(),
    imageUrl: v.optional(v.string()),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_and_category", ["orgId", "category"])
    .index("by_org_and_active", ["orgId", "isActive"])
    .index("by_org_and_sku", ["orgId", "sku"])
    .index("by_org_and_barcode", ["orgId", "barcode"])
    .searchIndex("search_by_name", {
      searchField: "name",
      filterFields: ["orgId", "isActive", "category"],
    }),

  /**
   * Tipos de combustible
   * Tabla separada para información específica de combustibles
   */
  fuelTypes: defineTable({
    orgId: v.id("organizations"),
    type: v.union(
      v.literal("premium"),
      v.literal("regular"),
      v.literal("diesel"),
      v.literal("super")
    ),
    name: v.string(),
    pricePerUnit: v.number(),
    unit: v.union(v.literal("liters"), v.literal("gallons")),
    color: v.optional(v.string()), // Color para UI
    octanaje: v.optional(v.number()),
    currentStock: v.optional(v.number()), // Stock actual en tanques
    tankCapacity: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_and_type", ["orgId", "type"])
    .index("by_org_and_active", ["orgId", "isActive"]),

  // ============================================
  // VENTAS
  // ============================================

  /**
   * Ventas / Transacciones
   */
  sales: defineTable({
    orgId: v.id("organizations"),
    customerId: v.optional(v.id("customers")),
    cashierId: v.id("users"), // Usuario que realizó la venta
    status: v.union(
      v.literal("draft"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    subtotal: v.number(),
    discount: v.number(), // Monto del descuento
    discountPercentage: v.number(), // Porcentaje de descuento
    tax: v.number(),
    total: v.number(),
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("credit_card"),
      v.literal("debit_card"),
      v.literal("mobile_payment"),
      v.literal("transfer"),
      v.literal("check")
    ),
    cashReceived: v.optional(v.number()),
    change: v.optional(v.number()),
    loyaltyPointsEarned: v.number(),
    loyaltyPointsUsed: v.number(),
    notes: v.optional(v.string()),
    cancelledAt: v.optional(v.number()),
    cancelledBy: v.optional(v.id("users")),
    cancelReason: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_and_status", ["orgId", "status"])
    .index("by_org_and_customer", ["orgId", "customerId"])
    .index("by_org_and_cashier", ["orgId", "cashierId"])
    .index("by_org_and_created", ["orgId", "createdAt"])
    .index("by_org_and_completed", ["orgId", "completedAt"]),

  /**
   * Items de venta
   * Detalles de productos en cada venta
   */
  saleItems: defineTable({
    orgId: v.id("organizations"),
    saleId: v.id("sales"),
    productId: v.id("products"),
    productName: v.string(), // Denormalizado para histórico
    quantity: v.number(),
    unitPrice: v.number(),
    discount: v.number(),
    taxRate: v.number(),
    subtotal: v.number(),
    total: v.number(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_sale", ["saleId"])
    .index("by_org_and_product", ["orgId", "productId"]),

  // ============================================
  // FIDELIZACIÓN
  // ============================================

  /**
   * Configuración del programa de fidelización
   * Una configuración por organización
   */
  loyaltyProgram: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    pointsPerCurrency: v.number(), // Puntos por cada unidad de moneda
    currencyPerPoint: v.number(), // Valor en moneda de cada punto
    minPurchaseForPoints: v.number(),
    pointsExpirationDays: v.optional(v.number()),
    welcomeBonus: v.number(),
    birthdayBonus: v.number(),
    referralBonus: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"]),

  /**
   * Transacciones de puntos de fidelización
   */
  loyaltyTransactions: defineTable({
    orgId: v.id("organizations"),
    customerId: v.id("customers"),
    type: v.union(v.literal("earn"), v.literal("redeem"), v.literal("expire"), v.literal("adjust")),
    points: v.number(), // Positivo para ganar, negativo para canjear
    balance: v.number(), // Balance después de la transacción
    reason: v.union(
      v.literal("purchase"),
      v.literal("bonus"),
      v.literal("promotion"),
      v.literal("manual"),
      v.literal("referral"),
      v.literal("birthday"),
      v.literal("redemption"),
      v.literal("expiration")
    ),
    description: v.optional(v.string()),
    relatedSaleId: v.optional(v.id("sales")),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_customer", ["customerId"])
    .index("by_org_and_customer", ["orgId", "customerId"])
    .index("by_org_and_created", ["orgId", "createdAt"]),

  /**
   * Promociones
   */
  promotions: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("percentage_discount"),
      v.literal("fixed_discount"),
      v.literal("bonus_points"),
      v.literal("free_product"),
      v.literal("buy_x_get_y")
    ),
    value: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    minPurchaseAmount: v.number(),
    maxUsesPerCustomer: v.optional(v.number()),
    maxTotalUses: v.optional(v.number()),
    currentUses: v.number(),
    applicableProducts: v.optional(v.array(v.id("products"))),
    applicableCategories: v.optional(v.array(v.string())),
    requiresLoyaltyMembership: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_and_active", ["orgId", "isActive"])
    .index("by_org_and_dates", ["orgId", "startDate", "endDate"]),

  // ============================================
  // PAGOS
  // ============================================

  /**
   * Pagos
   */
  payments: defineTable({
    orgId: v.id("organizations"),
    saleId: v.id("sales"),
    customerId: v.optional(v.id("customers")),
    amount: v.number(),
    currency: v.string(), // ISO 4217
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("credit_card"),
      v.literal("debit_card"),
      v.literal("mobile_payment"),
      v.literal("transfer"),
      v.literal("check")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded"),
      v.literal("cancelled")
    ),
    stripePaymentIntentId: v.optional(v.string()), // Para pagos con Stripe
    stripeChargeId: v.optional(v.string()),
    transactionId: v.optional(v.string()), // ID externo
    metadata: v.optional(v.any()), // Metadata adicional
    errorMessage: v.optional(v.string()),
    refundedAmount: v.optional(v.number()),
    refundedAt: v.optional(v.number()),
    refundReason: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_sale", ["saleId"])
    .index("by_org_and_customer", ["orgId", "customerId"])
    .index("by_org_and_status", ["orgId", "status"])
    .index("by_stripe_intent", ["stripePaymentIntentId"])
    .index("by_org_and_created", ["orgId", "createdAt"]),

  /**
   * Métodos de pago configurados
   * Permite habilitar/deshabilitar métodos por organización
   */
  paymentMethods: defineTable({
    orgId: v.id("organizations"),
    method: v.union(
      v.literal("cash"),
      v.literal("credit_card"),
      v.literal("debit_card"),
      v.literal("mobile_payment"),
      v.literal("transfer"),
      v.literal("check")
    ),
    name: v.string(),
    isEnabled: v.boolean(),
    processingFee: v.number(), // Comisión (0 a 1)
    requiresProcessing: v.boolean(), // Si requiere procesamiento externo
    configuration: v.optional(v.any()), // Config específica del método
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_and_enabled", ["orgId", "isEnabled"]),

  // ============================================
  // REPORTES Y ANALYTICS
  // ============================================

  /**
   * Reportes generados
   * Cachea reportes pesados para acceso rápido
   */
  reports: defineTable({
    orgId: v.id("organizations"),
    type: v.union(
      v.literal("daily_sales"),
      v.literal("monthly_sales"),
      v.literal("customer_analytics"),
      v.literal("inventory"),
      v.literal("loyalty"),
      v.literal("custom")
    ),
    name: v.string(),
    period: v.object({
      startDate: v.number(),
      endDate: v.number(),
    }),
    data: v.any(), // Datos del reporte en JSON
    generatedBy: v.id("users"),
    fileUrl: v.optional(v.string()), // URL si se exportó
    createdAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_and_type", ["orgId", "type"])
    .index("by_org_and_created", ["orgId", "createdAt"]),

  // ============================================
  // SISTEMA DE NOTIFICACIONES
  // ============================================

  /**
   * Plantillas de notificaciones
   * Plantillas reutilizables para diferentes tipos de notificaciones
   */
  notificationTemplates: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("welcome"),
      v.literal("purchase_confirmation"),
      v.literal("loyalty_points"),
      v.literal("promotion"),
      v.literal("birthday"),
      v.literal("payment_receipt"),
      v.literal("low_stock_alert"),
      v.literal("custom")
    ),
    channels: v.array(v.union(
      v.literal("email"),
      v.literal("sms"),
      v.literal("push")
    )),
    // Plantillas por canal
    emailTemplate: v.optional(v.object({
      subject: v.string(),
      htmlBody: v.string(),
      textBody: v.optional(v.string()),
    })),
    smsTemplate: v.optional(v.object({
      body: v.string(),
    })),
    pushTemplate: v.optional(v.object({
      title: v.string(),
      body: v.string(),
      icon: v.optional(v.string()),
      clickAction: v.optional(v.string()),
    })),
    // Variables disponibles en la plantilla (ej: {{customerName}}, {{points}})
    variables: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_and_type", ["orgId", "type"])
    .index("by_org_and_active", ["orgId", "isActive"]),

  /**
   * Notificaciones
   * Registro de todas las notificaciones enviadas o programadas
   */
  notifications: defineTable({
    orgId: v.id("organizations"),
    templateId: v.optional(v.id("notificationTemplates")),
    recipientType: v.union(
      v.literal("customer"),
      v.literal("user"),
      v.literal("all_customers"),
      v.literal("segment")
    ),
    recipientId: v.optional(v.union(
      v.id("customers"),
      v.id("users")
    )),
    recipientEmail: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
    channel: v.union(
      v.literal("email"),
      v.literal("sms"),
      v.literal("push"),
      v.literal("multi")
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("sending"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    // Contenido de la notificación
    subject: v.optional(v.string()),
    body: v.string(),
    htmlBody: v.optional(v.string()),
    // Metadata
    metadata: v.optional(v.any()),
    variables: v.optional(v.any()), // Variables usadas para renderizar la plantilla
    // Programación
    scheduledFor: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    // Tracking
    deliveredAt: v.optional(v.number()),
    readAt: v.optional(v.number()),
    clickedAt: v.optional(v.number()),
    // Error handling
    errorMessage: v.optional(v.string()),
    retryCount: v.number(),
    maxRetries: v.number(),
    // IDs externos de servicios de terceros
    externalId: v.optional(v.string()), // ID del proveedor (Twilio, Resend, FCM)
    // Relaciones
    relatedSaleId: v.optional(v.id("sales")),
    relatedPromotionId: v.optional(v.id("promotions")),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_and_status", ["orgId", "status"])
    .index("by_org_and_recipient", ["orgId", "recipientId"])
    .index("by_org_and_channel", ["orgId", "channel"])
    .index("by_org_and_created", ["orgId", "createdAt"])
    .index("by_scheduled", ["scheduledFor"])
    .index("by_customer", ["recipientId"])
    .index("by_status", ["status"]),

  /**
   * Preferencias de notificaciones
   * Configuración de preferencias de cada usuario/cliente
   */
  notificationPreferences: defineTable({
    orgId: v.id("organizations"),
    entityType: v.union(v.literal("customer"), v.literal("user")),
    entityId: v.union(v.id("customers"), v.id("users")),
    // Canales habilitados
    emailEnabled: v.boolean(),
    smsEnabled: v.boolean(),
    pushEnabled: v.boolean(),
    // Tipos de notificaciones permitidas
    marketingEnabled: v.boolean(),
    transactionalEnabled: v.boolean(),
    loyaltyEnabled: v.boolean(),
    promotionsEnabled: v.boolean(),
    // Configuración específica
    quietHoursEnabled: v.boolean(),
    quietHoursStart: v.optional(v.string()), // "22:00"
    quietHoursEnd: v.optional(v.string()), // "08:00"
    timezone: v.optional(v.string()),
    // Tokens para push notifications
    fcmTokens: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_and_entity", ["orgId", "entityType", "entityId"])
    .index("by_entity", ["entityId"]),

  /**
   * Logs de notificaciones
   * Registro detallado de eventos del sistema de notificaciones
   */
  notificationLogs: defineTable({
    orgId: v.id("organizations"),
    notificationId: v.id("notifications"),
    event: v.union(
      v.literal("created"),
      v.literal("scheduled"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed"),
      v.literal("bounced"),
      v.literal("opened"),
      v.literal("clicked"),
      v.literal("unsubscribed")
    ),
    channel: v.union(
      v.literal("email"),
      v.literal("sms"),
      v.literal("push"),
      v.literal("multi")
    ),
    details: v.optional(v.string()),
    errorCode: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    metadata: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_notification", ["notificationId"])
    .index("by_org_and_event", ["orgId", "event"])
    .index("by_org_and_created", ["orgId", "createdAt"]),

  /**
   * Campañas de notificaciones
   * Para envíos masivos o programados
   */
  notificationCampaigns: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    templateId: v.id("notificationTemplates"),
    targetType: v.union(
      v.literal("all_customers"),
      v.literal("segment"),
      v.literal("specific_list")
    ),
    // Segmentación
    segmentFilter: v.optional(v.any()), // Filtros para seleccionar destinatarios
    specificRecipients: v.optional(v.array(v.union(
      v.id("customers"),
      v.id("users")
    ))),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("failed")
    ),
    scheduledFor: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    // Estadísticas
    totalRecipients: v.number(),
    sentCount: v.number(),
    deliveredCount: v.number(),
    failedCount: v.number(),
    openedCount: v.number(),
    clickedCount: v.number(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_and_status", ["orgId", "status"])
    .index("by_org_and_created", ["orgId", "createdAt"])
    .index("by_scheduled", ["scheduledFor"]),
});

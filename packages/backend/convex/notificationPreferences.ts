import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Obtener preferencias de notificación de una entidad
 */
export const get = query({
  args: {
    entityType: v.union(v.literal("customer"), v.literal("user")),
    entityId: v.union(v.id("customers"), v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    const preferences = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_org_and_entity", (q) =>
        q.eq("orgId", user.orgId)
         .eq("entityType", args.entityType)
         .eq("entityId", args.entityId)
      )
      .first();

    // Si no existen preferencias, retornar valores por defecto
    if (!preferences) {
      return {
        orgId: user.orgId,
        entityType: args.entityType,
        entityId: args.entityId,
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
        marketingEnabled: true,
        transactionalEnabled: true,
        loyaltyEnabled: true,
        promotionsEnabled: true,
        quietHoursEnabled: false,
        timezone: "America/Argentina/Buenos_Aires",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    return preferences;
  },
});

/**
 * Crear o actualizar preferencias de notificación
 */
export const upsert = mutation({
  args: {
    entityType: v.union(v.literal("customer"), v.literal("user")),
    entityId: v.union(v.id("customers"), v.id("users")),
    emailEnabled: v.optional(v.boolean()),
    smsEnabled: v.optional(v.boolean()),
    pushEnabled: v.optional(v.boolean()),
    marketingEnabled: v.optional(v.boolean()),
    transactionalEnabled: v.optional(v.boolean()),
    loyaltyEnabled: v.optional(v.boolean()),
    promotionsEnabled: v.optional(v.boolean()),
    quietHoursEnabled: v.optional(v.boolean()),
    quietHoursStart: v.optional(v.string()),
    quietHoursEnd: v.optional(v.string()),
    timezone: v.optional(v.string()),
    fcmTokens: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    // Buscar preferencias existentes
    const existing = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_org_and_entity", (q) =>
        q.eq("orgId", user.orgId)
         .eq("entityType", args.entityType)
         .eq("entityId", args.entityId)
      )
      .first();

    const now = Date.now();

    if (existing) {
      // Actualizar
      const updates: any = { updatedAt: now };

      if (args.emailEnabled !== undefined) updates.emailEnabled = args.emailEnabled;
      if (args.smsEnabled !== undefined) updates.smsEnabled = args.smsEnabled;
      if (args.pushEnabled !== undefined) updates.pushEnabled = args.pushEnabled;
      if (args.marketingEnabled !== undefined) updates.marketingEnabled = args.marketingEnabled;
      if (args.transactionalEnabled !== undefined) updates.transactionalEnabled = args.transactionalEnabled;
      if (args.loyaltyEnabled !== undefined) updates.loyaltyEnabled = args.loyaltyEnabled;
      if (args.promotionsEnabled !== undefined) updates.promotionsEnabled = args.promotionsEnabled;
      if (args.quietHoursEnabled !== undefined) updates.quietHoursEnabled = args.quietHoursEnabled;
      if (args.quietHoursStart !== undefined) updates.quietHoursStart = args.quietHoursStart;
      if (args.quietHoursEnd !== undefined) updates.quietHoursEnd = args.quietHoursEnd;
      if (args.timezone !== undefined) updates.timezone = args.timezone;
      if (args.fcmTokens !== undefined) updates.fcmTokens = args.fcmTokens;

      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      // Crear
      const preferenceId = await ctx.db.insert("notificationPreferences", {
        orgId: user.orgId,
        entityType: args.entityType,
        entityId: args.entityId,
        emailEnabled: args.emailEnabled ?? true,
        smsEnabled: args.smsEnabled ?? true,
        pushEnabled: args.pushEnabled ?? true,
        marketingEnabled: args.marketingEnabled ?? true,
        transactionalEnabled: args.transactionalEnabled ?? true,
        loyaltyEnabled: args.loyaltyEnabled ?? true,
        promotionsEnabled: args.promotionsEnabled ?? true,
        quietHoursEnabled: args.quietHoursEnabled ?? false,
        quietHoursStart: args.quietHoursStart,
        quietHoursEnd: args.quietHoursEnd,
        timezone: args.timezone ?? "America/Argentina/Buenos_Aires",
        fcmTokens: args.fcmTokens,
        createdAt: now,
        updatedAt: now,
      });

      return preferenceId;
    }
  },
});

/**
 * Verificar si se puede enviar notificación a una entidad
 * Respeta las preferencias y horarios de silencio
 */
export const canSendNotification = query({
  args: {
    entityType: v.union(v.literal("customer"), v.literal("user")),
    entityId: v.union(v.id("customers"), v.id("users")),
    channel: v.union(
      v.literal("email"),
      v.literal("sms"),
      v.literal("push")
    ),
    notificationType: v.union(
      v.literal("marketing"),
      v.literal("transactional"),
      v.literal("loyalty"),
      v.literal("promotions")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    const preferences = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_org_and_entity", (q) =>
        q.eq("orgId", user.orgId)
         .eq("entityType", args.entityType)
         .eq("entityId", args.entityId)
      )
      .first();

    // Si no hay preferencias, permitir por defecto (excepto en horario de silencio)
    if (!preferences) {
      return { canSend: true, reason: "No preferences set, allowing by default" };
    }

    // Verificar canal habilitado
    if (args.channel === "email" && !preferences.emailEnabled) {
      return { canSend: false, reason: "Email notifications disabled" };
    }
    if (args.channel === "sms" && !preferences.smsEnabled) {
      return { canSend: false, reason: "SMS notifications disabled" };
    }
    if (args.channel === "push" && !preferences.pushEnabled) {
      return { canSend: false, reason: "Push notifications disabled" };
    }

    // Verificar tipo de notificación
    if (args.notificationType === "marketing" && !preferences.marketingEnabled) {
      return { canSend: false, reason: "Marketing notifications disabled" };
    }
    if (args.notificationType === "transactional" && !preferences.transactionalEnabled) {
      return { canSend: false, reason: "Transactional notifications disabled" };
    }
    if (args.notificationType === "loyalty" && !preferences.loyaltyEnabled) {
      return { canSend: false, reason: "Loyalty notifications disabled" };
    }
    if (args.notificationType === "promotions" && !preferences.promotionsEnabled) {
      return { canSend: false, reason: "Promotions notifications disabled" };
    }

    // Verificar horario de silencio (solo para notificaciones no transaccionales)
    if (
      preferences.quietHoursEnabled &&
      args.notificationType !== "transactional" &&
      preferences.quietHoursStart &&
      preferences.quietHoursEnd
    ) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinutes;

      const [startHour, startMinutes] = preferences.quietHoursStart.split(":").map(Number);
      const [endHour, endMinutes] = preferences.quietHoursEnd.split(":").map(Number);
      const startTime = startHour * 60 + startMinutes;
      const endTime = endHour * 60 + endMinutes;

      // Manejar casos donde el horario cruza medianoche
      if (startTime > endTime) {
        if (currentTime >= startTime || currentTime < endTime) {
          return { canSend: false, reason: "Quiet hours active" };
        }
      } else {
        if (currentTime >= startTime && currentTime < endTime) {
          return { canSend: false, reason: "Quiet hours active" };
        }
      }
    }

    return { canSend: true, reason: "All checks passed" };
  },
});

/**
 * Registrar token FCM para push notifications
 */
export const registerFCMToken = mutation({
  args: {
    entityType: v.union(v.literal("customer"), v.literal("user")),
    entityId: v.union(v.id("customers"), v.id("users")),
    fcmToken: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    const preferences = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_org_and_entity", (q) =>
        q.eq("orgId", user.orgId)
         .eq("entityType", args.entityType)
         .eq("entityId", args.entityId)
      )
      .first();

    const now = Date.now();

    if (preferences) {
      // Agregar token si no existe
      const tokens = preferences.fcmTokens || [];
      if (!tokens.includes(args.fcmToken)) {
        tokens.push(args.fcmToken);
        await ctx.db.patch(preferences._id, {
          fcmTokens: tokens,
          updatedAt: now,
        });
      }
    } else {
      // Crear preferencias con el token
      await ctx.db.insert("notificationPreferences", {
        orgId: user.orgId,
        entityType: args.entityType,
        entityId: args.entityId,
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
        marketingEnabled: true,
        transactionalEnabled: true,
        loyaltyEnabled: true,
        promotionsEnabled: true,
        quietHoursEnabled: false,
        timezone: "America/Argentina/Buenos_Aires",
        fcmTokens: [args.fcmToken],
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Eliminar token FCM
 */
export const removeFCMToken = mutation({
  args: {
    entityType: v.union(v.literal("customer"), v.literal("user")),
    entityId: v.union(v.id("customers"), v.id("users")),
    fcmToken: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    const preferences = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_org_and_entity", (q) =>
        q.eq("orgId", user.orgId)
         .eq("entityType", args.entityType)
         .eq("entityId", args.entityId)
      )
      .first();

    if (preferences && preferences.fcmTokens) {
      const tokens = preferences.fcmTokens.filter(t => t !== args.fcmToken);
      await ctx.db.patch(preferences._id, {
        fcmTokens: tokens,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

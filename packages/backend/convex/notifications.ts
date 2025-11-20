import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

/**
 * Crear una nueva notificación
 */
export const create = mutation({
  args: {
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
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    )),
    subject: v.optional(v.string()),
    body: v.string(),
    htmlBody: v.optional(v.string()),
    metadata: v.optional(v.any()),
    variables: v.optional(v.any()),
    scheduledFor: v.optional(v.number()),
    relatedSaleId: v.optional(v.id("sales")),
    relatedPromotionId: v.optional(v.id("promotions")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    const now = Date.now();
    const notificationId = await ctx.db.insert("notifications", {
      orgId: user.orgId,
      templateId: args.templateId,
      recipientType: args.recipientType,
      recipientId: args.recipientId,
      recipientEmail: args.recipientEmail,
      recipientPhone: args.recipientPhone,
      channel: args.channel,
      status: args.scheduledFor ? "scheduled" : "draft",
      priority: args.priority || "normal",
      subject: args.subject,
      body: args.body,
      htmlBody: args.htmlBody,
      metadata: args.metadata,
      variables: args.variables,
      scheduledFor: args.scheduledFor,
      retryCount: 0,
      maxRetries: 3,
      relatedSaleId: args.relatedSaleId,
      relatedPromotionId: args.relatedPromotionId,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    // Log de creación
    await ctx.db.insert("notificationLogs", {
      orgId: user.orgId,
      notificationId,
      event: "created",
      channel: args.channel,
      createdAt: now,
    });

    return notificationId;
  },
});

/**
 * Enviar una notificación inmediatamente
 */
export const send = action({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    // Trigger internal action to send
    await ctx.runAction(internal.notifications.processSend, {
      notificationId: args.notificationId,
    });

    return { success: true };
  },
});

/**
 * Procesar el envío de una notificación (internal action)
 */
export const processSend = internalAction({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    // Obtener la notificación
    const notification = await ctx.runQuery(internal.notifications.getById, {
      notificationId: args.notificationId,
    });

    if (!notification) {
      throw new Error("Notificación no encontrada");
    }

    if (notification.status === "sent") {
      return { success: true, message: "Ya enviada" };
    }

    try {
      // Actualizar estado a "sending"
      await ctx.runMutation(internal.notifications.updateStatus, {
        notificationId: args.notificationId,
        status: "sending",
      });

      // Enviar según el canal
      let result: { success: boolean; externalId?: string; results?: any[] } | undefined;
      switch (notification.channel) {
        case "email":
          result = await ctx.runAction(internal.notifications.sendEmail, {
            notificationId: args.notificationId,
          });
          break;
        case "sms":
          result = await ctx.runAction(internal.notifications.sendSMS, {
            notificationId: args.notificationId,
          });
          break;
        case "push":
          result = await ctx.runAction(internal.notifications.sendPush, {
            notificationId: args.notificationId,
          });
          break;
        case "multi":
          // Enviar por todos los canales habilitados
          result = await ctx.runAction(internal.notifications.sendMultiChannel, {
            notificationId: args.notificationId,
          });
          break;
      }

      // Actualizar estado a "sent"
      await ctx.runMutation(internal.notifications.updateStatus, {
        notificationId: args.notificationId,
        status: "sent",
        sentAt: Date.now(),
        externalId: result?.externalId,
      });

      // Log de envío exitoso
      await ctx.runMutation(internal.notifications.addLog, {
        notificationId: args.notificationId,
        event: "sent",
        channel: notification.channel,
      });

      return { success: true };
    } catch (error: any) {
      // Actualizar estado a "failed"
      await ctx.runMutation(internal.notifications.updateStatus, {
        notificationId: args.notificationId,
        status: "failed",
        errorMessage: error.message,
      });

      // Log de error
      await ctx.runMutation(internal.notifications.addLog, {
        notificationId: args.notificationId,
        event: "failed",
        channel: notification.channel,
        errorMessage: error.message,
      });

      throw error;
    }
  },
});

/**
 * Obtener notificación por ID (internal query)
 */
export const getById = internalQuery({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.notificationId);
  },
});

/**
 * Actualizar estado de notificación (internal mutation)
 */
export const updateStatus = internalMutation({
  args: {
    notificationId: v.id("notifications"),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("sending"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    sentAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    externalId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.sentAt !== undefined) updates.sentAt = args.sentAt;
    if (args.deliveredAt !== undefined) updates.deliveredAt = args.deliveredAt;
    if (args.errorMessage !== undefined) updates.errorMessage = args.errorMessage;
    if (args.externalId !== undefined) updates.externalId = args.externalId;

    await ctx.db.patch(args.notificationId, updates);
  },
});

/**
 * Agregar log de notificación (internal mutation)
 */
export const addLog = internalMutation({
  args: {
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
    errorMessage: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notificación no encontrada");

    await ctx.db.insert("notificationLogs", {
      orgId: notification.orgId,
      notificationId: args.notificationId,
      event: args.event,
      channel: args.channel,
      details: args.details,
      errorMessage: args.errorMessage,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

/**
 * Enviar email (internal action) - Mock implementation
 * En producción, se integraría con Resend o similar
 */
export const sendEmail = internalAction({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.runQuery(internal.notifications.getById, {
      notificationId: args.notificationId,
    });

    if (!notification) throw new Error("Notificación no encontrada");

    // TODO: Integración con Resend
    // Simulación de envío
    console.log("Enviando email:", {
      to: notification.recipientEmail,
      subject: notification.subject,
      body: notification.body,
    });

    // Simular ID externo
    const externalId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return { success: true, externalId };
  },
});

/**
 * Enviar SMS (internal action) - Mock implementation
 * En producción, se integraría con Twilio
 */
export const sendSMS = internalAction({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.runQuery(internal.notifications.getById, {
      notificationId: args.notificationId,
    });

    if (!notification) throw new Error("Notificación no encontrada");

    // TODO: Integración con Twilio
    // Simulación de envío
    console.log("Enviando SMS:", {
      to: notification.recipientPhone,
      body: notification.body,
    });

    // Simular ID externo
    const externalId = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return { success: true, externalId };
  },
});

/**
 * Enviar Push notification (internal action) - Mock implementation
 * En producción, se integraría con FCM
 */
export const sendPush = internalAction({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.runQuery(internal.notifications.getById, {
      notificationId: args.notificationId,
    });

    if (!notification) throw new Error("Notificación no encontrada");

    // TODO: Integración con Firebase Cloud Messaging
    // Simulación de envío
    console.log("Enviando Push:", {
      recipientId: notification.recipientId,
      title: notification.subject,
      body: notification.body,
    });

    // Simular ID externo
    const externalId = `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return { success: true, externalId };
  },
});

/**
 * Enviar por múltiples canales (internal action)
 */
export const sendMultiChannel = internalAction({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const results = [];

    // Intentar enviar por email
    try {
      const emailResult: { success: boolean; externalId: string } = await ctx.runAction(internal.notifications.sendEmail, {
        notificationId: args.notificationId,
      });
      results.push({ channel: "email", ...emailResult });
    } catch (error) {
      console.error("Error enviando email:", error);
    }

    // Intentar enviar por SMS
    try {
      const smsResult: { success: boolean; externalId: string } = await ctx.runAction(internal.notifications.sendSMS, {
        notificationId: args.notificationId,
      });
      results.push({ channel: "sms", ...smsResult });
    } catch (error) {
      console.error("Error enviando SMS:", error);
    }

    // Intentar enviar push
    try {
      const pushResult: { success: boolean; externalId: string } = await ctx.runAction(internal.notifications.sendPush, {
        notificationId: args.notificationId,
      });
      results.push({ channel: "push", ...pushResult });
    } catch (error) {
      console.error("Error enviando push:", error);
    }

    return { success: true, results };
  },
});

/**
 * Listar notificaciones de una organización
 */
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("sending"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("cancelled")
    )),
    channel: v.optional(v.union(
      v.literal("email"),
      v.literal("sms"),
      v.literal("push"),
      v.literal("multi")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    let query = ctx.db
      .query("notifications")
      .withIndex("by_org", (q) => q.eq("orgId", user.orgId))
      .order("desc");

    const notifications = await query.collect();

    let filtered = notifications;

    if (args.status) {
      filtered = filtered.filter(n => n.status === args.status);
    }

    if (args.channel) {
      filtered = filtered.filter(n => n.channel === args.channel);
    }

    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

/**
 * Obtener notificaciones de un destinatario específico
 */
export const listByRecipient = query({
  args: {
    recipientId: v.union(v.id("customers"), v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_org_and_recipient", (q) =>
        q.eq("orgId", user.orgId).eq("recipientId", args.recipientId)
      )
      .order("desc")
      .take(args.limit || 50);

    return notifications;
  },
});

/**
 * Marcar notificación como leída
 */
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notificación no encontrada");
    if (notification.orgId !== user.orgId) throw new Error("Acceso denegado");

    const now = Date.now();
    await ctx.db.patch(args.notificationId, {
      readAt: now,
      updatedAt: now,
    });

    // Log
    await ctx.db.insert("notificationLogs", {
      orgId: notification.orgId,
      notificationId: args.notificationId,
      event: "opened",
      channel: notification.channel,
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Obtener estadísticas de notificaciones
 */
export const getStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_org", (q) => q.eq("orgId", user.orgId))
      .collect();

    let filtered = notifications;

    if (args.startDate) {
      filtered = filtered.filter(n => n.createdAt >= args.startDate!);
    }

    if (args.endDate) {
      filtered = filtered.filter(n => n.createdAt <= args.endDate!);
    }

    const stats = {
      total: filtered.length,
      byStatus: {
        draft: filtered.filter(n => n.status === "draft").length,
        scheduled: filtered.filter(n => n.status === "scheduled").length,
        sending: filtered.filter(n => n.status === "sending").length,
        sent: filtered.filter(n => n.status === "sent").length,
        failed: filtered.filter(n => n.status === "failed").length,
        cancelled: filtered.filter(n => n.status === "cancelled").length,
      },
      byChannel: {
        email: filtered.filter(n => n.channel === "email").length,
        sms: filtered.filter(n => n.channel === "sms").length,
        push: filtered.filter(n => n.channel === "push").length,
        multi: filtered.filter(n => n.channel === "multi").length,
      },
      opened: filtered.filter(n => n.readAt !== undefined).length,
      clicked: filtered.filter(n => n.clickedAt !== undefined).length,
    };

    return stats;
  },
});

/**
 * Cancelar una notificación programada
 */
export const cancel = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notificación no encontrada");
    if (notification.orgId !== user.orgId) throw new Error("Acceso denegado");

    if (notification.status === "sent") {
      throw new Error("No se puede cancelar una notificación ya enviada");
    }

    await ctx.db.patch(args.notificationId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

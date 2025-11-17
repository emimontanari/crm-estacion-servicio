import { v } from "convex/values";
import { action, internalAction, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

/**
 * Crear una nueva campaña de notificaciones
 */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    templateId: v.id("notificationTemplates"),
    targetType: v.union(
      v.literal("all_customers"),
      v.literal("segment"),
      v.literal("specific_list")
    ),
    segmentFilter: v.optional(v.any()),
    specificRecipients: v.optional(v.array(v.union(
      v.id("customers"),
      v.id("users")
    ))),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    // Verificar que la plantilla existe
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Plantilla no encontrada");
    if (template.orgId !== user.orgId) throw new Error("Acceso denegado");

    const now = Date.now();
    const campaignId = await ctx.db.insert("notificationCampaigns", {
      orgId: user.orgId,
      name: args.name,
      description: args.description,
      templateId: args.templateId,
      targetType: args.targetType,
      segmentFilter: args.segmentFilter,
      specificRecipients: args.specificRecipients,
      status: args.scheduledFor ? "scheduled" : "draft",
      scheduledFor: args.scheduledFor,
      totalRecipients: 0,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      openedCount: 0,
      clickedCount: 0,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return campaignId;
  },
});

/**
 * Obtener lista de campañas
 */
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("failed")
    )),
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
      .query("notificationCampaigns")
      .withIndex("by_org", (q) => q.eq("orgId", user.orgId))
      .order("desc");

    const campaigns = await query.collect();

    if (args.status) {
      return campaigns.filter(c => c.status === args.status);
    }

    return campaigns;
  },
});

/**
 * Obtener una campaña por ID
 */
export const get = query({
  args: {
    campaignId: v.id("notificationCampaigns"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaña no encontrada");
    if (campaign.orgId !== user.orgId) throw new Error("Acceso denegado");

    return campaign;
  },
});

/**
 * Iniciar el envío de una campaña
 */
export const launch = action({
  args: {
    campaignId: v.id("notificationCampaigns"),
  },
  handler: async (ctx, args) => {
    await ctx.runAction(internal.notificationCampaigns.processLaunch, {
      campaignId: args.campaignId,
    });

    return { success: true };
  },
});

/**
 * Procesar el lanzamiento de una campaña (internal action)
 */
export const processLaunch = internalAction({
  args: {
    campaignId: v.id("notificationCampaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.runQuery(internal.notificationCampaigns.getById, {
      campaignId: args.campaignId,
    });

    if (!campaign) throw new Error("Campaña no encontrada");

    if (campaign.status !== "draft" && campaign.status !== "scheduled") {
      throw new Error("La campaña ya fue lanzada o está en progreso");
    }

    // Actualizar estado a "in_progress"
    await ctx.runMutation(internal.notificationCampaigns.updateStatus, {
      campaignId: args.campaignId,
      status: "in_progress",
      startedAt: Date.now(),
    });

    try {
      // Obtener destinatarios según el tipo de target
      const recipients = await ctx.runQuery(internal.notificationCampaigns.getRecipients, {
        campaignId: args.campaignId,
      });

      // Actualizar total de destinatarios
      await ctx.runMutation(internal.notificationCampaigns.updateStats, {
        campaignId: args.campaignId,
        totalRecipients: recipients.length,
      });

      // Obtener la plantilla
      const template = await ctx.runQuery(internal.notificationCampaigns.getTemplate, {
        templateId: campaign.templateId,
      });

      if (!template) throw new Error("Plantilla no encontrada");

      // Enviar notificaciones a cada destinatario
      for (const recipient of recipients) {
        try {
          // Crear notificación para cada destinatario
          const notificationId = await ctx.runMutation(internal.notificationCampaigns.createNotificationForRecipient, {
            campaignId: args.campaignId,
            orgId: campaign.orgId,
            recipientId: recipient._id,
            recipientType: recipient.type,
            templateId: campaign.templateId,
            template,
            recipient,
          });

          // Enviar la notificación
          await ctx.runAction(internal.notifications.processSend, {
            notificationId,
          });

          // Incrementar contador de enviados
          await ctx.runMutation(internal.notificationCampaigns.incrementSent, {
            campaignId: args.campaignId,
          });
        } catch (error) {
          console.error(`Error enviando a destinatario ${recipient._id}:`, error);
          // Incrementar contador de fallidos
          await ctx.runMutation(internal.notificationCampaigns.incrementFailed, {
            campaignId: args.campaignId,
          });
        }
      }

      // Marcar campaña como completada
      await ctx.runMutation(internal.notificationCampaigns.updateStatus, {
        campaignId: args.campaignId,
        status: "completed",
        completedAt: Date.now(),
      });

      return { success: true };
    } catch (error: any) {
      // Marcar campaña como fallida
      await ctx.runMutation(internal.notificationCampaigns.updateStatus, {
        campaignId: args.campaignId,
        status: "failed",
      });

      throw error;
    }
  },
});

/**
 * Obtener campaña por ID (internal)
 */
export const getById = query({
  args: {
    campaignId: v.id("notificationCampaigns"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.campaignId);
  },
});

/**
 * Obtener plantilla (internal)
 */
export const getTemplate = query({
  args: {
    templateId: v.id("notificationTemplates"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.templateId);
  },
});

/**
 * Obtener destinatarios de una campaña (internal)
 */
export const getRecipients = query({
  args: {
    campaignId: v.id("notificationCampaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaña no encontrada");

    const recipients: any[] = [];

    if (campaign.targetType === "all_customers") {
      // Obtener todos los clientes activos
      const customers = await ctx.db
        .query("customers")
        .withIndex("by_org_and_active", (q) =>
          q.eq("orgId", campaign.orgId).eq("isActive", true)
        )
        .collect();

      recipients.push(...customers.map(c => ({ ...c, type: "customer" as const })));
    } else if (campaign.targetType === "specific_list" && campaign.specificRecipients) {
      // Obtener destinatarios específicos
      for (const recipientId of campaign.specificRecipients) {
        const recipient = await ctx.db.get(recipientId);
        if (recipient) {
          // Determinar el tipo basado en la tabla
          const type = recipientId.toString().startsWith("customers:") ? "customer" : "user";
          recipients.push({ ...recipient, type });
        }
      }
    } else if (campaign.targetType === "segment" && campaign.segmentFilter) {
      // TODO: Implementar segmentación avanzada
      // Por ahora, retornar todos los clientes activos
      const customers = await ctx.db
        .query("customers")
        .withIndex("by_org_and_active", (q) =>
          q.eq("orgId", campaign.orgId).eq("isActive", true)
        )
        .collect();

      recipients.push(...customers.map(c => ({ ...c, type: "customer" as const })));
    }

    return recipients;
  },
});

/**
 * Crear notificación para un destinatario (internal mutation)
 */
export const createNotificationForRecipient = mutation({
  args: {
    campaignId: v.id("notificationCampaigns"),
    orgId: v.id("organizations"),
    recipientId: v.union(v.id("customers"), v.id("users")),
    recipientType: v.union(v.literal("customer"), v.literal("user")),
    templateId: v.id("notificationTemplates"),
    template: v.any(),
    recipient: v.any(),
  },
  handler: async (ctx, args) => {
    // Renderizar plantilla con datos del destinatario
    const variables = {
      name: args.recipient.name,
      email: args.recipient.email,
      phone: args.recipient.phone,
      // Agregar más variables según sea necesario
    };

    // Helper para reemplazar variables
    const replaceVariables = (text: string, vars: Record<string, any>): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return vars[key] !== undefined ? String(vars[key]) : match;
      });
    };

    // Determinar el canal principal
    const channel = args.template.channels[0] || "email";

    let subject, body, htmlBody;

    if (channel === "email" && args.template.emailTemplate) {
      subject = replaceVariables(args.template.emailTemplate.subject, variables);
      body = replaceVariables(args.template.emailTemplate.textBody || args.template.emailTemplate.htmlBody, variables);
      htmlBody = replaceVariables(args.template.emailTemplate.htmlBody, variables);
    } else if (channel === "sms" && args.template.smsTemplate) {
      body = replaceVariables(args.template.smsTemplate.body, variables);
    } else if (channel === "push" && args.template.pushTemplate) {
      subject = replaceVariables(args.template.pushTemplate.title, variables);
      body = replaceVariables(args.template.pushTemplate.body, variables);
    }

    const now = Date.now();
    const notificationId = await ctx.db.insert("notifications", {
      orgId: args.orgId,
      templateId: args.templateId,
      recipientType: args.recipientType,
      recipientId: args.recipientId,
      recipientEmail: args.recipient.email,
      recipientPhone: args.recipient.phone,
      channel,
      status: "draft",
      priority: "normal",
      subject,
      body: body || "",
      htmlBody,
      metadata: {
        campaignId: args.campaignId,
      },
      variables,
      retryCount: 0,
      maxRetries: 3,
      createdAt: now,
      updatedAt: now,
    });

    return notificationId;
  },
});

/**
 * Actualizar estado de campaña (internal mutation)
 */
export const updateStatus = mutation({
  args: {
    campaignId: v.id("notificationCampaigns"),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("failed")
    ),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.startedAt !== undefined) updates.startedAt = args.startedAt;
    if (args.completedAt !== undefined) updates.completedAt = args.completedAt;

    await ctx.db.patch(args.campaignId, updates);
  },
});

/**
 * Actualizar estadísticas de campaña (internal mutation)
 */
export const updateStats = mutation({
  args: {
    campaignId: v.id("notificationCampaigns"),
    totalRecipients: v.optional(v.number()),
    sentCount: v.optional(v.number()),
    deliveredCount: v.optional(v.number()),
    failedCount: v.optional(v.number()),
    openedCount: v.optional(v.number()),
    clickedCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaña no encontrada");

    const updates: any = { updatedAt: Date.now() };

    if (args.totalRecipients !== undefined) updates.totalRecipients = args.totalRecipients;
    if (args.sentCount !== undefined) updates.sentCount = args.sentCount;
    if (args.deliveredCount !== undefined) updates.deliveredCount = args.deliveredCount;
    if (args.failedCount !== undefined) updates.failedCount = args.failedCount;
    if (args.openedCount !== undefined) updates.openedCount = args.openedCount;
    if (args.clickedCount !== undefined) updates.clickedCount = args.clickedCount;

    await ctx.db.patch(args.campaignId, updates);
  },
});

/**
 * Incrementar contador de enviados (internal mutation)
 */
export const incrementSent = mutation({
  args: {
    campaignId: v.id("notificationCampaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaña no encontrada");

    await ctx.db.patch(args.campaignId, {
      sentCount: campaign.sentCount + 1,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Incrementar contador de fallidos (internal mutation)
 */
export const incrementFailed = mutation({
  args: {
    campaignId: v.id("notificationCampaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaña no encontrada");

    await ctx.db.patch(args.campaignId, {
      failedCount: campaign.failedCount + 1,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Cancelar una campaña
 */
export const cancel = mutation({
  args: {
    campaignId: v.id("notificationCampaigns"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaña no encontrada");
    if (campaign.orgId !== user.orgId) throw new Error("Acceso denegado");

    if (campaign.status === "completed") {
      throw new Error("No se puede cancelar una campaña completada");
    }

    await ctx.db.patch(args.campaignId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

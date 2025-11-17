import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Crear una nueva plantilla de notificación
 */
export const create = mutation({
  args: {
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
    variables: v.array(v.string()),
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
    const templateId = await ctx.db.insert("notificationTemplates", {
      orgId: user.orgId,
      name: args.name,
      description: args.description,
      type: args.type,
      channels: args.channels,
      emailTemplate: args.emailTemplate,
      smsTemplate: args.smsTemplate,
      pushTemplate: args.pushTemplate,
      variables: args.variables,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return templateId;
  },
});

/**
 * Actualizar una plantilla existente
 */
export const update = mutation({
  args: {
    templateId: v.id("notificationTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    channels: v.optional(v.array(v.union(
      v.literal("email"),
      v.literal("sms"),
      v.literal("push")
    ))),
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
    variables: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Plantilla no encontrada");
    if (template.orgId !== user.orgId) throw new Error("Acceso denegado");

    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.channels !== undefined) updates.channels = args.channels;
    if (args.emailTemplate !== undefined) updates.emailTemplate = args.emailTemplate;
    if (args.smsTemplate !== undefined) updates.smsTemplate = args.smsTemplate;
    if (args.pushTemplate !== undefined) updates.pushTemplate = args.pushTemplate;
    if (args.variables !== undefined) updates.variables = args.variables;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.templateId, updates);
    return { success: true };
  },
});

/**
 * Obtener todas las plantillas de una organización
 */
export const list = query({
  args: {
    isActive: v.optional(v.boolean()),
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
      .query("notificationTemplates")
      .withIndex("by_org", (q) => q.eq("orgId", user.orgId));

    const templates = await query.collect();

    if (args.isActive !== undefined) {
      return templates.filter(t => t.isActive === args.isActive);
    }

    return templates;
  },
});

/**
 * Obtener una plantilla por ID
 */
export const get = query({
  args: {
    templateId: v.id("notificationTemplates"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Plantilla no encontrada");
    if (template.orgId !== user.orgId) throw new Error("Acceso denegado");

    return template;
  },
});

/**
 * Obtener plantillas por tipo
 */
export const getByType = query({
  args: {
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    const templates = await ctx.db
      .query("notificationTemplates")
      .withIndex("by_org_and_type", (q) =>
        q.eq("orgId", user.orgId).eq("type", args.type)
      )
      .collect();

    return templates;
  },
});

/**
 * Eliminar una plantilla (soft delete)
 */
export const remove = mutation({
  args: {
    templateId: v.id("notificationTemplates"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Plantilla no encontrada");
    if (template.orgId !== user.orgId) throw new Error("Acceso denegado");

    await ctx.db.patch(args.templateId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Renderizar una plantilla con variables
 * Esta función reemplaza las variables en el template con los valores proporcionados
 */
export const renderTemplate = query({
  args: {
    templateId: v.id("notificationTemplates"),
    variables: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userId))
      .first();

    if (!user) throw new Error("Usuario no encontrado");

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Plantilla no encontrada");
    if (template.orgId !== user.orgId) throw new Error("Acceso denegado");

    // Función helper para reemplazar variables
    const replaceVariables = (text: string, vars: Record<string, any>): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return vars[key] !== undefined ? String(vars[key]) : match;
      });
    };

    const rendered: any = {};

    if (template.emailTemplate) {
      rendered.email = {
        subject: replaceVariables(template.emailTemplate.subject, args.variables),
        htmlBody: replaceVariables(template.emailTemplate.htmlBody, args.variables),
        textBody: template.emailTemplate.textBody
          ? replaceVariables(template.emailTemplate.textBody, args.variables)
          : undefined,
      };
    }

    if (template.smsTemplate) {
      rendered.sms = {
        body: replaceVariables(template.smsTemplate.body, args.variables),
      };
    }

    if (template.pushTemplate) {
      rendered.push = {
        title: replaceVariables(template.pushTemplate.title, args.variables),
        body: replaceVariables(template.pushTemplate.body, args.variables),
        icon: template.pushTemplate.icon,
        clickAction: template.pushTemplate.clickAction,
      };
    }

    return rendered;
  },
});

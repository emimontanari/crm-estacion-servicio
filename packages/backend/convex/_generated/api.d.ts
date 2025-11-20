/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as customers from "../customers.js";
import type * as invitations from "../invitations.js";
import type * as loyalty from "../loyalty.js";
import type * as notificationCampaigns from "../notificationCampaigns.js";
import type * as notificationPreferences from "../notificationPreferences.js";
import type * as notificationTemplates from "../notificationTemplates.js";
import type * as notifications from "../notifications.js";
import type * as organizations from "../organizations.js";
import type * as payments from "../payments.js";
import type * as products from "../products.js";
import type * as reports from "../reports.js";
import type * as sales from "../sales.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  customers: typeof customers;
  invitations: typeof invitations;
  loyalty: typeof loyalty;
  notificationCampaigns: typeof notificationCampaigns;
  notificationPreferences: typeof notificationPreferences;
  notificationTemplates: typeof notificationTemplates;
  notifications: typeof notifications;
  organizations: typeof organizations;
  payments: typeof payments;
  products: typeof products;
  reports: typeof reports;
  sales: typeof sales;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

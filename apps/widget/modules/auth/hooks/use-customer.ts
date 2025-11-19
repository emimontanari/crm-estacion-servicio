"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";

/**
 * Hook to get current customer information
 */
export function useCustomer() {
  const currentUser = useQuery(api.users.getCurrent);

  return {
    customer: currentUser?.role === "customer" ? currentUser : null,
    isCustomer: currentUser?.role === "customer",
    isLoading: currentUser === undefined,
  };
}

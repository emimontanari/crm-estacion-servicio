"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { useAuth } from "@clerk/nextjs";

/**
 * Hook para obtener la organización actual
 */
export function useOrganization() {
  const { orgId, isLoaded } = useAuth();
  const organization = useQuery(api.organizations.getCurrent, orgId ? {} : "skip");
  const stats = useQuery(api.organizations.getStats, orgId ? {} : "skip");
  const config = useQuery(api.organizations.getFullConfig, orgId ? {} : "skip");

  return {
    organization,
    stats,
    config,
    isLoading: !isLoaded || organization === undefined,
    hasOrganization: !!orgId,
  };
}

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { useCallback } from "react";

/**
 * Hook para gestionar usuarios de la organización
 */
export function useUsers(includeInactive = false) {
  const users = useQuery(api.users.getAll, { includeInactive });
  const stats = useQuery(api.users.getStats);

  // Mutations
  const updateUser = useMutation(api.users.update);
  const updateRole = useMutation(api.users.updateRole);
  const toggleActive = useMutation(api.users.toggleActive);
  const removeUser = useMutation(api.users.remove);

  // Helper functions
  const handleUpdateUser = useCallback(
    async (userId: any, data: any) => {
      try {
        await updateUser({ id: userId, ...data });
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [updateUser]
  );

  const handleUpdateRole = useCallback(
    async (userId: any, role: "admin" | "manager" | "cashier" | "viewer") => {
      try {
        await updateRole({ userId, role });
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [updateRole]
  );

  const handleToggleActive = useCallback(
    async (userId: any, isActive: boolean) => {
      try {
        await toggleActive({ userId, isActive });
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [toggleActive]
  );

  const handleRemoveUser = useCallback(
    async (userId: any) => {
      try {
        await removeUser({ userId });
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [removeUser]
  );

  return {
    users,
    stats,
    isLoading: users === undefined,

    // Actions
    updateUser: handleUpdateUser,
    updateRole: handleUpdateRole,
    toggleActive: handleToggleActive,
    removeUser: handleRemoveUser,
  };
}

/**
 * Hook para obtener usuario específico por ID
 */
export function useUser(userId: any) {
  const user = useQuery(api.users.getById, userId ? { id: userId } : "skip");

  return {
    user,
    isLoading: user === undefined,
  };
}

/**
 * Hook para obtener usuarios por rol
 */
export function useUsersByRole(role: "admin" | "manager" | "cashier" | "viewer") {
  const users = useQuery(api.users.getByRole, { role });

  return {
    users,
    isLoading: users === undefined,
  };
}

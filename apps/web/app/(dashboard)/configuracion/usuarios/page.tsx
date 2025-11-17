"use client";

import { useState } from "react";
import { useUsers, useCurrentUser } from "@/modules/auth/hooks";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { DataTable, Button, Badge } from "@workspace/ui";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Shield, Trash2, Edit } from "lucide-react";
import Link from "next/link";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  cashier: "Cajero",
  viewer: "Visualizador",
};

const roleColors: Record<string, string> = {
  admin: "bg-red-500",
  manager: "bg-blue-500",
  cashier: "bg-green-500",
  viewer: "bg-gray-500",
};

export default function UsersPage() {
  const { user: currentUser } = useCurrentUser();
  const { users, isLoading } = useUsers();
  const deleteUser = useMutation(api.users.deleteUser);
  const updateRole = useMutation(api.users.updateRole);

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleDeleteUser = async (userId: string) => {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await deleteUser({ userId });
      } catch (error: any) {
        alert(error.message || "Error al eliminar usuario");
      }
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (confirm(`¿Confirmas cambiar el rol a ${roleLabels[newRole]}?`)) {
      setUpdatingUserId(userId);
      try {
        await updateRole({ userId, role: newRole as any });
      } catch (error: any) {
        alert(error.message || "Error al actualizar rol");
      } finally {
        setUpdatingUserId(null);
      }
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Usuario",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Badge
            variant="secondary"
            className={`${roleColors[user.role]} text-white`}
          >
            {roleLabels[user.role]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Fecha de Registro",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("es-AR"),
    },
    {
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        const isCurrentUser = currentUser?.clerkId === user.clerkId;

        return (
          <div className="flex items-center gap-2">
            <select
              className="text-sm border rounded px-2 py-1"
              value={user.role}
              onChange={(e) => handleUpdateRole(user._id, e.target.value)}
              disabled={isCurrentUser || updatingUserId === user._id}
            >
              <option value="admin">Administrador</option>
              <option value="manager">Gerente</option>
              <option value="cashier">Cajero</option>
              <option value="viewer">Visualizador</option>
            </select>

            {!isCurrentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteUser(user._id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((u) => u.isActive).length || 0;
  const adminUsers = users?.filter((u) => u.role === "admin").length || 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/configuracion">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
          <p className="text-muted-foreground">
            Gestiona los usuarios y sus roles
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{totalUsers}</div>
          <p className="text-xs text-muted-foreground">Total Usuarios</p>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {activeUsers}
          </div>
          <p className="text-xs text-muted-foreground">Usuarios Activos</p>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold text-red-600">{adminUsers}</div>
          <p className="text-xs text-muted-foreground">Administradores</p>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users || []}
        searchKey="name"
        searchPlaceholder="Buscar usuarios..."
      />

      {/* Role Descriptions */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold">Administrador</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Acceso completo al sistema, puede gestionar usuarios, configuración
            y todos los módulos.
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Gerente</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Puede gestionar inventario, clientes, ver reportes y realizar
            ventas. No puede modificar configuración ni usuarios.
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Cajero</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Puede realizar ventas, buscar clientes y productos. Acceso de solo
            lectura a reportes básicos.
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold">Visualizador</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Acceso de solo lectura a reportes y dashboard. No puede realizar
            cambios en el sistema.
          </p>
        </div>
      </div>
    </div>
  );
}

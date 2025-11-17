"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api";
import {
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui";
import { Mail, MessageSquare, Bell, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface TemplateListProps {
  onEdit?: (templateId: string) => void;
  onView?: (templateId: string) => void;
}

export function TemplateList({ onEdit, onView }: TemplateListProps) {
  const templates = useQuery(api.notificationTemplates.list, {});
  const removeTemplate = useMutation(api.notificationTemplates.remove);

  const handleDelete = async (templateId: any) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta plantilla?")) {
      return;
    }

    try {
      await removeTemplate({ templateId });
      toast.success("Plantilla eliminada exitosamente");
    } catch (error: any) {
      console.error("Error deleting template:", error);
      toast.error(error.message || "Error al eliminar la plantilla");
    }
  };

  const getChannelIcons = (channels: string[]) => {
    return channels.map((channel) => {
      switch (channel) {
        case "email":
          return <Mail key={channel} className="h-4 w-4" />;
        case "sms":
          return <MessageSquare key={channel} className="h-4 w-4" />;
        case "push":
          return <Bell key={channel} className="h-4 w-4" />;
        default:
          return null;
      }
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      welcome: "Bienvenida",
      purchase_confirmation: "Confirmación de compra",
      loyalty_points: "Puntos de fidelidad",
      promotion: "Promoción",
      birthday: "Cumpleaños",
      payment_receipt: "Recibo de pago",
      low_stock_alert: "Alerta de stock",
      custom: "Personalizada",
    };
    return labels[type] || type;
  };

  if (!templates) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Mail className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No hay plantillas creadas</p>
        <p className="text-sm">Crea tu primera plantilla de notificación</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Canales</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Variables</TableHead>
            <TableHead>Creada</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template._id}>
              <TableCell className="font-medium">
                <div>
                  <div>{template.name}</div>
                  {template.description && (
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {template.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{getTypeLabel(template.type)}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {getChannelIcons(template.channels)}
                </div>
              </TableCell>
              <TableCell>
                {template.isActive ? (
                  <Badge variant="default">Activa</Badge>
                ) : (
                  <Badge variant="secondary">Inactiva</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {template.variables.length} variables
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(template.createdAt, {
                  addSuffix: true,
                  locale: es,
                })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onView?.(template._id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(template._id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(template._id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

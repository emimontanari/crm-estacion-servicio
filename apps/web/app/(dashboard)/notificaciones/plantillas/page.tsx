"use client";

import { useState } from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui";
import { Plus } from "lucide-react";
import { TemplateList } from "@/components/notifications/template-list";
import { TemplateForm } from "@/components/notifications/template-form";

export default function TemplatesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Plantillas de Notificaciones
          </h2>
          <p className="text-muted-foreground">
            Crea y gestiona plantillas reutilizables para tus notificaciones
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Plantilla</DialogTitle>
              <DialogDescription>
                Configura una plantilla para enviar notificaciones por email, SMS o push
              </DialogDescription>
            </DialogHeader>
            <TemplateForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <TemplateList
        onEdit={(id) => console.log("Edit template:", id)}
        onView={(id) => console.log("View template:", id)}
      />
    </div>
  );
}

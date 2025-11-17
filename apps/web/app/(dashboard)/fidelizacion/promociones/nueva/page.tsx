"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Button,
  Checkbox,
} from "@workspace/ui";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPromotionPage() {
  const router = useRouter();
  const createPromotion = useMutation(api.loyalty.createPromotion);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "multiplier" as "multiplier" | "bonus" | "discount",
    value: 2,
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!formData.startDate || !formData.endDate) {
      setError("Debes ingresar las fechas de inicio y fin");
      setIsSubmitting(false);
      return;
    }

    const startDate = new Date(formData.startDate).getTime();
    const endDate = new Date(formData.endDate).getTime();

    if (startDate >= endDate) {
      setError("La fecha de fin debe ser posterior a la fecha de inicio");
      setIsSubmitting(false);
      return;
    }

    try {
      await createPromotion({
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        value: formData.value,
        startDate,
        endDate,
        isActive: formData.isActive,
      });

      router.push("/fidelizacion/promociones");
    } catch (err: any) {
      setError(err.message || "Error al crear promoción");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/fidelizacion/promociones">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Nueva Promoción
          </h2>
          <p className="text-muted-foreground">
            Crea una nueva promoción de fidelidad
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Promoción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Puntos Dobles Fin de Semana"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe los detalles de la promoción..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">
                  Tipo de Promoción <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiplier">
                      Multiplicador de Puntos
                    </SelectItem>
                    <SelectItem value="bonus">Bonus de Puntos</SelectItem>
                    <SelectItem value="discount">
                      Descuento Porcentual
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">
                  Valor <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step="0.1"
                  required
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      value: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder={
                    formData.type === "multiplier"
                      ? "2"
                      : formData.type === "bonus"
                      ? "100"
                      : "10"
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {formData.type === "multiplier" &&
                    "Multiplicar puntos por este valor (ej: 2 = puntos dobles)"}
                  {formData.type === "bonus" &&
                    "Puntos adicionales a otorgar (ej: 100 = +100 puntos)"}
                  {formData.type === "discount" &&
                    "Porcentaje de descuento (ej: 10 = 10% off)"}
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Vista previa:</p>
              <p className="text-lg">
                {formData.type === "multiplier" &&
                  `Los clientes ganarán ${formData.value}x puntos durante esta promoción`}
                {formData.type === "bonus" &&
                  `Los clientes recibirán +${formData.value} puntos extra en sus compras`}
                {formData.type === "discount" &&
                  `Los clientes obtendrán ${formData.value}% de descuento`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Período de Validez</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Fecha de Inicio <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">
                  Fecha de Fin <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            {formData.startDate && formData.endDate && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                Duración:{" "}
                {Math.ceil(
                  (new Date(formData.endDate).getTime() -
                    new Date(formData.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                días
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked as boolean })
                }
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Activar promoción inmediatamente
              </Label>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Si no está activa, la promoción no se aplicará hasta que la
              actives manualmente
            </p>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Link href="/fidelizacion/promociones">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear Promoción"}
          </Button>
        </div>
      </form>
    </div>
  );
}

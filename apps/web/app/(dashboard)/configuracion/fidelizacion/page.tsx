"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Button,
  Checkbox,
} from "@workspace/ui";
import { ArrowLeft, Award, Save } from "lucide-react";
import Link from "next/link";

export default function LoyaltyConfigPage() {
  const loyaltyConfig = useQuery(api.loyalty.getProgramConfig);
  const updateConfig = useMutation(api.loyalty.updateProgramConfig);

  const [formData, setFormData] = useState({
    pointsPerPeso: 0,
    description: "",
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load config when available
  useState(() => {
    if (loyaltyConfig) {
      setFormData({
        pointsPerPeso: loyaltyConfig.pointsPerPeso,
        description: loyaltyConfig.description || "",
        isActive: loyaltyConfig.isActive,
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    try {
      await updateConfig({
        pointsPerPeso: formData.pointsPerPeso,
        description: formData.description || undefined,
        isActive: formData.isActive,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Error al actualizar configuración");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loyaltyConfig === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate value per point
  const valuePerPoint =
    formData.pointsPerPeso > 0 ? 1 / formData.pointsPerPeso : 0;

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
          <h2 className="text-3xl font-bold tracking-tight">
            Configuración del Programa de Fidelización
          </h2>
          <p className="text-muted-foreground">
            Ajusta las reglas del programa de puntos
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Configuración de Puntos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pointsPerPeso">
                Puntos por Peso <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pointsPerPeso"
                type="number"
                min="0"
                step="0.1"
                required
                value={formData.pointsPerPeso}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pointsPerPeso: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="1"
              />
              <p className="text-xs text-muted-foreground">
                Cuántos puntos se otorgan por cada $1 gastado
              </p>
            </div>

            {formData.pointsPerPeso > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">
                  Valor calculado del punto:
                </p>
                <p className="text-2xl font-bold">
                  $
                  {valuePerPoint.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Por cada punto acumulado
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Descripción del Programa</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción del programa de fidelización..."
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked as boolean })
                }
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Programa activo
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Ejemplos de Cálculo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium mb-1">
                Cliente gasta $1,000
              </p>
              <p className="text-muted-foreground">
                Recibirá:{" "}
                <span className="font-medium">
                  {(1000 * formData.pointsPerPeso).toFixed(0)} puntos
                </span>
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium mb-1">
                Cliente tiene 500 puntos
              </p>
              <p className="text-muted-foreground">
                Puede canjear por:{" "}
                <span className="font-medium">
                  $
                  {(500 * valuePerPoint).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current Config Display */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Puntos por Peso
                </p>
                <p className="text-xl font-bold">
                  {loyaltyConfig.pointsPerPeso}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="text-xl font-bold">
                  {loyaltyConfig.isActive ? "Activo" : "Inactivo"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
            Configuración actualizada correctamente
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Link href="/configuracion">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Badge,
  Progress,
} from "@workspace/ui";
import {
  Fuel,
  Plus,
  Pencil,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Id } from "@workspace/backend/convex/_generated/dataModel";

type FuelType = "premium" | "regular" | "diesel" | "super";
type Unit = "liters" | "gallons";

interface FuelFormData {
  type: FuelType;
  name: string;
  pricePerUnit: number;
  unit: Unit;
  color: string;
  octanaje: number;
  currentStock: number;
  tankCapacity: number;
}

const FUEL_TYPES = [
  { value: "premium", label: "Premium", color: "#10b981" },
  { value: "regular", label: "Regular", color: "#3b82f6" },
  { value: "diesel", label: "Diesel", color: "#f59e0b" },
  { value: "super", label: "Super", color: "#ef4444" },
];

const UNITS = [
  { value: "liters", label: "Litros" },
  { value: "gallons", label: "Galones" },
];

export default function FuelManagementPage() {
  const fuelTypes = useQuery(api.products.getFuelTypes);
  const createFuelType = useMutation(api.products.createFuelType);
  const updateFuelType = useMutation(api.products.updateFuelType);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFuel, setEditingFuel] = useState<Id<"fuelTypes"> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FuelFormData>({
    type: "regular",
    name: "",
    pricePerUnit: 0,
    unit: "liters",
    color: "#3b82f6",
    octanaje: 0,
    currentStock: 0,
    tankCapacity: 0,
  });

  const handleOpenDialog = (fuelId?: Id<"fuelTypes">) => {
    if (fuelId && fuelTypes) {
      const fuel = fuelTypes.find((f) => f._id === fuelId);
      if (fuel) {
        setFormData({
          type: fuel.type,
          name: fuel.name,
          pricePerUnit: fuel.pricePerUnit,
          unit: fuel.unit,
          color: fuel.color || "#3b82f6",
          octanaje: fuel.octanaje || 0,
          currentStock: fuel.currentStock || 0,
          tankCapacity: fuel.tankCapacity || 0,
        });
        setEditingFuel(fuelId);
      }
    } else {
      setFormData({
        type: "regular",
        name: "",
        pricePerUnit: 0,
        unit: "liters",
        color: "#3b82f6",
        octanaje: 0,
        currentStock: 0,
        tankCapacity: 0,
      });
      setEditingFuel(null);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingFuel) {
        await updateFuelType({
          id: editingFuel,
          name: formData.name,
          pricePerUnit: formData.pricePerUnit,
          unit: formData.unit,
          color: formData.color,
          octanaje: formData.octanaje || undefined,
          currentStock: formData.currentStock || undefined,
          tankCapacity: formData.tankCapacity || undefined,
        });
        toast.success("Combustible actualizado correctamente");
      } else {
        await createFuelType({
          type: formData.type,
          name: formData.name,
          pricePerUnit: formData.pricePerUnit,
          unit: formData.unit,
          color: formData.color,
          octanaje: formData.octanaje || undefined,
          currentStock: formData.currentStock || undefined,
          tankCapacity: formData.tankCapacity || undefined,
        });
        toast.success("Combustible creado correctamente");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error al guardar el combustible");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockPercentage = (current: number, capacity: number) => {
    if (!capacity) return 0;
    return (current / capacity) * 100;
  };

  const getStockStatus = (percentage: number) => {
    if (percentage <= 15) return { color: "text-red-500", label: "Crítico" };
    if (percentage <= 30) return { color: "text-orange-500", label: "Bajo" };
    if (percentage <= 60) return { color: "text-yellow-500", label: "Medio" };
    return { color: "text-green-500", label: "Óptimo" };
  };

  if (!fuelTypes) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalCapacity = fuelTypes.reduce(
    (sum, f) => sum + (f.tankCapacity || 0),
    0
  );
  const totalStock = fuelTypes.reduce(
    (sum, f) => sum + (f.currentStock || 0),
    0
  );
  const averageStock = totalCapacity
    ? (totalStock / totalCapacity) * 100
    : 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/inventario/productos">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-3xl font-bold tracking-tight">
              Gestión de Combustibles
            </h2>
          </div>
          <p className="text-muted-foreground">
            Administra los tipos de combustible y niveles de tanques
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Combustible
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tipos de Combustible
            </CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fuelTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Tipos configurados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Stock Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStock.toLocaleString("es-AR")}
            </div>
            <p className="text-xs text-muted-foreground">
              Litros disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nivel Promedio
            </CardTitle>
            {averageStock <= 30 ? (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageStock.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              De capacidad total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fuel Types List */}
      <div className="grid gap-4 md:grid-cols-2">
        {fuelTypes.map((fuel) => {
          const stockPercentage = getStockPercentage(
            fuel.currentStock || 0,
            fuel.tankCapacity || 0
          );
          const stockStatus = getStockStatus(stockPercentage);

          return (
            <Card key={fuel._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: fuel.color || "#3b82f6" }}
                    />
                    {fuel.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(fuel._id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  <Badge variant="secondary">{fuel.type.toUpperCase()}</Badge>
                  {fuel.octanaje && (
                    <span className="ml-2 text-xs">
                      Octanaje: {fuel.octanaje}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Precio por {fuel.unit === "liters" ? "Litro" : "Galón"}</p>
                    <p className="text-2xl font-bold">
                      ${fuel.pricePerUnit.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Estado</p>
                    <p className={`text-lg font-semibold ${stockStatus.color}`}>
                      {stockStatus.label}
                    </p>
                  </div>
                </div>

                {fuel.tankCapacity && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Nivel del Tanque</span>
                      <span className={stockStatus.color}>
                        {stockPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={stockPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Stock: {(fuel.currentStock || 0).toLocaleString("es-AR")}{" "}
                        {fuel.unit === "liters" ? "L" : "gal"}
                      </span>
                      <span>
                        Capacidad: {fuel.tankCapacity.toLocaleString("es-AR")}{" "}
                        {fuel.unit === "liters" ? "L" : "gal"}
                      </span>
                    </div>
                  </div>
                )}

                {stockPercentage <= 15 && fuel.tankCapacity && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Nivel crítico - Reabastecer urgente
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {fuelTypes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Fuel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No hay combustibles configurados
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comienza agregando tu primer tipo de combustible
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Combustible
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFuel ? "Editar Combustible" : "Nuevo Combustible"}
            </DialogTitle>
            <DialogDescription>
              {editingFuel
                ? "Actualiza la información del combustible"
                : "Agrega un nuevo tipo de combustible al inventario"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {!editingFuel && (
                <div className="space-y-2">
                  <Label htmlFor="type">
                    Tipo <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: FuelType) => {
                      const fuelType = FUEL_TYPES.find((f) => f.value === value);
                      setFormData({
                        ...formData,
                        type: value,
                        color: fuelType?.color || "#3b82f6",
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FUEL_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: type.color }}
                            />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ej: Nafta Premium 95"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerUnit">
                  Precio por Unidad <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.pricePerUnit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerUnit: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">
                  Unidad <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value: Unit) =>
                    setFormData({ ...formData, unit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="octanaje">Octanaje</Label>
                <Input
                  id="octanaje"
                  type="number"
                  min="0"
                  value={formData.octanaje}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      octanaje: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="95"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tankCapacity">
                  Capacidad del Tanque ({formData.unit === "liters" ? "L" : "gal"})
                </Label>
                <Input
                  id="tankCapacity"
                  type="number"
                  min="0"
                  value={formData.tankCapacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tankCapacity: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="10000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentStock">
                  Stock Actual ({formData.unit === "liters" ? "L" : "gal"})
                </Label>
                <Input
                  id="currentStock"
                  type="number"
                  min="0"
                  max={formData.tankCapacity || undefined}
                  value={formData.currentStock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentStock: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="8000"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : editingFuel ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

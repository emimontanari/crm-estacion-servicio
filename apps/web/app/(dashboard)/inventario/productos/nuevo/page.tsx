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
  CurrencyInput,
  Checkbox,
} from "@workspace/ui";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const categoryOptions = [
  { value: "fuel", label: "Combustible" },
  { value: "lubricant", label: "Lubricante" },
  { value: "accessory", label: "Accesorio" },
  { value: "food", label: "Alimento" },
  { value: "beverage", label: "Bebida" },
  { value: "service", label: "Servicio" },
  { value: "other", label: "Otro" },
];

const unitOptions = [
  { value: "L", label: "Litros" },
  { value: "unidad", label: "Unidad" },
  { value: "kg", label: "Kilogramos" },
  { value: "pack", label: "Pack" },
];

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useMutation(api.products.create);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "other",
    sku: "",
    barcode: "",
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 10,
    unit: "unidad",
    isActive: true,
    isFuel: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const productId = await createProduct({
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category as any,
        sku: formData.sku || undefined,
        barcode: formData.barcode || undefined,
        price: formData.price,
        cost: formData.cost || undefined,
        stock: formData.stock,
        minStock: formData.minStock,
        unit: formData.unit,
        isActive: formData.isActive,
        isFuel: formData.isFuel,
      });

      router.push(`/inventario/productos/${productId}`);
    } catch (err: any) {
      setError(err.message || "Error al crear producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/inventario/productos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Nuevo Producto</h2>
          <p className="text-muted-foreground">
            Agrega un nuevo producto al inventario
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre del Producto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ej: Aceite 10W-40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Categoría <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción detallada del producto..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  placeholder="ABC-123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Código de Barras</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  placeholder="1234567890123"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Precios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Precio de Venta <span className="text-red-500">*</span>
                </Label>
                <CurrencyInput
                  id="price"
                  required
                  value={formData.price}
                  onChange={(value) => setFormData({ ...formData, price: value })}
                  currency="ARS"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Costo</Label>
                <CurrencyInput
                  id="cost"
                  value={formData.cost}
                  onChange={(value) => setFormData({ ...formData, cost: value })}
                  currency="ARS"
                />
              </div>
            </div>

            {formData.price > 0 && formData.cost > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  Margen de Ganancia:{" "}
                  <span className="text-green-600">
                    {(
                      ((formData.price - formData.cost) / formData.price) *
                      100
                    ).toFixed(2)}
                    %
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="stock">
                  Stock Inicial <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock">
                  Stock Mínimo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  required
                  value={formData.minStock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minStock: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">
                  Unidad <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked as boolean })
                }
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Producto activo
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFuel"
                checked={formData.isFuel}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFuel: checked as boolean })
                }
              />
              <Label htmlFor="isFuel" className="cursor-pointer">
                Es combustible
              </Label>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Link href="/inventario/productos">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar Producto"}
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
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
  Badge,
} from "@workspace/ui";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
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

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const product = useQuery(api.products.getById, { id: id as any });
  const updateProduct = useMutation(api.products.update);
  const updateStock = useMutation(api.products.updateStock);

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

  const [stockAdjustment, setStockAdjustment] = useState({
    quantity: 0,
    operation: "add" as "add" | "subtract" | "set",
    reason: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load product data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        category: product.category,
        sku: product.sku || "",
        barcode: product.barcode || "",
        price: product.price,
        cost: product.cost || 0,
        stock: product.stock,
        minStock: product.minStock,
        unit: product.unit,
        isActive: product.isActive,
        isFuel: product.isFuel || false,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await updateProduct({
        id: id as any,
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category as any,
        sku: formData.sku || undefined,
        barcode: formData.barcode || undefined,
        price: formData.price,
        cost: formData.cost || undefined,
        minStock: formData.minStock,
        unit: formData.unit,
        isActive: formData.isActive,
        isFuel: formData.isFuel,
      });

      router.push("/inventario/productos");
    } catch (err: any) {
      setError(err.message || "Error al actualizar producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockAdjustment = async () => {
    if (stockAdjustment.quantity === 0) {
      alert("Ingresa una cantidad válida");
      return;
    }

    try {
      await updateStock({
        id: id as any,
        quantity: stockAdjustment.quantity,
        operation: stockAdjustment.operation,
        reason: stockAdjustment.reason || undefined,
      });

      // Reset adjustment form
      setStockAdjustment({ quantity: 0, operation: "add", reason: "" });
    } catch (err: any) {
      alert(err.message || "Error al ajustar stock");
    }
  };

  if (product === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Producto no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLowStock = product.stock <= product.minStock;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/inventario/productos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">Editar Producto</h2>
          <p className="text-muted-foreground">{product.name}</p>
        </div>
        {isLowStock && (
          <Badge variant="destructive">Stock Bajo</Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Main Form */}
        <div className="md:col-span-2">
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
                        <SelectValue />
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
                      onChange={(value) =>
                        setFormData({ ...formData, price: value })
                      }
                      currency="ARS"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost">Costo</Label>
                    <CurrencyInput
                      id="cost"
                      value={formData.cost}
                      onChange={(value) =>
                        setFormData({ ...formData, cost: value })
                      }
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
                <div className="grid gap-4 md:grid-cols-2">
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
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </div>

        {/* Stock Adjustment Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Stock Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <div className="text-4xl font-bold">
                  {product.stock} {product.unit}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Mínimo: {product.minStock} {product.unit}
                </p>
              </div>

              <div className="border-t pt-4 space-y-3">
                <Label>Ajustar Stock</Label>

                <Select
                  value={stockAdjustment.operation}
                  onValueChange={(value: any) =>
                    setStockAdjustment({ ...stockAdjustment, operation: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Sumar</SelectItem>
                    <SelectItem value="subtract">Restar</SelectItem>
                    <SelectItem value="set">Establecer</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min="0"
                  placeholder="Cantidad"
                  value={stockAdjustment.quantity || ""}
                  onChange={(e) =>
                    setStockAdjustment({
                      ...stockAdjustment,
                      quantity: parseFloat(e.target.value) || 0,
                    })
                  }
                />

                <Textarea
                  placeholder="Motivo del ajuste (opcional)"
                  value={stockAdjustment.reason}
                  onChange={(e) =>
                    setStockAdjustment({
                      ...stockAdjustment,
                      reason: e.target.value,
                    })
                  }
                  rows={2}
                />

                <Button
                  className="w-full"
                  onClick={handleStockAdjustment}
                  variant="secondary"
                >
                  Aplicar Ajuste
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

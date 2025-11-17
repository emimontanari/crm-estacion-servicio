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
  PhoneInput,
  Textarea,
  Button,
} from "@workspace/ui";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCustomerPage() {
  const router = useRouter();
  const createCustomer = useMutation(api.customers.create);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
    vehicleInfo: {
      plate: "",
      brand: "",
      model: "",
      year: undefined as number | undefined,
      color: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const customerId = await createCustomer({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        notes: formData.notes || undefined,
        vehicleInfo: formData.vehicleInfo.plate
          ? {
              plate: formData.vehicleInfo.plate || undefined,
              brand: formData.vehicleInfo.brand || undefined,
              model: formData.vehicleInfo.model || undefined,
              year: formData.vehicleInfo.year,
              color: formData.vehicleInfo.color || undefined,
            }
          : undefined,
      });

      router.push(`/clientes/${customerId}`);
    } catch (err: any) {
      setError(err.message || "Error al crear cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/clientes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Nuevo Cliente</h2>
          <p className="text-muted-foreground">
            Registra un nuevo cliente en el sistema
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="juan@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Teléfono <span className="text-red-500">*</span>
              </Label>
              <PhoneInput
                id="phone"
                required
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dirección</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Av. Corrientes 1234"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Buenos Aires"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Provincia</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="CABA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">Código Postal</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                  placeholder="1414"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Vehículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="plate">Patente</Label>
                <Input
                  id="plate"
                  value={formData.vehicleInfo.plate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleInfo: {
                        ...formData.vehicleInfo,
                        plate: e.target.value.toUpperCase(),
                      },
                    })
                  }
                  placeholder="ABC123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={formData.vehicleInfo.brand}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleInfo: {
                        ...formData.vehicleInfo,
                        brand: e.target.value,
                      },
                    })
                  }
                  placeholder="Toyota"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={formData.vehicleInfo.model}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleInfo: {
                        ...formData.vehicleInfo,
                        model: e.target.value,
                      },
                    })
                  }
                  placeholder="Corolla"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Año</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.vehicleInfo.year || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleInfo: {
                        ...formData.vehicleInfo,
                        year: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                  placeholder="2020"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.vehicleInfo.color}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleInfo: {
                        ...formData.vehicleInfo,
                        color: e.target.value,
                      },
                    })
                  }
                  placeholder="Blanco"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Información adicional sobre el cliente..."
              rows={4}
            />
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Link href="/clientes">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar Cliente"}
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@workspace/ui";
import { ArrowLeft, CreditCard, DollarSign, Smartphone } from "lucide-react";
import Link from "next/link";

const paymentMethodIcons: Record<string, any> = {
  cash: DollarSign,
  credit_card: CreditCard,
  debit_card: CreditCard,
  transfer: Smartphone,
};

export default function PaymentMethodsPage() {
  const paymentMethods = useQuery(api.payments.getPaymentMethods);

  if (paymentMethods === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            Métodos de Pago
          </h2>
          <p className="text-muted-foreground">
            Configura los métodos de pago aceptados
          </p>
        </div>
      </div>

      {/* Payment Methods Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {paymentMethods.map((method) => {
          const Icon = paymentMethodIcons[method.type] || CreditCard;
          return (
            <Card key={method._id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {method.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">{method.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <Badge variant={method.isActive ? "default" : "secondary"}>
                      {method.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  {method.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Descripción
                      </p>
                      <p className="text-sm">{method.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              Los métodos de pago son configurados automáticamente al crear la
              organización.
            </p>
            <p className="text-muted-foreground">
              Para modificar o agregar nuevos métodos de pago, contacta al
              administrador del sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

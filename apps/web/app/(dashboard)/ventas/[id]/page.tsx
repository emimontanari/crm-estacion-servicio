"use client";

import { use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  SaleSummary,
} from "@workspace/ui";
import { ArrowLeft, Printer, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SaleStatus = "completed" | "pending" | "cancelled" | "refunded";

const statusColors: Record<SaleStatus, string> = {
  completed: "bg-green-500",
  pending: "bg-yellow-500",
  cancelled: "bg-red-500",
  refunded: "bg-blue-500",
};

const statusLabels: Record<SaleStatus, string> = {
  completed: "Completada",
  pending: "Pendiente",
  cancelled: "Cancelada",
  refunded: "Reembolsada",
};

export default function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const sale = useQuery(api.sales.getById, { id: id as any });
  const payments = useQuery(api.payments.getBySaleId, { saleId: id as any });

  const handlePrint = () => {
    window.print();
  };

  if (sale === undefined || payments === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Venta no encontrada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 print:p-4">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/ventas/historial">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Detalle de Venta
            </h2>
            <p className="text-muted-foreground">
              Venta #{sale._id.slice(-8)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-center mb-2">
          Estación de Servicio
        </h1>
        <p className="text-center text-sm text-muted-foreground">
          Comprobante de Venta
        </p>
        <p className="text-center text-sm font-mono mt-1">
          #{sale._id.slice(-8)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Sale Summary */}
        <div className="md:col-span-2">
          <SaleSummary
            sale={{
              id: sale._id,
              date: new Date(sale.createdAt),
              items: sale.items.map((item) => ({
                name: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice,
              })),
              subtotal: sale.subtotal,
              discount: sale.discount || 0,
              tax: sale.tax,
              total: sale.total,
              status: sale.status,
            }}
          />
        </div>

        {/* Sale Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Venta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Estado</p>
                <Badge
                  variant="secondary"
                  className={`${statusColors[sale.status as SaleStatus]} text-white mt-1`}
                >
                  {statusLabels[sale.status as SaleStatus]}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium">Fecha y Hora</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(sale.createdAt).toLocaleString("es-AR", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Cliente</p>
                <p className="text-sm text-muted-foreground">
                  {sale.customerName || "Cliente Anónimo"}
                </p>
              </div>

              {sale.loyaltyPointsEarned > 0 && (
                <div>
                  <p className="text-sm font-medium">Puntos Ganados</p>
                  <Badge variant="secondary" className="mt-1">
                    +{sale.loyaltyPointsEarned} puntos
                  </Badge>
                </div>
              )}

              {sale.loyaltyPointsUsed && sale.loyaltyPointsUsed > 0 && (
                <div>
                  <p className="text-sm font-medium">Puntos Utilizados</p>
                  <Badge variant="outline" className="mt-1">
                    -{sale.loyaltyPointsUsed} puntos
                  </Badge>
                </div>
              )}

              {sale.discount && sale.discount > 0 && (
                <div>
                  <p className="text-sm font-medium">Descuento Aplicado</p>
                  <p className="text-sm text-red-600">
                    $
                    {sale.discount.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información de Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Método de Pago</p>
                <p className="text-sm text-muted-foreground">
                  {sale.paymentMethod === "cash" && "Efectivo"}
                  {sale.paymentMethod === "credit_card" && "Tarjeta de Crédito"}
                  {sale.paymentMethod === "debit_card" && "Tarjeta de Débito"}
                  {sale.paymentMethod === "transfer" && "Transferencia"}
                </p>
              </div>

              {sale.cashReceived && (
                <>
                  <div>
                    <p className="text-sm font-medium">Efectivo Recibido</p>
                    <p className="text-sm text-muted-foreground">
                      $
                      {sale.cashReceived.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Cambio</p>
                    <p className="text-sm text-muted-foreground">
                      $
                      {(sale.cashReceived - sale.total).toLocaleString(
                        "es-AR",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </p>
                  </div>
                </>
              )}

              {payments && payments.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Transacciones</p>
                  <div className="space-y-1">
                    {payments.map((payment) => (
                      <div
                        key={payment._id}
                        className="text-sm p-2 bg-muted rounded"
                      >
                        <div className="flex justify-between">
                          <span>
                            {new Date(payment.createdAt).toLocaleDateString(
                              "es-AR"
                            )}
                          </span>
                          <Badge
                            variant={
                              payment.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="font-medium">
                          $
                          {payment.amount.toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Footer */}
      <div className="hidden print:block mt-8 text-center text-sm text-muted-foreground border-t pt-4">
        <p>Gracias por su compra</p>
        <p className="mt-1">
          {new Date().toLocaleDateString("es-AR", { dateStyle: "full" })}
        </p>
      </div>
    </div>
  );
}

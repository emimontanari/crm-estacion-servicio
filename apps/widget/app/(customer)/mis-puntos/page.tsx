export default function MisPuntosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mis Puntos de Fidelización</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <p className="text-sm text-muted-foreground mb-1">Puntos Actuales</p>
          <p className="text-4xl font-bold">1,250</p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground mb-1">Nivel Actual</p>
          <p className="text-2xl font-semibold">Plata</p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground mb-1">
            Próximos a Vencer
          </p>
          <p className="text-2xl font-semibold">50 puntos</p>
          <p className="text-xs text-muted-foreground">En 30 días</p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Historial de Puntos</h2>
        <div className="space-y-3">
          {[
            { action: "Compra de gasolina", points: "+10", date: "Hoy" },
            { action: "Promoción especial", points: "+50", date: "Ayer" },
            { action: "Canje de descuento", points: "-100", date: "Hace 3 días" },
          ].map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.action}</p>
                <p className="text-sm text-muted-foreground">{item.date}</p>
              </div>
              <p
                className={`font-semibold ${
                  item.points.startsWith("+")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {item.points}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

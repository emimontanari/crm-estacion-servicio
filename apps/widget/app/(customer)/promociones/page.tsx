export default function PromocionesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Promociones Disponibles</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "10% de descuento",
            description: "En tu próxima carga de combustible",
            validUntil: "31 Dic 2024",
            points: 500,
          },
          {
            title: "Lavado gratis",
            description: "Canjea por un lavado completo",
            validUntil: "15 Dic 2024",
            points: 1000,
          },
          {
            title: "Cambio de aceite",
            description: "50% de descuento en cambio de aceite",
            validUntil: "20 Dic 2024",
            points: 750,
          },
        ].map((promo, index) => (
          <div key={index} className="rounded-lg border p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">{promo.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {promo.description}
            </p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Válido hasta {promo.validUntil}
              </span>
              <span className="font-semibold text-blue-600">
                {promo.points} pts
              </span>
            </div>
            <button className="w-full mt-4 py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Canjear
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

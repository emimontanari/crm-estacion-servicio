export default function ServiciosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Servicios Disponibles</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {[
          {
            title: "Cambio de Aceite",
            description: "Servicio completo de cambio de aceite y filtros",
            price: "$45.00",
            duration: "30 min",
          },
          {
            title: "Lavado Completo",
            description: "Lavado exterior e interior de tu vehículo",
            price: "$25.00",
            duration: "45 min",
          },
          {
            title: "Rotación de Llantas",
            description: "Rotación y balanceo de llantas",
            price: "$35.00",
            duration: "40 min",
          },
          {
            title: "Revisión General",
            description: "Inspección completa de tu vehículo",
            price: "$60.00",
            duration: "60 min",
          },
        ].map((service, index) => (
          <div key={index} className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {service.description}
            </p>
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">{service.price}</span>
              <span className="text-sm text-muted-foreground">
                {service.duration}
              </span>
            </div>
            <button className="w-full py-2 px-4 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">
              Solicitar Servicio
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

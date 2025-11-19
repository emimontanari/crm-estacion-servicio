export default function MiCuentaPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mi Cuenta</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Nombre:</span> Cliente Ejemplo
            </p>
            <p>
              <span className="font-medium">Email:</span> cliente@ejemplo.com
            </p>
            <p>
              <span className="font-medium">Teléfono:</span> +1 234 567 8900
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Mi Vehículo</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Marca:</span> Toyota
            </p>
            <p>
              <span className="font-medium">Modelo:</span> Corolla
            </p>
            <p>
              <span className="font-medium">Año:</span> 2020
            </p>
            <p>
              <span className="font-medium">Placa:</span> ABC-1234
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

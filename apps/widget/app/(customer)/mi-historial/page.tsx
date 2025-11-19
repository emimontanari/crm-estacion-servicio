export default function MiHistorialPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mi Historial de Compras</h1>
      
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="rounded-lg border p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">Compra #{item}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <p className="font-bold">$50.00</p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Gasolina Premium - 10 litros</p>
              <p className="text-green-600">+10 puntos</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

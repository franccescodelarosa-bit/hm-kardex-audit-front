export default function DashboardPage() {
  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-sm text-slate-500">
          Auditorías
        </p>

        <h2 className="text-3xl font-bold mt-2">
          12
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-sm text-slate-500">
          Clientes
        </p>

        <h2 className="text-3xl font-bold mt-2">
          4
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-sm text-slate-500">
          Observaciones
        </p>

        <h2 className="text-3xl font-bold mt-2">
          27
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-sm text-slate-500">
          Reportes
        </p>

        <h2 className="text-3xl font-bold mt-2">
          8
        </h2>
      </div>
    </div>
  );
}
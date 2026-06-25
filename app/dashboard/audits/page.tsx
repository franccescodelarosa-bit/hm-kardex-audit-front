"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AuditsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [filterClient, setFilterClient] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [clientId, setClientId] = useState("");
  const [year, setYear] =  useState( new Date().getFullYear() );
  const [runningAuditId, setRunningAuditId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    loadClients();
    loadAudits();
  }, []);
  const loadClients = async () => {
    try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        const response = await fetch(`${API_URL}/clients`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        const data = await response.json();
        setClients(data);
    } catch (error) {
        console.error(error);
    }
  };
  const loadAudits = async () => {
    try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        const response = await fetch(`${API_URL}/audits`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (!response.ok) return;
        const data = await response.json();
        setAudits(data);
    } catch (error) {
            console.error(error);
    }
  };
  const statusColors = {
    PENDING:"bg-yellow-100 text-yellow-700",
    IN_PROGRESS:"bg-blue-100 text-blue-700",
    READY_FOR_AUDIT:"bg-green-100 text-green-700",
    AUDITING:"bg-purple-100 text-purple-700 animate-pulse",
    COMPLETED: "bg-emerald-100 text-emerald-700",
  };
  const createAudit = async () => {
    try {
        setLoading(true);
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        await fetch(`${API_URL}/audits`,
            {
                method: "POST",
                headers: {
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: 
                    JSON.stringify({
                        clientId,
                        year
                    }),
            }
        );
        await loadAudits();
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };
  const runAudit = async ( auditId: string ) => {
    try {
        setRunningAuditId(auditId);
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        const response = await fetch( `${API_URL}/audits/${auditId}/run`,
            {
            method: 'POST',
            headers: {
                Authorization:
                `Bearer ${token}`,
            },
            },
        );
        if (!response.ok) {
            throw new Error(
                'No se pudo iniciar la auditoría',
            );
        }
        const data = await response.json();
        console.log(data);
        alert(
            'Auditoría enviada a procesamiento'
        );
        await loadAudits();
    } catch (error) {
        console.error(error);
        alert(
        'Error al iniciar auditoría'
        );
    } finally {
        setRunningAuditId(null);
    }
    };
  const filteredAudits = audits.filter(audit => {
    const clientMatch = !filterClient || audit.client_id === filterClient;
    const statusMatch = !filterStatus || audit.status === filterStatus;
    return ( clientMatch && statusMatch);
  });
  return (
    <div>
        <div className="mb-8">
            <h1 className="text-2xl font-bold">Auditorías</h1>
            <p className="text-slate-500">Crear procesos de revisión Kardex            </p>
        </div>
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="space-y-5">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Cliente</label>
                        <select
                            value={clientId}
                            onChange={(e) =>
                                setClientId(
                                    e.target.value
                                )
                            }
                            className="w-full border rounded-xl p-3"
                        >
                            <option value="">Seleccionar</option>
                            {clients.map(
                                (client) => (
                                    <option
                                        key={client.id}
                                        value={client.id}
                                    >
                                        {
                                            client.business_name
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Año</label>
                        <input
                            type="number"
                            value={year}
                            onChange={(e) =>
                                setYear(
                                    Number(
                                    e.target.value
                                    )
                                )
                            }
                            className="w-full border rounded-xl p-3"
                        />
                    </div>
                    <button
                        onClick={createAudit}
                        disabled={loading}
                        className="bg-slate-900 text-white rounded-xl px-5 py-3"
                    >
                        {loading ? "Creando..." : "Crear Auditoría"}
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="font-bold text-lg mb-4"> Auditorías </h2>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <select
                        value={filterClient}
                        onChange={(e) =>
                        setFilterClient(
                            e.target.value
                        )
                        }
                        className="
                        border
                        rounded-lg
                        p-2
                        text-sm
                        "
                    >
                        <option value="">
                        Todos los clientes
                        </option>

                        {clients.map(client => (
                        <option
                            key={client.id}
                            value={client.id}
                        >
                            {client.business_name}
                        </option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) =>
                        setFilterStatus(
                            e.target.value
                        )
                        }
                        className="
                        border
                        rounded-lg
                        p-2
                        text-sm
                        "
                    >
                        <option value="">
                        Todos los estados
                        </option>

                        <option value="PENDING">
                        Pendiente
                        </option>

                        <option value="IN_PROGRESS">
                        En Progreso
                        </option>

                        <option value="READY_FOR_AUDIT">
                        Lista para Auditoría
                        </option>

                        <option value="AUDITING">
                        Auditando
                        </option>

                        <option value="COMPLETED">
                        Completada
                        </option>

                    </select>
                </div>
                <div className="text-sm text-slate-500 mb-3">Mostrando {filteredAudits.length} auditorías</div>
                <div className="space-y-3">
                    {filteredAudits.map((audit) => (
                        <div key={audit.id} className="border rounded-xl p-4">
                            <div className="flex justify-between align-center text-xs mb-1">
                                <div>
                                    <div className="font-semibold"> {audit.clients?.business_name} </div>
                                    <div className="text-sm text-slate-500"> Año {audit.year} </div>
                                </div>
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${ statusColors[audit.status as keyof typeof statusColors]}`}>
                                        {audit.status}
                                    </span>
                                </div>
                            </div>    
                            <div className="mt-3">
                                <div className="w-full h-2 bg-slate-200 rounded-full">
                                <div
                                    className="h-2 bg-green-500 rounded-full"
                                    style={{
                                    width: `${audit.progress}%`,
                                    }}
                                />
                                </div> 
                                <div className="flex justify-between text-xs mb-1">     
                                    <div className="text-xs text-slate-500 mt-1">
                                        {audit.uploadedCount}/15 archivos
                                    </div>
                                    <span>{audit.progress}%</span>
                                </div>   
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() =>
                                        router.push(
                                        `/dashboard/audits/${audit.id}`
                                        )
                                    }
                                    className="
                                        flex-1
                                        border
                                        rounded-lg
                                        px-3
                                        py-2
                                        text-sm
                                    "
                                >
                                    Ver Documentos
                                </button>
                                <button
                                    disabled={
                                        audit.progress < 100 ||
                                        audit.status === "AUDITING" ||
                                        runningAuditId === audit.id
                                    }
                                    onClick={() => runAudit( audit.id)}
                                    className={`
                                        flex-1
                                        rounded-lg
                                        px-3
                                        py-2
                                        text-sm
                                        text-white

                                        ${
                                        audit.progress === 100
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-slate-300 cursor-not-allowed"
                                        }
                                    `}
                                >
                                    { runningAuditId === audit.id ? "Enviando..." : audit.status === "AUDITING" ? "Procesando" : "Iniciar Auditoría" }
                                </button>
                            </div>
                            {
                                audit.status === "AUDITING" && (
                                    <div className="text-xs text-purple-600 mt-2">
                                        Auditoría en procesamiento...
                                    </div>
                                )
                            }
                        </div>
                    ))}
                </div>
            </div>
        </div>  
    </div>
  );
}
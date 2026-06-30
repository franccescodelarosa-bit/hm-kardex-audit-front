"use client";
import { useEffect, useState, Fragment } from "react";
import { useParams } from "next/navigation";
import { getFinding } from "@/services/audit-results.services";
import { getDashboard, getRules, getFindings } from "@/services/audit-results.services";
import { FileSpreadsheet } from "lucide-react";
import { fetchAuthSession } from "aws-amplify/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export default function ReportDetailPage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [dashboard, setDashboard] = useState<any>();
    const [rules, setRules] = useState<any[]>([]);
    const [findings, setFindings] = useState<any>(null);
    const [selectedFinding, setSelectedFinding] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [selectedRule, setSelectedRule] = useState("");
    const [selectedRisk, setSelectedRisk] = useState("");
    const pageSize = 10;
    useEffect(() => {
        load();
    }, []);
    async function loadFinding(id: string) {
        if (selectedFinding?.id === id) {
            setSelectedFinding(null);
            return;
        }
        const detail = await getFinding(id);
        setSelectedFinding(detail);
    }
    function formatLabel(key: string): string {
        const labels: Record<string, string> = {
            fromIndex: "Mes inicial",
            toIndex: "Mes final",
            differences: "Diferencias encontradas",
            finalBalance: "Saldo Final",
            initialBalance: "Saldo Inicial",
            quantity: "Cantidad",
            unitCost: "Costo Unitario",
            totalCost: "Costo Total",
            expectedQuantity: "Cantidad Esperada",
            actualQuantity: "Cantidad Encontrada",
            expectedCost: "Costo Esperado",
            actualCost: "Costo Encontrado",
            document: "Documento",
            movement: "Movimiento",
            warehouse: "Almacén"
        };
        return labels[key] ?? key;
    }
    function renderMetadata(value: any) {
        if (Array.isArray(value)) {
            return (
                <ul className="list-disc ml-6">
                    {value.map((item, index) => (
                        <li key={index}>{String(item)}</li>
                    ))}
                </ul>
            );
        }
        if (typeof value === "object" && value !== null) {
            return (
                <div className="space-y-2 flex flex-row gap-3">
                    {
                        Object.entries(value).map(([key, val]) => (
                            <div key={key} className="border rounded-lg p-3">
                                <div className="font-semibold text-gray-700 mb-2">{formatLabel(key)}</div>
                                {renderMetadata(val)}
                            </div>
                        ))
                    }
                </div>
            );
        }
        return (
            <span>
                {String(value)}
            </span>
        );
    }
    useEffect(() => {
        loadFindings();
    }, [page, selectedRule, selectedRisk]);
    async function load() {
        setLoading(true);
        const [ dashboard, rules ] = await Promise.all([
            getDashboard(id as string),
            getRules(id as string)
        ]);
        setDashboard(dashboard);
        setRules(rules);
        await loadFindings();
        setLoading(false);
    }
    async function loadFindings() {
        let filters = "";
        if (selectedRule)
            filters += `&ruleId=${selectedRule}`;
        if (selectedRisk)
            filters += `&riskLevel=${selectedRisk}`;
        const data = await getFindings(
            id as string,
            page,
            pageSize,
            filters
        );
        setFindings(data);
    }
    const exportRule = async (ruleId: string, ruleCode: string) => {
        try {
            const session = await fetchAuthSession();
            const token = session.tokens?.idToken?.toString();
            const response = await fetch(
                `${API_URL}/auditsresult/${dashboard.audit.id}/rules/${ruleId}/excel`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error("No se pudo generar el Excel.");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${dashboard.audit.id}_${ruleCode}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert("No se pudo descargar el Excel.");
        }
    };
    if (loading)
        return <div className="p-10">Cargando...</div>;
    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-4xl font-bold">
                    {dashboard.audit.client}
                </h1>
                <p className="text-gray-500">
                    Auditoría {dashboard.audit.year}
                </p>
            </div>
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow p-6">
                    <p className="text-gray-500">
                        Hallazgos
                    </p>
                    <h2 className="text-4xl font-bold">
                        {dashboard.summary.totalFindings}
                    </h2>
                </div>
                <div className="bg-red-50 rounded-xl p-6">
                    <p>CRITICO</p>
                    <h2 className="text-3xl font-bold">
                        {findings.summary.critical}
                    </h2>
                </div>
                <div className="bg-yellow-50 rounded-xl p-6">
                    <p>ALTO</p>
                    <h2 className="text-3xl font-bold">
                        {findings.summary.high}
                    </h2>
                </div>
                <div className="bg-green-50 rounded-xl p-6">
                    <p>MEDIO</p>
                    <h2 className="text-3xl font-bold">
                        {findings.summary.medium}
                    </h2>
                </div>
            </div>
            <div className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold">Reglas Incumplidas</h3>
                        <p className="text-sm text-slate-500">Selecciona una regla para revisar los hallazgos o descargar el Excel.</p>
                    </div>
                    {
                        selectedRule &&
                        <button
                            onClick={() => {
                                setSelectedRule("");
                                setPage(1);
                            }}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Ver todas
                        </button>
                    }
                </div>
                <div className="space-y-2 flex gap-3">
                    {
                        rules.map(rule => {
                            const selected = selectedRule === rule.id;
                            return (
                                <div
                                    key={rule.id}
                                    className={`flex items-center justify-between rounded-lg border px-4 py-3 transition ${
                                        selected
                                            ? "border-blue-500 bg-blue-50"
                                            : "hover:bg-slate-50"
                                    }`}
                                >
                                    <button
                                        className="flex-1 text-left"
                                        onClick={() => {
                                            setSelectedRule(rule.id);
                                            setPage(1);
                                        }}
                                    >
                                        <div className="font-semibold">{rule.code}</div>
                                        <div className="text-sm text-slate-500">{rule.name}</div>
                                    </button>
                                    <div className="flex items-center gap-4">
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">{rule.count}</span>
                                        <button
                                            title="Exportar Excel"
                                            onClick={() => exportRule(rule.id, rule.code)}
                                            className="rounded-md p-2 hover:bg-green-100"
                                        >
                                            <FileSpreadsheet size={22} className="text-green-700" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
            <div className="bg-white rounded-xl shadow overflow-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-3 text-left">Producto</th>
                            <th className="p-3 text-left">Mes</th>
                            <th className="p-3 text-left">Regla</th>
                            <th className="p-3 text-left">Riesgo</th>
                            <th className="p-3 text-left">Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            findings?.items?.map((finding: any) => (
                                <Fragment key={finding.id}>
                                    <tr
                                        className="border-b hover:bg-slate-50 cursor-pointer"
                                        onClick={() => loadFinding(finding.id)}
                                    >
                                        <td className="p-3">{finding.productCode}</td>
                                        <td className="p-3">{finding.month}</td>
                                        <td className="p-3">{finding.rule?.code}</td>
                                        <td className="p-3">{finding.rule?.riskLevel}</td>
                                        <td className="p-3">{finding.description}</td>
                                    </tr>
                                    {selectedFinding?.id === finding.id && (
                                        <tr className="bg-slate-50">
                                            <td colSpan={5} className="p-6">
                                                <h3 className="text-lg font-bold mb-4">Evidencia del Hallazgo</h3>
                                                <div className="mb-4">               
                                                    <strong>Recomendación:</strong><p className="mt-1">{selectedFinding.recommendation}</p>
                                                </div>
                                                <div className="mt-4">
                                                    {renderMetadata(selectedFinding.metadata)}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>                            
                            ))
                        }
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="border rounded px-4 py-2"
                >Anterior</button>
                <span>Página {page}</span>
                <button
                    disabled={page * pageSize >= findings?.total}
                    onClick={() => setPage(page + 1)}
                    className="border rounded px-4 py-2"
                >Siguiente</button>
            </div>
        </div>
    );
}
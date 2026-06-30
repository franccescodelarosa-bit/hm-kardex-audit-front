"use client";

import { useEffect, useState, Fragment } from "react";
import { useParams } from "next/navigation";
import { getFinding } from "@/services/audit-results.services";

import {
    getDashboard,
    getRules,
    getFindings
} from "@/services/audit-results.services";

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

                            <div
                                key={key}
                                className="border rounded-lg p-3"
                            >

                                <div className="font-semibold text-gray-700 mb-2">

                                    {formatLabel(key)}

                                </div>

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

        const [

            dashboard,

            rules

        ] = await Promise.all([

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

                    <p>HIGH</p>

                    <h2 className="text-3xl font-bold">

                        {dashboard.riskLevels.high}

                    </h2>

                </div>

                <div className="bg-yellow-50 rounded-xl p-6">

                    <p>MEDIUM</p>

                    <h2 className="text-3xl font-bold">

                        {dashboard.riskLevels.medium}

                    </h2>

                </div>

                <div className="bg-green-50 rounded-xl p-6">

                    <p>LOW</p>

                    <h2 className="text-3xl font-bold">

                        {dashboard.riskLevels.low}

                    </h2>

                </div>

            </div>

            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="font-bold text-xl mb-4">

                    Reglas Ejecutadas

                </h2>

                <div className="flex flex-wrap gap-3">

                    <button

                        onClick={() => setSelectedRule("")}

                        className="px-4 py-2 rounded bg-slate-700 text-white"

                    >

                        Todas

                    </button>

                    {

                        rules.map(rule => (

                            <button

                                key={rule.id}

                                onClick={() => {

                                    setSelectedRule(rule.id);

                                    setPage(1);

                                }}

                                className="px-4 py-2 rounded border hover:bg-blue-100"

                            >

                                {rule.code}

                                {" "}

                                ({rule.count})

                            </button>

                        ))

                    }

                </div>

            </div>

            <div className="flex gap-4">

                <select

                    className="border rounded p-2"

                    value={selectedRisk}

                    onChange={(e) => {

                        setSelectedRisk(e.target.value);

                        setPage(1);

                    }}

                >

                    <option value="">Todos los riesgos</option>

                    <option value="CRITICO">CRITICO</option>

                    <option value="ALTO">ALTO</option>

                    <option value="MEDIO">MEDIO</option>

                </select>

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
                                        <td className="p-3">
                                            {finding.productCode}
                                        </td>

                                        <td className="p-3">
                                            {finding.month}
                                        </td>

                                        <td className="p-3">
                                            {finding.rule?.code}
                                        </td>

                                        <td className="p-3">
                                            {finding.rule?.riskLevel}
                                        </td>

                                        <td className="p-3">
                                            {finding.description}
                                        </td>
                                    </tr>

                                    {selectedFinding?.id === finding.id && (

                                        <tr className="bg-slate-50">

                                            <td colSpan={5} className="p-6">

                                                <h3 className="text-lg font-bold mb-4">
                                                    Evidencia del Hallazgo
                                                </h3>

                                                <div className="mb-4">
                                                    <strong>Recomendación:</strong>
                                                    <p className="mt-1">
                                                        {selectedFinding.recommendation}
                                                    </p>
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

                >

                    Anterior

                </button>

                <span>

                    Página {page}

                </span>

                <button

                    disabled={page * pageSize >= findings?.total}

                    onClick={() => setPage(page + 1)}

                    className="border rounded px-4 py-2"

                >

                    Siguiente

                </button>

            </div>

        </div>

    );

}
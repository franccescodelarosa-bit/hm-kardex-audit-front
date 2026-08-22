"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getFinding } from "@/services/audit-results.services";
import { getDashboard, getRules, getFindings } from "@/services/audit-results.services";
import {
    FileSpreadsheet,
    FileSearch,
    Lightbulb,
    X,
    Search,
    Download,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { fetchAuthSession } from "aws-amplify/auth";
import { ExecutiveDashboardHelper } from "../../../../components/helpers/executive-dashboard.helper";
import { updateAuditFollowUp } from "../../../../services/audit-results.services";
import { createRuleTranslator, formatRuleCode, ruleNumber } from "@/lib/rule-translator";
import { translateRiskLevel, getRiskLevelColor } from "@/lib/risk-level";
import { formatMetadataLabel } from "@/lib/finding-metadata";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const RISK_FILTERS = [
    { value: "", label: "Todos" },
    { value: "CRITICO", label: "Crítico" },
    { value: "ALTO", label: "Alto" },
    { value: "MEDIO", label: "Medio" },
];

const COMBINING_MARKS = new RegExp(
    "[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]",
    "g"
);

function normalizeAccents(value: string | null | undefined): string {
    if (!value) return "";
    return value
        .trim()
        .normalize("NFD")
        .replace(COMBINING_MARKS, "")
        .toUpperCase();
}

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
    const [search, setSearch] = useState("");
    const [followUpOpen, setFollowUpOpen] = useState(false);
    const ruleTranslator = useMemo(
        () => createRuleTranslator(rules),
        [rules]
    );
    const [pageSize, setPageSize] = useState(25);
    const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
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
    /**
     * Arma la lista de números de página a mostrar, con "..." cuando hay
     * demasiadas páginas para listarlas todas (evita, por ejemplo, tener
     * que renderizar 565 botones cuando una regla tiene miles de hallazgos).
     * Siempre muestra la primera, la última, y una ventana alrededor de la
     * página actual.
     */
    function getPageNumbers(current: number, totalPages: number): (number | "...")[] {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pages: (number | "...")[] = [1];
        if (current > 3) {
            pages.push("...");
        }
        const start = Math.max(2, current - 1);
        const end = Math.min(totalPages - 1, current + 1);
        for (let p = start; p <= end; p++) {
            pages.push(p);
        }
        if (current < totalPages - 2) {
            pages.push("...");
        }
        pages.push(totalPages);
        return pages;
    }
    function handlePageSizeChange(newSize: number) {
        setPageSize(newSize);
        setPage(1);
    }
    function goToPage(jumpTo: number, totalPages: number) {
        const target = Math.min(Math.max(1, jumpTo), totalPages);
        setPage(target);
    }
    function renderMetadata(value: any) {
        if (Array.isArray(value)) {
            return (
                <ul className="list-disc ml-5 space-y-1 text-sm text-slate-700">
                    {value.map((item, index) => (
                        <li key={index}>
                            {typeof item === "object" && item !== null
                                ? renderMetadata(item)
                                : String(item)}
                        </li>
                    ))}
                </ul>
            );
        }
        if (typeof value === "object" && value !== null) {
            return (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {
                        Object.entries(value).map(([key, val]) => {
                            const isGroup = typeof val === "object" && val !== null;
                            return (
                                <div
                                    key={key}
                                    className={`rounded-lg border border-slate-200 bg-white p-3 ${
                                        isGroup ? "col-span-full bg-slate-50" : ""
                                    }`}
                                >
                                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                                        {formatMetadataLabel(key)}
                                    </div>
                                    <div className="text-sm font-semibold text-slate-800">
                                        {renderMetadata(val)}
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            );
        }
        if (typeof value === "number") {
            return (
                <span className={value < 0 ? "text-red-600" : undefined}>
                    {value.toLocaleString("es-PE")}
                </span>
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
    }, [page, pageSize, selectedRule, selectedRisk]);
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

    const exportAllRules = async () => {
        for (const rule of rules) {
            await exportRule(rule.id, rule.code);
        }
    };
    useEffect(() => {
        if (!dashboard?.followUp) {
            return;
        }
        setResponsible(
            dashboard.followUp.responsible ?? ""
        );
        setRegularizationDate(
            dashboard.followUp.regularizationDate
                ? dashboard.followUp.regularizationDate.substring(0, 10)
                : ""
        );
        setCorrectiveAction(
            dashboard.followUp.correctiveAction ?? ""
        );
        setObservations(
            dashboard.followUp.observations ?? ""
        );
    }, [dashboard]);
    const [validationStatus] = useState("PENDIENTE");
    const [regularizationDate, setRegularizationDate] = useState("");
    const [correctiveAction, setCorrectiveAction] = useState("");
    const [observations, setObservations] = useState("");
    const [responsible, setResponsible] = useState("");
    const [saving, setSaving] = useState(false);
    const [jumpValue, setJumpValue] = useState("");

    const saveFollowUp = async () => {
        try {
            setSaving(true);
            const result = await updateAuditFollowUp(
                dashboard.audit.id,
                {
                    validationStatus,
                    regularizationDate: regularizationDate || null,
                    correctiveAction,
                    observations,
                    responsible
                }
            );

            alert(
                `Seguimiento actualizado correctamente.\n` +
                `Responsable: ${result.responsible}\n` +
                `Fecha: ${new Date(result.updated_at).toLocaleString("es-PE")}`
            );
            setFollowUpOpen(false);
        }
        catch {
            console.error(
                "No fue posible guardar el seguimiento."
            );
        }
        finally {
            setSaving(false);
        }

    };
    if (loading)
        return <div className="p-10">Cargando...</div>;

    const sortedRules = [...rules].sort((a, b) => b.count - a.count);
    const maxRuleCount = sortedRules.reduce((max, rule) => Math.max(max, rule.count), 0);
    const totalFindingsCount = dashboard.summary.totalFindings || 0;
    const criticalPct = totalFindingsCount ? (findings.summary.critical / totalFindingsCount) * 100 : 0;
    const highPct = totalFindingsCount ? (findings.summary.high / totalFindingsCount) * 100 : 0;
    const mediumPct = totalFindingsCount ? (findings.summary.medium / totalFindingsCount) * 100 : 0;
    const executedRulesCount = dashboard.summary.executedRules || 0;
    const passedRulesCount = dashboard.summary.passedRules || 0;

    const searchTerm = search.trim().toLowerCase();
    const visibleItems = (findings?.items ?? []).filter((finding: any) => {
        if (!searchTerm) return true;
        const haystack = [
            finding.productCode,
            formatRuleCode(finding.rule?.code),
            ruleTranslator.translate(finding.rule?.code),
            finding.description,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
        return haystack.includes(searchTerm);
    });

    return (
        <div className="p-8 space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                                normalizeAccents(dashboard.summary.generalStatus) === "APROBADO"
                                    ? "bg-green-100 text-green-700"
                                    : normalizeAccents(dashboard.summary.generalStatus) === "CRITICO"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                            {dashboard.summary.generalStatus}
                        </span>
                        <h1 className="text-3xl font-bold text-slate-900">
                            {dashboard.audit.client}
                        </h1>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                        {dashboard.audit.id} · AUDITORÍA {dashboard.audit.year} · {executedRulesCount} reglas ejecutadas
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportAllRules}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <Download size={16} />
                        Exportar todo
                    </button>
                    <button
                        onClick={() => setFollowUpOpen(true)}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        Registrar seguimiento
                    </button>
                </div>
            </div>

            {/* Panel de indicadores */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Severidad de {totalFindingsCount.toLocaleString("es-PE")} hallazgos
                    </p>
                    <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="bg-red-500" style={{ width: `${criticalPct}%` }} />
                        <div className="bg-orange-400" style={{ width: `${highPct}%` }} />
                        <div className="bg-slate-400" style={{ width: `${mediumPct}%` }} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-red-500" /> Crítico {findings.summary.critical.toLocaleString("es-PE")}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-orange-400" /> Alto {findings.summary.high.toLocaleString("es-PE")}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-slate-400" /> Medio {findings.summary.medium.toLocaleString("es-PE")}
                        </span>
                    </div>
                </div>

                <div className="rounded-xl border bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Cumplimiento de reglas
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                        {Array.from({ length: executedRulesCount }).map((_, index) => (
                            <span
                                key={index}
                                className={`h-3 w-5 rounded-sm ${
                                    index < passedRulesCount ? "bg-green-500" : "bg-red-200"
                                }`}
                            />
                        ))}
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                        <b className="text-slate-800">{passedRulesCount} de {executedRulesCount}</b> aprobadas · {dashboard.summary.compliance}%
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Impacto económico
                    </p>
                    <h2 className="mt-2 text-3xl font-bold text-red-600">
                        S/ {dashboard.summary.economicImpact.toLocaleString("es-PE")}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        expuesto en {dashboard.summary.failedRules} reglas
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Productos afectados
                    </p>
                    <h2 className="mt-2 text-3xl font-bold text-slate-900">
                        {dashboard.summary.affectedProducts.toLocaleString("es-PE")}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        del inventario {dashboard.audit.year}
                    </p>
                </div>
            </div>

            {/* Reglas incumplidas: tarjetas que se envuelven en filas (flex-wrap), sin scroll horizontal ni vertical */}
            <div className="rounded-xl border bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800">
                            Reglas incumplidas · {rules.length}
                        </h3>
                        <p className="text-xs text-slate-500">
                            Ordenadas por volumen de hallazgos
                        </p>
                    </div>
                    {selectedRule && (
                        <button
                            onClick={() => {
                                setSelectedRule("");
                                setPage(1);
                            }}
                            className="text-xs font-medium text-blue-600 hover:underline"
                        >
                            Ver todas
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-3">
                    {sortedRules.map((rule) => {
                        const selected = selectedRule === rule.id;
                        const widthPct = maxRuleCount ? (rule.count / maxRuleCount) * 100 : 0;
                        return (
                            <div
                                key={rule.id}
                                className={`w-56 shrink-0 overflow-hidden rounded-lg border p-3 transition ${
                                    selected
                                        ? "border-blue-400 bg-blue-50"
                                        : "border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <button
                                        className="min-w-0 flex-1 text-left"
                                        onClick={() => {
                                            setSelectedRule(selected ? "" : rule.id);
                                            setPage(1);
                                        }}
                                    >
                                        <div className="flex items-baseline justify-between gap-2">
                                            <span className="text-xs font-bold text-red-600">
                                                {ruleNumber(rule.code)}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-500">
                                                {rule.count.toLocaleString("es-PE")}
                                            </span>
                                        </div>
                                        <div className="truncate text-sm text-slate-700" title={rule.name}>
                                            {rule.name}
                                        </div>
                                    </button>
                                    <button
                                        title="Exportar Excel"
                                        onClick={() => exportRule(rule.id, rule.code)}
                                        className="rounded p-1 text-slate-400 hover:bg-green-100 hover:text-green-700"
                                    >
                                        <FileSpreadsheet size={14} />
                                    </button>
                                </div>
                                <div className="mt-2 h-1 rounded-full bg-slate-100">
                                    <div
                                        className="h-1 rounded-full bg-red-500"
                                        style={{ width: `${widthPct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Buscador + tabs de riesgo + tabla de hallazgos */}
            <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-xs">
                        <Search
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar producto, regla o descripción"
                            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm"
                        />
                    </div>
                    <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
                        {RISK_FILTERS.map((filter) => (
                            <button
                                key={filter.value || "all"}
                                onClick={() => {
                                    setSelectedRisk(filter.value);
                                    setPage(1);
                                }}
                                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                    selectedRisk === filter.value
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-600 hover:bg-white"
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                    <span className="whitespace-nowrap text-xs text-slate-500">
                        {visibleItems.length} de {(findings.total ?? 0).toLocaleString("es-PE")} hallazgos
                    </span>
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
                                visibleItems.map((finding: any) => (
                                    <tr
                                        key={finding.id}
                                        className={`border-b cursor-pointer transition ${
                                            selectedFinding?.id === finding.id
                                                ? "bg-blue-50"
                                                : "hover:bg-slate-50"
                                        }`}
                                        onClick={() => loadFinding(finding.id)}
                                    >
                                        <td className="p-3">{finding.productCode}</td>
                                        <td className="p-3">{finding.month}</td>
                                        <td className="p-3">
                                            <div className="font-medium">
                                                {formatRuleCode(finding.rule?.code)}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {ruleTranslator.translate(finding.rule?.code)}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getRiskLevelColor(
                                                    finding.riskLevel
                                                )}`}
                                            >
                                                {translateRiskLevel(finding.riskLevel)}
                                            </span>
                                        </td>
                                        <td className="p-3">{finding.description}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>

                {
                    findings &&
                    (() => {
                        const total = findings.total ?? 0;
                        const totalPages = Math.max(1, Math.ceil(total / pageSize));
                        const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
                        const rangeEnd = Math.min(page * pageSize, total);
                        return (
                            <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                    <span>
                                        Mostrando <b className="text-slate-700">{rangeStart}–{rangeEnd}</b> de <b className="text-slate-700">{total}</b> hallazgos
                                    </span>
                                    <label className="flex items-center gap-2">
                                        <span>Por página:</span>
                                        <select
                                            value={pageSize}
                                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                            className="h-8 rounded-lg border px-2 text-sm"
                                        >
                                            {PAGE_SIZE_OPTIONS.map(size => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                                <div className="flex flex-wrap items-center gap-1">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => goToPage(1, totalPages)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                                        title="Primera página"
                                    >
                                        <ChevronsLeft size={16} />
                                    </button>
                                    <button
                                        disabled={page === 1}
                                        onClick={() => goToPage(page - 1, totalPages)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                                        title="Anterior"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    <div className="flex items-center gap-1 px-1">
                                        {
                                            getPageNumbers(page, totalPages).map((p, index) =>
                                                p === "..."
                                                    ? <span key={`ellipsis-${index}`} className="px-1 text-slate-400">…</span>
                                                    : (
                                                        <button
                                                            key={p}
                                                            onClick={() => goToPage(p, totalPages)}
                                                            className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition ${
                                                                p === page
                                                                    ? "bg-slate-900 text-white"
                                                                    : "text-slate-600 hover:bg-slate-100"
                                                            }`}
                                                        >{p}</button>
                                                    )
                                            )
                                        }
                                    </div>

                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => goToPage(page + 1, totalPages)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                                        title="Siguiente"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => goToPage(totalPages, totalPages)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                                        title="Última página"
                                    >
                                        <ChevronsRight size={16} />
                                    </button>

                                    <form
                                        className="ml-2 flex items-center gap-1.5 border-l pl-3"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (jumpValue) {
                                                goToPage(Number(jumpValue), totalPages);
                                                setJumpValue("");
                                            }
                                        }}
                                    >
                                        <input
                                            type="number"
                                            min={1}
                                            max={totalPages}
                                            value={jumpValue}
                                            onChange={(e) => setJumpValue(e.target.value)}
                                            placeholder="Ir a…"
                                            className="h-8 w-16 rounded-lg border px-2 text-sm"
                                        />
                                        <button
                                            type="submit"
                                            className="flex h-8 items-center rounded-lg border px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                                        >
                                            Ir
                                        </button>
                                    </form>
                                </div>
                            </div>
                        );
                    })()
                }
            </div>

            {/* Modal: Evidencia del Hallazgo */}
            {selectedFinding && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
                    onClick={() => setSelectedFinding(null)}
                >
                    <div
                        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b p-5">
                            <div className="flex items-center gap-2">
                                <FileSearch size={18} className="text-blue-600" />
                                <h3 className="text-base font-bold text-slate-800">
                                    Evidencia del Hallazgo
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedFinding(null)}
                                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 overflow-y-auto p-5">
                            {selectedFinding.recommendation && (
                                <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
                                    <Lightbulb size={18} className="mt-0.5 shrink-0 text-blue-600" />
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1">
                                            Recomendación
                                        </p>
                                        <p className="text-sm text-slate-700">
                                            {selectedFinding.recommendation}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                                    Detalle
                                </p>
                                {renderMetadata(selectedFinding.metadata)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Drawer: Registrar seguimiento */}
            {followUpOpen && (
                <div
                    className="fixed inset-0 z-50 flex justify-end bg-slate-900/40"
                    onClick={() => setFollowUpOpen(false)}
                >
                    <div
                        className="flex h-full w-full max-w-md flex-col bg-white shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between border-b p-5">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Seguimiento de regularización
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {dashboard.audit.client} · {dashboard.audit.year}
                                </p>
                            </div>
                            <button
                                onClick={() => setFollowUpOpen(false)}
                                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto p-5">
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Responsable
                                </label>
                                <input
                                    value={responsible}
                                    onChange={(e) => setResponsible(e.target.value)}
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Nombre del responsable"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Fecha de regularización
                                </label>
                                <input
                                    type="date"
                                    value={regularizationDate}
                                    onChange={(e) => setRegularizationDate(e.target.value)}
                                    className="w-full rounded-lg border p-2"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Acción correctiva
                                </label>
                                <textarea
                                    rows={3}
                                    value={correctiveAction}
                                    onChange={(e) => setCorrectiveAction(e.target.value)}
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Acciones realizadas para regularizar..."
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Observaciones
                                </label>
                                <textarea
                                    rows={3}
                                    value={observations}
                                    onChange={(e) => setObservations(e.target.value)}
                                    className="w-full rounded-lg border p-2"
                                    placeholder="Observaciones adicionales..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 border-t p-5">
                            <button
                                onClick={() => setFollowUpOpen(false)}
                                className="flex-1 rounded-lg border py-2 font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={saveFollowUp}
                                disabled={saving}
                                className="flex-1 rounded-lg bg-slate-900 py-2 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                            >
                                {saving ? "Guardando..." : "Guardar seguimiento"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

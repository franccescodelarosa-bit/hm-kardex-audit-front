"use client";
import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { updateAuditFollowUp } from "../../services/audit-results.services";

interface Props {
    report: any;
}

export default function ReportCard({
    report
}: Props) {

    const router = useRouter();
    const [status, setStatus] = useState(
        report.validationStatus ?? "PENDIENTE"
    );

    const getStatusColor = (status: string) => {

        switch (status) {

            case "REGULARIZADO":
                return "bg-green-100 text-green-700";

            case "EN_PROCESO":
                return "bg-yellow-100 text-yellow-700";

            default:
                return "bg-red-100 text-red-700";

        }

    };

    return (

        <div
            onClick={() =>
                router.push(`/dashboard/reports/${report.id}`)
            }
            className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer p-6 border"
        >

            <h2 className="text-xl font-bold">
                {report.client.businessName}
            </h2>

            <h4 className="text-xs text-slate-500">
                {report.id}
            </h4>

            <p className="text-gray-500">
                Auditoría {report.year}
            </p>

            <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-500">
                        Estado Auditoría
                    </span>
                    <span className="font-semibold text-green-600">
                        {report.status}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">
                        Responsable
                    </span>
                    <span className="font-medium">
                        {report.responsible ?? "-"}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">
                        Fecha de Regularización
                    </span>
                    <span className="font-medium">
                        {report.regularizationDate ? report.regularizationDate.substring(0, 10).split("-").reverse().join("-") : "-"}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-500">
                        Regularización
                    </span>
                    <select
                        className={`rounded-md border px-2 py-1 text-sm font-semibold ${getStatusColor(
                            status
                        )}`}
                        onClick={(e) => e.stopPropagation()}
                        onChange={async (e) => {
                            e.stopPropagation();
                            const value = e.target.value;
                            setStatus(value);
                            try {
                                await updateAuditFollowUp(
                                    report.id,
                                    {
                                        validationStatus: value
                                    }
                                );
                            }
                            catch {
                                setStatus(report.validationStatus ?? "PENDIENTE");
                            }
                        }}
                        defaultValue={
                            report.validationStatus ??
                            "PENDIENTE"
                        }
                    >
                        <option value="PENDIENTE">
                            Pendiente
                        </option>

                        <option value="EN_PROCESO">
                            En Proceso
                        </option>

                        <option value="REGULARIZADO">
                            Regularizado
                        </option>

                    </select>
                </div>
            </div>
        </div>

    );

}
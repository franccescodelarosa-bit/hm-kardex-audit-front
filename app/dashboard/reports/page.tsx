"use client";

import { useEffect, useState } from "react";

import { getReports } from "@/services/audit-results.services";

import ReportCard from "@/components/reports/ReportCard";

export default function ReportsPage(){

    const [reports,setReports]=useState<any[]>([]);

    const [loading,setLoading]=useState(true);

    useEffect(()=>{

        load();

    },[]);

    async function load(){

        const data=await getReports();

        setReports(data);

        setLoading(false);

    }

    if(loading)

        return <p>Cargando...</p>;

    return(

        <div className="p-8">

            <h1 className="text-3xl font-bold mb-8">

                Reportes de Auditoría

            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {

                    reports.map(report=>

                        <ReportCard

                            key={report.id}

                            report={report}

                        />

                    )

                }

            </div>

        </div>

    );

}
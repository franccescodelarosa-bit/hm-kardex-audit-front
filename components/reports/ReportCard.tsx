"use client";

import { useRouter } from "next/navigation";

interface Props{

    report:any;

}

export default function ReportCard({

    report

}:Props){

    const router=useRouter();

    return(

        <div

            onClick={()=>router.push(`/dashboard/reports/${report.id}`)}

            className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer p-6 border"

        >

            <h2 className="text-xl font-bold">

                {report.client.businessName}

            </h2>

            <p className="text-gray-500">

                Auditoría {report.year}

            </p>

            <div className="mt-4">

                <span className="text-green-600 font-semibold">

                    {report.status}

                </span>

            </div>
        </div>

    );

}
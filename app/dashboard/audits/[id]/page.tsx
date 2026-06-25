"use client";
import {  useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AuditDetailPage() {
 const params = useParams();
 const [audit, setAudit] = useState<any>(null);
 const [uploads, setUploads] = useState<any[]>([]);
 useEffect(() => {
    loadAudit();
    loadUploads();
 }, []);
 const loadUploads = async () => {
    try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        const response = await fetch(
            `${API_URL}/uploads/audit/${params.id}`,
                {
                    headers: {
                    Authorization:
                        `Bearer ${token}`,
                    },
                }
        );
        const data = await response.json();
        setUploads(data);
    } catch (error) {
        console.error(error);
    }
 };
 const uploadFile = async (file: File, fileType: string, month?: number ) => {
    try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        const presignedResponse = await fetch(`${API_URL}/uploads/presigned-url`,
            {
                method: "POST",
                headers: {
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${token}`,
                },
                body: JSON.stringify({
                    auditJobId:params.id,
                    fileType,
                    month,
                    fileName: file.name,
                }),
            }
        );
        const { uploadUrl, key } = await presignedResponse.json();
        await fetch(uploadUrl, { method: "PUT", body: file });
        await fetch(`${API_URL}/uploads`, 
            {  
               method: "POST",    
               headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify({
                    auditJobId: params.id,
                    fileType,
                    month,
                    fileName: file.name,
                    fileSize: file.size,
                    s3Key: key,
               }),
            }
        );
        await loadUploads();
    } catch (error) {
        console.error(error);
        alert(
            "Error subiendo archivo"
        );
    }
 };
 const loadAudit = async () => {
    try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        const response = await fetch(`${API_URL}/audits/${params.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );
        const data = await response.json();
        setAudit(data);
      } catch (error) {
        console.error(error);
      }
 };
 if (!audit) {
    return (<div>Cargando...</div>
    );
 }
 const documents = [
    {
        key: "INITIAL_INVENTORY",
        label: "Inventario Inicial",
    },
    {
        key: "TRANSIT",
        label: "Mercadería en Tránsito",
    },
    {
        key: "FINAL_INVENTORY",
        label: "Inventario Final",
    }
  ];
 const months = [ "Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre", "Noviembre","Diciembre"];
 const hasDocument = (fileType: string) => {
    return uploads.some(upload => upload.file_type === fileType);
 };
 const hasMonth = (month: number) => {
    return uploads.some( upload => upload.file_type === "KARDEX" && upload.month === month);
 };
 const totalRequired = 15;
 const totalUploaded = uploads.length;
 const completion = Math.min(100, Math.round(( uploads.length / totalRequired ) * 100));
 const viewFile = async ( uploadId: string ) => {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    const response = await fetch(`${API_URL}/uploads/${uploadId}/view`,
        {
            headers: { Authorization: `Bearer ${token}`},
        }
    );
    const data = await response.json();
    window.open( data.url, '_blank');
 };
 const getDocument = (fileType: string) => {
    return uploads.find( upload => upload.file_type === fileType);
 };
 const statusColors = {
    PENDING:"bg-yellow-100 text-yellow-700",
    IN_PROGRESS:"bg-blue-100 text-blue-700",
    READY_FOR_AUDIT:"bg-green-100 text-green-700",
    AUDITING:"bg-purple-100 text-purple-700",
    COMPLETED:"bg-emerald-100 text-emerald-700",
 };
 return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold">
            {
                audit.clients
                ?.business_name
            } - ID: {audit.id}
            </h1>
            <p className="text-slate-500">
            Auditoría {audit.year}
            </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">

                <div>

                <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[
                    audit.status as keyof typeof statusColors
                    ]
                }`}
                >
                {audit.status}
                </span>


                </div>
                <div className="flex items-center gap-3">
                    <span className="text-slate-500">  {totalUploaded} / {totalRequired}  documentos
                    </span>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">

                {completion}%

                </span>
                </div>
            </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold mb-4">
                Documentos
            </h2>

            <div className="space-y-3">

                {documents.map((document) => {

                const uploaded =
                    getDocument(document.key);

                return (

                    <div
                    key={document.key}
                    className={`
                        border rounded-xl p-4
                        flex items-center justify-between

                        ${
                        uploaded
                            ? "border-green-300 bg-green-50"
                            : "border-slate-200"
                        }
                    `}
                    >

                    <div>

                        <div className="font-medium">
                        {document.label}
                        </div>

                        {uploaded ? (
                        <>
                            <div className="text-sm text-slate-700 font-medium">
                            📄 {uploaded.file_name}
                            </div>

                            <div className="text-xs text-slate-500">
                            👤 {uploaded.uploadedBy}
                            </div>

                            <div className="text-xs text-slate-500">
                            🕒 {
                                new Date(
                                uploaded.uploaded_at
                                ).toLocaleString()
                            }
                            </div>
                        </>
                        ) : (
                        <div className="text-sm text-slate-400">
                            Documento pendiente
                        </div>
                        )}

                    </div>

                    <div className="flex gap-2">

                        {uploaded && (
                        <button
                            onClick={() =>
                            viewFile(uploaded.id)
                            }
                            className="
                            border
                            px-3
                            py-2
                            rounded-lg
                            "
                        >
                            Descargar
                        </button>
                        )}

                        <label
                        className="
                            bg-slate-900
                            text-white
                            px-4
                            py-2
                            rounded-lg
                            cursor-pointer
                        "
                        >

                        {uploaded
                            ? "Actualizar"
                            : "Subir"}

                        <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {

                            const file =
                                e.target.files?.[0];

                            if (!file)
                                return;

                            uploadFile(
                                file,
                                document.key
                            );

                            }}
                        />

                        </label>

                    </div>

                    </div>

                );

                })}

            </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold mb-4">
                Kardex Mensual
            </h2>

            <div className="grid grid-cols-2 gap-3">

            {months.map(
                (
                month,
                index
                ) => {

                const kardex =
                    uploads.find(
                    x =>
                        x.file_type === "KARDEX" &&
                        x.month === index + 1
                    );

                return (

                    <div
                    key={month}
                    className="
                        border
                        rounded-xl
                        p-4
                    "
                    >

                    <div className="flex justify-between items-center">

                        <div>

                        <div className="font-medium">
                            {
                            kardex
                                ? "✅"
                                : "❌"
                            }
                            {" "}
                            {month}
                        </div>

                        {kardex && (
                            <>
                            <div className="text-xs text-slate-500 mt-1">
                                📄 {kardex.file_name}
                            </div>

                            <div className="text-xs text-slate-500">
                                👤 {kardex.uploadedBy}
                            </div>

                            <div className="text-xs text-slate-500">
                                🕒 {
                                new Date(
                                    kardex.uploaded_at
                                ).toLocaleString()
                                }
                            </div>
                            </>
                        )}

                        </div>

                        <div className="flex gap-2">

                        {kardex && (
                            <button
                            onClick={() =>
                                viewFile(
                                kardex.id
                                )
                            }
                            className="
                                border
                                px-3
                                py-1
                                rounded-lg
                                text-sm
                            "
                            >
                            Ver
                            </button>
                        )}

                        <label
                            className="
                            bg-slate-900
                            text-white
                            px-3
                            py-1
                            rounded-lg
                            text-sm
                            cursor-pointer
                            "
                        >

                            {
                            kardex
                                ? "Actualizar"
                                : "Subir"
                            }

                            <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {

                                const file =
                                e.target.files?.[0];

                                if (!file)
                                return;

                                uploadFile(
                                file,
                                "KARDEX",
                                index + 1
                                );

                            }}
                            />

                        </label>

                        </div>

                    </div>

                    </div>

                );

                }
            )}

            </div>
        </div>
    </div>
  );
}
import { fetchAuthSession } from "aws-amplify/auth";
const API = process.env.NEXT_PUBLIC_API_URL!;
async function headers() {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };
}

export async function getReports() {
    const response = await fetch(
        `${API}/auditsresult`,
        {
            headers: await headers()
        }
    );
    if (!response.ok)
        throw new Error("Error obteniendo auditorías.");
    return response.json();
}

export async function getDashboard(id:string){
    const response=await fetch(
        `${API}/auditsresult/${id}/dashboard`,
        {
            headers:await headers()
        }
    );
    return response.json();
}

export async function getRules(id:string){
    const response=await fetch(
        `${API}/auditsresult/${id}/rules`,
        {
            headers:await headers()
        }
    );
    return response.json();
}

export async function getFindings(
    id:string,
    page:number=1,
    pageSize:number=25,
    filters:string=""
){
    const response=await fetch(`${API}/auditsresult/${id}/findings?page=${page}&pageSize=${pageSize}${filters}`,
        {
            headers:await headers()
        }
    );
    return response.json();
}

export async function getFinding(id:string){
    const response=await fetch(`${API}/auditsresult/findings/${id}`,
        {
            headers:await headers()
        }
    );
    return response.json();
}

export interface UpdateAuditFollowUpRequest {
    validationStatus: string;
    regularizationDate?: string | null;
    correctiveAction?: string;
    observations?: string;
    responsible?: string;
}

export async function updateAuditFollowUp(
    auditJobId: string,
    dto: UpdateAuditFollowUpRequest
) {
    const response=await fetch(`${API}/auditsresult/${auditJobId}/follow-up`,
        {
            method: "PUT",
            headers:await headers(),
            body:  JSON.stringify({dto})
        }
    );
    return await response.json();
}

export interface GeneratedReportStatus {
    reportId: string;
    status: "PENDING" | "READY" | "ERROR";
    downloadUrl?: string;
    errorMessage?: string;
}

export async function startZipReport(
    auditJobId: string
): Promise<GeneratedReportStatus> {
    const response = await fetch(
        `${API}/auditsresult/${auditJobId}/reports/zip`,
        {
            method: "POST",
            headers: await headers()
        }
    );
    if (!response.ok)
        throw new Error("No se pudo iniciar la generación del reporte.");
    return response.json();
}

export async function getReportStatus(
    reportId: string
): Promise<GeneratedReportStatus> {
    const response = await fetch(
        `${API}/auditsresult/reports/${reportId}`,
        {
            headers: await headers()
        }
    );
    if (!response.ok)
        throw new Error("No se pudo consultar el estado del reporte.");
    return response.json();
}

export async function startRuleReport(
    auditJobId: string,
    ruleId: string
): Promise<GeneratedReportStatus> {
    const response = await fetch(
        `${API}/auditsresult/${auditJobId}/rules/${ruleId}/reports`,
        {
            method: "POST",
            headers: await headers()
        }
    );
    if (!response.ok)
        throw new Error("No se pudo iniciar la generación del reporte.");
    return response.json();
}
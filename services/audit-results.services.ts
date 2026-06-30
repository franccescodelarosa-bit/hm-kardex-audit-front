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

    const response=await fetch(

`${API}/auditsresult/${id}/findings?page=${page}&pageSize=${pageSize}${filters}`,

        {

            headers:await headers()

        }

    );

    return response.json();

}

export async function getFinding(id:string){

    const response=await fetch(

`${API}/auditsresult/findings/${id}`,

        {

            headers:await headers()

        }

    );

    return response.json();

}
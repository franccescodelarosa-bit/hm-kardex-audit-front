"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { Trash2 } from "lucide-react";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

export default function UsersPage() {
const [companyName, setCompanyName] =
  useState("");
  const [clients, setClients] =
  useState<any[]>([]);

const [businessName, setBusinessName] =
  useState("");

const [selectedClient, setSelectedClient] =
  useState<any>(null);

const [ruc, setRuc] =
  useState("");

const [email, setEmail] =
  useState("");

const [phone, setPhone] =
  useState("");

const [loading, setLoading] =
  useState(false);

useEffect(() => {
  loadClients();
}, []);  
const loadClients = async () => {
  try {

    const session =
      await fetchAuthSession();

    const token =
      session.tokens?.idToken?.toString();

    const response =
      await fetch(
        `${API_URL}/clients`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    const data =
      await response.json();

    setClients(data);

  } catch (error) {
    console.error(error);
  }
};
const createClient = async () => {

  try {

    setLoading(true);

    const session =
      await fetchAuthSession();

    const token =
      session.tokens?.idToken?.toString();

    await fetch(
      `${API_URL}/clients`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify({
          businessName,
          companyName,
          ruc,
          email,
          phone,
        }),
      }
    );

    setBusinessName("");
    setRuc("");
    setEmail("");
    setPhone("");

    await loadClients();

  } catch (error) {

    console.error(error);

  } finally {

    setLoading(false);

  }
};

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Gestión de Usuarios
        </h1>

        <p className="text-slate-500">
          Registrar nuevos empleados
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="space-y-5">

                <div>
                <label className="block mb-2 text-sm font-medium">
                    Razón Social
                </label>

                <input
                    className="w-full border rounded-xl p-3"
                    placeholder="Grupo Romero"
                    value={businessName}
                    onChange={(e) =>
                    setBusinessName(
                        e.target.value
                    )
                    }
                />
                </div>

                <div>
                <label className="block mb-2 text-sm font-medium">
                    RUC
                </label>

                <input
                    className="w-full border rounded-xl p-3"
                    placeholder="20100070970"
                    value={ruc}
                    onChange={(e) =>
                    setRuc(
                        e.target.value
                    )
                    }
                />
                </div>

                <div>
                <label className="block mb-2 text-sm font-medium">
                    Correo
                </label>

                <input
                    className="w-full border rounded-xl p-3"
                    placeholder="contacto@empresa.com"
                    value={email}
                    onChange={(e) =>
                    setEmail(
                        e.target.value
                    )
                    }
                />
                </div>

                <div>
                <label className="block mb-2 text-sm font-medium">
                    Teléfono
                </label>

                <input
                    className="w-full border rounded-xl p-3"
                    placeholder="999999999"
                    value={phone}
                    onChange={(e) =>
                    setPhone(
                        e.target.value
                    )
                    }
                />
                </div>

                <button
                onClick={createClient}
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-3 transition"
                >
                {loading
                    ? "Guardando..."
                    : "Crear Cliente"}
                </button>

            </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="font-bold text-lg mb-4">
            Compañias Registradas
          </h2>
          <div className="space-y-3">
            {clients.map((client) => (
                <div
                    key={client.id}
                    onClick={() =>
                    setSelectedClient(client)
                    }
                    className="cursor-pointer border rounded-2xl p-5 hover:shadow-md transition"
                >

                    <div className="font-semibold">
                    {client.business_name}
                    </div>

                    <div className="text-sm text-slate-500">
                    {client.ruc}
                    </div>

                    <div className="text-sm text-slate-500">
                    {client.email}
                    </div>

                    <span className="inline-flex mt-2 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                    {client.status}
                    </span>

                </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-8">
            {!selectedClient ? (
                <div className="text-slate-400">
                Selecciona un cliente
                </div>
            ) : (
                <>

                <h2 className="text-xl font-bold mb-6">
                    {selectedClient.business_name}
                </h2>

                <div className="space-y-4">

                    <div>
                    <p className="text-xs text-slate-500">
                        RUC
                    </p>

                    <p>
                        {selectedClient.ruc}
                    </p>
                    </div>

                    <div>
                    <p className="text-xs text-slate-500">
                        Correo
                    </p>

                    <p>
                        {selectedClient.email}
                    </p>
                    </div>

                    <div>
                    <p className="text-xs text-slate-500">
                        Teléfono
                    </p>

                    <p>
                        {selectedClient.phone}
                    </p>
                    </div>

                    <div>
                    <p className="text-xs text-slate-500">
                        Estado
                    </p>

                    <span className="inline-flex mt-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                        {selectedClient.status}
                    </span>
                    </div>


                </div>

                </>
            )}
        </div>
      </div>
    </div>
  );
}
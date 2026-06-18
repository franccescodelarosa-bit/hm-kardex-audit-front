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

  const [users, setUsers] =
  useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [name, setName] =
    useState("");

  const createUser = async () => {
    try {
      setLoading(true);

      const session =
        await fetchAuthSession();

      const token =
        session.tokens?.idToken?.toString();

      const response =
        await fetch(
          `${API_URL}/users`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              email,
              fullName: name,
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Error creando usuario"
        );
      }

      const data =
        await response.json();

      console.log(data);

      alert(
        "Usuario creado"
      );
      await loadUsers();
      setEmail("");
      setName("");

    } catch (error) {
      console.error(error);

      alert(
        "Error creando usuario"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {

      const session =
        await fetchAuthSession();

      const token =
        session.tokens?.idToken?.toString();

      const response =
        await fetch(
          `${API_URL}/users`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      setUsers(data);

    } catch (error) {
      console.error(error);
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

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Nombre completo
              </label>

              <input
                className="w-full border rounded-xl p-3"
                placeholder="Franccesco De La Rosa"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Correo electrónico
              </label>

              <input
                className="w-full border rounded-xl p-3"
                placeholder="correo@empresa.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </div>

            <button
              onClick={createUser}
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-3 transition"
            >
              {loading
                ? "Creando usuario..."
                : "Crear usuario"}
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="font-bold text-lg mb-4">
            Usuarios Registrados
          </h2>
          <div className="space-y-3">

            {users.map((user) => (

              <div
                key={user.id}
                className="bg-white border rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                    {user.full_name?.charAt(0)}
                  </div>

                  <div>

                    <h3 className="font-semibold text-slate-900">
                      {user.full_name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {user.email}
                    </p>

                    <div className="flex gap-2 mt-2">

                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "SUPER_ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>

                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {user.status}
                      </span>

                    </div>

                  </div>

                </div>

                <button
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl p-2 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>

            ))}

          </div>

        </div>
      </div>
    </div>
  );
}
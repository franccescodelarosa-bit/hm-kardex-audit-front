"use client";

import { useState } from "react";

export default function UsersPage() {
  const [loading, setLoading] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [name, setName] =
    useState("");

  const createUser = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/users",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            fullName: name,
          }),
        }
      );

      const data =
        await response.json();

      console.log(data);

      alert("Usuario creado 😈");

      setEmail("");
      setName("");
    } catch (error) {
      console.error(error);

      alert("Error creando usuario");
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

      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-2xl">
        <div className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium">
              Nombre completo
            </label>

            <input
              className="w-full border rounded-xl p-3"
              placeholder="Juan Perez"
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
    </div>
  );
}
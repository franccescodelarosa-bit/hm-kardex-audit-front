"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  confirmSignIn,
} from "aws-amplify/auth";

export default function ChangePasswordPage() {

  const router =
    useRouter();

  const [password, setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const [error,
    setError] =
    useState("");

  const handleChangePassword =
    async () => {

      try {

        setError("");

        if (
          password !==
          confirmPassword
        ) {
          setError(
            "Las contraseñas no coinciden"
          );

          return;
        }

        setLoading(true);

        await confirmSignIn({
          challengeResponse:
            password,
        });

        alert(
          "Contraseña actualizada correctamente"
        );

        router.push(
          "/dashboard"
        );

      } catch (err: any) {

        console.error(err);

        setError(
          err?.message ??
          "Error actualizando contraseña"
        );

      } finally {

        setLoading(false);

      }
    };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold mb-2">
          Cambiar contraseña
        </h1>

        <p className="text-slate-500 mb-6">
          Debes actualizar tu contraseña temporal.
        </p>

        <div className="space-y-4">

          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="w-full border rounded-xl p-3"
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            className="w-full border rounded-xl p-3"
          />

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={
              handleChangePassword
            }
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-xl py-3"
          >
            {loading
              ? "Actualizando..."
              : "Guardar contraseña"}
          </button>

        </div>

      </div>

    </div>
  );
}
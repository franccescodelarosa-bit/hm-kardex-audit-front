"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { signIn } from "aws-amplify/auth";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await signIn({
        username: email,
        password,
      });

      console.log("LOGIN SUCCESS", response);

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Credenciales inválidas"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardContent className="p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              HMSoft
            </h1>

            <p className="text-slate-500 mt-2">
              Sistema Inteligente de Auditoría Kardex
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>
                Correo electrónico
              </Label>

              <Input
                type="email"
                placeholder="usuario@hmsoft.pe"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Contraseña</Label>

              <Input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />
            </div>

            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}

            <Button
              className="w-full h-11 text-base"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading
                ? "Ingresando..."
                : "Ingresar"}
            </Button>
          </div>

          <div className="mt-8 text-center text-sm text-slate-500">
            HMSoft © 2026
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
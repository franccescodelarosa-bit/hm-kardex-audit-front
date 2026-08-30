"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  fetchAuthSession,
  signOut,
} from "aws-amplify/auth";

import {
  useRouter,
} from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

const AuthContext =
  createContext<any>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const router =
    useRouter();

  const [user, setUser] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const redirectToLogin =
    async () => {

      try {

        await signOut();

      } catch (error) {

        console.error(error);

      }

      router.replace(
        "/login"
      );

    };

  const loadUser =
    async () => {

      try {

        const session =
          await fetchAuthSession();

        const token =
          session.tokens?.idToken?.toString();

        if (!token) {

          await redirectToLogin();

          return;
        }

        const response =
          await fetch(
            `${API_URL}/auth/me`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {

          await redirectToLogin();

          return;
        }

        const data =
          await response.json();

        setUser(data);

      } catch (error) {

        console.error(error);

        await redirectToLogin();

      } finally {

        setLoading(false);

      }

    };

  if (loading) {

    return (
      <div className="flex items-center justify-center h-screen">
        Cargando...
      </div>
    );

  }

  return (
    <AuthContext.Provider
      value={{
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);
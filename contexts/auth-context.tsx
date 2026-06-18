"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  fetchAuthSession,
} from "aws-amplify/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

const AuthContext =
  createContext<any>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser =
    async () => {
      try {
        const session =
          await fetchAuthSession();

        const token =
          session.tokens?.idToken?.toString();

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

        const data =
          await response.json();

        setUser(data);
      } catch (error) {
        console.error(error);
      }
    };

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
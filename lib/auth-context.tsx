// lib/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export type Role = "ADMIN" | "INSTRUCTOR" | "STUDENT";
export type UserClassification = "Adulto" | "Infantil";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  belt?: string;
  avatar?: string;
  role: Role;
  degree?: number;
  whatsapp?: string;
  birth_date?: string;
  user_classification?: UserClassification;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: Role | null;
  signupWithEmail: (email: string, password: string, userData: any) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ✅ Função para derivar role do email
function getRoleFromEmail(email: string): Role {
  const lowerEmail = email.toLowerCase();
  if (lowerEmail.startsWith("admin")) return "ADMIN";
  if (lowerEmail.startsWith("instructor") || lowerEmail.startsWith("instrutor"))
    return "INSTRUCTOR";
  return "STUDENT";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Ref para evitar loops de processamento do mesmo usuário
  const processingId = useRef<string | null>(null);

  const fetchUserProfile = useCallback(async (authUser: User) => {
    try {
      console.log("🔎 Buscando perfil para:", authUser.email);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      console.log("📊 Perfil obtido:", profile);

      // ✅ Derivar role do email
      const role = getRoleFromEmail(authUser.email || "");

      setUser({
        id: authUser.id,
        email: authUser.email || "",
        name: profile?.full_name || authUser.user_metadata?.full_name || "Usuário",
        avatar: profile?.avatar_url || authUser.user_metadata?.avatar_url,
        role,
        degree:profile.degree,
        whatsapp: profile?.whatsapp,
        birth_date: profile?.birth_date,
        user_classification: profile?.user_classification,
      });

      console.log("✅ Usuário definido com role:", role);
    } catch (e) {
      console.error("❌ Erro ao carregar perfil:", e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;

    // Escuta global de eventos do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("🔔 Auth Event:", event); // Log para debug

      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        // Se não há sessão em eventos de inicialização ou logout
        if (event === "SIGNED_OUT" || event === "INITIAL_SESSION") {
          setUser(null);
          setIsLoading(false);
        }
      }
    });

    // Check de segurança caso o evento demore
    const checkInitial = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted && !session) setIsLoading(false);
    };
    checkInitial();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { 
        redirectTo: `${window.location.origin}/auth/callback`
      },
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchUserProfile(session.user);
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
          fetchUserProfile(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  // ✅ SIGNUP COM EMAIL/SENHA - CORRIGIDO PARA SALVAR TODOS OS DADOS
  const signupWithEmail = useCallback(
    async (email: string, password: string, userData: any) => {
      try {
        console.log("📝 Iniciando cadastro com dados:", {
          email,
          full_name: userData.full_name,
          user_classification: userData.user_classification,
          birth_date: userData.birth_date,
          whatsapp: userData.whatsapp,
        });

        // PASSO 1: Criar usuário em auth.users
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: userData.full_name,
            },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (authError) {
          console.error("❌ Erro ao criar usuário:", authError.message);
          throw authError;
        }

        console.log("✅ Usuário criado em auth.users:", authData.user?.id);

        // PASSO 2: Aguardar um pouco para garantir que a row foi criada
        await new Promise(resolve => setTimeout(resolve, 500));

        // PASSO 3: Atualizar o perfil com os dados completos usando UPDATE
        if (authData.user) {
          console.log("📝 Atualizando perfil com dados:", {
            id: authData.user.id,
            full_name: userData.full_name,
            birth_date: userData.birth_date,
            whatsapp: userData.whatsapp,
            user_classification: userData.user_classification,
          });

          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              full_name: userData.full_name,
              birth_date: userData.birth_date,
              whatsapp: userData.whatsapp,
              user_classification: userData.user_classification,
              profile_type: "STUDENT",
            })
            .eq("id", authData.user.id);

          if (updateError) {
            console.error("❌ Erro ao atualizar perfil:", updateError.message);
            throw updateError;
          }

          console.log("✅ Perfil atualizado com sucesso");
        }

        // PASSO 4: Deslogar imediatamente
        await supabase.auth.signOut();
        console.log("✅ Usuário deslogado - faça login manualmente");

      } catch (error: any) {
        console.error("❌ Erro completo em signupWithEmail:", error);
        throw error;
      }
    },
    []
  );

  // ✅ LOGIN COM EMAIL/SENHA
  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        console.log("🔐 Fazendo login com:", email);

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("❌ Erro no login:", error.message);
          setIsLoading(false);
          throw error;
        }

        console.log("✅ Login bem-sucedido");
      } catch (error) {
        console.error("❌ Erro em loginWithEmail:", error);
        setIsLoading(false);
        throw error;
      }
    },
    []
  );

  // ✅ LOGOUT
  const logout = useCallback(async () => {
    try {
      console.log("👋 Fazendo logout...");
      await supabase.auth.signOut();
      setUser(null);
      console.log("✅ Logout realizado");
    } catch (error) {
      console.error("❌ Erro no logout:", error);
      throw error;
    }
  }, []);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        role: user?.role ?? null,
        signupWithEmail,
        loginWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};

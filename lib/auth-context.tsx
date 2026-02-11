// lib/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type Role = "ADMIN" | "INSTRUCTOR" | "STUDENT";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: Role;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: Role | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getRoleFromEmail(email: string): Role {
  const lowerEmail = email.toLowerCase();
  if (lowerEmail.startsWith("admin")) return "ADMIN";
  if (lowerEmail.startsWith("instructor") || lowerEmail.startsWith("instrutor")) return "INSTRUCTOR";
  return "STUDENT";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Ref para evitar loops de processamento do mesmo usuário
  const processingId = useRef<string | null>(null);

  const fetchUserProfile = useCallback(async (authUser: User) => {
    // Se já estamos processando este ID, evitamos duplicidade
    if (processingId.current === authUser.id && user) return;
    processingId.current = authUser.id;

    try {
      // Usamos getSession novamente aqui para garantir que temos o token mais fresco
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      const role = getRoleFromEmail(authUser.email || "");

      const userData: UserProfile = {
        id: authUser.id,
        email: authUser.email || "",
        name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Usuário",
        avatar: profile?.avatar_url || authUser.user_metadata?.avatar_url,
        role,
      };

      // A MUDANÇA REAL ACONTECE AQUI
      setUser(userData);

      if (!profile) {
        await supabase.from("profiles").upsert({
          id: authUser.id,
          full_name: userData.name,
          email: userData.email,
          avatar_url: userData.avatar,
        });
      }
    } catch (e) {
      console.error("Erro no AuthContext:", e);
      setUser(null);
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

  const logout = useCallback(async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    window.location.href = "/login";
  }, []);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, role: user?.role ?? null, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};
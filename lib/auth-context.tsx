"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
// Definir Role aqui mesmo
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
  if (email.toLowerCase().startsWith("admin")) return "ADMIN";
  if (
    email.toLowerCase().startsWith("instructor") ||
    email.toLowerCase().startsWith("instrutor")
  )
    return "INSTRUCTOR";
  return "STUDENT";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

const fetchUserProfile = useCallback(async (authUser: User) => {
  console.log('🔎 Buscando perfil para:', authUser.email)
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle() // ⬅️ MUDANÇA: maybeSingle em vez de single

    console.log('📊 Resultado profiles:', { profile, error })

    const role = getRoleFromEmail(authUser.email || '')
    
    const userData = {
      id: authUser.id,
      email: authUser.email || '',
      name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
      avatar: profile?.avatar_url || authUser.user_metadata?.avatar_url,
      role,
    }

    console.log('✅ Setando user:', userData)
    setUser(userData)

    // Se não tem perfil, criar
    if (!profile) {
      console.log('📝 Criando perfil...')
      await supabase.from('profiles').insert({
        id: authUser.id,
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
        email: authUser.email,
        avatar_url: authUser.user_metadata?.avatar_url,
      })
    }

  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error)
    
    // Mesmo com erro, criar usuário básico
    const role = getRoleFromEmail(authUser.email || '')
    setUser({
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
      avatar: authUser.user_metadata?.avatar_url,
      role,
    })
  } finally {
    setIsLoading(false)
  }
}, [])


  // Timeout de segurança para evitar loading infinito
useEffect(() => {
  const timeout = setTimeout(() => {
    console.log('⏰ Timeout de segurança: forçando isLoading = false')
    setIsLoading(false)
  }, 3000) // 3 segundos

  return () => clearTimeout(timeout)
}, [])


useEffect(() => {
  let mounted = true
  
  const initAuth = async () => {
    try {
      console.log('🔍 Iniciando auth...')
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('📱 Session:', session?.user?.email, 'error:', error)
      
      if (!mounted) return
      
      if (session?.user) {
        console.log('👤 Usuário logado, buscando perfil...')
        await fetchUserProfile(session.user)
      } else {
        console.log('❌ Sem usuário logado')
        setUser(null)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('❌ Erro init auth:', error)
      if (mounted) {
        setIsLoading(false)
      }
    }
  }

  initAuth()

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('🔄 Auth change:', event, 'user:', session?.user?.email)
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ SIGNED_IN - chamando fetchUserProfile')
        await fetchUserProfile(session.user)
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 SIGNED_OUT')
        setUser(null)
        setIsLoading(false)
      }
    }
  )


  return () => {
    mounted = false
    subscription.unsubscribe()
  }
}, [fetchUserProfile])



const loginWithGoogle = useCallback(async () => {
  setIsLoading(true)
  try {
    console.log('🚀 Iniciando login com Google...')
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    console.log('📤 SignIn result:', { data, error })

    if (error) {
      console.error('❌ Erro ao fazer login com Google:', error)
      throw error
    }
  } catch (error) {
    console.error('❌ Erro no login:', error)
    setIsLoading(false)
    throw error
  }
}, [])


  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erro ao fazer logout:", error);
        throw error;
      }
      setUser(null);
    } catch (error) {
      console.error("Erro no logout:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        role: user?.role ?? null,
        loginWithGoogle,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  nome: string;
  email: string;
  fazenda?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
  nomeCompleto?: string;
  email: string;
  password: string;
  telefone?: string;
  fazenda?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

function clearAuthData() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  document.cookie = 'auth_token=; path=/; max-age=0';
}

function redirectToLogin() {
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
    window.location.replace('/auth/login');
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        clearAuthData();
        redirectToLogin();
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/usuarios/verificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({
          id: userData.id.toString(),
          nome: userData.nome,
          email: userData.email,
          fazenda: userData.fazenda,
        });
      } else {
        // Token inválido — limpa e redireciona sem mostrar erro
        clearAuthData();
        redirectToLogin();
      }
    } catch {
      // Erro de rede — só limpa, não redireciona (evita loop se API offline)
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    const response = await fetch(`${API_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha: password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.erro || 'E-mail ou senha inválidos.');
    }

    const data = await response.json();

    const userData: User = {
      id: data.id.toString(),
      nome: data.nome,
      email: data.email,
      fazenda: data.fazenda,
    };

    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    document.cookie = `auth_token=${data.token}; path=/;${rememberMe ? ' max-age=2592000' : ''}`;

    setUser(userData);
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    router.push('/auth/login');
  };

  const register = async (data: RegisterData) => {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: data.nomeCompleto ?? data.email,
        email: data.email,
        senha: data.password,
        telefone: data.telefone,
        fazenda: data.fazenda,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.erro || 'Erro ao criar conta.');
    }

    await login(data.email, data.password, false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
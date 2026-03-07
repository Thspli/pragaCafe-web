// src/hooks/useNotificacoes.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface Notificacao {
  id: number;
  tipo: string;
  titulo: string;
  mensagem?: string;
  lida: boolean;
  metadados?: {
    talhaoId?: number;
    talhaoNome?: string;
    armadilhaId?: number;
    armadilhaNome?: string;
    latitude?: number;
    longitude?: number;
  };
  criadoEm: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
const POLL_INTERVAL = 15_000; // 15 segundos

export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const fetchNotificacoes = useCallback(async (silent = false) => {
    const token = getToken();
    if (!token) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`${API_URL}/notificacoes?limite=40`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotificacoes(data.notificacoes || []);
      setNaoLidas(data.naoLidas ?? 0);
    } catch {
      // silencioso em background
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotificacoes();
    intervalRef.current = setInterval(() => fetchNotificacoes(true), POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotificacoes]);

  const marcarComoLida = useCallback(async (id: number) => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${API_URL}/notificacoes/${id}/ler`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
      );
      setNaoLidas((prev) => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const marcarTodasComoLidas = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${API_URL}/notificacoes/ler-todas`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
      setNaoLidas(0);
    } catch {}
  }, []);

  const deletarNotificacao = useCallback(async (id: number) => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${API_URL}/notificacoes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificacoes((prev) => {
        const removed = prev.find((n) => n.id === id);
        if (removed && !removed.lida) setNaoLidas((c) => Math.max(0, c - 1));
        return prev.filter((n) => n.id !== id);
      });
    } catch {}
  }, []);

  const limparTodas = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${API_URL}/notificacoes`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificacoes([]);
      setNaoLidas(0);
    } catch {}
  }, []);

  return {
    notificacoes,
    naoLidas,
    loading,
    fetchNotificacoes,
    marcarComoLida,
    marcarTodasComoLidas,
    deletarNotificacao,
    limparTodas,
  };
}
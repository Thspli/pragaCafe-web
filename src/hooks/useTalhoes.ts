"use client";

import { useState, useEffect } from "react";

export interface Praga {
  tipo: string;
  quantidade: number;
}

export interface Talhao {
  id: number;
  nome: string;
  area: number | null;
  status: "baixo" | "medio" | "alto" | "critico" | null;
  ultimaColeta: string | null;
  totalPragas: number | null;
  armadilhasAtivas: number | null;
  center: [number, number];
  boundary: [number, number][];
  pragas: Praga[] | null;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export function useTalhoes() {
  const [talhoes, setTalhoes] = useState<Talhao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTalhoes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/talhoes`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sessão expirada. Faça login novamente.");
        }
        throw new Error("Erro ao buscar talhões");
      }

      const data = await response.json();
      setTalhoes(data);
    } catch (err: any) {
      console.error("Erro no fetch:", err);
      setError(err.message || "Falha ao carregar talhões. Backend pode estar offline.");
      setTalhoes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalhoes();
  }, []);

  const createTalhao = async (talhaoData: {
    nome: string;
    area?: number;
    status?: string;
    center: [number, number];
    boundary: [number, number][];
    pragas?: Praga[];
  }) => {
    try {
      const response = await fetch(`${API_URL}/talhoes`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          nome: talhaoData.nome,
          area: talhaoData.area,
          status: talhaoData.status,
          centerLat: talhaoData.center[0],
          centerLng: talhaoData.center[1],
          boundaryJson: talhaoData.boundary,
          pragasJson: talhaoData.pragas ?? [],
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sessão expirada. Faça login novamente.");
        }
        throw new Error("Erro ao criar talhão");
      }

      const novoTalhao = await response.json();
      setTalhoes(prev => [...prev, novoTalhao]);
      return novoTalhao;
    } catch (err: any) {
      console.error("Erro ao criar talhão:", err);
      throw err;
    }
  };

  const getTotals = () => {
    return {
      totalTalhoes:    talhoes.length,
      // cada campo soma independentemente — um null em pragas não zera a área
      totalArmadilhas: talhoes.reduce((acc, t) => acc + (t.armadilhasAtivas ?? 0), 0),
      totalPragas:     talhoes.reduce((acc, t) => acc + (t.totalPragas     ?? 0), 0),
      areaTotal:       talhoes.reduce((acc, t) => acc + (t.area            ?? 0), 0),
    };
  };

  return {
    talhoes,
    loading,
    error,
    createTalhao,
    reload: fetchTalhoes,
    getTotals,
  };
}
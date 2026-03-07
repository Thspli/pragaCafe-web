// src/components/modals/ListaArmadilhasModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Camera } from "lucide-react";

interface Armadilha {
  id: number;
  nome: string;
  observacao?: string;
  foto?: string;
  dataFoto?: string;
  latitude: number;
  longitude: number;
  talhaoId: number;
  criadoEm?: string;
}

interface Talhao {
  id: number;
  nome: string;
  area: number | null;
  status: "baixo" | "medio" | "alto" | "critico" | null;
  totalPragas: number | null;
  armadilhasAtivas: number | null;
}

interface ListaArmadilhasModalProps {
  open: boolean;
  onClose: () => void;
  talhoes: Talhao[];
  onArmadilhaClick?: (armadilha: Armadilha) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export function ListaArmadilhasModal({ open, onClose, talhoes, onArmadilhaClick }: ListaArmadilhasModalProps) {
  const [currentTalhaoIndex, setCurrentTalhaoIndex] = useState(0);
  const [armadilhas, setArmadilhas] = useState<Armadilha[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const currentTalhao = talhoes[currentTalhaoIndex];

  useEffect(() => {
    if (!open || !currentTalhao) return;
    const fetchArmadilhas = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const params = new URLSearchParams();
        params.set('talhaoId', String(currentTalhao.id));
        const res = await fetch(`${API_URL}/armadilhas?${params.toString()}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (!res.ok) { setArmadilhas([]); return; }
        const data = await res.json();
        const unique = Array.from(new Map(data.map((a: any) => [a.id, a])).values()) as Armadilha[];
        setArmadilhas(unique.filter(a => a.latitude != null && a.longitude != null));
      } catch {
        setArmadilhas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchArmadilhas();
  }, [open, currentTalhao]);

  useEffect(() => { if (!open) { setCurrentTalhaoIndex(0); setArmadilhas([]); } }, [open]);

  if (!open) return null;

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "baixo":   return { bg: "#fdf6f0", color: "#4A2C2A" };
      case "medio":   return { bg: "#fef3c7", color: "#92400e" };
      case "alto":    return { bg: "#fed7aa", color: "#9a3412" };
      case "critico": return { bg: "#fecaca", color: "#7f1d1d" };
      default:        return { bg: "#e5e7eb", color: "#374151" };
    }
  };

  const statusInfo = getStatusColor(currentTalhao?.status);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, padding: "2rem", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{ background: "white", borderRadius: "1rem", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", width: "100%", maxWidth: "1200px", maxHeight: "85vh", overflow: "hidden", border: "2px solid #D4A853", display: "flex", flexDirection: "column" }}
          >
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #2C1810 0%, #4A2C2A 50%, #8B4513 100%)", padding: "1.5rem 2rem", display: "flex", alignItems: "center", gap: "1rem", borderBottom: "2px solid #2C1810" }}>
              <button onClick={() => setCurrentTalhaoIndex(p => p > 0 ? p - 1 : talhoes.length - 1)} disabled={talhoes.length <= 1}
                style={{ padding: "0.625rem", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", borderRadius: "0.625rem", cursor: talhoes.length > 1 ? "pointer" : "not-allowed", color: "white", opacity: talhoes.length > 1 ? 1 : 0.5 }}>
                <ChevronLeft size={24} />
              </button>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "white", margin: 0, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    📸 Pontos de Foto — {currentTalhao?.nome}
                  </h2>
                  <span style={{ fontSize: "0.85rem", background: "rgba(212,168,83,0.2)", padding: "0.25rem 0.75rem", borderRadius: "0.5rem", fontWeight: 600, color: "#D4A853" }}>
                    Talhão {currentTalhaoIndex + 1}/{talhoes.length}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ color: "rgba(212,168,83,0.9)", fontSize: "0.9rem", fontWeight: 600 }}>
                    {armadilhas.length} ponto(s) de foto cadastrado(s)
                  </span>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0.75rem", borderRadius: "0.5rem", fontWeight: 700, fontSize: "0.75rem", background: statusInfo.bg, color: statusInfo.color }}>
                    {currentTalhao?.status?.toUpperCase() || "SEM STATUS"}
                  </div>
                </div>
              </div>

              <button onClick={() => setCurrentTalhaoIndex(p => p < talhoes.length - 1 ? p + 1 : 0)} disabled={talhoes.length <= 1}
                style={{ padding: "0.625rem", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", borderRadius: "0.625rem", cursor: talhoes.length > 1 ? "pointer" : "not-allowed", color: "white", opacity: talhoes.length > 1 ? 1 : 0.5 }}>
                <ChevronRight size={24} />
              </button>
              <button onClick={onClose} style={{ padding: "0.625rem", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", borderRadius: "0.625rem", cursor: "pointer", color: "white" }}>
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: "2rem", overflowY: "auto", flex: 1 }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                  <div style={{ width: "40px", height: "40px", border: "4px solid #f3f4f6", borderTop: "4px solid #8B4513", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" }} />
                  <p style={{ color: "#6b7280", fontWeight: 600 }}>Carregando pontos de foto...</p>
                </div>
              ) : armadilhas.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#6b7280" }}>
                  <Camera size={64} style={{ margin: "0 auto 1rem", opacity: 0.3, color: "#8B4513" }} />
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Nenhum ponto de foto cadastrado</h3>
                  <p style={{ fontSize: "0.9rem" }}>Adicione pontos de foto clicando no mapa dentro do talhão {currentTalhao?.nome}</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                  {armadilhas.map((armadilha) => (
                    <motion.div key={armadilha.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02, y: -4 }}
                      onClick={() => { if (onArmadilhaClick) { onArmadilhaClick(armadilha); onClose(); } }}
                      style={{ background: "linear-gradient(135deg, #ffffff 0%, #fdf6f0 100%)", border: "2px solid #D4A853", borderRadius: "0.75rem", padding: "1.5rem", cursor: onArmadilhaClick ? "pointer" : "default", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}
                    >
                      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: "radial-gradient(circle, rgba(200,134,10,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "2px solid #f5e6d3" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#2C1810", margin: 0, flex: 1 }}>
                          {armadilha.nome || 'Ponto de Foto'}
                        </h3>
                        <span style={{ fontSize: "0.75rem", color: "#C8860A", fontWeight: 700, background: "#fdf6f0", padding: "0.25rem 0.75rem", borderRadius: "0.5rem" }}>#{armadilha.id}</span>
                      </div>

                      {armadilha.foto && (
                        <div style={{ width: "100%", height: "160px", borderRadius: "0.5rem", overflow: "hidden", marginBottom: "1rem", border: "2px solid #D4A853", position: "relative", cursor: "pointer" }}
                          onClick={(e) => { e.stopPropagation(); setPreviewImage(armadilha.foto || null); }}>
                          <img src={armadilha.foto} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.7))", padding: "1.5rem 0.75rem 0.75rem", color: "white", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem" }}>
                            <Camera size={14} />Clique para ampliar
                          </div>
                        </div>
                      )}

                      {armadilha.observacao && (
                        <div style={{ background: "#fdf6f0", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#4A2C2A", lineHeight: 1.5 }}>
                          {armadilha.observacao}
                        </div>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#4A2C2A", fontSize: "0.85rem", fontWeight: 600 }}>
                          <MapPin size={16} style={{ color: "#C8860A", flexShrink: 0 }} />
                          <span>{armadilha.latitude.toFixed(6)}, {armadilha.longitude.toFixed(6)}</span>
                        </div>
                        {armadilha.dataFoto && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#4A2C2A", fontSize: "0.85rem", fontWeight: 600 }}>
                            <Camera size={16} style={{ color: "#C8860A", flexShrink: 0 }} />
                            <span>{new Date(armadilha.dataFoto).toLocaleDateString("pt-BR")}</span>
                          </div>
                        )}
                        {armadilha.criadoEm && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#4A2C2A", fontSize: "0.85rem", fontWeight: 600 }}>
                            <Calendar size={16} style={{ color: "#C8860A", flexShrink: 0 }} />
                            <span>Criado em {new Date(armadilha.criadoEm).toLocaleDateString("pt-BR")}</span>
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "2px solid #f5e6d3", textAlign: "right" }}>
                        {onArmadilhaClick && <span style={{ color: "#C8860A", fontWeight: 700, fontSize: "0.85rem" }}>Ver detalhes →</span>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {previewImage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewImage(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5000, padding: "2rem", cursor: "pointer" }}>
              <img src={previewImage} alt="Preview" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "0.75rem" }} />
            </motion.div>
          )}
        </motion.div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </AnimatePresence>
  );
}
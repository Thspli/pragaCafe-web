// src/components/modals/ListaTalhoesModal.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Coffee, Camera, Plus } from "lucide-react";
import { Talhao } from "../../hooks/useTalhoes";

interface ListaTalhoesModalProps {
  open: boolean;
  onClose: () => void;
  talhoes: Talhao[];
  onTalhaoClick?: (talhao: Talhao) => void;
  onNovoTalhao?: () => void;
}

export function ListaTalhoesModal({ open, onClose, talhoes, onTalhaoClick, onNovoTalhao }: ListaTalhoesModalProps) {
  if (!open) return null;

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "baixo":   return { bg: "#fdf6f0", color: "#4A2C2A", label: "Baixa Infestação" };
      case "medio":   return { bg: "#fef3c7", color: "#92400e", label: "Média Infestação" };
      case "alto":    return { bg: "#fed7aa", color: "#9a3412", label: "Alta Infestação" };
      case "critico": return { bg: "#fecaca", color: "#7f1d1d", label: "Crítica" };
      default:        return { bg: "#e5e7eb", color: "#374151", label: "Sem Status" };
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, padding: "2rem", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        >
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{ background: "white", borderRadius: "1rem", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", width: "100%", maxWidth: "1200px", maxHeight: "85vh", overflow: "hidden", border: "2px solid #D4A853", display: "flex", flexDirection: "column" }}
          >
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #2C1810 0%, #4A2C2A 50%, #8B4513 100%)", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #2C1810" }}>
              <div>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "white", margin: 0, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <MapPin size={28} />Meus Talhões
                </h2>
                <p style={{ color: "rgba(212,168,83,0.9)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                  Total de {talhoes.length} talhão(ões) cadastrado(s)
                </p>
              </div>
              <button onClick={onClose}
                style={{ padding: "0.625rem", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", borderRadius: "0.625rem", cursor: "pointer", color: "white" }}>
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: "2rem", overflowY: "auto", flex: 1 }}>
              {talhoes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
                  <div style={{ width: "120px", height: "120px", background: "linear-gradient(135deg, #fdf6f0 0%, #f5e6d3 100%)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid #D4A853", boxShadow: "0 8px 24px rgba(139, 69, 19, 0.15)" }}>
                    <MapPin size={64} style={{ color: "#8B4513" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2C1810", marginBottom: "0.75rem" }}>Nenhum talhão cadastrado</h3>
                    <p style={{ fontSize: "1rem", color: "#6b7280", lineHeight: 1.6, maxWidth: "500px", margin: "0 auto" }}>
                      Comece criando seu primeiro talhão para monitorar brocas e pontos de foto na sua lavoura de café
                    </p>
                  </div>
                  <div style={{ background: "#fdf6f0", border: "2px solid #D4A853", borderRadius: "1rem", padding: "1.5rem", maxWidth: "500px", width: "100%" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#2C1810", marginBottom: "1rem", textAlign: "left" }}>☕ Com talhões você pode:</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", textAlign: "left" }}>
                      <FeatureItem icon="🗺️" text="Desenhar áreas personalizadas no mapa" />
                      <FeatureItem icon="📸" text="Adicionar e gerenciar pontos de foto" />
                      <FeatureItem icon="🐛" text="Monitorar brocas em tempo real" />
                      <FeatureItem icon="📊" text="Gerar relatórios detalhados" />
                    </div>
                  </div>
                  {onNovoTalhao && (
                    <motion.button onClick={() => { onNovoTalhao(); onClose(); }} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                      style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 2rem", background: "linear-gradient(135deg, #4A2C2A, #8B4513)", color: "white", border: "none", borderRadius: "0.75rem", fontSize: "1.1rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(139, 69, 19, 0.3)" }}>
                      <Plus size={24} />Criar Meu Primeiro Talhão
                    </motion.button>
                  )}
                  <p style={{ fontSize: "0.875rem", color: "#9ca3af", fontStyle: "italic" }}>💡 Dica: Use a ferramenta de desenho no mapa para delimitar seu talhão</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
                  {talhoes.map((talhao) => {
                    const statusInfo = getStatusColor(talhao.status);
                    return (
                      <motion.div key={talhao.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02, y: -4 }}
                        onClick={() => { if (onTalhaoClick) { onTalhaoClick(talhao); onClose(); } }}
                        style={{ background: "linear-gradient(135deg, #ffffff 0%, #fdf6f0 100%)", border: "2px solid #D4A853", borderRadius: "0.75rem", padding: "1.5rem", cursor: onTalhaoClick ? "pointer" : "default", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "2px solid #f5e6d3" }}>
                          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#2C1810", margin: 0, flex: 1 }}>{talhao.nome}</h3>
                          <span style={{ fontSize: "0.75rem", color: "#C8860A", fontWeight: 700, background: "#fdf6f0", padding: "0.25rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #D4A853" }}>#{talhao.id}</span>
                        </div>

                        <div style={{ display: "inline-block", padding: "0.5rem 1rem", borderRadius: "0.5rem", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", background: statusInfo.bg, color: statusInfo.color, marginBottom: "1rem" }}>
                          {statusInfo.label}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#4A2C2A", fontSize: "0.9rem", fontWeight: 600 }}>
                            <MapPin size={18} style={{ color: "#C8860A", flexShrink: 0 }} />
                            <span>Área: {talhao.area?.toFixed(2) ?? "N/A"} ha</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#4A2C2A", fontSize: "0.9rem", fontWeight: 600 }}>
                            <Coffee size={18} style={{ color: "#C8860A", flexShrink: 0 }} />
                            <span>Brocas: {talhao.totalPragas ?? 0}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#4A2C2A", fontSize: "0.9rem", fontWeight: 600 }}>
                            <Camera size={18} style={{ color: "#C8860A", flexShrink: 0 }} />
                            <span>Pontos de foto: {talhao.armadilhasAtivas ?? 0}</span>
                          </div>
                          {talhao.ultimaColeta && (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#4A2C2A", fontSize: "0.9rem", fontWeight: 600 }}>
                              <Calendar size={18} style={{ color: "#C8860A", flexShrink: 0 }} />
                              <span>Última coleta: {new Date(talhao.ultimaColeta).toLocaleDateString("pt-BR")}</span>
                            </div>
                          )}
                        </div>

                        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "2px solid #f5e6d3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#6b7280", fontSize: "0.8rem", fontWeight: 600 }}>
                            {talhao.center ? <>{talhao.center[0].toFixed(5)}<br />{talhao.center[1].toFixed(5)}</> : <>N/A<br />N/A</>}
                          </span>
                          {onTalhaoClick && <span style={{ color: "#C8860A", fontWeight: 700, fontSize: "0.85rem" }}>Ver no mapa →</span>}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem", color: "#374151", fontWeight: 600 }}>
      <span style={{ fontSize: "1.25rem" }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}
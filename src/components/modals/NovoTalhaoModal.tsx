// src/components/modals/NovoTalhaoModal.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface TempPolygon {
  boundary: [number, number][];
  center: [number, number];
  area: number;
}

interface NovoTalhaoModalProps {
  open: boolean;
  onClose: () => void;
  tempPolygon: TempPolygon | null;
  nome: string;
  status: "baixo" | "medio" | "alto" | "critico";
  onChangeNome: (value: string) => void;
  onChangeStatus: (value: "baixo" | "medio" | "alto" | "critico") => void;
  onConfirm: () => Promise<void> | void;
}

export function NovoTalhaoModal({ open, onClose, tempPolygon, nome, status, onChangeNome, onChangeStatus, onConfirm }: NovoTalhaoModalProps) {
  if (!open || !tempPolygon) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "1rem", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{ background: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", width: "100%", maxWidth: "500px", border: "2px solid #D4A853" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "2px solid #f5e6d3" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2C1810", margin: 0 }}>
                ☕ Novo Talhão
              </h3>
              <button onClick={onClose} style={{ padding: "0.625rem", background: "white", border: "2px solid #f5e6d3", borderRadius: "0.625rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#2C1810" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              <input
                value={nome} onChange={(e) => onChangeNome(e.target.value)}
                placeholder="Nome do talhão (ex: T-05)"
                style={{ padding: "0.75rem", border: "2px solid #f5e6d3", borderRadius: "0.5rem", fontSize: "1rem", outline: "none" }}
              />

              <select
                value={status} onChange={(e) => onChangeStatus(e.target.value as any)}
                style={{ padding: "0.75rem", border: "2px solid #f5e6d3", borderRadius: "0.5rem", fontSize: "1rem" }}
              >
                <option value="baixo">✅ Baixa Infestação</option>
                <option value="medio">⚠️ Média Infestação</option>
                <option value="alto">🔶 Alta Infestação</option>
                <option value="critico">🚨 Infestação Crítica</option>
              </select>

              <div style={{ background: "#fdf6f0", padding: "1rem", borderRadius: "0.5rem", border: "1px solid #D4A853" }}>
                <strong style={{ color: "#2C1810" }}>📏 Área calculada:</strong>{" "}
                <span style={{ color: "#8B4513", fontWeight: 700 }}>{tempPolygon.area.toFixed(2)} ha</span>
                <br />
                <strong style={{ color: "#2C1810" }}>📍 Centro:</strong>{" "}
                <span style={{ color: "#4A2C2A", fontSize: "0.9rem" }}>{tempPolygon.center[0].toFixed(6)}, {tempPolygon.center[1].toFixed(6)}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button onClick={onClose}
                style={{ padding: "0.75rem 1.5rem", background: "white", color: "#dc2626", border: "2px solid #fecaca", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 600 }}>
                Cancelar
              </button>
              <button onClick={onConfirm}
                style={{ padding: "0.75rem 1.5rem", background: "linear-gradient(135deg, #4A2C2A, #8B4513)", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 700 }}>
                💾 Salvar Talhão
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
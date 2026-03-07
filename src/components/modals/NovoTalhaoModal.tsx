// src/components/modals/NovoTalhaoModal.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Ruler, Tag } from "lucide-react";

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

const STATUS_OPTIONS = [
  { value: "baixo",   label: "Baixa Infestação",  color: "#8B4513", bg: "rgba(139,69,19,0.12)",  dot: "#8B4513" },
  { value: "medio",   label: "Média Infestação",   color: "#C8860A", bg: "rgba(200,134,10,0.12)", dot: "#C8860A" },
  { value: "alto",    label: "Alta Infestação",    color: "#D4780A", bg: "rgba(212,120,10,0.12)", dot: "#D4780A" },
  { value: "critico", label: "Crítica",            color: "#dc2626", bg: "rgba(220,38,38,0.12)",  dot: "#dc2626" },
] as const;

export function NovoTalhaoModal({
  open, onClose, tempPolygon, nome, status,
  onChangeNome, onChangeStatus, onConfirm,
}: NovoTalhaoModalProps) {
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState(false);

  if (!open || !tempPolygon) return null;

  const handleConfirm = async () => {
    setSaving(true);
    try { await onConfirm(); } finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 2000,
            background: "rgba(10,5,2,0.72)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 480,
              borderRadius: "1.5rem",
              overflow: "hidden",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,83,0.15)",
            }}
          >
            {/* ── HEADER ── */}
            <div style={{
              background: "linear-gradient(135deg, #1a0f0a 0%, #2C1810 60%, #3d1f12 100%)",
              padding: "2rem 2rem 1.75rem",
              position: "relative", overflow: "hidden",
              borderBottom: "1px solid rgba(212,168,83,0.15)",
            }}>
              <div style={{
                position: "absolute", top: -60, right: -40,
                width: 200, height: 200,
                background: "radial-gradient(circle, rgba(212,168,83,0.1) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
                <div>
                  <div style={{
                    fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em",
                    textTransform: "uppercase", color: "rgba(212,168,83,0.55)",
                    marginBottom: "0.5rem",
                  }}>
                    Novo Talhão
                  </div>
                  <h2 style={{
                    margin: 0, fontSize: "1.6rem", fontWeight: 700,
                    color: "#fff", lineHeight: 1.2,
                  }}>
                    Delimitar Área
                  </h2>
                  <p style={{
                    margin: "0.375rem 0 0", fontSize: "0.85rem",
                    color: "rgba(212,168,83,0.5)", fontWeight: 400,
                  }}>
                    Preencha os dados do polígono desenhado
                  </p>
                </div>

                <button
                  onClick={onClose}
                  style={{
                    width: 38, height: 38,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "0.625rem", cursor: "pointer", color: "rgba(255,255,255,0.5)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
                >
                  <X size={17} />
                </button>
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
                <StatChip icon={<Ruler size={13} />} label="Área" value={`${tempPolygon.area.toFixed(2)} ha`} />
                <StatChip icon={<MapPin size={13} />} label="Centro" value={`${tempPolygon.center[0].toFixed(4)}, ${tempPolygon.center[1].toFixed(4)}`} />
              </div>
            </div>

            {/* ── BODY ── */}
            <div style={{ background: "#fdf8f3", padding: "1.75rem 2rem 2rem" }}>

              {/* Nome input */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "#6b4c3a", marginBottom: "0.625rem",
                }}>
                  <Tag size={11} style={{ color: "#8B4513" }} />
                  Nome do Talhão
                </label>
                <input
                  value={nome}
                  onChange={e => onChangeNome(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Ex: Talhão Norte A"
                  style={{
                    width: "100%",
                    padding: "0.875rem 1rem",
                    fontSize: "0.95rem", fontWeight: 500,
                    background: "white",
                    border: `2px solid ${focused ? "#8B4513" : "#e8ddd5"}`,
                    borderRadius: "0.875rem",
                    color: "#2C1810",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    boxShadow: focused ? "0 0 0 4px rgba(139,69,19,0.08)" : "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Status selector */}
              <div style={{ marginBottom: "1.75rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "#6b4c3a", marginBottom: "0.75rem",
                }}>
                  Nível de Infestação
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
                  {STATUS_OPTIONS.map(opt => {
                    const isSelected = status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onChangeStatus(opt.value)}
                        style={{
                          display: "flex", alignItems: "center", gap: "0.625rem",
                          padding: "0.75rem 1rem",
                          background: isSelected ? opt.bg : "white",
                          border: `2px solid ${isSelected ? opt.color : "#e8ddd5"}`,
                          borderRadius: "0.875rem",
                          cursor: "pointer", transition: "all 0.18s", textAlign: "left",
                        }}
                        onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = opt.color; e.currentTarget.style.background = opt.bg; } }}
                        onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = "#e8ddd5"; e.currentTarget.style.background = "white"; } }}
                      >
                        <div style={{
                          width: 10, height: 10, borderRadius: "50%", background: opt.dot, flexShrink: 0,
                          boxShadow: isSelected ? `0 0 8px ${opt.dot}88` : "none",
                          transition: "box-shadow 0.2s",
                        }} />
                        <span style={{
                          fontSize: "0.82rem", fontWeight: isSelected ? 700 : 600,
                          color: isSelected ? opt.color : "#6b4c3a", lineHeight: 1.2,
                        }}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1, padding: "0.9rem",
                    background: "white", border: "2px solid #e8ddd5",
                    borderRadius: "0.875rem", color: "#6b4c3a",
                    fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.18s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#c9b5a8"; e.currentTarget.style.background = "#f5ede6"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8ddd5"; e.currentTarget.style.background = "white"; }}
                >
                  Cancelar
                </button>
                <motion.button
                  onClick={handleConfirm}
                  disabled={saving || !nome.trim()}
                  whileHover={!saving && !!nome.trim() ? { scale: 1.02, y: -1 } : {}}
                  whileTap={!saving && !!nome.trim() ? { scale: 0.98 } : {}}
                  style={{
                    flex: 2, padding: "0.9rem", border: "none", borderRadius: "0.875rem",
                    color: "white", fontWeight: 700, fontSize: "0.95rem",
                    cursor: saving || !nome.trim() ? "not-allowed" : "pointer",
                    background: saving || !nome.trim()
                      ? "#c9b5a8"
                      : "linear-gradient(135deg, #3d1f12 0%, #8B4513 60%, #a05220 100%)",
                    boxShadow: saving || !nome.trim() ? "none" : "0 4px 16px rgba(139,69,19,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  }}
                >
                  {saving ? (
                    <>
                      <div style={{
                        width: 16, height: 16, borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid #fff",
                        animation: "spin 0.8s linear infinite",
                      }} />
                      Salvando…
                    </>
                  ) : "Salvar Talhão"}
                </motion.button>
              </div>
            </div>
          </motion.div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.5rem",
      padding: "0.5rem 0.875rem",
      background: "rgba(212,168,83,0.1)",
      border: "1px solid rgba(212,168,83,0.18)",
      borderRadius: "0.625rem",
    }}>
      <span style={{ color: "rgba(212,168,83,0.65)" }}>{icon}</span>
      <div>
        <div style={{ fontSize: "0.63rem", color: "rgba(212,168,83,0.45)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.85)", fontWeight: 600, marginTop: 1 }}>{value}</div>
      </div>
    </div>
  );
}
// src/components/panels/TalhaoPanel.tsx — TEMA CAFÉ
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MapPin, Calendar, Coffee, Camera, FileText,
  BarChart3, Download, Edit, Trash2, Save, XCircle
} from "lucide-react";
import { Talhao } from "../../hooks/useTalhoes";
import { useToast } from "../ui/Toast";

interface TalhaoPanelProps {
  talhao: Talhao | null;
  armadilhaRealCount?: number | null;
  onClose: () => void;
}

export function TalhaoPanel({ talhao, armadilhaRealCount, onClose }: TalhaoPanelProps) {
  const [activeTab, setActiveTab] = useState<"info" | "graficos" | "relatorios">("info");
  const [isEditing, setIsEditing] = useState(false);
  const [editedNome, setEditedNome] = useState("");
  const [editedStatus, setEditedStatus] = useState<"baixo" | "medio" | "alto" | "critico">("baixo");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const toast = useToast();

  React.useEffect(() => {
    if (talhao && isEditing) {
      setEditedNome(talhao.nome);
      setEditedStatus(talhao.status || "baixo");
    }
  }, [talhao, isEditing]);

  if (!talhao) return null;

  const getStatusInfo = (status: string | null) => {
    switch (status) {
      case "baixo":   return { bg: "#fdf6f0", color: "#4A2C2A", label: "Baixa Infestação",  icon: "✅", dot: "#8B4513" };
      case "medio":   return { bg: "#fef3c7", color: "#92400e", label: "Média Infestação",   icon: "⚠️", dot: "#C8860A" };
      case "alto":    return { bg: "#fed7aa", color: "#9a3412", label: "Alta Infestação",    icon: "🔶", dot: "#D4780A" };
      case "critico": return { bg: "#fecaca", color: "#7f1d1d", label: "Crítica",            icon: "🚨", dot: "#dc2626" };
      default:        return { bg: "#e5e7eb", color: "#374151", label: "Sem Status",         icon: "❓", dot: "#6b7280" };
    }
  };

  const STATUS_OPTIONS = [
    { value: "baixo",   label: "Baixa Infestação",  dot: "#8B4513" },
    { value: "medio",   label: "Média Infestação",   dot: "#C8860A" },
    { value: "alto",    label: "Alta Infestação",    dot: "#D4780A" },
    { value: "critico", label: "Crítica",            dot: "#dc2626" },
  ] as const;

  const statusInfo = getStatusInfo(isEditing ? editedStatus : talhao.status);
  const displayArmadilhaCount = armadilhaRealCount !== null && armadilhaRealCount !== undefined
    ? armadilhaRealCount
    : (talhao.armadilhasAtivas ?? 0);

  const handleEdit = async () => {
    if (!editedNome.trim()) {
      toast.warning("Campo obrigatório", "O nome do talhão não pode estar vazio.");
      return;
    }
    setIsSaving(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const response = await fetch(`${API_URL}/talhoes/${talhao.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ nome: editedNome, status: editedStatus }),
      });
      if (!response.ok) throw new Error("Erro ao atualizar talhão");
      toast.success("Talhão atualizado!", "As alterações foram salvas com sucesso.");
      setIsEditing(false);
      window.location.reload();
    } catch {
      toast.error("Erro ao atualizar", "Não foi possível salvar as alterações. Verifique o backend.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await toast.confirm({
      title: `Excluir "${talhao.nome}"?`,
      message: "Esta ação é irreversível. O talhão e todos os seus dados serão removidos permanentemente.",
      confirmLabel: "Sim, excluir",
      cancelLabel: "Cancelar",
      danger: true,
    });
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const response = await fetch(`${API_URL}/talhoes/${talhao.id}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!response.ok) throw new Error("Erro ao deletar talhão");
      toast.success("Talhão excluído", "O talhão foi removido com sucesso.");
      onClose();
      window.location.reload();
    } catch {
      toast.error("Erro ao excluir", "Não foi possível excluir o talhão. Verifique o backend.");
      setIsDeleting(false);
    }
  };

  const inputBase: React.CSSProperties = {
    width: "100%", outline: "none", fontFamily: "inherit",
    fontSize: "0.9rem", fontWeight: 500, color: "#2C1810",
    background: "white", boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
    borderRadius: "0.75rem", padding: "0.75rem 1rem",
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="talhao-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 3999 }}
      />

      {/* Panel */}
      <motion.div
        key="talhao-panel"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          position: "fixed", top: 0, right: 0, width: "100%", maxWidth: 500,
          height: "100vh", background: "white",
          boxShadow: "-4px 0 32px rgba(44,24,16,0.25)",
          zIndex: 4000, display: "flex", flexDirection: "column",
        }}
      >
        {/* ── HEADER ── */}
        <div style={{
          background: "linear-gradient(135deg, #1a0f0a 0%, #2C1810 60%, #3d1f12 100%)",
          padding: "2rem", color: "white",
          borderBottom: "1px solid rgba(212,168,83,0.15)",
          position: "relative", overflow: "hidden", flexShrink: 0,
        }}>
          <div style={{
            position: "absolute", top: -50, right: -30, width: 180, height: 180,
            background: "radial-gradient(circle, rgba(212,168,83,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", position: "relative" }}>
            <div style={{ flex: 1, paddingRight: "1rem" }}>
              <div style={{
                fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "rgba(212,168,83,0.55)", marginBottom: "0.4rem",
              }}>
                Talhão #{talhao.id}
              </div>

              {isEditing ? (
                <input
                  value={editedNome}
                  onChange={e => setEditedNome(e.target.value)}
                  onFocus={() => setFocusedField("nome")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Nome do talhão"
                  style={{
                    ...inputBase,
                    fontSize: "1.5rem", fontWeight: 700, padding: "0.5rem 0.75rem",
                    background: "rgba(255,255,255,0.12)",
                    border: `2px solid ${focusedField === "nome" ? "rgba(212,168,83,0.6)" : "rgba(255,255,255,0.2)"}`,
                    color: "white", marginBottom: "0.5rem",
                    boxShadow: focusedField === "nome" ? "0 0 0 4px rgba(212,168,83,0.1)" : "none",
                  }}
                />
              ) : (
                <h2 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "0 0 0.5rem", lineHeight: 1.2 }}>
                  ☕ {talhao.nome}
                </h2>
              )}
            </div>

            <button
              onClick={onClose}
              style={{
                width: 38, height: 38, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.625rem", cursor: "pointer", color: "rgba(255,255,255,0.5)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
            >
              <X size={17} />
            </button>
          </div>

          {/* Status */}
          {isEditing ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {STATUS_OPTIONS.map(opt => {
                const sel = editedStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setEditedStatus(opt.value)}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.45rem 0.875rem",
                      background: sel ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)",
                      border: `1.5px solid ${sel ? "rgba(212,168,83,0.6)" : "rgba(255,255,255,0.12)"}`,
                      borderRadius: "999px", cursor: "pointer", color: sel ? "#D4A853" : "rgba(255,255,255,0.55)",
                      fontSize: "0.78rem", fontWeight: sel ? 700 : 500,
                      transition: "all 0.18s",
                    }}
                  >
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: opt.dot }} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.625rem 1.125rem", borderRadius: "0.75rem",
              fontWeight: 700, fontSize: "0.875rem",
              background: statusInfo.bg, color: statusInfo.color,
              border: `2px solid ${statusInfo.color}22`,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusInfo.dot }} />
              {statusInfo.label}
            </div>
          )}
        </div>

        {/* ── TABS ── */}
        <div style={{ display: "flex", borderBottom: "2px solid #f0e6dd", background: "#fdf8f3", flexShrink: 0 }}>
          {[
            { id: "info",      label: "Informações", icon: MapPin    },
            { id: "graficos",  label: "Gráficos",    icon: BarChart3 },
            { id: "relatorios",label: "Relatórios",  icon: FileText  },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1, padding: "0.9rem 0.5rem", background: active ? "white" : "transparent",
                  border: "none", borderBottom: `3px solid ${active ? "#8B4513" : "transparent"}`,
                  cursor: "pointer", fontWeight: active ? 700 : 600,
                  color: active ? "#4A2C2A" : "#9b8070",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                  fontSize: "0.82rem", transition: "all 0.2s",
                }}>
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── CONTENT ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>

          {activeTab === "info" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* KPI row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                <StatCard icon={<MapPin size={20} />}  label="Área"          value={`${talhao.area?.toFixed(2) ?? "—"} ha`} color="#3b82f6" />
                <StatCard icon={<Coffee size={20} />}  label="Brocas"        value={talhao.totalPragas ?? 0}                color="#ef4444" />
                <StatCard icon={<Camera size={20} />}  label="Pontos Foto"   value={displayArmadilhaCount}                  color="#8B4513" />
              </div>

              {/* Coordenadas */}
              <Section title="📍 Coordenadas GPS">
                <InfoRow label="Latitude"  value={talhao.center ? talhao.center[0].toFixed(6) : "—"} />
                <InfoRow label="Longitude" value={talhao.center ? talhao.center[1].toFixed(6) : "—"} />
                <InfoRow label="Perímetro" value={`${talhao.boundary?.length ?? 0} pontos`} />
                <button
                  onClick={() => talhao.center && window.open(`https://www.google.com/maps?q=${talhao.center[0]},${talhao.center[1]}`, "_blank")}
                  style={{
                    marginTop: "0.625rem", width: "100%", padding: "0.7rem",
                    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                    color: "white", border: "none", borderRadius: "0.625rem",
                    fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  }}
                >
                  <MapPin size={15} /> Abrir no Google Maps
                </button>
              </Section>

              {/* Histórico */}
              <Section title="📅 Histórico">
                <InfoRow label="Última Coleta" value={talhao.ultimaColeta ? new Date(talhao.ultimaColeta).toLocaleDateString("pt-BR") : "Sem registro"} />
                <InfoRow label="Status Atual"  value={statusInfo.label} valueColor={statusInfo.color} />
              </Section>

              {/* Pragas */}
              {talhao.pragas && talhao.pragas.length > 0 && (
                <Section title="🐛 Brocas Detectadas">
                  {talhao.pragas.map((praga, idx) => (
                    <div key={idx} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "0.625rem 0.875rem", background: "#fdf6f0",
                      borderRadius: "0.625rem", border: "1px solid #ede4da", marginBottom: "0.5rem",
                    }}>
                      <span style={{ fontWeight: 600, color: "#2C1810", fontSize: "0.875rem" }}>{praga.tipo}</span>
                      <span style={{ fontWeight: 700, color: "#ef4444", fontSize: "1rem" }}>{praga.quantidade}</span>
                    </div>
                  ))}
                </Section>
              )}

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                {isEditing ? (
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <ActionButton
                      icon={<Save size={16} />} label={isSaving ? "Salvando…" : "Salvar"}
                      color="#8B4513" onClick={handleEdit} fullWidth loading={isSaving}
                    />
                    <ActionButton
                      icon={<XCircle size={16} />} label="Cancelar"
                      color="#6b7280" onClick={() => setIsEditing(false)} fullWidth
                    />
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <ActionButton icon={<Edit size={16} />}  label="Editar"                               color="#3b82f6" onClick={() => setIsEditing(true)}  />
                    <ActionButton icon={<Trash2 size={16} />} label={isDeleting ? "Excluindo…" : "Excluir"} color="#ef4444" onClick={handleDelete} disabled={isDeleting} loading={isDeleting} />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "graficos" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <ComingSoon icon={<BarChart3 size={56} style={{ color: "#C8860A" }} />}
                title="Gráficos Profissionais"
                description="Gráficos de evolução de brocas, mapas de calor e análise temporal."
                items={["📊 Evolução temporal de infestação", "🗺️ Mapa de calor por área", "📈 Comparativo entre talhões", "🎯 Eficiência de pontos de foto"]}
              />
            </motion.div>
          )}

          {activeTab === "relatorios" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <ComingSoon icon={<FileText size={56} style={{ color: "#C8860A" }} />}
                title="Relatórios Profissionais"
                description="Exportação em PDF, Excel e dashboards interativos."
                items={["📄 Relatório executivo em PDF", "📊 Exportar dados para Excel", "📸 Captura de tela do mapa", "🤖 Análise com IA (insights)"]}
              />
              <ActionButton
                icon={<Download size={16} />} label="Gerar Relatório Completo"
                color="#8B4513" fullWidth onClick={() => toast.info("Em breve", "A geração de relatórios estará disponível em breve.")}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Sub-components ────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: any) {
  return (
    <div style={{
      padding: "1rem 0.75rem", background: "white", borderRadius: "0.875rem",
      border: "2px solid #f0e6dd",
      display: "flex", flexDirection: "column", gap: "0.375rem", alignItems: "center", textAlign: "center",
    }}>
      <div style={{ color }}>{icon}</div>
      <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#2C1810", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "0.72rem", color: "#9b8070", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: "0.875rem", border: "2px solid #f0e6dd", padding: "1.25rem" }}>
      <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#2C1810", marginBottom: "0.875rem", margin: "0 0 0.875rem" }}>{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0.5rem 0", borderBottom: "1px solid #f5ede6",
    }}>
      <span style={{ fontSize: "0.82rem", color: "#9b8070", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: valueColor || "#2C1810" }}>{value}</span>
    </div>
  );
}

function ActionButton({ icon, label, color, fullWidth, onClick, disabled, loading }: any) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { y: -2, scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
        padding: "0.8rem 1.25rem", background: disabled || loading ? "#d1c0b8" : color,
        color: "white", border: "none", borderRadius: "0.75rem",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        fontWeight: 700, fontSize: "0.875rem",
        width: fullWidth ? "100%" : "auto",
        opacity: disabled ? 0.6 : 1,
        boxShadow: disabled || loading ? "none" : `0 4px 12px ${color}44`,
        transition: "background 0.2s, box-shadow 0.2s",
      }}
    >
      {loading
        ? <div style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", animation: "spin 0.8s linear infinite" }} />
        : icon}
      {label}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.button>
  );
}

function ComingSoon({ icon, title, description, items }: any) {
  return (
    <div style={{
      textAlign: "center", padding: "2.5rem 2rem",
      background: "#fdf8f3", borderRadius: "0.875rem",
      border: "2px dashed #e8ddd5",
    }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>{icon}</div>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2C1810", marginBottom: "0.5rem" }}>{title}</h3>
      <p style={{ color: "#9b8070", fontSize: "0.875rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>{description}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", textAlign: "left", maxWidth: 320, margin: "0 auto" }}>
        {items.map((t: string) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", background: "white", borderRadius: "0.5rem", border: "1px solid #f0e6dd", fontSize: "0.84rem", color: "#4A2C2A", fontWeight: 500 }}>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}
// src/components/panels/TalhaoPanel.tsx — TEMA CAFÉ
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MapPin, Calendar, Coffee, Camera, FileText,
  BarChart3, Download, Edit, Trash2, Save, XCircle,
  TrendingUp, TrendingDown, Activity, Clock,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import { Talhao } from "../../hooks/useTalhoes";
import { useToast } from "../ui/Toast";
import { RelatorioModal } from "../modals/RelatorioModal";

interface TalhaoPanelProps {
  talhao: Talhao | null;
  armadilhaRealCount?: number | null;
  onClose: () => void;
}

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
  ausencia?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

// ── Paleta interna ────────────────────────────────────────────────
const P = {
  gold:    "#D4A853",
  brown:   "#8B4513",
  caramel: "#C8860A",
  dark:    "#2C1810",
  surface: "#fdf8f3",
  border:  "#f0e6dd",
  muted:   "#9b8070",
  text:    "#2C1810",
};

// ── Tooltip customizado ───────────────────────────────────────────
const CafeTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#2C1810", border: "1px solid rgba(212,168,83,0.3)",
      borderRadius: "0.625rem", padding: "0.625rem 0.875rem",
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    }}>
      <div style={{ fontSize: "0.7rem", color: "rgba(212,168,83,0.6)", marginBottom: "0.3rem", fontWeight: 600 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#fff" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color }} />
          <span style={{ color: "rgba(255,255,255,0.55)" }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Hook para buscar armadilhas reais ─────────────────────────────
function useArmadilhasDoTalhao(talhaoId: number | null) {
  const [armadilhas, setArmadilhas] = useState<Armadilha[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!talhaoId) return;
    const fetch_ = async () => {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        const params = new URLSearchParams({ talhaoId: String(talhaoId) });
        const res = await fetch(`${API_URL}/armadilhas?${params}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const data = await res.json();
        const unique = Array.from(new Map(data.map((a: any) => [a.id, a])).values()) as Armadilha[];
        setArmadilhas(unique.filter(a => a.latitude != null && a.longitude != null));
      } catch {
        setArmadilhas([]);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [talhaoId]);

  return { armadilhas, loading };
}

// ── Funções para derivar dados dos gráficos ───────────────────────
function buildTimelineData(armadilhas: Armadilha[]) {
  // Agrupa pontos criados por mês
  const map = new Map<string, number>();
  armadilhas.forEach(a => {
    const date = new Date(a.criadoEm || a.dataFoto || "");
    if (isNaN(date.getTime())) return;
    const key = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    map.set(key, (map.get(key) || 0) + 1);
  });
  // Últimos 6 meses garantidos
  const result: { mes: string; pontos: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    result.push({ mes: key, pontos: map.get(key) || 0 });
  }
  return result;
}

function buildFotoData(armadilhas: Armadilha[]) {
  const comFoto    = armadilhas.filter(a => a.foto).length;
  const semFoto    = armadilhas.length - comFoto;
  return [
    { name: "Com foto",  value: comFoto,  color: P.brown   },
    { name: "Sem foto",  value: semFoto,  color: "#e8ddd5" },
  ].filter(d => d.value > 0);
}

function buildObsData(armadilhas: Armadilha[]) {
  const comObs = armadilhas.filter(a => a.observacao?.trim()).length;
  const semObs = armadilhas.length - comObs;
  return [
    { name: "Com observação", value: comObs, color: P.caramel },
    { name: "Sem observação", value: semObs, color: "#e8ddd5"  },
  ].filter(d => d.value > 0);
}

function buildHeatmapData(armadilhas: Armadilha[]) {
  // Densidade por hora do dia dos pontos criados
  const hours = Array.from({ length: 24 }, (_, i) => ({ hora: `${i}h`, pontos: 0 }));
  armadilhas.forEach(a => {
    const date = new Date(a.criadoEm || a.dataFoto || "");
    if (!isNaN(date.getTime())) {
      hours[date.getHours()].pontos++;
    }
  });
  // Retorna apenas horas com atividade + vizinhas
  return hours.filter((_, i) => {
    return hours[i].pontos > 0 ||
      (i > 0 && hours[i - 1].pontos > 0) ||
      (i < 23 && hours[i + 1].pontos > 0);
  });
}

function buildKPIs(armadilhas: Armadilha[], talhao: Talhao) {
  const comFoto     = armadilhas.filter(a => a.foto).length;
  const cobertura   = armadilhas.length > 0
    ? ((comFoto / armadilhas.length) * 100).toFixed(0)
    : "0";
  const area        = talhao.area || 0;
  const densidade   = area > 0
    ? (armadilhas.length / area).toFixed(1)
    : "—";

  // Data mais recente
  const datas = armadilhas
    .map(a => new Date(a.criadoEm || a.dataFoto || ""))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());
  const ultimoRegistro = datas[0]
    ? datas[0].toLocaleDateString("pt-BR")
    : "—";

  return { comFoto, cobertura, densidade, ultimoRegistro };
}

// ─────────────────────────────────────────────────────────────────
export function TalhaoPanel({ talhao, armadilhaRealCount, onClose }: TalhaoPanelProps) {
  const [activeTab, setActiveTab] = useState<"info" | "graficos" | "relatorios">("info");
  const [relatorioOpen, setRelatorioOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNome, setEditedNome] = useState("");
  const [editedStatus, setEditedStatus] = useState<"baixo" | "medio" | "alto" | "critico">("baixo");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const toast = useToast();

  // Busca armadilhas reais ao abrir o painel (necessário para os gráficos)
  const { armadilhas, loading: armLoading } = useArmadilhasDoTalhao(talhao?.id ?? null);

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
    fontSize: "0.9rem", fontWeight: 500, color: P.text,
    background: "white", boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
    borderRadius: "0.75rem", padding: "0.75rem 1rem",
  };

  // Dados dos gráficos
  const timelineData = buildTimelineData(armadilhas);
  const fotoData     = buildFotoData(armadilhas);
  const obsData      = buildObsData(armadilhas);
  const heatmapData  = buildHeatmapData(armadilhas);
  const kpis         = buildKPIs(armadilhas, talhao);

  return (
    <AnimatePresence>
      <motion.div
        key="talhao-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 3999 }}
      />

      <motion.div
        key="talhao-panel"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          position: "fixed", top: 0, right: 0, width: "100%", maxWidth: 520,
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
          <div style={{ position: "absolute", top: -50, right: -30, width: 180, height: 180, background: "radial-gradient(circle, rgba(212,168,83,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", position: "relative" }}>
            <div style={{ flex: 1, paddingRight: "1rem" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(212,168,83,0.55)", marginBottom: "0.4rem" }}>
                Talhão #{talhao.id}
              </div>
              {isEditing ? (
                <input
                  value={editedNome}
                  onChange={e => setEditedNome(e.target.value)}
                  onFocus={() => setFocusedField("nome")}
                  onBlur={() => setFocusedField(null)}
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
            <button onClick={onClose} style={{ width: 38, height: 38, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.625rem", cursor: "pointer", color: "rgba(255,255,255,0.5)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
              <X size={17} />
            </button>
          </div>

          {/* Status */}
          {isEditing ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {STATUS_OPTIONS.map(opt => {
                const sel = editedStatus === opt.value;
                return (
                  <button key={opt.value} onClick={() => setEditedStatus(opt.value)}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 0.875rem", background: sel ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)", border: `1.5px solid ${sel ? "rgba(212,168,83,0.6)" : "rgba(255,255,255,0.12)"}`, borderRadius: "999px", cursor: "pointer", color: sel ? "#D4A853" : "rgba(255,255,255,0.55)", fontSize: "0.78rem", fontWeight: sel ? 700 : 500, transition: "all 0.18s" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: opt.dot }} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.125rem", borderRadius: "0.75rem", fontWeight: 700, fontSize: "0.875rem", background: statusInfo.bg, color: statusInfo.color, border: `2px solid ${statusInfo.color}22` }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusInfo.dot }} />
              {statusInfo.label}
            </div>
          )}
        </div>

        {/* ── TABS ── */}
        <div style={{ display: "flex", borderBottom: `2px solid ${P.border}`, background: P.surface, flexShrink: 0 }}>
          {[
            { id: "info",       label: "Informações", icon: MapPin    },
            { id: "graficos",   label: "Gráficos",    icon: BarChart3 },
            { id: "relatorios", label: "Relatórios",  icon: FileText  },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                style={{ flex: 1, padding: "0.9rem 0.5rem", background: active ? "white" : "transparent", border: "none", borderBottom: `3px solid ${active ? P.brown : "transparent"}`, cursor: "pointer", fontWeight: active ? 700 : 600, color: active ? "#4A2C2A" : P.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", fontSize: "0.82rem", transition: "all 0.2s" }}>
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── CONTENT ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>

          {/* ── ABA INFO ── */}
          {activeTab === "info" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                <StatCard icon={<MapPin size={20} />}  label="Área"        value={`${talhao.area?.toFixed(2) ?? "—"} ha`} color="#3b82f6" />
                <StatCard icon={<Coffee size={20} />}  label="Brocas"      value={talhao.totalPragas ?? 0}                color="#ef4444" />
                <StatCard icon={<Camera size={20} />}  label="Pontos Foto" value={displayArmadilhaCount}                  color={P.brown} />
              </div>

              <Section title="📍 Coordenadas GPS">
                <InfoRow label="Latitude"  value={talhao.center ? talhao.center[0].toFixed(6) : "—"} />
                <InfoRow label="Longitude" value={talhao.center ? talhao.center[1].toFixed(6) : "—"} />
                <InfoRow label="Perímetro" value={`${talhao.boundary?.length ?? 0} pontos`} />
                <button onClick={() => talhao.center && window.open(`https://www.google.com/maps?q=${talhao.center[0]},${talhao.center[1]}`, "_blank")}
                  style={{ marginTop: "0.625rem", width: "100%", padding: "0.7rem", background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "white", border: "none", borderRadius: "0.625rem", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <MapPin size={15} /> Abrir no Google Maps
                </button>
              </Section>

              <Section title="📅 Histórico">
                <InfoRow label="Última Coleta" value={talhao.ultimaColeta ? new Date(talhao.ultimaColeta).toLocaleDateString("pt-BR") : "Sem registro"} />
                <InfoRow label="Status Atual"  value={statusInfo.label} valueColor={statusInfo.color} />
              </Section>

              {talhao.pragas && talhao.pragas.length > 0 && (
                <Section title="🐛 Brocas Detectadas">
                  {talhao.pragas.map((praga, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.625rem 0.875rem", background: P.surface, borderRadius: "0.625rem", border: `1px solid ${P.border}`, marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: 600, color: P.text, fontSize: "0.875rem" }}>{praga.tipo}</span>
                      <span style={{ fontWeight: 700, color: "#ef4444", fontSize: "1rem" }}>{praga.quantidade}</span>
                    </div>
                  ))}
                </Section>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                {isEditing ? (
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <ActionButton icon={<Save size={16} />}    label={isSaving ? "Salvando…" : "Salvar"} color={P.brown}   onClick={handleEdit}             fullWidth loading={isSaving} />
                    <ActionButton icon={<XCircle size={16} />} label="Cancelar"                           color="#6b7280"   onClick={() => setIsEditing(false)} fullWidth />
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <ActionButton icon={<Edit   size={16} />}  label="Editar"                                  color="#3b82f6" onClick={() => setIsEditing(true)}  />
                    <ActionButton icon={<Trash2 size={16} />}  label={isDeleting ? "Excluindo…" : "Excluir"}   color="#ef4444" onClick={handleDelete} disabled={isDeleting} loading={isDeleting} />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── ABA GRÁFICOS ── */}
          {activeTab === "graficos" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {armLoading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", gap: "1rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${P.border}`, borderTop: `3px solid ${P.brown}`, animation: "spin 0.9s linear infinite" }} />
                  <span style={{ color: P.muted, fontSize: "0.875rem", fontWeight: 600 }}>Carregando dados…</span>
                </div>
              ) : armadilhas.length === 0 ? (
                <EmptyCharts talhaoNome={talhao.nome} />
              ) : (
                <>
                  {/* KPI mini cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <MiniKPI icon={<Camera size={16} />}   label="Com foto"         value={`${kpis.comFoto}/${armadilhas.length}`} color={P.brown}   />
                    <MiniKPI icon={<Activity size={16} />} label="Cobertura"         value={`${kpis.cobertura}%`}                  color={P.caramel} />
                    <MiniKPI icon={<MapPin size={16} />}   label="Densidade"         value={`${kpis.densidade}/ha`}                color="#3b82f6"   />
                    <MiniKPI icon={<Clock size={16} />}    label="Último registro"   value={kpis.ultimoRegistro}                   color={P.gold}    />
                  </div>

                  {/* Linha do tempo de pontos criados */}
                  <ChartBox title="Pontos de Foto ao Longo do Tempo" subtitle="Criados nos últimos 6 meses">
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={timelineData}>
                        <defs>
                          <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={P.brown} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={P.brown} stopOpacity={0}   />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={P.border} />
                        <XAxis dataKey="mes" tick={{ fontSize: 10, fill: P.muted }} stroke={P.border} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: P.muted }} stroke={P.border} width={24} />
                        <Tooltip content={<CafeTooltip />} />
                        <Area type="monotone" dataKey="pontos" stroke={P.brown} strokeWidth={2.5} fill="url(#gArea)" name="Pontos" dot={{ fill: P.brown, r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: P.caramel }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartBox>

                  {/* Pie charts lado a lado */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <ChartBox title="Cobertura de Fotos" subtitle={`${armadilhas.length} pontos`} compact>
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie data={fotoData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={3}>
                            {fotoData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip content={<CafeTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        {fotoData.map(d => (
                          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.7rem", color: P.muted, fontWeight: 600 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                            {d.name}
                          </div>
                        ))}
                      </div>
                    </ChartBox>

                    <ChartBox title="Observações" subtitle={`${armadilhas.length} pontos`} compact>
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie data={obsData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={3}>
                            {obsData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip content={<CafeTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        {obsData.map(d => (
                          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.7rem", color: P.muted, fontWeight: 600 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                            {d.name}
                          </div>
                        ))}
                      </div>
                    </ChartBox>
                  </div>

                  {/* Heatmap de horários (só se tiver dados) */}
                  {heatmapData.length > 0 && (
                    <ChartBox title="Horários de Registro" subtitle="Distribuição por hora do dia">
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={heatmapData} barSize={14}>
                          <CartesianGrid strokeDasharray="3 3" stroke={P.border} vertical={false} />
                          <XAxis dataKey="hora" tick={{ fontSize: 9, fill: P.muted }} stroke={P.border} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: P.muted }} stroke={P.border} width={20} />
                          <Tooltip content={<CafeTooltip />} />
                          <Bar dataKey="pontos" name="Registros" radius={[4, 4, 0, 0]}>
                            {heatmapData.map((entry, i) => (
                              <Cell key={i} fill={entry.pontos > 0 ? P.caramel : "#f0e6dd"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartBox>
                  )}

                  {/* Lista dos últimos pontos */}
                  <ChartBox title="Últimos Pontos Registrados" subtitle={`${armadilhas.length} pontos no total`}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 200, overflowY: "auto" }}>
                      {[...armadilhas]
                        .sort((a, b) => new Date(b.criadoEm || "").getTime() - new Date(a.criadoEm || "").getTime())
                        .slice(0, 8)
                        .map(a => (
                          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.625rem", background: P.surface, borderRadius: "0.5rem", border: `1px solid ${P.border}` }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: a.foto ? `${P.brown}20` : "#e8ddd5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Camera size={13} style={{ color: a.foto ? P.brown : P.muted }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: P.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.nome || "Ponto de Foto"}</div>
                              {a.criadoEm && (
                                <div style={{ fontSize: "0.7rem", color: P.muted }}>
                                  {new Date(a.criadoEm).toLocaleDateString("pt-BR")}
                                </div>
                              )}
                            </div>
                            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: a.foto ? P.brown : P.muted, background: a.foto ? `${P.brown}12` : "#f0e6dd", padding: "2px 7px", borderRadius: 999, whiteSpace: "nowrap" }}>
                              {a.foto ? "📸 Foto" : "Sem foto"}
                            </div>
                          </div>
                        ))}
                    </div>
                  </ChartBox>
                </>
              )}
            </motion.div>
          )}

          {/* ── ABA RELATÓRIOS ── */}
          {activeTab === "relatorios" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRelatorioOpen(true)}
                style={{ width: "100%", padding: "1.25rem", background: `linear-gradient(135deg, #3d1f12 0%, ${P.brown} 60%, #a05220 100%)`, border: "none", borderRadius: "1rem", color: "white", fontWeight: 700, fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", boxShadow: `0 4px 16px ${P.brown}55` }}>
                <BarChart3 size={20} />
                Gerar Relatório
              </motion.button>

              {[
                { icon: "📄", label: "PDF Executivo",    desc: "Resumo com KPIs e tabela de talhões, pronto para imprimir" },
                { icon: "📊", label: "Excel Completo",   desc: "Planilha com aba por talhão + todos os pontos de foto"      },
                { icon: "📋", label: "Pontos de Foto",   desc: "Lista detalhada com coordenadas GPS, fotos e observações"   },
                { icon: "📁", label: "CSV para análise", desc: "Dados brutos para importar no seu sistema ou Excel"         },
              ].map(c => (
                <div key={c.label} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start", padding: "0.875rem 1rem", background: "white", border: `2px solid ${P.border}`, borderRadius: "0.875rem" }}>
                  <div style={{ fontSize: "1.5rem", lineHeight: 1 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem", color: P.text }}>{c.label}</div>
                    <div style={{ fontSize: "0.78rem", color: P.muted, marginTop: 2, lineHeight: 1.5 }}>{c.desc}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {talhao && (
        <RelatorioModal
          open={relatorioOpen}
          onClose={() => setRelatorioOpen(false)}
          talhoes={[talhao]}
        />
      )}
    </AnimatePresence>
  );
}

// ── Sub-components ────────────────────────────────────────────────

function ChartBox({ title, subtitle, children, compact }: {
  title: string; subtitle: string; children: React.ReactNode; compact?: boolean;
}) {
  return (
    <div style={{ background: "white", borderRadius: "0.875rem", border: `2px solid ${P.border}`, padding: compact ? "0.875rem" : "1.125rem", overflow: "hidden" }}>
      <div style={{ marginBottom: "0.75rem" }}>
        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: P.text }}>{title}</div>
        <div style={{ fontSize: "0.7rem", color: P.muted, marginTop: 2 }}>{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

function MiniKPI({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ background: "white", borderRadius: "0.875rem", border: `2px solid ${P.border}`, padding: "0.875rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div style={{ width: 34, height: 34, borderRadius: "0.625rem", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "1rem", fontWeight: 700, color: P.text, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: "0.68rem", color: P.muted, fontWeight: 600, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      </div>
    </div>
  );
}

function EmptyCharts({ talhaoNome }: { talhaoNome: string }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 2rem", background: P.surface, borderRadius: "0.875rem", border: `2px dashed ${P.border}` }}>
      <BarChart3 size={48} style={{ color: "#e8ddd5", margin: "0 auto 1rem" }} />
      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: P.text, marginBottom: "0.5rem" }}>Nenhum dado ainda</h3>
      <p style={{ fontSize: "0.85rem", color: P.muted, lineHeight: 1.6, margin: 0 }}>
        Adicione pontos de foto em <strong>{talhaoNome}</strong> para ver os gráficos de análise aparecerem aqui.
      </p>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div style={{ padding: "1rem 0.75rem", background: "white", borderRadius: "0.875rem", border: `2px solid ${P.border}`, display: "flex", flexDirection: "column", gap: "0.375rem", alignItems: "center", textAlign: "center" }}>
      <div style={{ color }}>{icon}</div>
      <div style={{ fontSize: "1.4rem", fontWeight: 700, color: P.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "0.72rem", color: P.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: "0.875rem", border: `2px solid ${P.border}`, padding: "1.25rem" }}>
      <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: P.text, margin: "0 0 0.875rem" }}>{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: `1px solid #f5ede6` }}>
      <span style={{ fontSize: "0.82rem", color: P.muted, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: valueColor || P.text }}>{value}</span>
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
      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.8rem 1.25rem", background: disabled || loading ? "#d1c0b8" : color, color: "white", border: "none", borderRadius: "0.75rem", cursor: disabled || loading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.875rem", width: fullWidth ? "100%" : "auto", opacity: disabled ? 0.6 : 1, boxShadow: disabled || loading ? "none" : `0 4px 12px ${color}44`, transition: "background 0.2s, box-shadow 0.2s" }}>
      {loading ? <div style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", animation: "spin 0.8s linear infinite" }} /> : icon}
      {label}
    </motion.button>
  );
}
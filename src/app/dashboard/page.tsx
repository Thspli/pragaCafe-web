// src/app/dashboard/page.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Coffee, Camera, MapPin,
  Calendar, AlertTriangle, CheckCircle, Activity,
  BarChart3, PieChart as PieChartIcon, ArrowLeft,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useTalhoes } from "@/hooks/useTalhoes";

// ── Paleta ────────────────────────────────────────────────────────
const C = {
  bg:        "#0f0805",
  surface:   "#1a0f0a",
  surface2:  "#231410",
  border:    "rgba(212,168,83,0.12)",
  borderHov: "rgba(212,168,83,0.28)",
  gold:      "#D4A853",
  goldDim:   "rgba(212,168,83,0.55)",
  goldFaint: "rgba(212,168,83,0.08)",
  caramel:   "#C8860A",
  brown:     "#8B4513",
  text:      "rgba(255,255,255,0.88)",
  textDim:   "rgba(255,255,255,0.45)",
  textMuted: "rgba(212,168,83,0.5)",
  red:       "#ef4444",
  blue:      "#3b82f6",
};

// ── Tooltip customizado ───────────────────────────────────────────
const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#231410", border: `1px solid ${C.border}`,
      borderRadius: "0.75rem", padding: "0.75rem 1rem",
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
    }}>
      <div style={{ fontSize: "0.75rem", color: C.goldDim, marginBottom: "0.4rem", fontWeight: 600 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: C.text }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
          <span style={{ color: C.textDim }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { talhoes, loading } = useTalhoes();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  const pragasHistorico = [
    { mes: "Jan", brocas: 120, pontos: 45 },
    { mes: "Fev", brocas: 180, pontos: 52 },
    { mes: "Mar", brocas: 240, pontos: 48 },
    { mes: "Abr", brocas: 200, pontos: 55 },
    { mes: "Mai", brocas: 150, pontos: 60 },
    { mes: "Jun", brocas: 100, pontos: 58 },
  ];

  const statusDistribution = [
    { name: "Baixa",   value: talhoes.filter(t => t.status === "baixo").length   || 1, color: "#8B4513" },
    { name: "Média",   value: talhoes.filter(t => t.status === "medio").length   || 0, color: "#C8860A" },
    { name: "Alta",    value: talhoes.filter(t => t.status === "alto").length    || 0, color: "#D4A853" },
    { name: "Crítica", value: talhoes.filter(t => t.status === "critico").length || 0, color: "#ef4444" },
  ].filter(d => d.value > 0);

  const talhoesPorBrocas = talhoes
    .map(t => ({ nome: t.nome, brocas: t.totalPragas || 0, area: t.area || 0 }))
    .sort((a, b) => b.brocas - a.brocas)
    .slice(0, 5);

  const totals = {
    totalTalhoes:    talhoes.length,
    totalPragas:     talhoes.reduce((acc, t) => acc + (t.totalPragas     || 0), 0),
    totalArmadilhas: talhoes.reduce((acc, t) => acc + (t.armadilhasAtivas || 0), 0),
    areaTotal:       talhoes.reduce((acc, t) => acc + (t.area             || 0), 0),
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, border: `3px solid ${C.border}`,
            borderTop: `3px solid ${C.gold}`, borderRadius: "50%",
            margin: "0 auto 1rem", animation: "spin 1s linear infinite",
          }} />
          <p style={{ color: C.goldDim, fontWeight: 600 }}>Carregando dashboard…</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "2rem" }}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <motion.button
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -3 }}
            onClick={() => window.location.href = "/"}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: C.goldFaint, border: `1px solid ${C.border}`,
              padding: "0.55rem 1rem", borderRadius: "0.75rem",
              cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
              color: C.goldDim, marginBottom: "1.25rem", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHov; e.currentTarget.style.color = C.gold; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border;    e.currentTarget.style.color = C.goldDim; }}
          >
            <ArrowLeft size={15} />
            Voltar ao Mapa
          </motion.button>

          <motion.h1
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: "2rem", fontWeight: 700, color: C.text,
              margin: 0, display: "flex", alignItems: "center", gap: "0.75rem",
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: "0.875rem",
              background: "linear-gradient(135deg, rgba(212,168,83,0.15), rgba(200,134,10,0.08))",
              border: `1px solid ${C.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BarChart3 size={24} style={{ color: C.gold }} />
            </div>
            Dashboard Analytics
          </motion.h1>
          <p style={{ color: C.textMuted, fontSize: "0.875rem", marginTop: "0.5rem" }}>
            Visão geral e análise de dados em tempo real
          </p>
        </div>

        {/* Period selector */}
        <div style={{
          display: "flex", gap: "0.25rem",
          background: C.surface, padding: "0.25rem",
          borderRadius: "0.875rem", border: `1px solid ${C.border}`,
          alignSelf: "flex-start",
        }}>
          {(["week", "month", "year"] as const).map(period => {
            const active = selectedPeriod === period;
            return (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                style={{
                  padding: "0.5rem 1.125rem",
                  background: active ? "linear-gradient(135deg, #3d1f12, #8B4513)" : "transparent",
                  color: active ? "#fff" : C.textDim,
                  border: "none", borderRadius: "0.625rem",
                  cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
                  transition: "all 0.2s",
                  boxShadow: active ? "0 4px 12px rgba(139,69,19,0.35)" : "none",
                }}
              >
                {period === "week" ? "Semana" : period === "month" ? "Mês" : "Ano"}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
        <KPICard icon={<MapPin size={22} />}   label="Total de Talhões" value={totals.totalTalhoes}                  trend={null} accent={C.blue}    delay={0}    />
        <KPICard icon={<Coffee size={22} />}   label="Total de Brocas"  value={totals.totalPragas}                   trend={-12}  accent={C.red}     delay={0.07} />
        <KPICard icon={<Camera size={22} />}   label="Pontos de Foto"   value={totals.totalArmadilhas}               trend={+8}   accent={C.brown}   delay={0.14} />
        <KPICard icon={<Activity size={22} />} label="Área Total"       value={`${totals.areaTotal.toFixed(1)} ha`}  trend={null} accent={C.caramel} delay={0.21} />
      </div>

      {/* ── CHARTS ROW 1 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>

        {/* Evolução */}
        <ChartCard title="Evolução de Brocas" subtitle="Últimos 6 meses" icon={<TrendingUp size={18} />}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={pragasHistorico}>
              <defs>
                <linearGradient id="gBrocas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.red}   stopOpacity={0.25} />
                  <stop offset="95%" stopColor={C.red}   stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gPontos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.gold}  stopOpacity={0.2}  />
                  <stop offset="95%" stopColor={C.gold}  stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,168,83,0.08)" />
              <XAxis dataKey="mes" stroke={C.textDim} tick={{ fontSize: 11, fill: C.textDim }} />
              <YAxis stroke={C.textDim} tick={{ fontSize: 11, fill: C.textDim }} />
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ fontSize: "0.78rem", color: C.textDim }} />
              <Area type="monotone" dataKey="brocas" stroke={C.red}  strokeWidth={2} fill="url(#gBrocas)" name="Brocas"         dot={{ fill: C.red,  r: 3 }} />
              <Area type="monotone" dataKey="pontos" stroke={C.gold} strokeWidth={2} fill="url(#gPontos)" name="Pontos de Foto" dot={{ fill: C.gold, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Distribuição */}
        <ChartCard title="Status dos Talhões" subtitle="Distribuição atual" icon={<PieChartIcon size={18} />}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%" cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={95}
                dataKey="value"
              >
                {statusDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<DarkTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── BAR CHART ── */}
      <ChartCard
        title="Top 5 Talhões com Maior Infestação"
        subtitle="Ordenado por número de brocas"
        icon={<AlertTriangle size={18} />}
        style={{ marginBottom: "1rem" }}
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={talhoesPorBrocas}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,168,83,0.08)" />
            <XAxis dataKey="nome" stroke={C.textDim} tick={{ fontSize: 11, fill: C.textDim }} />
            <YAxis stroke={C.textDim} tick={{ fontSize: 11, fill: C.textDim }} />
            <Tooltip content={<DarkTooltip />} />
            <Legend wrapperStyle={{ fontSize: "0.78rem", color: C.textDim }} />
            <Bar dataKey="brocas" fill={C.red}   name="Brocas"    radius={[6, 6, 0, 0]} />
            <Bar dataKey="area"   fill={C.brown} name="Área (ha)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── ATIVIDADES ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        style={{
          background: C.surface, borderRadius: "1rem",
          padding: "1.5rem", border: `1px solid ${C.border}`,
        }}
      >
        <h3 style={{
          fontSize: "0.95rem", fontWeight: 700, color: C.text,
          marginBottom: "1.125rem", display: "flex", alignItems: "center", gap: "0.5rem",
        }}>
          <Calendar size={18} style={{ color: C.gold }} />
          Atividades Recentes
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <ActivityItem
            icon={<CheckCircle size={16} style={{ color: C.brown }} />}
            title="Novo ponto de foto cadastrado"
            description="Talhão 3 — Setor Norte"
            time="5 min atrás"
          />
          <ActivityItem
            icon={<AlertTriangle size={16} style={{ color: C.caramel }} />}
            title="Alerta de infestação média"
            description="Talhão 7 — Verificar pontos de foto"
            time="1h atrás"
          />
          <ActivityItem
            icon={<Coffee size={16} style={{ color: C.red }} />}
            title="Pico de brocas detectado"
            description="Talhão 2 — 45 brocas identificadas"
            time="3h atrás"
          />
          <ActivityItem
            icon={<CheckCircle size={16} style={{ color: C.brown }} />}
            title="Relatório mensal gerado"
            description="Maio 2025 — Download disponível"
            time="1 dia atrás"
          />
        </div>
      </motion.div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── SUB-COMPONENTS ────────────────────────────────────────────────

function KPICard({ icon, label, value, trend, accent, delay }: {
  icon: React.ReactNode; label: string; value: string | number;
  trend: number | null; accent: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      whileHover={{ y: -4, scale: 1.015 }}
      style={{
        background: C.surface, borderRadius: "1rem",
        padding: "1.375rem 1.5rem",
        border: `1px solid ${C.border}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        transition: "border-color 0.2s",
        cursor: "default",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.borderHov; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border;    }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.125rem" }}>
        <div style={{
          width: 42, height: 42, borderRadius: "0.75rem",
          background: `${accent}18`,
          border: `1px solid ${accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: accent,
        }}>
          {icon}
        </div>
        {trend !== null && (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.25rem",
            fontSize: "0.78rem", fontWeight: 700,
            color: trend > 0 ? C.brown : C.red,
            background: trend > 0 ? "rgba(139,69,19,0.12)" : "rgba(239,68,68,0.1)",
            padding: "0.25rem 0.625rem", borderRadius: "999px",
          }}>
            {trend > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: "2rem", fontWeight: 700, color: C.text, lineHeight: 1, marginBottom: "0.375rem" }}>
        {value}
      </div>
      <div style={{ fontSize: "0.78rem", color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
    </motion.div>
  );
}

function ChartCard({ title, subtitle, icon, children, style: extraStyle }: {
  title: string; subtitle: string; icon: React.ReactNode;
  children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: C.surface, borderRadius: "1rem",
        padding: "1.5rem", border: `1px solid ${C.border}`,
        ...extraStyle,
      }}
    >
      <div style={{ marginBottom: "1.375rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
          <span style={{ color: C.gold }}>{icon}</span>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: C.text, margin: 0 }}>{title}</h3>
        </div>
        <p style={{ fontSize: "0.78rem", color: C.textMuted, margin: 0 }}>{subtitle}</p>
      </div>
      {children}
    </motion.div>
  );
}

function ActivityItem({ icon, title, description, time }: {
  icon: React.ReactNode; title: string; description: string; time: string;
}) {
  return (
    <div
      style={{
        display: "flex", gap: "0.875rem", padding: "0.875rem 1rem",
        background: C.surface2, borderRadius: "0.75rem",
        border: `1px solid ${C.border}`,
        transition: "all 0.18s", cursor: "pointer",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = C.borderHov;
        (e.currentTarget as HTMLElement).style.transform   = "translateX(4px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = C.border;
        (e.currentTarget as HTMLElement).style.transform   = "translateX(0)";
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: "0.625rem", flexShrink: 0,
        background: C.goldFaint, border: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: C.text }}>{title}</p>
        <p style={{ margin: "0.125rem 0 0", fontSize: "0.78rem", color: C.textDim }}>{description}</p>
      </div>
      <div style={{ fontSize: "0.72rem", color: C.textMuted, whiteSpace: "nowrap", paddingTop: "0.125rem" }}>
        {time}
      </div>
    </div>
  );
}
// src/app/dashboard/page.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Coffee,
  Camera,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowLeft,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTalhoes } from "@/hooks/useTalhoes";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { talhoes, loading } = useTalhoes();
  const router = useRouter();
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
    { name: "Baixa",   value: talhoes.filter(t => t.status === "baixo").length || 1,  color: "#8B4513" },
    { name: "Média",   value: talhoes.filter(t => t.status === "medio").length || 0,  color: "#C8860A" },
    { name: "Alta",    value: talhoes.filter(t => t.status === "alto").length || 0,   color: "#D4A853" },
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fdf6f0" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "4px solid #e5e7eb", borderTop: "4px solid #8B4513", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#4A2C2A", fontWeight: 600 }}>☕ Carregando dashboard...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fdf6f0", padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push("/")}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: "white", border: "2px solid #e5e7eb",
              padding: "0.625rem 1rem", borderRadius: "0.75rem",
              cursor: "pointer", fontSize: "0.875rem", fontWeight: 600,
              color: "#374151", marginBottom: "1rem",
            }}
          >
            <ArrowLeft size={18} />
            Voltar ao Mapa
          </motion.button>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: "2rem", fontWeight: 700, color: "#2C1810", margin: 0, display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <BarChart3 size={32} style={{ color: "#8B4513" }} />
            Dashboard Analytics
          </motion.h1>
          <p style={{ color: "#6b7280", fontSize: "0.95rem", marginTop: "0.5rem" }}>
            Visão geral e análise de dados em tempo real
          </p>
        </div>

        {/* Period Selector */}
        <div style={{ display: "flex", gap: "0.5rem", background: "white", padding: "0.25rem", borderRadius: "0.75rem", border: "2px solid #e5e7eb", alignSelf: "flex-start" }}>
          {(["week", "month", "year"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              style={{
                padding: "0.5rem 1rem",
                background: selectedPeriod === period ? "linear-gradient(135deg, #4A2C2A, #8B4513)" : "transparent",
                color: selectedPeriod === period ? "white" : "#6b7280",
                border: "none", borderRadius: "0.5rem", cursor: "pointer",
                fontSize: "0.875rem", fontWeight: 600, transition: "all 0.2s",
              }}
            >
              {period === "week" ? "Semana" : period === "month" ? "Mês" : "Ano"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <KPICard icon={<MapPin size={24} />}   label="Total de Talhões" value={totals.totalTalhoes}                   trend={null} color="#3b82f6" delay={0}   />
        <KPICard icon={<Coffee size={24} />}   label="Total de Brocas"  value={totals.totalPragas}                    trend={-12}  color="#ef4444" delay={0.1} />
        <KPICard icon={<Camera size={24} />}   label="Pontos de Foto"   value={totals.totalArmadilhas}                trend={+8}   color="#8B4513" delay={0.2} />
        <KPICard icon={<Activity size={24} />} label="Área Total"       value={`${totals.areaTotal.toFixed(1)} ha`}  trend={null} color="#C8860A" delay={0.3} />
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <ChartCard title="Evolução de Brocas" subtitle="Últimos 6 meses" icon={<TrendingUp size={20} />}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={pragasHistorico}>
              <defs>
                <linearGradient id="colorBrocas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="colorPontos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8B4513" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B4513" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#9ca3af" style={{ fontSize: "0.75rem" }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: "0.75rem" }} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "0.875rem" }} />
              <Legend wrapperStyle={{ fontSize: "0.875rem" }} />
              <Area type="monotone" dataKey="brocas" stroke="#ef4444" strokeWidth={2} fill="url(#colorBrocas)" name="Brocas" />
              <Area type="monotone" dataKey="pontos" stroke="#8B4513" strokeWidth={2} fill="url(#colorPontos)" name="Pontos de Foto" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status dos Talhões" subtitle="Distribuição atual" icon={<PieChartIcon size={20} />}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%" cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bar Chart */}
      <ChartCard title="Top 5 Talhões com Maior Infestação" subtitle="Ordenado por número de brocas" icon={<AlertTriangle size={20} />}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={talhoesPorBrocas}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="nome" stroke="#9ca3af" style={{ fontSize: "0.75rem" }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: "0.75rem" }} />
            <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "0.875rem" }} />
            <Legend wrapperStyle={{ fontSize: "0.875rem" }} />
            <Bar dataKey="brocas" fill="#ef4444" name="Brocas"     radius={[8, 8, 0, 0]} />
            <Bar dataKey="area"   fill="#8B4513" name="Área (ha)"  radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", border: "2px solid #e5e7eb", marginTop: "1.5rem" }}
      >
        <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#2C1810", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Calendar size={20} style={{ color: "#8B4513" }} />
          Atividades Recentes
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <ActivityItem icon={<CheckCircle size={18} style={{ color: "#8B4513" }} />}   title="Novo ponto de foto cadastrado" description="Talhão 3 - Setor Norte"               time="5 minutos atrás" />
          <ActivityItem icon={<AlertTriangle size={18} style={{ color: "#C8860A" }} />} title="Alerta de infestação média"    description="Talhão 7 - Verificar pontos de foto" time="1 hora atrás"    />
          <ActivityItem icon={<Coffee size={18} style={{ color: "#ef4444" }} />}        title="Pico de brocas detectado"     description="Talhão 2 - 45 brocas identificadas" time="3 horas atrás"   />
          <ActivityItem icon={<CheckCircle size={18} style={{ color: "#8B4513" }} />}   title="Relatório mensal gerado"      description="Maio 2025 - Download disponível"    time="1 dia atrás"     />
        </div>
      </motion.div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function KPICard({ icon, label, value, trend, color, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", border: "2px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", transition: "all 0.3s" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div style={{ background: `${color}15`, padding: "0.75rem", borderRadius: "0.75rem", display: "flex", color }}>
          {icon}
        </div>
        {trend !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.875rem", fontWeight: 700, color: trend > 0 ? "#8B4513" : "#ef4444" }}>
            {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: "2rem", fontWeight: 700, color: "#2C1810", marginBottom: "0.25rem" }}>{value}</div>
      <div style={{ fontSize: "0.875rem", color: "#6b7280", fontWeight: 500 }}>{label}</div>
    </motion.div>
  );
}

function ChartCard({ title, subtitle, icon, children }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", border: "2px solid #e5e7eb" }}
    >
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <div style={{ color: "#8B4513" }}>{icon}</div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#2C1810", margin: 0 }}>{title}</h3>
        </div>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>{subtitle}</p>
      </div>
      {children}
    </motion.div>
  );
}

function ActivityItem({ icon, title, description, time }: any) {
  return (
    <div
      style={{ display: "flex", gap: "1rem", padding: "0.875rem", background: "#fdf6f0", borderRadius: "0.75rem", transition: "all 0.2s", cursor: "pointer" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#f5e6d3"; e.currentTarget.style.transform = "translateX(4px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "#fdf6f0"; e.currentTarget.style.transform = "translateX(0)"; }}
    >
      <div style={{ marginTop: "0.125rem" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#2C1810" }}>{title}</p>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280", marginTop: "0.125rem" }}>{description}</p>
      </div>
      <div style={{ fontSize: "0.75rem", color: "#9ca3af", whiteSpace: "nowrap" }}>{time}</div>
    </div>
  );
}
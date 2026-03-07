// src/components/panels/Header.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Coffee, MapPin, Camera, BarChart3,
  User, LogOut, Settings, Bell, ChevronDown, X,
  Leaf, Map, Phone, Mail, Edit2, Save, Lock, Globe,
  Moon, Bell as BellIcon, Shield, Palette, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface HeaderProps {
  totals: {
    totalTalhoes: number;
    totalArmadilhas: number;
    totalPragas: number;
    areaTotal: number;
  };
  onNovoTalhao: () => void;
  onListaTalhoes: () => void;
  onListaArmadilhas: () => void;
  onMinhaLocalizacao: () => void;
  onCreateTestTalhao: () => void;
}

const notifications = [
  { id: 1, type: "warning", message: "Talhão 3 com infestação alta", time: "5 min" },
  { id: 2, type: "success", message: "Novo ponto de foto cadastrado", time: "1h" },
  { id: 3, type: "info",    message: "Relatório mensal disponível",   time: "3h" },
];

export function Header({
  totals,
  onListaTalhoes,
  onListaArmadilhas,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [userPanelOpen,  setUserPanelOpen]  = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [perfilModalOpen, setPerfilModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const userRef  = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (userRef.current  && !userRef.current.contains(e.target as Node))  setUserPanelOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifPanelOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const initials = user?.nome
    ? user.nome.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <>
      {/* ── HEADER BAR ─────────────────────────────────────────── */}
      <header style={{
        background: "linear-gradient(135deg, #1a0f0a 0%, #2C1810 40%, #4A2C2A 80%, #6b3a28 100%)",
        borderBottom: "1px solid rgba(212,168,83,0.25)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
        position: "sticky", top: 0, zIndex: 1000,
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          pointerEvents: "none",
        }} />

        <div style={{
          padding: "1.125rem 2rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: "1.5rem", position: "relative",
        }}>
          {/* ── LOGO ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
            <div style={{
              width: 52, height: 52,
              background: "linear-gradient(135deg, rgba(212,168,83,0.2), rgba(200,134,10,0.1))",
              border: "1.5px solid rgba(212,168,83,0.4)", borderRadius: "0.875rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}>
              <Coffee size={28} style={{ color: "#D4A853" }} />
            </div>
            <div>
              <div style={{ fontSize: "1.375rem", fontWeight: 700, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>
                Fazenda Café
              </div>
              <div style={{ fontSize: "0.75rem", color: "rgba(212,168,83,0.75)", fontWeight: 500, marginTop: 3, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Monitoramento Agrícola
              </div>
            </div>
          </motion.div>

          {/* ── STATS ── */}
          <div style={{ display: "flex", gap: "0.625rem", alignItems: "center", flex: 1, justifyContent: "center", flexWrap: "wrap" }}>
            <StatPill icon={<MapPin size={16} />}  label="Talhões"     value={totals.totalTalhoes}                onClick={onListaTalhoes}    delay={0.05} />
            <StatPill icon={<Camera size={16} />}  label="Pontos Foto" value={totals.totalArmadilhas}             onClick={onListaArmadilhas} delay={0.1}  />
            <StatPill icon={<Coffee size={16} />}  label="Brocas"      value={totals.totalPragas} accent="#ef4444" delay={0.15} />
            <StatPill icon={<Leaf size={16} />}    label="Área"        value={`${totals.areaTotal.toFixed(1)}ha`} delay={0.2} />
          </div>

          {/* ── RIGHT ACTIONS ── */}
          <div style={{ display: "flex", gap: "0.625rem", alignItems: "center", flexShrink: 0 }}>
            {/* Dashboard */}
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/dashboard")}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.625rem 1.125rem",
                background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.25)",
                borderRadius: "0.75rem", color: "rgba(255,255,255,0.9)",
                fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", backdropFilter: "blur(8px)",
              }}
            >
              <BarChart3 size={18} style={{ color: "#D4A853" }} />
              Dashboard
            </motion.button>

            {/* Notifications */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <motion.button
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setNotifPanelOpen(p => !p); setUserPanelOpen(false); }}
                style={{
                  width: 44, height: 44,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.25)",
                  borderRadius: "0.75rem", cursor: "pointer", color: "rgba(255,255,255,0.8)", position: "relative",
                }}
              >
                <Bell size={20} />
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  background: "#ef4444", color: "#fff",
                  fontSize: "0.65rem", fontWeight: 700,
                  padding: "2px 6px", borderRadius: 999, border: "2px solid #1a0f0a",
                }}>
                  {notifications.length}
                </span>
              </motion.button>
              <AnimatePresence>
                {notifPanelOpen && <NotifDropdown onClose={() => setNotifPanelOpen(false)} />}
              </AnimatePresence>
            </div>

            {/* User avatar */}
            {user && (
              <div ref={userRef}>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setUserPanelOpen(p => !p); setNotifPanelOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.625rem",
                    padding: "0.5rem 0.875rem 0.5rem 0.5rem",
                    background: userPanelOpen ? "rgba(212,168,83,0.2)" : "rgba(212,168,83,0.08)",
                    border: `1px solid ${userPanelOpen ? "rgba(212,168,83,0.5)" : "rgba(212,168,83,0.2)"}`,
                    borderRadius: "0.875rem", cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "linear-gradient(135deg, #8B4513, #C8860A)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: "0.9rem",
                    border: "2px solid rgba(212,168,83,0.5)", flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  <div style={{ textAlign: "left", lineHeight: 1.3 }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.nome.split(" ")[0]}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "rgba(212,168,83,0.8)" }}>
                      {user.fazenda || "Fazenda"}
                    </div>
                  </div>
                  <ChevronDown size={15} style={{
                    color: "rgba(212,168,83,0.7)", transition: "transform 0.25s",
                    transform: userPanelOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }} />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── USER SIDE PANEL ─────────────────────────────────────── */}
      <AnimatePresence>
        {userPanelOpen && user && (
          <>
            <motion.div
              key="user-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setUserPanelOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)", zIndex: 2000 }}
            />
            <motion.div
              key="user-panel"
              initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              style={{
                position: "fixed", top: 0, right: 0, width: 320, height: "100vh",
                background: "linear-gradient(180deg, #1a0f0a 0%, #2C1810 100%)",
                borderLeft: "1px solid rgba(212,168,83,0.2)",
                boxShadow: "-12px 0 40px rgba(0,0,0,0.4)",
                zIndex: 2001, display: "flex", flexDirection: "column", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", inset: 0, opacity: 0.05,
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                pointerEvents: "none",
              }} />

              <button
                onClick={() => setUserPanelOpen(false)}
                style={{
                  position: "absolute", top: 18, right: 18, width: 36, height: 36,
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "rgba(255,255,255,0.6)", zIndex: 1,
                }}
              >
                <X size={18} />
              </button>

              {/* Profile */}
              <div style={{ padding: "2.75rem 2rem 2rem", borderBottom: "1px solid rgba(212,168,83,0.15)", position: "relative" }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: "linear-gradient(135deg, #8B4513, #C8860A)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: "1.75rem",
                  border: "3px solid rgba(212,168,83,0.4)",
                  boxShadow: "0 8px 24px rgba(139,69,19,0.4)", marginBottom: "1.125rem",
                }}>
                  {initials}
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: 4 }}>{user.nome}</div>
                <div style={{ fontSize: "0.875rem", color: "rgba(212,168,83,0.75)", marginBottom: 10 }}>{user.email}</div>
                {user.fazenda && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "rgba(212,168,83,0.12)", border: "1px solid rgba(212,168,83,0.25)",
                    padding: "0.3rem 0.75rem", borderRadius: 999,
                    fontSize: "0.8rem", fontWeight: 600, color: "#D4A853",
                  }}>
                    <Map size={13} />{user.fazenda}
                  </div>
                )}
              </div>

              {/* Menu items */}
              <div style={{ padding: "1.25rem 1rem", flex: 1 }}>
                <PanelMenuItem
                  icon={<User size={18} />}
                  label="Meu Perfil"
                  description="Editar informações pessoais"
                  onClick={() => { setUserPanelOpen(false); setPerfilModalOpen(true); }}
                />
                <PanelMenuItem
                  icon={<Settings size={18} />}
                  label="Configurações"
                  description="Preferências do sistema"
                  onClick={() => { setUserPanelOpen(false); setConfigModalOpen(true); }}
                />
                <PanelMenuItem
                  icon={<BarChart3 size={18} />}
                  label="Dashboard"
                  description="Análises e gráficos"
                  onClick={() => { setUserPanelOpen(false); router.push("/dashboard"); }}
                />
              </div>

              {/* Logout */}
              <div style={{ padding: "1.25rem 1rem 2rem", borderTop: "1px solid rgba(212,168,83,0.12)" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={logout}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "0.875rem",
                    padding: "1rem 1.125rem",
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: "0.875rem", color: "#f87171",
                    fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}
                >
                  <LogOut size={19} />Sair da conta
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MODAL PERFIL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {perfilModalOpen && user && (
          <PerfilModal user={user} initials={initials} onClose={() => setPerfilModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── MODAL CONFIGURAÇÕES ──────────────────────────────────── */}
      <AnimatePresence>
        {configModalOpen && (
          <ConfigModal onClose={() => setConfigModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ── MODAL PERFIL ─────────────────────────────────────────────────
function PerfilModal({ user, initials, onClose }: { user: any; initials: string; onClose: () => void }) {
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(user.nome || "");
  const [telefone, setTelefone] = useState(user.telefone || "");
  const [fazenda, setFazenda] = useState(user.fazenda || "");
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    // Simula salvamento — conectar ao endpoint de update quando disponível
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setEditing(false);
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%", padding: "0.75rem 1rem",
    fontSize: "0.9rem", fontWeight: 500,
    background: "white",
    border: `2px solid ${focusedField === field ? "#8B4513" : "#e8ddd5"}`,
    borderRadius: "0.875rem", color: "#2C1810", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: focusedField === field ? "0 0 0 4px rgba(139,69,19,0.08)" : "none",
    boxSizing: "border-box" as const,
    opacity: editing ? 1 : 0.7,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 3500,
        background: "rgba(10,5,2,0.75)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 28 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 500, borderRadius: "1.5rem", overflow: "hidden",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,83,0.15)",
        }}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1a0f0a 0%, #2C1810 60%, #3d1f12 100%)",
          padding: "2rem", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -50, right: -30, width: 180, height: 180,
            background: "radial-gradient(circle, rgba(212,168,83,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg, #8B4513, #C8860A)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: "1.4rem",
                border: "3px solid rgba(212,168,83,0.5)",
                boxShadow: "0 6px 20px rgba(139,69,19,0.4)",
              }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(212,168,83,0.55)", marginBottom: "0.3rem" }}>
                  Meu Perfil
                </div>
                <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                  {user.nome.split(" ")[0]}
                </h2>
                <div style={{ fontSize: "0.8rem", color: "rgba(212,168,83,0.6)", marginTop: 3 }}>{user.email}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.625rem", cursor: "pointer", color: "rgba(255,255,255,0.5)", transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ background: "#fdf8f3", padding: "1.75rem 2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Nome */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b4c3a", marginBottom: "0.5rem" }}>
                <User size={11} style={{ color: "#8B4513" }} />Nome completo
              </label>
              <input value={nome} onChange={e => setNome(e.target.value)}
                disabled={!editing}
                onFocus={() => setFocusedField("nome")} onBlur={() => setFocusedField(null)}
                style={inputStyle("nome")} />
            </div>

            {/* Email (somente leitura) */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b4c3a", marginBottom: "0.5rem" }}>
                <Mail size={11} style={{ color: "#8B4513" }} />E-mail
              </label>
              <input value={user.email} disabled
                style={{ ...inputStyle("email"), opacity: 0.5, cursor: "not-allowed" }} />
            </div>

            {/* Telefone */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b4c3a", marginBottom: "0.5rem" }}>
                <Phone size={11} style={{ color: "#8B4513" }} />Telefone <span style={{ fontSize: "0.65rem", color: "#c9b5a8", fontWeight: 500, letterSpacing: 0, textTransform: "none" }}>(opcional)</span>
              </label>
              <input value={telefone} onChange={e => setTelefone(e.target.value)}
                disabled={!editing} placeholder="(00) 00000-0000"
                onFocus={() => setFocusedField("tel")} onBlur={() => setFocusedField(null)}
                style={inputStyle("tel")} />
            </div>

            {/* Fazenda */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b4c3a", marginBottom: "0.5rem" }}>
                <Map size={11} style={{ color: "#8B4513" }} />Fazenda
              </label>
              <input value={fazenda} onChange={e => setFazenda(e.target.value)}
                disabled={!editing} placeholder="Nome da fazenda"
                onFocus={() => setFocusedField("faz")} onBlur={() => setFocusedField(null)}
                style={inputStyle("faz")} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: "#fdf8f3", borderTop: "1px solid #ede4da",
          padding: "1.25rem 2rem 1.5rem", display: "flex", gap: "0.75rem",
        }}>
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} disabled={saving}
                style={{
                  flex: 1, padding: "0.9rem", background: "white", border: "2px solid #e8ddd5",
                  borderRadius: "0.875rem", color: "#6b4c3a", fontWeight: 600, fontSize: "0.9rem",
                  cursor: "pointer", transition: "all 0.18s",
                }}>
                Cancelar
              </button>
              <motion.button onClick={handleSave} disabled={saving}
                whileHover={!saving ? { scale: 1.02, y: -1 } : {}}
                whileTap={!saving ? { scale: 0.98 } : {}}
                style={{
                  flex: 2, padding: "0.9rem", border: "none", borderRadius: "0.875rem",
                  color: "white", fontWeight: 700, fontSize: "0.95rem", cursor: saving ? "not-allowed" : "pointer",
                  background: saving ? "#c9b5a8" : "linear-gradient(135deg, #3d1f12 0%, #8B4513 60%, #a05220 100%)",
                  boxShadow: saving ? "none" : "0 4px 16px rgba(139,69,19,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                }}>
                {saving ? (
                  <><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", animation: "spin 0.8s linear infinite" }} />Salvando…</>
                ) : (
                  <><Save size={16} />Salvar Alterações</>
                )}
              </motion.button>
            </>
          ) : (
            <>
              <button onClick={onClose}
                style={{
                  flex: 1, padding: "0.9rem", background: "white", border: "2px solid #e8ddd5",
                  borderRadius: "0.875rem", color: "#6b4c3a", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
                }}>
                Fechar
              </button>
              <motion.button onClick={() => setEditing(true)}
                whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                style={{
                  flex: 2, padding: "0.9rem", border: "none", borderRadius: "0.875rem",
                  color: "white", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
                  background: "linear-gradient(135deg, #3d1f12 0%, #8B4513 60%, #a05220 100%)",
                  boxShadow: "0 4px 16px rgba(139,69,19,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                }}>
                <Edit2 size={16} />Editar Perfil
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

// ── MODAL CONFIGURAÇÕES ──────────────────────────────────────────
function ConfigModal({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState(true);
  const [darkMap, setDarkMap] = useState(true);
  const [language, setLanguage] = useState("pt-BR");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaved(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaved(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 3500,
        background: "rgba(10,5,2,0.75)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 28 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 500, borderRadius: "1.5rem", overflow: "hidden",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,83,0.15)",
        }}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1a0f0a 0%, #2C1810 60%, #3d1f12 100%)",
          padding: "1.25rem 1.5rem", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -50, right: -30, width: 180, height: 180,
            background: "radial-gradient(circle, rgba(212,168,83,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff", lineHeight: 1.2, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Settings size={18} style={{ color: "#D4A853" }} />Configurações
              </h2>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "rgba(212,168,83,0.5)" }}>
                Preferências e ajustes do sistema
              </p>
            </div>
            <button onClick={onClose}
              style={{
                width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.625rem", cursor: "pointer", color: "rgba(255,255,255,0.5)", transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ background: "#fdf8f3", padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "50vh", overflowY: "auto" }}>

          {/* Seção Notificações */}
          <ConfigSection title="Notificações" icon={<BellIcon size={14} style={{ color: "#8B4513" }} />}>
            <ConfigToggle
              label="Alertas de infestação"
              description="Receber avisos quando brocas ultrapassarem limite"
              value={notifications}
              onChange={setNotifications}
            />
          </ConfigSection>

          {/* Seção Mapa */}
          <ConfigSection title="Mapa" icon={<Palette size={14} style={{ color: "#8B4513" }} />}>
            <ConfigToggle
              label="Mapa escuro (satélite)"
              description="Usar imagem de satélite como fundo do mapa"
              value={darkMap}
              onChange={setDarkMap}
            />
          </ConfigSection>

          {/* Seção Idioma */}
          <ConfigSection title="Idioma" icon={<Globe size={14} style={{ color: "#8B4513" }} />}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { value: "pt-BR", label: "🇧🇷 Português (Brasil)" },
                { value: "es",    label: "🇪🇸 Español" },
                { value: "en",    label: "🇺🇸 English" },
              ].map(opt => {
                const sel = language === opt.value;
                return (
                  <button key={opt.value} onClick={() => setLanguage(opt.value)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.75rem 1rem",
                      background: sel ? "rgba(139,69,19,0.08)" : "white",
                      border: `2px solid ${sel ? "#8B4513" : "#e8ddd5"}`,
                      borderRadius: "0.75rem", cursor: "pointer", transition: "all 0.18s",
                      fontSize: "0.88rem", fontWeight: sel ? 700 : 500,
                      color: sel ? "#4A2C2A" : "#6b4c3a",
                    }}>
                    {opt.label}
                    {sel && <Check size={16} style={{ color: "#8B4513" }} />}
                  </button>
                );
              })}
            </div>
          </ConfigSection>

          {/* Seção Segurança */}
          <ConfigSection title="Segurança" icon={<Shield size={14} style={{ color: "#8B4513" }} />}>
            <button
              style={{
                width: "100%", padding: "0.875rem 1rem",
                display: "flex", alignItems: "center", gap: "0.75rem",
                background: "white", border: "2px solid #e8ddd5",
                borderRadius: "0.875rem", cursor: "pointer",
                fontSize: "0.88rem", fontWeight: 600, color: "#4A2C2A",
                transition: "all 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#8B4513"; e.currentTarget.style.background = "rgba(139,69,19,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8ddd5"; e.currentTarget.style.background = "white"; }}
            >
              <Lock size={16} style={{ color: "#8B4513" }} />
              Alterar senha
              <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#c9b5a8" }}>Em breve →</span>
            </button>
          </ConfigSection>
        </div>

        {/* Footer */}
        <div style={{
          background: "#fdf8f3", borderTop: "1px solid #ede4da",
          padding: "0.875rem 1.5rem", display: "flex", gap: "0.75rem",
        }}>
          <button onClick={onClose}
            style={{
              flex: 1, padding: "0.75rem", background: "white", border: "2px solid #e8ddd5",
              borderRadius: "0.875rem", color: "#6b4c3a", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
            }}>
            Fechar
          </button>
          <motion.button onClick={handleSave}
            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
            style={{
              flex: 2, padding: "0.75rem", border: "none", borderRadius: "0.875rem",
              color: "white", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
              background: saved
                ? "linear-gradient(135deg, #15803d, #16a34a)"
                : "linear-gradient(135deg, #3d1f12 0%, #8B4513 60%, #a05220 100%)",
              boxShadow: "0 4px 16px rgba(139,69,19,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              transition: "background 0.3s",
            }}>
            {saved ? <><Check size={16} />Salvo!</> : <><Save size={16} />Salvar</>}
          </motion.button>
        </div>
      </motion.div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

function ConfigSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: "0.75rem", border: "2px solid #f0e6dd", padding: "0.75rem 0.875rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b4c3a", marginBottom: "0.5rem" }}>
        {icon}{title}
      </div>
      {children}
    </div>
  );
}

function ConfigToggle({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.5rem 0.625rem",
        background: value ? "rgba(139,69,19,0.05)" : "#fdf8f3",
        border: `2px solid ${value ? "rgba(139,69,19,0.15)" : "#f0e6dd"}`,
        borderRadius: "0.75rem", cursor: "pointer", transition: "all 0.2s",
      }}
    >
      <div>
        <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#2C1810" }}>{label}</div>
        <div style={{ fontSize: "0.75rem", color: "#9b8070", marginTop: 2 }}>{description}</div>
      </div>
      <div style={{
        width: 44, height: 24, borderRadius: 999, position: "relative",
        background: value ? "#8B4513" : "#e8ddd5", transition: "background 0.2s", flexShrink: 0, marginLeft: "1rem",
      }}>
        <div style={{
          position: "absolute", top: 3, left: value ? "calc(100% - 21px)" : 3,
          width: 18, height: 18, borderRadius: "50%", background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s",
        }} />
      </div>
    </div>
  );
}

// ── SUB-COMPONENTS ────────────────────────────────────────────────
function StatPill({ icon, label, value, accent, onClick, delay }: {
  icon: React.ReactNode; label: string; value: string | number;
  accent?: string; onClick?: () => void; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay ?? 0 }}
      whileHover={onClick ? { y: -2, scale: 1.04 } : {}}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "0.5rem",
        padding: "0.55rem 1rem",
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,168,83,0.18)",
        borderRadius: "0.75rem", cursor: onClick ? "pointer" : "default",
        backdropFilter: "blur(6px)", transition: "all 0.2s", userSelect: "none",
      }}
    >
      <span style={{ color: accent || "#D4A853", opacity: 0.9 }}>{icon}</span>
      <span style={{ fontSize: "1.1rem", fontWeight: 700, color: accent || "#fff", lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: "0.72rem", color: "rgba(212,168,83,0.65)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </span>
    </motion.div>
  );
}

function NotifDropdown({ onClose }: { onClose: () => void }) {
  const notifs = [
    { id: 1, type: "warning", message: "Talhão 3 com infestação alta", time: "5 min" },
    { id: 2, type: "success", message: "Novo ponto de foto cadastrado", time: "1h" },
    { id: 3, type: "info",    message: "Relatório mensal disponível",   time: "3h" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ type: "spring", stiffness: 380, damping: 28 }}
      style={{
        position: "absolute", top: "calc(100% + 12px)", right: 0, width: 320,
        background: "#1e1008", border: "1px solid rgba(212,168,83,0.2)",
        borderRadius: "1rem", boxShadow: "0 16px 40px rgba(0,0,0,0.45)", overflow: "hidden", zIndex: 2100,
      }}
    >
      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(212,168,83,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, color: "#fff", fontSize: "1rem" }}>Notificações</span>
        <span style={{ fontSize: "0.75rem", background: "rgba(212,168,83,0.15)", color: "#D4A853", padding: "3px 10px", borderRadius: 999, fontWeight: 600 }}>
          {notifs.length} novas
        </span>
      </div>
      {notifs.map(n => (
        <div key={n.id} style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "0.875rem", alignItems: "flex-start", cursor: "pointer", transition: "background 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(212,168,83,0.06)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <div style={{ width: 9, height: 9, borderRadius: "50%", marginTop: 5, flexShrink: 0, background: n.type === "warning" ? "#C8860A" : n.type === "success" ? "#8B4513" : "#3b82f6" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.85)", fontWeight: 500, lineHeight: 1.4 }}>{n.message}</div>
            <div style={{ fontSize: "0.75rem", color: "rgba(212,168,83,0.55)", marginTop: 3 }}>{n.time} atrás</div>
          </div>
        </div>
      ))}
      <div style={{ padding: "0.75rem 1.25rem", textAlign: "center" }}>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#D4A853", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
          Ver todas →
        </button>
      </div>
    </motion.div>
  );
}

function PanelMenuItem({ icon, label, description, onClick }: { icon: React.ReactNode; label: string; description: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: "1rem",
        padding: "0.875rem 1rem", background: "transparent",
        border: "1px solid transparent", borderRadius: "0.875rem",
        cursor: "pointer", textAlign: "left", marginBottom: "0.375rem", transition: "all 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,168,83,0.08)"; e.currentTarget.style.borderColor = "rgba(212,168,83,0.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: "0.75rem",
        background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#D4A853", flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#fff", lineHeight: 1 }}>{label}</div>
        <div style={{ fontSize: "0.78rem", color: "rgba(212,168,83,0.55)", marginTop: 4 }}>{description}</div>
      </div>
    </motion.button>
  );
}
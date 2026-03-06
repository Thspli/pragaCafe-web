// src/components/panels/Header.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Coffee, MapPin, Camera, TrendingUp, BarChart3,
  User, LogOut, Settings, Bell, ChevronDown, X,
  Leaf, Map
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
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          pointerEvents: "none",
        }} />

        <div style={{
          padding: "1.125rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1.5rem",
          position: "relative",
        }}>

          {/* ── LOGO ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}
          >
            <div style={{
              width: 52, height: 52,
              background: "linear-gradient(135deg, rgba(212,168,83,0.2), rgba(200,134,10,0.1))",
              border: "1.5px solid rgba(212,168,83,0.4)",
              borderRadius: "0.875rem",
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
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/dashboard")}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.625rem 1.125rem",
                background: "rgba(212,168,83,0.1)",
                border: "1px solid rgba(212,168,83,0.25)",
                borderRadius: "0.75rem",
                color: "rgba(255,255,255,0.9)",
                fontSize: "0.875rem", fontWeight: 600,
                cursor: "pointer", backdropFilter: "blur(8px)",
              }}
            >
              <BarChart3 size={18} style={{ color: "#D4A853" }} />
              Dashboard
            </motion.button>

            {/* Notifications */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setNotifPanelOpen(p => !p); setUserPanelOpen(false); }}
                style={{
                  width: 44, height: 44,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(212,168,83,0.1)",
                  border: "1px solid rgba(212,168,83,0.25)",
                  borderRadius: "0.75rem",
                  cursor: "pointer", color: "rgba(255,255,255,0.8)",
                  position: "relative",
                }}
              >
                <Bell size={20} />
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  background: "#ef4444", color: "#fff",
                  fontSize: "0.65rem", fontWeight: 700,
                  padding: "2px 6px", borderRadius: 999,
                  border: "2px solid #1a0f0a",
                }}>
                  {notifications.length}
                </span>
              </motion.button>

              <AnimatePresence>
                {notifPanelOpen && (
                  <NotifDropdown onClose={() => setNotifPanelOpen(false)} />
                )}
              </AnimatePresence>
            </div>

            {/* User avatar */}
            {user && (
              <div ref={userRef}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setUserPanelOpen(p => !p); setNotifPanelOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.625rem",
                    padding: "0.5rem 0.875rem 0.5rem 0.5rem",
                    background: userPanelOpen ? "rgba(212,168,83,0.2)" : "rgba(212,168,83,0.08)",
                    border: `1px solid ${userPanelOpen ? "rgba(212,168,83,0.5)" : "rgba(212,168,83,0.2)"}`,
                    borderRadius: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "linear-gradient(135deg, #8B4513, #C8860A)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: "0.9rem",
                    border: "2px solid rgba(212,168,83,0.5)",
                    flexShrink: 0,
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
                    color: "rgba(212,168,83,0.7)",
                    transition: "transform 0.25s",
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUserPanelOpen(false)}
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(2px)",
                zIndex: 2000,
              }}
            />

            <motion.div
              key="user-panel"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              style={{
                position: "fixed",
                top: 0, right: 0,
                width: 320,
                height: "100vh",
                background: "linear-gradient(180deg, #1a0f0a 0%, #2C1810 100%)",
                borderLeft: "1px solid rgba(212,168,83,0.2)",
                boxShadow: "-12px 0 40px rgba(0,0,0,0.4)",
                zIndex: 2001,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
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
                  position: "absolute", top: 18, right: 18,
                  width: 36, height: 36,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "0.625rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "rgba(255,255,255,0.6)",
                  zIndex: 1,
                }}
              >
                <X size={18} />
              </button>

              {/* Profile */}
              <div style={{
                padding: "2.75rem 2rem 2rem",
                borderBottom: "1px solid rgba(212,168,83,0.15)",
                position: "relative",
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: "linear-gradient(135deg, #8B4513, #C8860A)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: "1.75rem",
                  border: "3px solid rgba(212,168,83,0.4)",
                  boxShadow: "0 8px 24px rgba(139,69,19,0.4)",
                  marginBottom: "1.125rem",
                }}>
                  {initials}
                </div>

                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                  {user.nome}
                </div>
                <div style={{ fontSize: "0.875rem", color: "rgba(212,168,83,0.75)", marginBottom: 10 }}>
                  {user.email}
                </div>
                {user.fazenda && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "rgba(212,168,83,0.12)",
                    border: "1px solid rgba(212,168,83,0.25)",
                    padding: "0.3rem 0.75rem",
                    borderRadius: 999,
                    fontSize: "0.8rem", fontWeight: 600, color: "#D4A853",
                  }}>
                    <Map size={13} />
                    {user.fazenda}
                  </div>
                )}
              </div>

              {/* Menu items */}
              <div style={{ padding: "1.25rem 1rem", flex: 1 }}>
                <PanelMenuItem
                  icon={<User size={18} />}
                  label="Meu Perfil"
                  description="Editar informações pessoais"
                  onClick={() => { setUserPanelOpen(false); alert("Perfil (em breve)"); }}
                />
                <PanelMenuItem
                  icon={<Settings size={18} />}
                  label="Configurações"
                  description="Preferências do sistema"
                  onClick={() => { setUserPanelOpen(false); alert("Configurações (em breve)"); }}
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={logout}
                  style={{
                    width: "100%",
                    display: "flex", alignItems: "center", gap: "0.875rem",
                    padding: "1rem 1.125rem",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: "0.875rem",
                    color: "#f87171",
                    fontSize: "0.95rem", fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
                  }}
                >
                  <LogOut size={19} />
                  Sair da conta
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ── SUB-COMPONENTS ────────────────────────────────────────────────

function StatPill({ icon, label, value, accent, onClick, delay }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: string;
  onClick?: () => void;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay ?? 0 }}
      whileHover={onClick ? { y: -2, scale: 1.04 } : {}}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "0.5rem",
        padding: "0.55rem 1rem",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(212,168,83,0.18)",
        borderRadius: "0.75rem",
        cursor: onClick ? "pointer" : "default",
        backdropFilter: "blur(6px)",
        transition: "all 0.2s",
        userSelect: "none",
      }}
    >
      <span style={{ color: accent || "#D4A853", opacity: 0.9 }}>{icon}</span>
      <span style={{ fontSize: "1.1rem", fontWeight: 700, color: accent || "#fff", lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: "0.72rem", color: "rgba(212,168,83,0.65)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </span>
    </motion.div>
  );
}

function NotifDropdown({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      style={{
        position: "absolute",
        top: "calc(100% + 12px)",
        right: 0,
        width: 320,
        background: "#1e1008",
        border: "1px solid rgba(212,168,83,0.2)",
        borderRadius: "1rem",
        boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
        overflow: "hidden",
        zIndex: 2100,
      }}
    >
      <div style={{
        padding: "1rem 1.25rem",
        borderBottom: "1px solid rgba(212,168,83,0.12)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontWeight: 700, color: "#fff", fontSize: "1rem" }}>Notificações</span>
        <span style={{
          fontSize: "0.75rem", background: "rgba(212,168,83,0.15)",
          color: "#D4A853", padding: "3px 10px", borderRadius: 999, fontWeight: 600,
        }}>
          {notifications.length} novas
        </span>
      </div>

      {notifications.map(n => (
        <div key={n.id} style={{
          padding: "0.875rem 1.25rem",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex", gap: "0.875rem", alignItems: "flex-start",
          cursor: "pointer", transition: "background 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(212,168,83,0.06)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <div style={{
            width: 9, height: 9, borderRadius: "50%", marginTop: 5, flexShrink: 0,
            background: n.type === "warning" ? "#C8860A" : n.type === "success" ? "#8B4513" : "#3b82f6",
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.85)", fontWeight: 500, lineHeight: 1.4 }}>
              {n.message}
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(212,168,83,0.55)", marginTop: 3 }}>
              {n.time} atrás
            </div>
          </div>
        </div>
      ))}

      <div style={{ padding: "0.75rem 1.25rem", textAlign: "center" }}>
        <button onClick={onClose} style={{
          background: "transparent", border: "none",
          color: "#D4A853", fontSize: "0.875rem", fontWeight: 600,
          cursor: "pointer",
        }}>
          Ver todas →
        </button>
      </div>
    </motion.div>
  );
}

function PanelMenuItem({ icon, label, description, onClick }: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex", alignItems: "center", gap: "1rem",
        padding: "0.875rem 1rem",
        background: "transparent",
        border: "1px solid transparent",
        borderRadius: "0.875rem",
        cursor: "pointer",
        textAlign: "left",
        marginBottom: "0.375rem",
        transition: "all 0.2s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(212,168,83,0.08)";
        e.currentTarget.style.borderColor = "rgba(212,168,83,0.15)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "transparent";
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: "0.75rem",
        background: "rgba(212,168,83,0.1)",
        border: "1px solid rgba(212,168,83,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#D4A853", flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#fff", lineHeight: 1 }}>
          {label}
        </div>
        <div style={{ fontSize: "0.78rem", color: "rgba(212,168,83,0.55)", marginTop: 4 }}>
          {description}
        </div>
      </div>
    </motion.button>
  );
}
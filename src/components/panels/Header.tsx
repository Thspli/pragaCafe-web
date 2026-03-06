// src/components/panels/Header.tsx
"use client";

import React, { useState } from "react";
import { Coffee, MapPin, Camera, TrendingUp, BarChart3, User, LogOut, Settings, Bell, ChevronDown } from "lucide-react";
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

export function Header({
  totals,
  onNovoTalhao,
  onListaTalhoes,
  onListaArmadilhas,
  onMinhaLocalizacao,
  onCreateTestTalhao,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, type: 'warning', message: 'Talhão 3 com infestação alta', time: '5 min' },
    { id: 2, type: 'success', message: 'Nova ponto de foto cadastrado', time: '1h' },
    { id: 3, type: 'info', message: 'Relatório mensal disponível', time: '3h' },
  ];

  const unreadNotifications = notifications.length;

  return (
    <header
      style={{
        background: "linear-gradient(135deg, rgba(44, 24, 16, 0.97) 0%, rgba(74, 44, 42, 0.97) 50%, rgba(139, 69, 19, 0.97) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(212, 168, 83, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        {/* Logo + Brand */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: "flex", alignItems: "center", gap: "1rem" }}
        >
          <div
            style={{
              background: "rgba(212, 168, 83, 0.15)",
              padding: "0.75rem",
              borderRadius: "1rem",
              display: "flex",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(212, 168, 83, 0.3)",
            }}
          >
            <Coffee style={{ width: "2rem", height: "2rem", color: "#D4A853" }} />
          </div>
          <div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "white",
                margin: 0,
                lineHeight: 1,
              }}
            >
              Fazenda Café
            </h1>
            <p
              style={{
                color: "rgba(212, 168, 83, 0.9)",
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                fontWeight: 500,
              }}
            >
              Sistema de Monitoramento Agrícola
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <StatCard
            icon={<MapPin size={18} />}
            label="Talhões"
            value={totals.totalTalhoes}
            onClick={onListaTalhoes}
            delay={0.1}
          />
          <StatCard
            icon={<Camera size={18} />}
            label="Pontos de Foto"
            value={totals.totalArmadilhas}
            onClick={onListaArmadilhas}
            delay={0.2}
          />
          <StatCard
            icon={<Coffee size={18} />}
            label="Brocas"
            value={totals.totalPragas}
            color="#ef4444"
            delay={0.3}
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            label="Área"
            value={`${totals.areaTotal.toFixed(1)}ha`}
            delay={0.4}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {/* Dashboard Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard')}
            style={{
              background: "rgba(212, 168, 83, 0.15)",
              border: "1px solid rgba(212, 168, 83, 0.3)",
              padding: "0.625rem 1rem",
              borderRadius: "0.75rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "white",
              fontWeight: 600,
              fontSize: "0.875rem",
              backdropFilter: "blur(10px)",
              transition: "all 0.2s",
            }}
          >
            <BarChart3 size={18} />
            Dashboard
          </motion.button>

          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: "rgba(212, 168, 83, 0.15)",
                border: "1px solid rgba(212, 168, 83, 0.3)",
                padding: "0.625rem",
                borderRadius: "0.75rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "white",
                backdropFilter: "blur(10px)",
                position: "relative",
              }}
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    background: "#ef4444",
                    color: "white",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.4rem",
                    borderRadius: "999px",
                    border: "2px solid rgba(44, 24, 16, 0.97)",
                  }}
                >
                  {unreadNotifications}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 0.5rem)",
                    right: 0,
                    background: "white",
                    borderRadius: "1rem",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                    border: "1px solid #e5e7eb",
                    width: "320px",
                    maxHeight: "400px",
                    overflowY: "auto",
                    zIndex: 2000,
                  }}
                >
                  <div
                    style={{
                      padding: "1rem",
                      borderBottom: "1px solid #e5e7eb",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#1f2937" }}>
                      Notificações
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600 }}>
                      {unreadNotifications} novas
                    </span>
                  </div>
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        padding: "0.875rem 1rem",
                        borderBottom: "1px solid #f3f4f6",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fdf6f0")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                    >
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background:
                              notif.type === "warning"
                                ? "#C8860A"
                                : notif.type === "success"
                                ? "#8B4513"
                                : "#3b82f6",
                            marginTop: "0.25rem",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>
                            {notif.message}
                          </p>
                          <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{notif.time} atrás</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "center",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    <button
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#4A2C2A",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Ver todas
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          {user && (
            <div style={{ position: "relative" }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  background: "rgba(212, 168, 83, 0.15)",
                  border: "1px solid rgba(212, 168, 83, 0.3)",
                  padding: "0.5rem 0.875rem",
                  borderRadius: "0.75rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #8B4513, #C8860A)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    border: "2px solid rgba(212, 168, 83, 0.4)",
                  }}
                >
                  {user.nome.charAt(0).toUpperCase()}
                </div>
                <div style={{ textAlign: "left" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "white",
                      lineHeight: 1,
                    }}
                  >
                    {user.nome}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.7rem",
                      color: "rgba(212, 168, 83, 0.9)",
                      marginTop: "0.125rem",
                    }}
                  >
                    {user.fazenda || user.email}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  style={{
                    color: "rgba(212, 168, 83, 0.8)",
                    transition: "transform 0.2s",
                    transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 0.5rem)",
                      right: 0,
                      background: "white",
                      borderRadius: "1rem",
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                      border: "1px solid #e5e7eb",
                      width: "240px",
                      overflow: "hidden",
                      zIndex: 2000,
                    }}
                  >
                    <div style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}>
                      <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
                        {user.nome}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                        {user.email}
                      </p>
                    </div>
                    <MenuItem
                      icon={<User size={16} />}
                      label="Meu Perfil"
                      onClick={() => {
                        setShowUserMenu(false);
                        alert("Perfil (em desenvolvimento)");
                      }}
                    />
                    <MenuItem
                      icon={<Settings size={16} />}
                      label="Configurações"
                      onClick={() => {
                        setShowUserMenu(false);
                        alert("Configurações (em desenvolvimento)");
                      }}
                    />
                    <div style={{ borderTop: "1px solid #e5e7eb" }}>
                      <MenuItem
                        icon={<LogOut size={16} />}
                        label="Sair"
                        onClick={logout}
                        danger
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function StatCard({ icon, label, value, color, onClick, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, scale: 1.05 }}
      onClick={onClick}
      style={{
        background: "rgba(212, 168, 83, 0.12)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(212, 168, 83, 0.25)",
        padding: "0.75rem 1rem",
        borderRadius: "0.875rem",
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.375rem",
        minWidth: "90px",
        transition: "all 0.2s",
      }}
    >
      <div style={{ color: color || "#D4A853", opacity: 0.95 }}>{icon}</div>
      <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", lineHeight: 1 }}>
        {value}
      </div>
      <div
        style={{
          fontSize: "0.7rem",
          color: "rgba(212, 168, 83, 0.85)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>
    </motion.div>
  );
}

function MenuItem({ icon, label, onClick, danger }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "0.75rem 1rem",
        background: "transparent",
        border: "none",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        cursor: "pointer",
        fontSize: "0.875rem",
        fontWeight: 500,
        color: danger ? "#ef4444" : "#374151",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? "#fef2f2" : "#fdf6f0";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {icon}
      {label}
    </button>
  );
}
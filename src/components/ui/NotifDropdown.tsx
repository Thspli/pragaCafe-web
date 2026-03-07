// src/components/ui/NotifDropdown.tsx
// Substitui o NotifDropdown estático dentro de Header.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, MapPin, AlertTriangle, CheckCircle, Trash2, BellOff, Check, X } from "lucide-react";
import { Notificacao } from "@/hooks/useNotificacoes";

interface NotifDropdownProps {
  notificacoes: Notificacao[];
  naoLidas: number;
  loading: boolean;
  onClose: () => void;
  onMarcarLida: (id: number) => void;
  onMarcarTodas: () => void;
  onDeletar: (id: number) => void;
  onLimparTodas: () => void;
}

const TIPO_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  foto_tirada:        { icon: <Camera size={14} />,        color: "#C8860A", bg: "rgba(200,134,10,0.15)" },
  ponto_criado:       { icon: <MapPin size={14} />,         color: "#8B4513", bg: "rgba(139,69,19,0.15)" },
  ponto_atualizado:   { icon: <CheckCircle size={14} />,    color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  ponto_removido:     { icon: <X size={14} />,              color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  ausencia_registrada:{ icon: <AlertTriangle size={14} />,  color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  infestacao_alta:    { icon: <AlertTriangle size={14} />,  color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  talhao_criado:      { icon: <MapPin size={14} />,         color: "#D4A853", bg: "rgba(212,168,83,0.15)" },
  sistema:            { icon: <CheckCircle size={14} />,    color: "#6b7280", bg: "rgba(107,114,128,0.15)" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

export function NotifDropdown({
  notificacoes, naoLidas, loading,
  onClose, onMarcarLida, onMarcarTodas, onDeletar, onLimparTodas,
}: NotifDropdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      style={{
        position: "absolute", top: "calc(100% + 12px)", right: 0, width: 360,
        background: "#1a0f0a",
        border: "1px solid rgba(212,168,83,0.2)",
        borderRadius: "1rem",
        boxShadow: "0 20px 48px rgba(0,0,0,0.55)",
        overflow: "hidden", zIndex: 2100,
        maxHeight: "80vh",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "1rem 1.25rem 0.875rem",
        borderBottom: "1px solid rgba(212,168,83,0.12)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>Notificações</span>
          {naoLidas > 0 && (
            <span style={{
              fontSize: "0.72rem", background: "#ef4444", color: "#fff",
              padding: "2px 8px", borderRadius: 999, fontWeight: 700,
            }}>
              {naoLidas}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {naoLidas > 0 && (
            <button
              onClick={onMarcarTodas}
              title="Marcar todas como lidas"
              style={{
                background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.2)",
                borderRadius: "0.5rem", padding: "0.3rem 0.6rem",
                color: "#D4A853", fontSize: "0.72rem", fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem",
              }}
            >
              <Check size={11} /> Ler todas
            </button>
          )}
          {notificacoes.length > 0 && (
            <button
              onClick={onLimparTodas}
              title="Limpar tudo"
              style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
                borderRadius: "0.5rem", padding: "0.3rem 0.6rem",
                color: "#f87171", fontSize: "0.72rem", fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem",
              }}
            >
              <Trash2 size={11} /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {loading && notificacoes.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "rgba(212,168,83,0.4)" }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%",
              border: "2px solid rgba(212,168,83,0.15)", borderTop: "2px solid #D4A853",
              animation: "spin 0.8s linear infinite", margin: "0 auto 0.75rem",
            }} />
            Carregando…
          </div>
        ) : notificacoes.length === 0 ? (
          <div style={{ padding: "2.5rem 1.5rem", textAlign: "center" }}>
            <BellOff size={36} style={{ color: "rgba(212,168,83,0.2)", margin: "0 auto 0.75rem" }} />
            <p style={{ color: "rgba(212,168,83,0.4)", fontSize: "0.875rem", margin: 0 }}>
              Nenhuma notificação
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notificacoes.map((n) => {
              const cfg = TIPO_CONFIG[n.tipo] || TIPO_CONFIG["sistema"];
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, padding: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    padding: "0.875rem 1.25rem",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    display: "flex", gap: "0.75rem", alignItems: "flex-start",
                    background: n.lida ? "transparent" : "rgba(212,168,83,0.04)",
                    cursor: "pointer", transition: "background 0.15s",
                    position: "relative",
                  }}
                  onClick={() => !n.lida && onMarcarLida(n.id)}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(212,168,83,0.07)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = n.lida ? "transparent" : "rgba(212,168,83,0.04)"; }}
                >
                  {/* Ícone de tipo */}
                  <div style={{
                    width: 32, height: 32, borderRadius: "0.625rem", flexShrink: 0,
                    background: cfg.bg, border: `1px solid ${cfg.color}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: cfg.color, marginTop: 1,
                  }}>
                    {cfg.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "0.84rem", fontWeight: n.lida ? 500 : 700,
                      color: n.lida ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.9)",
                      lineHeight: 1.35, marginBottom: "0.2rem",
                    }}>
                      {n.titulo}
                    </div>
                    {n.mensagem && (
                      <div style={{
                        fontSize: "0.75rem", color: "rgba(212,168,83,0.5)",
                        lineHeight: 1.4, marginBottom: "0.3rem",
                      }}>
                        {n.mensagem}
                      </div>
                    )}
                    {n.metadados?.talhaoNome && (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: "0.25rem",
                        fontSize: "0.68rem", color: "rgba(212,168,83,0.45)",
                        background: "rgba(212,168,83,0.07)", padding: "1px 6px",
                        borderRadius: 999, marginBottom: "0.25rem",
                      }}>
                        <MapPin size={9} /> {n.metadados.talhaoNome}
                      </div>
                    )}
                    <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)" }}>
                      {timeAgo(n.criadoEm)}
                    </div>
                  </div>

                  {/* Botão deletar */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeletar(n.id); }}
                    style={{
                      background: "transparent", border: "none", cursor: "pointer",
                      color: "rgba(255,255,255,0.15)", padding: "2px",
                      flexShrink: 0, display: "flex", alignItems: "center",
                      borderRadius: "4px", transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.15)"; }}
                  >
                    <X size={13} />
                  </button>

                  {/* Bolinha de não lida */}
                  {!n.lida && (
                    <div style={{
                      position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                      width: 5, height: 5, borderRadius: "50%", background: "#D4A853",
                      boxShadow: "0 0 6px #D4A85388",
                    }} />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "0.625rem 1.25rem",
        borderTop: "1px solid rgba(212,168,83,0.08)",
        textAlign: "center", flexShrink: 0,
      }}>
        <span style={{ fontSize: "0.72rem", color: "rgba(212,168,83,0.3)" }}>
          Atualiza a cada 15 segundos
        </span>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
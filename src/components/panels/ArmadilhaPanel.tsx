// src/components/panels/ArmadilhaPanel.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MapPin, Calendar, Camera, AlertCircle, CheckCircle,
  Edit, Trash2, Save, XCircle, Clock, Navigation,
} from "lucide-react";
import { useToast } from "../ui/Toast";

interface ArmadilhaPanelProps {
  armadilha: any | null;
  onClose: () => void;
}

export function ArmadilhaPanel({ armadilha, onClose }: ArmadilhaPanelProps) {
  const [activeTab, setActiveTab] = useState<"info" | "foto" | "historico">("info");
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ nome: "", observacao: "", ausencia: false });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const toast = useToast();

  React.useEffect(() => {
    if (armadilha) {
      setEditedData({
        nome: armadilha.nome || "",
        observacao: armadilha.observacao || "",
        ausencia: armadilha.ausencia || false,
      });
    }
  }, [armadilha]);

  if (!armadilha) return null;

  const fotoUrl   = armadilha.foto || null;
  const dataFoto  = armadilha.dataFoto  ? new Date(armadilha.dataFoto)  : null;
  const criadoEm  = armadilha.criadoEm  ? new Date(armadilha.criadoEm)  : null;

  const handleSave = async () => {
    if (!editedData.nome.trim()) {
      toast.warning("Campo obrigatório", "O nome do ponto de foto não pode estar vazio.");
      return;
    }
    setIsSaving(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
      const token   = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch(`${API_URL}/armadilhas/${armadilha.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ nome: editedData.nome, observacao: editedData.observacao, ausencia: editedData.ausencia }),
      });
      if (!res.ok) throw new Error();
      toast.success("Ponto atualizado!", "As alterações foram salvas com sucesso.");
      setIsEditing(false);
      window.dispatchEvent(new CustomEvent("armadilha:changed", { detail: { action: "updated", armadilha: { ...armadilha, ...editedData } } }));
      window.location.reload();
    } catch {
      toast.error("Erro ao atualizar", "Não foi possível salvar as alterações. Verifique o backend.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await toast.confirm({
      title: `Excluir "${armadilha.nome || "Ponto de Foto"}"?`,
      message: "Esta ação é irreversível. O ponto de foto será removido permanentemente.",
      confirmLabel: "Sim, excluir",
      cancelLabel: "Cancelar",
      danger: true,
    });
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
      const token   = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch(`${API_URL}/armadilhas/${armadilha.id}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error();
      toast.success("Ponto excluído", "O ponto de foto foi removido com sucesso.");
      onClose();
      window.dispatchEvent(new CustomEvent("armadilha:changed", { detail: { action: "deleted", armadilha } }));
      window.location.reload();
    } catch {
      toast.error("Erro ao excluir", "Não foi possível excluir o ponto de foto. Verifique o backend.");
      setIsDeleting(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditedData({ nome: armadilha.nome || "", observacao: armadilha.observacao || "", ausencia: armadilha.ausencia || false });
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%", outline: "none", fontFamily: "inherit",
    fontSize: "0.9rem", fontWeight: 500, color: "#2C1810",
    background: "white", boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
    borderRadius: "0.75rem", padding: "0.75rem 1rem",
    border: `2px solid ${focusedField === field ? "#8B4513" : "#f0e6dd"}`,
    boxShadow: focusedField === field ? "0 0 0 4px rgba(139,69,19,0.08)" : "none",
  });

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="arm-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 3999 }}
      />

      {/* Panel */}
      <motion.div
        key="arm-panel"
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

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", position: "relative" }}>
            <div style={{ flex: 1, paddingRight: "1rem" }}>
              <div style={{
                fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "rgba(212,168,83,0.55)", marginBottom: "0.4rem",
              }}>
                Ponto de Foto · #{armadilha.id}
              </div>

              {isEditing ? (
                <input
                  value={editedData.nome}
                  onChange={e => setEditedData(d => ({ ...d, nome: e.target.value }))}
                  onFocus={() => setFocusedField("nome-h")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Nome do ponto"
                  style={{
                    width: "100%", outline: "none", fontFamily: "inherit",
                    fontSize: "1.5rem", fontWeight: 700, color: "white",
                    background: "rgba(255,255,255,0.12)",
                    border: `2px solid ${focusedField === "nome-h" ? "rgba(212,168,83,0.6)" : "rgba(255,255,255,0.2)"}`,
                    borderRadius: "0.75rem", padding: "0.5rem 0.75rem",
                    marginBottom: "0.5rem", boxSizing: "border-box",
                    boxShadow: focusedField === "nome-h" ? "0 0 0 4px rgba(212,168,83,0.1)" : "none",
                    transition: "all 0.2s",
                  }}
                />
              ) : (
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem", lineHeight: 1.2 }}>
                  📸 {armadilha.nome || "Ponto de Foto"}
                </h2>
              )}

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <span style={{
                  fontSize: "0.75rem", background: "rgba(212,168,83,0.15)",
                  padding: "0.25rem 0.625rem", borderRadius: "0.5rem",
                  fontWeight: 600, color: "#D4A853",
                }}>
                  Talhão #{armadilha.talhaoId}
                </span>
              </div>
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

          {/* Status / ausência toggle */}
          {isEditing ? (
            <div
              onClick={() => setEditedData(d => ({ ...d, ausencia: !d.ausencia }))}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.625rem",
                padding: "0.5rem 1rem", borderRadius: "0.75rem", cursor: "pointer",
                background: editedData.ausencia ? "rgba(220,38,38,0.15)" : "rgba(139,69,19,0.15)",
                border: `1.5px solid ${editedData.ausencia ? "rgba(220,38,38,0.3)" : "rgba(139,69,19,0.3)"}`,
                transition: "all 0.2s",
              }}
            >
              {editedData.ausencia
                ? <AlertCircle size={16} style={{ color: "#fca5a5" }} />
                : <CheckCircle size={16} style={{ color: "#D4A853" }} />}
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: editedData.ausencia ? "#fca5a5" : "#D4A853" }}>
                {editedData.ausencia ? "Ausência (clique para alternar)" : "Com Foto (clique para alternar)"}
              </span>
            </div>
          ) : (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.625rem 1.125rem", borderRadius: "0.75rem",
              fontWeight: 700, fontSize: "0.875rem",
              background: armadilha.ausencia ? "#fee2e2" : "#fdf6f0",
              color: armadilha.ausencia ? "#991b1b" : "#4A2C2A",
              border: `2px solid ${armadilha.ausencia ? "#fca5a5" : "#D4A853"}`,
            }}>
              {armadilha.ausencia
                ? <><AlertCircle size={16} />Sem Foto / Ausência</>
                : <><CheckCircle size={16} />Foto Registrada</>}
            </div>
          )}
        </div>

        {/* ── TABS ── */}
        <div style={{ display: "flex", borderBottom: "2px solid #f0e6dd", background: "#fdf8f3", flexShrink: 0 }}>
          {[
            { id: "info",      label: "Informações", icon: MapPin  },
            { id: "foto",      label: "Foto",        icon: Camera  },
            { id: "historico", label: "Histórico",   icon: Clock   },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1, padding: "0.9rem 0.5rem",
                  background: active ? "white" : "transparent", border: "none",
                  borderBottom: `3px solid ${active ? "#8B4513" : "transparent"}`,
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

          {/* INFO TAB */}
          {activeTab === "info" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Observação */}
              <Section title="📝 Observação">
                {isEditing ? (
                  <textarea
                    value={editedData.observacao}
                    onChange={e => setEditedData(d => ({ ...d, observacao: e.target.value }))}
                    onFocus={() => setFocusedField("obs")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Digite suas observações…"
                    rows={4}
                    style={{
                      ...inputStyle("obs"),
                      resize: "vertical", minHeight: 90,
                      fontFamily: "inherit", lineHeight: 1.5,
                    }}
                  />
                ) : (
                  <p style={{ margin: 0, color: armadilha.observacao ? "#374151" : "#c9b5a8", lineHeight: 1.6, fontSize: "0.9rem", fontStyle: armadilha.observacao ? "normal" : "italic" }}>
                    {armadilha.observacao || "Nenhuma observação registrada."}
                  </p>
                )}
              </Section>

              {/* GPS */}
              <Section title="📍 Coordenadas GPS">
                <InfoRow icon={<Navigation size={15} style={{ color: "#C8860A" }} />} label="Latitude"  value={armadilha.latitude?.toFixed(6)  ?? "—"} />
                <InfoRow icon={<Navigation size={15} style={{ color: "#C8860A" }} />} label="Longitude" value={armadilha.longitude?.toFixed(6) ?? "—"} />
                <button
                  onClick={() => armadilha.latitude && window.open(`https://www.google.com/maps?q=${armadilha.latitude},${armadilha.longitude}`, "_blank")}
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

              {/* Datas */}
              <Section title="📅 Registro">
                {dataFoto && <InfoRow icon={<Camera size={15} style={{ color: "#C8860A" }} />} label="Foto capturada" value={dataFoto.toLocaleString("pt-BR")} />}
                {criadoEm  && <InfoRow icon={<Clock  size={15} style={{ color: "#C8860A" }} />} label="Ponto criado"   value={criadoEm.toLocaleString("pt-BR")}  />}
              </Section>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {isEditing ? (
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <ActionButton icon={<Save size={16} />}   label={isSaving ? "Salvando…" : "Salvar"} color="#8B4513" onClick={handleSave}   fullWidth loading={isSaving} />
                    <ActionButton icon={<XCircle size={16} />} label="Cancelar"                           color="#6b7280" onClick={cancelEdit}    fullWidth />
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <ActionButton icon={<Edit   size={16} />} label="Editar"                                 color="#3b82f6" onClick={() => setIsEditing(true)} />
                    <ActionButton icon={<Trash2 size={16} />} label={isDeleting ? "Excluindo…" : "Excluir"}  color="#ef4444" onClick={handleDelete} disabled={isDeleting} loading={isDeleting} />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* FOTO TAB */}
          {activeTab === "foto" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {fotoUrl ? (
                <>
                  <div
                    onClick={() => setPreviewImage(fotoUrl)}
                    style={{
                      width: "100%", height: 380, borderRadius: "0.875rem",
                      overflow: "hidden", border: "2px solid #f0e6dd",
                      cursor: "zoom-in", position: "relative",
                    }}
                  >
                    <img src={fotoUrl} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      background: "linear-gradient(transparent, rgba(0,0,0,0.65))",
                      padding: "2rem 1rem 1rem",
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      color: "white", fontSize: "0.85rem", fontWeight: 500,
                    }}>
                      <Camera size={15} /> Clique para ampliar
                    </div>
                  </div>
                  {dataFoto && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: "0.625rem",
                      padding: "0.875rem 1rem", background: "#fdf8f3",
                      borderRadius: "0.75rem", border: "1px solid #f0e6dd",
                      color: "#4A2C2A", fontSize: "0.875rem", fontWeight: 600,
                    }}>
                      <Calendar size={16} style={{ color: "#C8860A", flexShrink: 0 }} />
                      Capturada em {dataFoto.toLocaleString("pt-BR")}
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  height: 380, background: "#fdf8f3", borderRadius: "0.875rem",
                  border: "2px dashed #e8ddd5",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.875rem",
                }}>
                  <Camera size={56} style={{ color: "#c9b5a8" }} />
                  <p style={{ fontSize: "1rem", fontWeight: 600, color: "#9b8070", margin: 0 }}>Nenhuma foto disponível</p>
                  <p style={{ fontSize: "0.85rem", color: "#c9b5a8", margin: 0 }}>Aguardando captura de imagem</p>
                </div>
              )}
            </motion.div>
          )}

          {/* HISTÓRICO TAB */}
          {activeTab === "historico" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{
                textAlign: "center", padding: "2.5rem 2rem",
                background: "#fdf8f3", borderRadius: "0.875rem",
                border: "2px dashed #e8ddd5",
              }}>
                <Clock size={56} style={{ color: "#C8860A", margin: "0 auto 1rem" }} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2C1810", marginBottom: "0.5rem" }}>Histórico Completo</h3>
                <p style={{ color: "#9b8070", fontSize: "0.875rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>Linha do tempo de alterações e capturas em breve.</p>
                {[
                  "📸 Histórico de fotos",
                  "📝 Log de alterações",
                  "📊 Estatísticas de captura",
                  "🔔 Alertas e notificações",
                ].map(t => (
                  <div key={t} style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.5rem 0.75rem", background: "white",
                    borderRadius: "0.5rem", border: "1px solid #f0e6dd",
                    fontSize: "0.84rem", color: "#4A2C2A", fontWeight: 500,
                    marginBottom: "0.4rem", textAlign: "left",
                  }}>
                    {t}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Image preview */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 5000, padding: "2rem", cursor: "zoom-out",
            }}
          >
            <motion.img
              initial={{ scale: 0.88 }} animate={{ scale: 1 }} exit={{ scale: 0.88 }}
              src={previewImage} alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: "1rem", boxShadow: "0 32px 64px rgba(0,0,0,0.5)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

// ── Sub-components ────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: "0.875rem", border: "2px solid #f0e6dd", padding: "1.25rem" }}>
      <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#2C1810", margin: "0 0 0.875rem" }}>{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0.5rem 0.625rem", background: "#fdf8f3",
      borderRadius: "0.5rem", marginBottom: "0.4rem", gap: "0.75rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
        {icon}
        <span style={{ fontSize: "0.8rem", color: "#9b8070", fontWeight: 600 }}>{label}</span>
      </div>
      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#2C1810" }}>{value}</span>
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
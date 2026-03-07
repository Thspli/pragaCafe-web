// src/components/modals/NovoArmadilhaModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, MapPin, FileText, AlertCircle, CheckCircle, ZoomIn } from "lucide-react";
import { useToast } from "../ui/Toast";

interface NovoArmadilhaModalProps {
  open: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  talhaoId: number;
  talhaoNome?: string;
  onConfirm: (data: {
    nome: string;
    observacao?: string;
    dataFoto?: string | null;
    foto?: string | null;
    ausencia?: boolean;
    latitude: number;
    longitude: number;
    talhaoId: number;
    existingId?: number;
  }) => Promise<void> | void;
}

export function NovoArmadilhaModal({
  open, onClose, lat, lng, talhaoId, talhaoNome, onConfirm,
}: NovoArmadilhaModalProps) {
  const [nome, setNome] = useState("Ponto de Foto");
  const [observacao, setObservacao] = useState("");
  const [selectedFoto, setSelectedFoto] = useState<string | null>(null);
  const [ausencia, setAusencia] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fotosFromDb, setFotosFromDb] = useState<string[]>([]);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const toast = useToast();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

  useEffect(() => {
    if (!open) {
      setNome("Ponto de Foto");
      setObservacao("");
      setSelectedFoto(null);
      setAusencia(false);
      setFotosFromDb([]);
      setExistingId(null);
      setPreviewUrl(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const fetchFotos = async () => {
      setPhotosLoading(true);
      try {
        const params = new URLSearchParams();
        if (talhaoId) params.set("talhaoId", String(talhaoId));
        const res = await fetch(`${API_URL}/armadilhas?${params.toString()}`, {
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (!res.ok) { setFotosFromDb([]); return; }
        const items = await res.json();
        const uniqueItems = Array.from(new Map(items.map((i: any) => [i.id, i])).values()) as any[];

        const threshold = 0.0008;
        const nearest = uniqueItems.find(
          (it: any) => it.latitude != null && it.longitude != null &&
          Math.abs(it.latitude - lat) <= threshold && Math.abs(it.longitude - lng) <= threshold
        );

        if (nearest) {
          setExistingId(nearest.id);
          setNome(nearest.nome || "Ponto de Foto");
          setObservacao(nearest.observacao || "");
          setAusencia(nearest.ausencia || false);
          if (nearest.foto) { setFotosFromDb([nearest.foto]); setSelectedFoto(nearest.foto); }
          else { setFotosFromDb([]); setSelectedFoto(null); }
        } else {
          const fotos = uniqueItems.filter((x: any) => x.foto).map((x: any) => x.foto);
          setFotosFromDb(fotos);
          setSelectedFoto(fotos[0] ?? null);
        }
      } catch { setFotosFromDb([]); setSelectedFoto(null); }
      finally { setPhotosLoading(false); }
    };
    fetchFotos();
  }, [open, talhaoId, lat, lng, API_URL]);

  const handleSubmit = async () => {
    if (!nome.trim()) {
      toast.warning("Campo obrigatório", "O nome do ponto de foto é obrigatório.");
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        nome: nome.trim(), observacao: observacao || undefined,
        foto: selectedFoto || null, ausencia, latitude: lat, longitude: lng, talhaoId,
      };
      if (existingId) payload.existingId = existingId;
      await onConfirm(payload);
      onClose();
    } catch {
      toast.error("Erro ao salvar", "Não foi possível salvar o ponto de foto.");
    } finally { setLoading(false); }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    padding: "0.875rem 1rem",
    fontSize: "0.9rem", fontWeight: 500,
    background: "white",
    border: `2px solid ${focusedField === field ? "#8B4513" : "#e8ddd5"}`,
    borderRadius: "0.875rem",
    color: "#2C1810",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: focusedField === field ? "0 0 0 4px rgba(139,69,19,0.08)" : "none",
    boxSizing: "border-box",
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 3000,
            background: "rgba(10,5,2,0.75)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 28 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 520,
              borderRadius: "1.5rem",
              overflow: "hidden",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,83,0.15)",
              maxHeight: "90vh",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* ── HEADER ── */}
            <div style={{
              background: "linear-gradient(135deg, #1a0f0a 0%, #2C1810 60%, #3d1f12 100%)",
              padding: "1.75rem 2rem 1.625rem",
              position: "relative", overflow: "hidden",
              flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", top: -50, right: -30,
                width: 180, height: 180,
                background: "radial-gradient(circle, rgba(212,168,83,0.1) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
                <div>
                  <div style={{
                    fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em",
                    textTransform: "uppercase", color: "rgba(212,168,83,0.55)",
                    marginBottom: "0.4rem",
                  }}>
                    {existingId ? "Editar Registro" : "Novo Registro"}
                  </div>
                  <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                    Ponto de Foto
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <MapPin size={13} style={{ color: "rgba(212,168,83,0.6)" }} />
                    <span style={{ fontSize: "0.78rem", color: "rgba(212,168,83,0.55)", fontWeight: 500 }}>
                      {talhaoNome ?? `Talhão #${talhaoId}`} · {lat.toFixed(5)}, {lng.toFixed(5)}
                    </span>
                  </div>
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

              {existingId && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  marginTop: "1rem",
                  background: "rgba(200,134,10,0.15)",
                  border: "1px solid rgba(200,134,10,0.25)",
                  padding: "0.35rem 0.75rem", borderRadius: "0.5rem",
                  fontSize: "0.75rem", color: "#D4A853", fontWeight: 600,
                }}>
                  <AlertCircle size={12} />
                  Editando ponto existente (ID #{existingId})
                </div>
              )}
            </div>

            {/* ── BODY (scrollable) ── */}
            <div style={{ background: "#fdf8f3", padding: "1.75rem 2rem", overflowY: "auto", flex: 1 }}>

              {/* Nome */}
              <Field label="Nome" icon={<FileText size={11} style={{ color: "#8B4513" }} />}>
                <input
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  onFocus={() => setFocusedField("nome")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Ex: Ponto A - Setor Norte"
                  disabled={loading}
                  style={inputStyle("nome")}
                />
              </Field>

              {/* Observação */}
              <Field label="Observação" icon={<FileText size={11} style={{ color: "#8B4513" }} />} optional>
                <textarea
                  value={observacao}
                  onChange={e => setObservacao(e.target.value)}
                  onFocus={() => setFocusedField("obs")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Anotações sobre este ponto…"
                  disabled={loading}
                  rows={3}
                  style={{
                    ...inputStyle("obs"),
                    resize: "vertical", minHeight: 80,
                    fontFamily: "inherit", lineHeight: 1.5,
                  }}
                />
              </Field>

              {/* Fotos */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "#6b4c3a", marginBottom: "0.75rem",
                }}>
                  <Camera size={11} style={{ color: "#8B4513" }} />
                  Foto
                </label>

                {photosLoading ? (
                  <div style={{
                    height: 100, background: "white", borderRadius: "0.875rem",
                    border: "2px solid #e8ddd5",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      border: "2px solid #e8ddd5", borderTop: "2px solid #8B4513",
                      animation: "spin 0.8s linear infinite",
                    }} />
                    <span style={{ fontSize: "0.85rem", color: "#9ca3af", fontWeight: 500 }}>Carregando fotos…</span>
                  </div>
                ) : fotosFromDb.length === 0 ? (
                  <div style={{
                    padding: "1.25rem",
                    background: "white", borderRadius: "0.875rem",
                    border: "2px dashed #e8ddd5",
                    textAlign: "center",
                  }}>
                    <Camera size={32} style={{ color: "#c9b5a8", margin: "0 auto 0.5rem" }} />
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#9ca3af", fontWeight: 500 }}>
                      Nenhuma foto disponível neste talhão
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
                    {fotosFromDb.map((url, idx) => {
                      const isSelected = selectedFoto === url;
                      return (
                        <div
                          key={idx}
                          onClick={() => { setSelectedFoto(url); }}
                          style={{
                            position: "relative", width: 110, height: 82, cursor: "pointer",
                            borderRadius: "0.75rem", overflow: "hidden",
                            border: `2.5px solid ${isSelected ? "#8B4513" : "#e8ddd5"}`,
                            transition: "border-color 0.18s, transform 0.18s",
                            transform: isSelected ? "scale(1.03)" : "scale(1)",
                            boxShadow: isSelected ? "0 4px 16px rgba(139,69,19,0.25)" : "none",
                          }}
                        >
                          <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          {isSelected && (
                            <div style={{
                              position: "absolute", inset: 0,
                              background: "rgba(139,69,19,0.25)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <CheckCircle size={22} style={{ color: "white" }} />
                            </div>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); setPreviewUrl(url); }}
                            style={{
                              position: "absolute", top: 5, right: 5,
                              width: 24, height: 24,
                              background: "rgba(0,0,0,0.55)", border: "none",
                              borderRadius: "50%", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "white",
                            }}
                          >
                            <ZoomIn size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Ausência toggle */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "1rem 1.125rem",
                background: ausencia ? "rgba(220,38,38,0.06)" : "white",
                border: `2px solid ${ausencia ? "rgba(220,38,38,0.2)" : "#e8ddd5"}`,
                borderRadius: "0.875rem",
                transition: "all 0.2s",
                cursor: "pointer",
                marginBottom: "0.25rem",
              }}
                onClick={() => setAusencia(a => !a)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "0.625rem",
                    background: ausencia ? "rgba(220,38,38,0.1)" : "#fdf6f0",
                    border: `1.5px solid ${ausencia ? "rgba(220,38,38,0.25)" : "#e8ddd5"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <AlertCircle size={18} style={{ color: ausencia ? "#dc2626" : "#c9b5a8" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: ausencia ? "#dc2626" : "#2C1810" }}>
                      Marcar como Ausência
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 2 }}>
                      Sem broca detectada neste ponto
                    </div>
                  </div>
                </div>
                {/* Toggle pill */}
                <div style={{
                  width: 44, height: 24, borderRadius: 999,
                  background: ausencia ? "#dc2626" : "#e8ddd5",
                  position: "relative", transition: "background 0.2s", flexShrink: 0,
                }}>
                  <div style={{
                    position: "absolute", top: 3,
                    left: ausencia ? "calc(100% - 21px)" : 3,
                    width: 18, height: 18, borderRadius: "50%",
                    background: "white",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    transition: "left 0.2s",
                  }} />
                </div>
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div style={{
              background: "#fdf8f3",
              borderTop: "1px solid #ede4da",
              padding: "1.25rem 2rem 1.5rem",
              display: "flex", gap: "0.75rem",
              flexShrink: 0,
            }}>
              <button
                onClick={onClose}
                disabled={loading}
                style={{
                  flex: 1, padding: "0.9rem",
                  background: "white", border: "2px solid #e8ddd5",
                  borderRadius: "0.875rem", color: "#6b4c3a",
                  fontWeight: 600, fontSize: "0.9rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.18s", opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = "#c9b5a8"; e.currentTarget.style.background = "#f5ede6"; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8ddd5"; e.currentTarget.style.background = "white"; }}
              >
                Cancelar
              </button>
              <motion.button
                onClick={handleSubmit}
                disabled={loading}
                whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                style={{
                  flex: 2, padding: "0.9rem", border: "none", borderRadius: "0.875rem",
                  color: "white", fontWeight: 700, fontSize: "0.95rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  background: loading
                    ? "#c9b5a8"
                    : "linear-gradient(135deg, #3d1f12 0%, #8B4513 60%, #a05220 100%)",
                  boxShadow: loading ? "none" : "0 4px 16px rgba(139,69,19,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid #fff",
                      animation: "spin 0.8s linear infinite",
                    }} />
                    Salvando…
                  </>
                ) : (
                  existingId ? "Atualizar Ponto" : "Salvar Ponto"
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Image preview overlay */}
          <AnimatePresence>
            {previewUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewUrl(null)}
                style={{
                  position: "fixed", inset: 0, zIndex: 4000,
                  background: "rgba(0,0,0,0.9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "2rem", cursor: "zoom-out",
                }}
              >
                <motion.img
                  initial={{ scale: 0.88 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.88 }}
                  src={previewUrl}
                  alt="preview"
                  style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: "1rem", boxShadow: "0 32px 64px rgba(0,0,0,0.5)" }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, icon, optional, children }: {
  label: string; icon: React.ReactNode; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1.125rem" }}>
      <label style={{
        display: "flex", alignItems: "center", gap: "0.4rem",
        fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "#6b4c3a", marginBottom: "0.625rem",
      }}>
        {icon}
        {label}
        {optional && (
          <span style={{ fontSize: "0.65rem", color: "#c9b5a8", fontWeight: 500, letterSpacing: 0, textTransform: "none", marginLeft: 2 }}>
            (opcional)
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
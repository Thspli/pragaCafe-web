"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info" | "confirm";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ToastContextType {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  confirm: AlertTriangle,
};

const COLORS = {
  success: { bg: "#fdf6f0", border: "#8B4513", icon: "#8B4513", title: "#2C1810", bar: "#8B4513" },
  error:   { bg: "#fef2f2", border: "#ef4444", icon: "#ef4444", title: "#7f1d1d", bar: "#ef4444" },
  warning: { bg: "#fffbeb", border: "#C8860A", icon: "#C8860A", title: "#78350f", bar: "#C8860A" },
  info:    { bg: "#eff6ff", border: "#3b82f6", icon: "#3b82f6", title: "#1e3a5f", bar: "#3b82f6" },
  confirm: { bg: "#fffbeb", border: "#C8860A", icon: "#C8860A", title: "#78350f", bar: "#C8860A" },
};

// ─── Confirm Modal ────────────────────────────────────────────
interface ConfirmModalProps {
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ options, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 24 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "1.25rem",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 32px 64px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.04)",
          overflow: "hidden",
          border: `2px solid ${options.danger ? "#fca5a5" : "#D4A853"}`,
        }}
      >
        {/* Top bar */}
        <div style={{
          height: "5px",
          background: options.danger
            ? "linear-gradient(90deg, #ef4444, #dc2626)"
            : "linear-gradient(90deg, #4A2C2A, #8B4513, #C8860A)",
        }} />

        <div style={{ padding: "2rem" }}>
          {/* Icon + Title */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0,
              background: options.danger ? "#fee2e2" : "#fdf6f0",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `2px solid ${options.danger ? "#fca5a5" : "#D4A853"}`,
            }}>
              <AlertTriangle size={24} style={{ color: options.danger ? "#ef4444" : "#C8860A" }} />
            </div>
            <div>
              <h3 style={{
                margin: 0, fontSize: "1.15rem", fontWeight: 700,
                color: options.danger ? "#7f1d1d" : "#2C1810", lineHeight: 1.3,
              }}>
                {options.title}
              </h3>
              {options.message && (
                <p style={{
                  margin: "0.5rem 0 0", fontSize: "0.9rem", color: "#6b7280",
                  lineHeight: 1.6,
                }}>
                  {options.message}
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1, padding: "0.875rem", borderRadius: "0.75rem",
                background: "white", border: "2px solid #e5e7eb",
                color: "#374151", fontWeight: 600, fontSize: "0.9rem",
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "white"; }}
            >
              {options.cancelLabel ?? "Cancelar"}
            </button>
            <button
              onClick={onConfirm}
              style={{
                flex: 1, padding: "0.875rem", borderRadius: "0.75rem", border: "none",
                background: options.danger
                  ? "linear-gradient(135deg, #dc2626, #ef4444)"
                  : "linear-gradient(135deg, #4A2C2A, #8B4513)",
                color: "white", fontWeight: 700, fontSize: "0.9rem",
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: options.danger
                  ? "0 4px 12px rgba(239,68,68,0.35)"
                  : "0 4px 12px rgba(139,69,19,0.35)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {options.confirmLabel ?? "Confirmar"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Single Toast ──────────────────────────────────────────────
function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const Icon = ICONS[toast.type];
  const c = COLORS[toast.type];
  const duration = toast.duration ?? 4000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      style={{
        background: c.bg,
        border: `2px solid ${c.border}`,
        borderRadius: "1rem",
        padding: "1rem 1.25rem",
        width: "320px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "3px", background: c.bar,
          transformOrigin: "left",
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0,
          background: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1.5px solid ${c.border}`,
          boxShadow: `0 2px 6px ${c.border}22`,
        }}>
          <Icon size={18} style={{ color: c.icon }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: c.title, lineHeight: 1.3 }}>
            {toast.title}
          </p>
          {toast.message && (
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "#6b7280", lineHeight: 1.5 }}>
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: "#9ca3af", padding: "2px", flexShrink: 0,
            display: "flex", alignItems: "center",
            borderRadius: "4px", transition: "color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#374151"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; }}
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Provider ─────────────────────────────────────────────────
interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (v: boolean) => void;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const counterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, title, message, duration }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const ctx: ToastContextType = {
    success: (t, m) => addToast("success", t, m),
    error:   (t, m) => addToast("error",   t, m, 5000),
    warning: (t, m) => addToast("warning", t, m),
    info:    (t, m) => addToast("info",    t, m),
    confirm: (options) =>
      new Promise<boolean>((resolve) => {
        setPendingConfirm({ options, resolve });
      }),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Toast stack */}
      <div style={{
        position: "fixed", bottom: "1.5rem", right: "1.5rem",
        zIndex: 9999, display: "flex", flexDirection: "column", gap: "0.625rem",
        pointerEvents: "none",
      }}>
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} style={{ pointerEvents: "auto" }}>
              <ToastCard toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {pendingConfirm && (
          <ConfirmModal
            options={pendingConfirm.options}
            onConfirm={() => { pendingConfirm.resolve(true);  setPendingConfirm(null); }}
            onCancel={()  => { pendingConfirm.resolve(false); setPendingConfirm(null); }}
          />
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}
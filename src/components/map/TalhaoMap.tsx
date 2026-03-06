// src/components/map/TalhaoMap.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Talhao } from "../../hooks/useTalhoes";
import { useToast } from "../ui/Toast";

export interface TempPolygon {
  boundary: [number, number][];
  center: [number, number];
  area: number;
}

interface TalhaoMapProps {
  talhoes: Talhao[];
  onPolygonCreated: (poly: TempPolygon) => void;
  onTalhaoClick?: (talhao: Talhao) => void;
  onAddArmadilha?: (lat: number, lng: number, talhaoId?: number | null) => void;
  onArmadilhaClick?: (armadilha: any) => void;
}

export function TalhaoMap({
  talhoes,
  onPolygonCreated,
  onTalhaoClick,
  onAddArmadilha,
  onArmadilhaClick,
}: TalhaoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [addingArmadilha, setAddingArmadilha] = useState(false);
  const addingArmadilhaRef = useRef(false);
  const setAddingArmadilhaSync = (val: boolean) => {
    addingArmadilhaRef.current = val;
    setAddingArmadilha(val);
  };
  const armadilhaLayersRef = useRef<Map<number, any[]>>(new Map());
  const [armadilhaCountsByTalhao, setArmadilhaCountsByTalhao] = useState<Map<number, number>>(new Map());
  const toast = useToast();

  // 1. Carrega scripts Leaflet
  useEffect(() => {
    if ((window as any).L) { setScriptsLoaded(true); return; }

    const leafletCss = document.createElement("link");
    leafletCss.rel = "stylesheet";
    leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    leafletCss.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    leafletCss.crossOrigin = "";
    document.head.appendChild(leafletCss);

    const drawCss = document.createElement("link");
    drawCss.rel = "stylesheet";
    drawCss.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css";
    document.head.appendChild(drawCss);

    const leafletJs = document.createElement("script");
    leafletJs.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    leafletJs.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    leafletJs.crossOrigin = "";
    leafletJs.onload = () => {
      const drawJs = document.createElement("script");
      drawJs.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js";
      drawJs.onload = () => setScriptsLoaded(true);
      document.body.appendChild(drawJs);
    };
    document.body.appendChild(leafletJs);

    if (!document.getElementById("armadilha-marker-styles")) {
      const style = document.createElement("style");
      style.id = "armadilha-marker-styles";
      style.innerHTML = `
        .armadilha-bounce { animation: armadilha-pop 600ms cubic-bezier(.2,.8,.2,1); transform-origin: center bottom; }
        @keyframes armadilha-pop {
          0%   { transform: scale(0) translateY(20px); opacity: 0 }
          60%  { transform: scale(1.15) translateY(-5px); opacity: 1 }
          100% { transform: scale(1) translateY(0); opacity: 1 }
        }
        .armadilha-marker-container { filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); transition: all 0.2s ease; }
        .armadilha-marker-container:hover { filter: drop-shadow(0 6px 12px rgba(0,0,0,0.4)); transform: translateY(-2px); }
      `;
      document.head.appendChild(style);
    }

    return () => {
      if (document.head.contains(leafletCss)) document.head.removeChild(leafletCss);
      if (document.head.contains(drawCss)) document.head.removeChild(drawCss);
    };
  }, []);

  // 2. Inicializa mapa
  useEffect(() => {
    if (!scriptsLoaded || !mapContainerRef.current || mapInstanceRef.current) return;
    const L = (window as any).L;
    const map = L.map(mapContainerRef.current, { center: [-22.028, -50.044], zoom: 15, zoomControl: true });
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles © Esri", maxZoom: 19,
    }).addTo(map);
    const drawnItems = L.featureGroup().addTo(map);
    mapInstanceRef.current = { map, drawnItems, layers: [] };
    setTimeout(() => { map.invalidateSize(); setMapInitialized(true); }, 500);
    return () => { if (map) map.remove(); };
  }, [scriptsLoaded]);

  // 3. Sistema de desenho
  useEffect(() => {
    if (!mapInitialized || !mapInstanceRef.current) return;
    const L = (window as any).L;
    const { map, drawnItems } = mapInstanceRef.current;
    const drawControl = new L.Control.Draw({
      position: "topleft",
      draw: {
        polygon: drawing, rectangle: false, polyline: false,
        circle: false, marker: false, circlemarker: false,
      },
      edit: { featureGroup: drawnItems, edit: false, remove: false },
    });
    map.addControl(drawControl);
    const onCreated = (e: any) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      const latlngs = layer.getLatLngs()[0];
      const boundary: [number, number][] = latlngs.map((p: any) => [p.lat, p.lng]);
      const centerLatLng = layer.getBounds().getCenter();
      const center: [number, number] = [centerLatLng.lat, centerLatLng.lng];
      const area = L.GeometryUtil.geodesicArea(latlngs) / 10000;
      onPolygonCreated({ boundary, center, area });
      setDrawing(false);
      drawnItems.clearLayers();
    };
    map.on(L.Draw.Event.CREATED, onCreated);
    return () => { map.off(L.Draw.Event.CREATED, onCreated); map.removeControl(drawControl); };
  }, [mapInitialized, drawing, onPolygonCreated]);

  // 3b. Modo adicionar armadilha
  useEffect(() => {
    if (!mapInitialized || !mapInstanceRef.current) return;
    const { map } = mapInstanceRef.current;

    const pointInPolygon = (point: [number, number], vs: [number, number][]) => {
      const x = point[0], y = point[1];
      let inside = false;
      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1], xj = vs[j][0], yj = vs[j][1];
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    };

    const onMapClick = (e: any) => {
      const lat = e.latlng?.lat, lng = e.latlng?.lng;
      if (lat == null || lng == null) return;
      let foundTalhaoId: number | null = null;
      try {
        for (const t of talhoes) {
          if (!t.boundary?.length) continue;
          if (pointInPolygon([lat, lng], t.boundary)) { foundTalhaoId = t.id; break; }
        }
      } catch {}
      if (!foundTalhaoId) {
        toast.warning("Fora do talhão", "Clique dentro de um talhão para adicionar o ponto de foto.");
        setAddingArmadilhaSync(false);
        return;
      }
      if (typeof onAddArmadilha === "function") onAddArmadilha(lat, lng, foundTalhaoId);
      setAddingArmadilhaSync(false);
    };

    if (addingArmadilha) {
      map.getContainer().style.cursor = "crosshair";
      map.on("click", onMapClick);
    }
    return () => {
      try { map.getContainer().style.cursor = ""; map.off("click", onMapClick); } catch {}
    };
  }, [mapInitialized, addingArmadilha, talhoes, onAddArmadilha, toast]);

  const fetchAndRenderArmadilhasForTalhao = useCallback(async (talhaoId: number) => {
    if (!mapInstanceRef.current) return 0;
    const { map } = mapInstanceRef.current;
    const L = (window as any).L;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const oldLayers = armadilhaLayersRef.current.get(talhaoId) || [];
      oldLayers.forEach(l => { try { map.removeLayer(l); } catch {} });
      armadilhaLayersRef.current.set(talhaoId, []);
      const params = new URLSearchParams();
      params.set("talhaoId", String(talhaoId));
      const res = await fetch(`${API_URL}/armadilhas?${params.toString()}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) return 0;
      const armadilhas = await res.json();
      const unique = Array.from(new Map(armadilhas.map((a: any) => [a.id, a])).values());
      const newLayers: any[] = [];
      unique.forEach((a: any) => {
        if (a.latitude == null || a.longitude == null) return;
        const isAusencia = a.ausencia || false;
        const svg = `
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="armadilha-marker-container">
            <ellipse cx="16" cy="37" rx="8" ry="2" fill="rgba(0,0,0,0.2)"/>
            <path d="M16 2C10.477 2 6 6.477 6 12C6 18.5 16 36 16 36C16 36 26 18.5 26 12C26 6.477 21.523 2 16 2Z"
                  fill="${isAusencia ? "#94a3b8" : "#C8860A"}" stroke="#ffffff" stroke-width="2"/>
            ${isAusencia
              ? `<line x1="12" y1="10" x2="20" y2="18" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
                 <line x1="20" y1="10" x2="12" y2="18" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>`
              : `<rect x="12" y="9" width="8" height="10" rx="1" fill="#ffffff" opacity="0.9"/>
                 <circle cx="16" cy="14" r="2.5" fill="#C8860A"/>
                 <line x1="16" y1="8" x2="16" y2="11" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>`
            }
          </svg>`;
        const aIcon = L.divIcon({ html: svg, className: "armadilha-icon", iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -40] });
        const amarker = L.marker([a.latitude, a.longitude], { icon: aIcon }).addTo(map);
        amarker.bindPopup(`
          <div style="min-width:180px;font-family:system-ui,sans-serif">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <div style="width:10px;height:10px;border-radius:50%;background:${isAusencia ? "#94a3b8" : "#C8860A"}"></div>
              <strong style="font-size:14px;color:#2C1810">${a.nome || "Ponto de Foto"}</strong>
            </div>
            ${a.observacao ? `<div style="font-size:12px;color:#444;margin-bottom:6px">${a.observacao}</div>` : ""}
            <div style="font-size:11px;color:#666;display:flex;flex-direction:column;gap:4px;padding-top:6px;border-top:1px solid #e5e7eb">
              <div><strong>Status:</strong> ${isAusencia ? "❌ Ausência" : "✅ Ativa"}</div>
              <div><strong>ID:</strong> #${a.id}</div>
            </div>
          </div>`);
        if (typeof onArmadilhaClick === "function") {
          try { amarker.on("click", () => onArmadilhaClick(a)); } catch {}
        }
        try {
          const el = (amarker as any).getElement?.();
          if (el?.classList) el.classList.add("armadilha-bounce");
        } catch {}
        newLayers.push(amarker);
      });
      armadilhaLayersRef.current.set(talhaoId, newLayers);
      return newLayers.length;
    } catch { return 0; }
  }, [onArmadilhaClick]);

  // 4. Renderiza talhões
  useEffect(() => {
    if (!mapInitialized || !mapInstanceRef.current) return;
    const L = (window as any).L;
    const { map, layers } = mapInstanceRef.current;
    layers.forEach((l: any) => { try { map.removeLayer(l); } catch {} });
    mapInstanceRef.current.layers = [];
    if (!talhoes.length) return;

    (async () => {
      const newCounts = new Map<number, number>();
      for (const talhao of talhoes) {
        const count = await fetchAndRenderArmadilhasForTalhao(talhao.id);
        newCounts.set(talhao.id, count);
      }
      setArmadilhaCountsByTalhao(newCounts);

      talhoes.forEach(talhao => {
        if (!talhao.boundary?.length || !talhao.center) return;
        const color = getStatusColor(talhao.status);
        const realCount = newCounts.get(talhao.id) || 0;
        const polygon = L.polygon(talhao.boundary, { color, fillColor: color, fillOpacity: 0.4, weight: 2 }).addTo(map);
        if (onTalhaoClick) polygon.on("click", (e: any) => {
          if (addingArmadilhaRef.current) return;
          L.DomEvent.stopPropagation(e);
          onTalhaoClick(talhao);
        });
        mapInstanceRef.current.layers.push(polygon);

        const labelHtml = `
          <div style="border:2px solid ${color};background:rgba(255,255,255,0.95);padding:6px 10px;border-radius:6px;font-size:11px;font-weight:600;text-align:center;box-shadow:0 2px 4px rgba(0,0,0,0.12);white-space:nowrap;">
            <div style="color:#2C1810;font-weight:700;">${talhao.nome}</div>
            <div style="display:flex;gap:8px;align-items:center;justify-content:center;font-size:11px;color:#374151;margin-top:4px;">
              <div>${talhao.totalPragas ?? 0} brocas</div>
              <div style="background:#fdf6f0;border:1px solid #D4A853;padding:3px 8px;border-radius:999px;font-weight:700;color:#4A2C2A;font-size:11px;">${realCount} 📸</div>
            </div>
          </div>`;
        const labelIcon = L.divIcon({ className: "talhao-label", html: labelHtml, iconSize: [120, 45], iconAnchor: [60, 22] });
        const marker = L.marker(talhao.center, { icon: labelIcon, interactive: false }).addTo(map);
        mapInstanceRef.current.layers.push(marker);
      });

      const ultimo = talhoes[talhoes.length - 1];
      const hasValidCenter = (() => {
        if (!ultimo?.center) return false;
        const c: any = ultimo.center;
        return Array.isArray(c) ? c.length === 2 && c[0] != null && c[1] != null : c && typeof c.lat === "number";
      })();
      if (hasValidCenter) { try { mapInstanceRef.current.map.setView(ultimo.center, 17, { animate: true }); } catch {} }
    })();
  }, [mapInitialized, talhoes, onTalhaoClick, fetchAndRenderArmadilhasForTalhao]);

  // Event listener mudanças armadilhas
  useEffect(() => {
    const onArmadilhaChanged = async (ev: any) => {
      const detail = ev?.detail;
      if (!detail) {
        const newCounts = new Map<number, number>();
        for (const t of talhoes) { const count = await fetchAndRenderArmadilhasForTalhao(t.id); newCounts.set(t.id, count); }
        setArmadilhaCountsByTalhao(newCounts);
        return;
      }
      const talhaoId = detail.armadilha?.talhaoId || detail.talhaoId;
      if (talhaoId) {
        const count = await fetchAndRenderArmadilhasForTalhao(talhaoId);
        setArmadilhaCountsByTalhao(prev => { const m = new Map(prev); m.set(talhaoId, count); return m; });
      }
    };
    window.addEventListener("armadilha:changed", onArmadilhaChanged as any);
    return () => window.removeEventListener("armadilha:changed", onArmadilhaChanged as any);
  }, [talhoes, fetchAndRenderArmadilhasForTalhao]);

  useEffect(() => {
    return () => {
      armadilhaLayersRef.current.forEach(layers => {
        layers.forEach(l => { try { mapInstanceRef.current?.map?.removeLayer(l); } catch {} });
      });
      armadilhaLayersRef.current.clear();
    };
  }, []);

  const getStatusColor = (status: string | null): string => {
    switch (status) {
      case "baixo":   return "#8B4513";
      case "medio":   return "#C8860A";
      case "alto":    return "#D4A853";
      case "critico": return "#dc2626";
      default:        return "#6b7280";
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>

      {/* ── TOOLBAR FLUTUANTE ─────────────────────────────── */}
      <div style={{
        position: "absolute",
        bottom: "1.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        background: "rgba(26, 15, 10, 0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(212,168,83,0.25)",
        borderRadius: "9999px",
        padding: "0.75rem 1.125rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(212,168,83,0.08) inset",
      }}>

        {/* Status indicator */}
        {mapInitialized && (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            paddingRight: "0.625rem",
            borderRight: "1px solid rgba(212,168,83,0.2)",
            marginRight: "0.125rem",
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 6px #22c55e",
            }} />
            <span style={{ fontSize: "0.82rem", color: "rgba(212,168,83,0.8)", fontWeight: 600, letterSpacing: "0.04em" }}>
              {talhoes.length} talhão{talhoes.length !== 1 ? "ões" : ""}
            </span>
          </div>
        )}

        {/* Botão: Novo talhão */}
        <MapToolButton
          active={drawing}
          disabled={!mapInitialized}
          onClick={() => setDrawing(d => !d)}
          label={drawing ? "Cancelar" : "Novo Talhão"}
          emoji={drawing ? "✕" : "✏️"}
          activeColor="rgba(220,38,38,0.85)"
          tooltip={drawing ? "Cancelar desenho" : "Desenhar novo talhão"}
        />

        <div style={{ width: 1, height: 24, background: "rgba(212,168,83,0.15)" }} />

        {/* Botão: Ponto de foto */}
        <MapToolButton
          active={addingArmadilha}
          disabled={!mapInitialized}
          onClick={() => setAddingArmadilhaSync(!addingArmadilhaRef.current)}
          label={addingArmadilha ? "Cancelar" : "Ponto de Foto"}
          emoji={addingArmadilha ? "✕" : "📸"}
          activeColor="rgba(220,38,38,0.85)"
          tooltip={addingArmadilha ? "Cancelar" : "Adicionar ponto de foto"}
        />

        {/* Loading */}
        {!mapInitialized && (
          <>
            <div style={{ width: 1, height: 24, background: "rgba(212,168,83,0.15)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0 0.25rem" }}>
              <div style={{
                width: 14, height: 14,
                border: "2px solid rgba(212,168,83,0.2)",
                borderTop: "2px solid #D4A853",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              <span style={{ fontSize: "0.72rem", color: "rgba(212,168,83,0.6)", fontWeight: 500 }}>
                Carregando…
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── MAP CONTAINER ─────────────────────────────────── */}
      <div
        ref={mapContainerRef}
        style={{ flex: 1, width: "100%", height: "100%", background: "#d4d4d4", position: "relative" }}
      >
        {!mapInitialized && (
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)", zIndex: 1000,
            background: "rgba(26,15,10,0.92)", backdropFilter: "blur(12px)",
            padding: "1.75rem 2.25rem", borderRadius: "1rem",
            border: "1px solid rgba(212,168,83,0.25)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
            textAlign: "center",
          }}>
            <div style={{
              width: 40, height: 40,
              border: "3px solid rgba(212,168,83,0.15)",
              borderTop: "3px solid #D4A853",
              borderRadius: "50%",
              margin: "0 auto 1rem",
              animation: "spin 1s linear infinite",
            }} />
            <p style={{ color: "#D4A853", fontWeight: 600, margin: 0, fontSize: "0.9rem" }}>
              🛰️ Carregando mapa satélite…
            </p>
            <p style={{ color: "rgba(212,168,83,0.45)", fontWeight: 400, margin: "0.25rem 0 0", fontSize: "0.75rem" }}>
              Aguarde um momento
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── MapToolButton ────────────────────────────────────────────────
function MapToolButton({
  active,
  disabled,
  onClick,
  label,
  emoji,
  activeColor,
  tooltip,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  label: string;
  emoji: string;
  activeColor: string;
  tooltip: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "0.4rem",
        padding: "0.6rem 1.25rem",
        borderRadius: "9999px",
        border: active
          ? `1px solid ${activeColor}`
          : `1px solid ${hovered ? "rgba(212,168,83,0.4)" : "rgba(212,168,83,0.15)"}`,
        background: active
          ? activeColor
          : hovered
          ? "rgba(212,168,83,0.12)"
          : "transparent",
        color: active ? "#fff" : hovered ? "#D4A853" : "rgba(255,255,255,0.75)",
        fontSize: "0.9rem",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.18s ease",
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: "1rem" }}>{emoji}</span>
      {label}
    </button>
  );
}
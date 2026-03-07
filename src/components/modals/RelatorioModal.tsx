// src/components/modals/RelatorioModal.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, FileText, Download, Coffee, MapPin, Camera,
  CheckCircle, AlertTriangle, Loader, FileSpreadsheet,
  BarChart3, Calendar, Layers,
} from "lucide-react";

// ── Tipos ─────────────────────────────────────────────────────────
interface Talhao {
  id: number;
  nome: string;
  area: number | null;
  status: string | null;
  totalPragas: number | null;
  armadilhasAtivas: number | null;
  center: [number, number] | null;
  ultimaColeta: string | null;
}

interface Armadilha {
  id: number;
  nome: string;
  observacao?: string;
  foto?: string;
  dataFoto?: string;
  latitude: number;
  longitude: number;
  talhaoId: number;
  criadoEm?: string;
}

interface RelatorioModalProps {
  open: boolean;
  onClose: () => void;
  talhoes: Talhao[];
}

type TipoRelatorio = "executivo" | "pontos" | "completo";
type FormatoRelatorio = "pdf" | "excel" | "csv";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

// ── Helpers ───────────────────────────────────────────────────────
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
}

function statusLabel(s: string | null) {
  const m: Record<string, string> = {
    baixo: "Baixa Infestação", medio: "Média Infestação",
    alto: "Alta Infestação", critico: "Crítica",
  };
  return m[s ?? ""] ?? "—";
}

function fmtDate(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("pt-BR");
}

function fmtDateTime(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "—" : dt.toLocaleString("pt-BR");
}

async function fetchArmadilhasDeTalhao(talhaoId: number): Promise<Armadilha[]> {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/armadilhas?talhaoId=${talhaoId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return [];
    const data = await res.json();
    const unique = Array.from(new Map(data.map((a: any) => [a.id, a])).values()) as Armadilha[];
    return unique.filter(a => a.latitude != null && a.longitude != null);
  } catch { return []; }
}

// ── Carrega jsPDF dinamicamente ───────────────────────────────────
async function loadJsPDF(): Promise<any> {
  if ((window as any).jspdf?.jsPDF) return (window as any).jspdf.jsPDF;
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => {
      const autoTableScript = document.createElement("script");
      autoTableScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";
      autoTableScript.onload = () => resolve((window as any).jspdf.jsPDF);
      autoTableScript.onerror = reject;
      document.head.appendChild(autoTableScript);
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── Carrega SheetJS dinamicamente ─────────────────────────────────
async function loadXLSX(): Promise<any> {
  if ((window as any).XLSX) return (window as any).XLSX;
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = () => resolve((window as any).XLSX);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ─────────────────────────────────────────────────────────────────
// GERAÇÃO DE PDF
// ─────────────────────────────────────────────────────────────────
async function gerarPDF(
  tipo: TipoRelatorio,
  talhoes: Talhao[],
  armadilhasPorTalhao: Map<number, Armadilha[]>,
  selectedIds: number[],
) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const selecionados = talhoes.filter(t => selectedIds.includes(t.id));
  const W = 210, margem = 16;
  const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  // ── Cores tema café ──
  const CAFE    = [44,  24,  16];
  const CARAMEL = [200, 134, 10];
  const GOLD    = [212, 168, 83];
  const LIGHT   = [253, 246, 240];
  const WHITE   = [255, 255, 255];
  const GRAY    = [107, 114, 128];
  const RED_ERR = [239, 68,  68];

  // ── Totais gerais ──
  const totalPontos = Array.from(armadilhasPorTalhao.values()).reduce((s, a) => s + a.length, 0);
  const totalBrocas = selecionados.reduce((s, t) => s + (t.totalPragas ?? 0), 0);
  const totalArea   = selecionados.reduce((s, t) => s + (t.area ?? 0), 0);

  // ── Função: cabeçalho de página ──
  const addHeader = (pageTitle: string, pageNum?: string) => {
    // Faixa superior
    doc.setFillColor(...CAFE as [number,number,number]);
    doc.rect(0, 0, W, 22, "F");
    // Gradiente simulado com retângulo caramel
    doc.setFillColor(...CARAMEL as [number,number,number]);
    doc.rect(W - 50, 0, 50, 22, "F");

    // Logo / nome
    doc.setTextColor(...WHITE as [number,number,number]);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("☕  Fazenda Café", margem, 14);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GOLD as [number,number,number]);
    doc.text("Sistema de Monitoramento Agrícola", margem, 19);

    // Título do relatório (direita)
    doc.setTextColor(...WHITE as [number,number,number]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(pageTitle, W - margem, 10, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(hoje, W - margem, 16, { align: "right" });
    if (pageNum) doc.text(pageNum, W - margem, 20, { align: "right" });

    // Linha dourada
    doc.setDrawColor(...GOLD as [number,number,number]);
    doc.setLineWidth(0.5);
    doc.line(0, 22, W, 22);
  };

  // ── Função: rodapé ──
  const addFooter = () => {
    const y = 292;
    doc.setDrawColor(...GOLD as [number,number,number]);
    doc.setLineWidth(0.3);
    doc.line(margem, y - 2, W - margem, y - 2);
    doc.setTextColor(...GRAY as [number,number,number]);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Fazenda Café — Sistema de Monitoramento GPS", margem, y + 2);
    doc.text(`Gerado em ${hoje}`, W - margem, y + 2, { align: "right" });
  };

  // ────────────────────────────────────────
  // PÁGINA 1: CAPA / RESUMO EXECUTIVO
  // ────────────────────────────────────────
  let tituloDoc = tipo === "executivo" ? "Relatório Executivo"
    : tipo === "pontos" ? "Relatório de Pontos de Foto"
    : "Relatório Completo";

  addHeader(tituloDoc);

  // Bloco título central
  doc.setFillColor(...LIGHT as [number,number,number]);
  doc.roundedRect(margem, 28, W - margem * 2, 28, 3, 3, "F");
  doc.setDrawColor(...GOLD as [number,number,number]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margem, 28, W - margem * 2, 28, 3, 3, "S");

  doc.setTextColor(...CAFE as [number,number,number]);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(tituloDoc, W / 2, 40, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY as [number,number,number]);
  doc.text(`${selecionados.length} talhão(ões) selecionado(s)  •  Período: ${hoje}`, W / 2, 50, { align: "center" });

  // Cards KPI
  const kpiY = 62;
  const kpiW = (W - margem * 2 - 9) / 4;
  const kpis = [
    { label: "Talhões",     value: String(selecionados.length), icon: "📋", color: CAFE    },
    { label: "Pontos Foto", value: String(totalPontos),         icon: "📸", color: CARAMEL },
    { label: "Brocas",      value: String(totalBrocas),         icon: "🐛", color: [180, 40, 40] as [number,number,number] },
    { label: "Área Total",  value: `${totalArea.toFixed(1)} ha`,icon: "🗺️", color: [37, 99, 235] as [number,number,number] },
  ];

  kpis.forEach((k, i) => {
    const x = margem + i * (kpiW + 3);
    doc.setFillColor(...WHITE as [number,number,number]);
    doc.roundedRect(x, kpiY, kpiW, 22, 2, 2, "F");
    doc.setDrawColor(...k.color as [number,number,number]);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, kpiY, kpiW, 22, 2, 2, "S");
    // Barra colorida topo
    doc.setFillColor(...k.color as [number,number,number]);
    doc.roundedRect(x, kpiY, kpiW, 4, 2, 2, "F");
    doc.rect(x, kpiY + 2, kpiW, 2, "F");

    doc.setTextColor(...k.color as [number,number,number]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(k.value, x + kpiW / 2, kpiY + 14, { align: "center" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY as [number,number,number]);
    doc.text(k.label, x + kpiW / 2, kpiY + 20, { align: "center" });
  });

  // Tabela resumo de talhões
  let curY = kpiY + 28;
  doc.setTextColor(...CAFE as [number,number,number]);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo dos Talhões", margem, curY);
  curY += 4;

  const talhaoRows = selecionados.map(t => {
    const arm = armadilhasPorTalhao.get(t.id) || [];
    return [
      t.nome,
      `${(t.area ?? 0).toFixed(2)} ha`,
      statusLabel(t.status),
      String(t.totalPragas ?? 0),
      String(arm.length),
      fmtDate(t.ultimaColeta),
    ];
  });

  (doc as any).autoTable({
    startY: curY,
    head: [["Talhão", "Área", "Status Infest.", "Brocas", "Pts. Foto", "Últ. Coleta"]],
    body: talhaoRows,
    theme: "grid",
    headStyles: {
      fillColor: CAFE, textColor: WHITE, fontStyle: "bold",
      fontSize: 8, halign: "center",
    },
    bodyStyles: { fontSize: 8, textColor: [30, 20, 15] },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
      5: { halign: "center" },
    },
    margin: { left: margem, right: margem },
    didDrawPage: () => addFooter(),
  });

  // ────────────────────────────────────────
  // PÁGINAS POR TALHÃO (para tipos "pontos" e "completo")
  // ────────────────────────────────────────
  if (tipo === "pontos" || tipo === "completo") {
    for (const talhao of selecionados) {
      const arm = armadilhasPorTalhao.get(talhao.id) || [];
      if (arm.length === 0 && tipo === "pontos") continue;

      doc.addPage();
      addHeader(`${talhao.nome} — Detalhes`);
      addFooter();

      let y = 28;

      // Info do talhão
      doc.setFillColor(...LIGHT as [number,number,number]);
      doc.roundedRect(margem, y, W - margem * 2, 24, 2, 2, "F");
      doc.setDrawColor(...GOLD as [number,number,number]);
      doc.setLineWidth(0.3);
      doc.roundedRect(margem, y, W - margem * 2, 24, 2, 2, "S");

      doc.setTextColor(...CAFE as [number,number,number]);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(`☕  ${talhao.nome}`, margem + 4, y + 9);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY as [number,number,number]);
      const infoLine = [
        `Área: ${(talhao.area ?? 0).toFixed(2)} ha`,
        `Status: ${statusLabel(talhao.status)}`,
        `Brocas: ${talhao.totalPragas ?? 0}`,
        `Pontos de Foto: ${arm.length}`,
        talhao.ultimaColeta ? `Últ. Coleta: ${fmtDate(talhao.ultimaColeta)}` : "",
      ].filter(Boolean).join("   •   ");
      doc.text(infoLine, margem + 4, y + 18);
      y += 30;

      if (arm.length === 0) {
        doc.setFillColor(254, 242, 242);
        doc.roundedRect(margem, y, W - margem * 2, 14, 2, 2, "F");
        doc.setTextColor(...RED_ERR as [number,number,number]);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Nenhum ponto de foto cadastrado neste talhão.", W / 2, y + 9, { align: "center" });
        continue;
      }

      // Tabela pontos
      doc.setTextColor(...CAFE as [number,number,number]);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`Pontos de Foto  (${arm.length} registros)`, margem, y);
      y += 3;

      const armRows = arm.map((a, idx) => [
        String(idx + 1),
        a.nome || "Ponto de Foto",
        a.observacao?.slice(0, 40) || "—",
        a.foto ? "✓" : "—",
        fmtDateTime(a.dataFoto || a.criadoEm),
        `${a.latitude.toFixed(5)}, ${a.longitude.toFixed(5)}`,
      ]);

      (doc as any).autoTable({
        startY: y,
        head: [["#", "Nome", "Observação", "Foto", "Data", "Coordenadas"]],
        body: armRows,
        theme: "striped",
        headStyles: {
          fillColor: CARAMEL, textColor: WHITE, fontStyle: "bold",
          fontSize: 7.5, halign: "center",
        },
        bodyStyles: { fontSize: 7.5, textColor: [30, 20, 15] },
        alternateRowStyles: { fillColor: LIGHT },
        columnStyles: {
          0: { halign: "center", cellWidth: 8 },
          1: { cellWidth: 35, fontStyle: "bold" },
          2: { cellWidth: 48 },
          3: { halign: "center", cellWidth: 12 },
          4: { halign: "center", cellWidth: 32 },
          5: { halign: "center" },
        },
        margin: { left: margem, right: margem },
        didDrawPage: () => { addHeader(`${talhao.nome} — Pontos`); addFooter(); },
      });

      // Stats rápidas ao fim da tabela
      if (tipo === "completo") {
        const afterY = (doc as any).lastAutoTable.finalY + 8;
        if (afterY < 260) {
          const comFoto   = arm.filter(a => a.foto).length;
          const semFoto   = arm.length - comFoto;
          const cobertura = arm.length > 0 ? ((comFoto / arm.length) * 100).toFixed(1) : "0";
          const densidade = (talhao.area ?? 0) > 0
            ? (arm.length / (talhao.area ?? 1)).toFixed(2) : "—";

          doc.setFillColor(...LIGHT as [number,number,number]);
          doc.roundedRect(margem, afterY, W - margem * 2, 18, 2, 2, "F");
          doc.setDrawColor(...GOLD as [number,number,number]);
          doc.setLineWidth(0.3);
          doc.roundedRect(margem, afterY, W - margem * 2, 18, 2, 2, "S");

          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...CAFE as [number,number,number]);
          const statsCols = [
            { label: "Com foto:",       val: `${comFoto} (${cobertura}%)` },
            { label: "Sem foto:",       val: String(semFoto)              },
            { label: "Densidade:",      val: `${densidade} pts/ha`        },
          ];
          statsCols.forEach((st, i) => {
            const sx = margem + 8 + i * ((W - margem * 2 - 16) / 3);
            doc.text(st.label, sx, afterY + 8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...GRAY as [number,number,number]);
            doc.text(st.val, sx, afterY + 14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...CAFE as [number,number,number]);
          });
        }
      }
    }
  }

  // Salva
  const filename = `fazenda-cafe-${tipo}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

// ─────────────────────────────────────────────────────────────────
// GERAÇÃO DE EXCEL
// ─────────────────────────────────────────────────────────────────
async function gerarExcel(
  talhoes: Talhao[],
  armadilhasPorTalhao: Map<number, Armadilha[]>,
  selectedIds: number[],
) {
  const XLSX = await loadXLSX();
  const selecionados = talhoes.filter(t => selectedIds.includes(t.id));
  const wb = XLSX.utils.book_new();

  // ── Aba 1: Resumo ──
  const resumoData = [
    ["FAZENDA CAFÉ — RELATÓRIO DE MONITORAMENTO"],
    [`Gerado em: ${new Date().toLocaleString("pt-BR")}`],
    [],
    ["RESUMO GERAL"],
    ["Talhões selecionados", selecionados.length],
    ["Total de pontos de foto", Array.from(armadilhasPorTalhao.values()).reduce((s, a) => s + a.length, 0)],
    ["Total de brocas", selecionados.reduce((s, t) => s + (t.totalPragas ?? 0), 0)],
    ["Área total (ha)", selecionados.reduce((s, t) => s + (t.area ?? 0), 0).toFixed(2)],
    [],
    ["TALHÕES"],
    ["ID", "Nome", "Área (ha)", "Status", "Brocas", "Pontos de Foto", "Última Coleta", "Latitude", "Longitude"],
    ...selecionados.map(t => {
      const arm = armadilhasPorTalhao.get(t.id) || [];
      return [
        t.id, t.nome,
        t.area ?? 0,
        statusLabel(t.status),
        t.totalPragas ?? 0,
        arm.length,
        fmtDate(t.ultimaColeta),
        t.center?.[0] ?? "—",
        t.center?.[1] ?? "—",
      ];
    }),
  ];

  const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
  wsResumo["!cols"] = [
    { wch: 22 }, { wch: 28 }, { wch: 12 }, { wch: 20 },
    { wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

  // ── Aba 2: Pontos de Foto (todos juntos) ──
  const todosPontos: any[][] = [];
  todosPontos.push([
    "Talhão", "ID Ponto", "Nome", "Observação", "Tem Foto",
    "Data da Foto", "Data de Criação", "Latitude", "Longitude",
  ]);
  selecionados.forEach(t => {
    const arm = armadilhasPorTalhao.get(t.id) || [];
    arm.forEach(a => {
      todosPontos.push([
        t.nome,
        a.id,
        a.nome || "Ponto de Foto",
        a.observacao || "",
        a.foto ? "Sim" : "Não",
        fmtDateTime(a.dataFoto),
        fmtDateTime(a.criadoEm),
        a.latitude,
        a.longitude,
      ]);
    });
  });
  const wsPontos = XLSX.utils.aoa_to_sheet(todosPontos);
  wsPontos["!cols"] = [
    { wch: 22 }, { wch: 10 }, { wch: 28 }, { wch: 40 }, { wch: 10 },
    { wch: 20 }, { wch: 20 }, { wch: 14 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPontos, "Pontos de Foto");

  // ── Aba por talhão ──
  selecionados.forEach(t => {
    const arm = armadilhasPorTalhao.get(t.id) || [];
    const sheetData: any[][] = [
      [`TALHÃO: ${t.nome}`],
      [`Área: ${(t.area ?? 0).toFixed(2)} ha   Status: ${statusLabel(t.status)}   Brocas: ${t.totalPragas ?? 0}`],
      [],
      ["ID", "Nome", "Observação", "Tem Foto", "Data Foto", "Data Criação", "Latitude", "Longitude"],
      ...arm.map(a => [
        a.id, a.nome || "Ponto de Foto",
        a.observacao || "",
        a.foto ? "Sim" : "Não",
        fmtDateTime(a.dataFoto),
        fmtDateTime(a.criadoEm),
        a.latitude, a.longitude,
      ]),
      [],
      ["Total de pontos:", arm.length],
      ["Com foto:", arm.filter(a => a.foto).length],
      ["Sem foto:", arm.filter(a => !a.foto).length],
    ];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws["!cols"] = [
      { wch: 8 }, { wch: 28 }, { wch: 40 }, { wch: 10 },
      { wch: 20 }, { wch: 20 }, { wch: 14 }, { wch: 14 },
    ];
    // Nome da aba: máx 31 chars, sem caracteres especiais
    const tabName = t.nome.replace(/[:\\\/\?\*\[\]]/g, "").slice(0, 28);
    XLSX.utils.book_append_sheet(wb, ws, tabName || `T${t.id}`);
  });

  const filename = `fazenda-cafe-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// ─────────────────────────────────────────────────────────────────
// GERAÇÃO DE CSV
// ─────────────────────────────────────────────────────────────────
function gerarCSV(
  talhoes: Talhao[],
  armadilhasPorTalhao: Map<number, Armadilha[]>,
  selectedIds: number[],
) {
  const selecionados = talhoes.filter(t => selectedIds.includes(t.id));
  const rows: string[][] = [];
  rows.push(["talhao_id", "talhao_nome", "talhao_area_ha", "talhao_status", "talhao_brocas",
    "ponto_id", "ponto_nome", "ponto_observacao", "ponto_tem_foto", "ponto_data_foto",
    "ponto_criado_em", "ponto_latitude", "ponto_longitude"]);

  selecionados.forEach(t => {
    const arm = armadilhasPorTalhao.get(t.id) || [];
    if (arm.length === 0) {
      rows.push([
        String(t.id), t.nome, String(t.area ?? 0), statusLabel(t.status),
        String(t.totalPragas ?? 0), "", "", "", "", "", "", "", "",
      ]);
    } else {
      arm.forEach(a => {
        rows.push([
          String(t.id), t.nome, String(t.area ?? 0), statusLabel(t.status), String(t.totalPragas ?? 0),
          String(a.id), a.nome || "Ponto de Foto",
          (a.observacao || "").replace(/,/g, ";"),
          a.foto ? "Sim" : "Não",
          fmtDateTime(a.dataFoto),
          fmtDateTime(a.criadoEm),
          String(a.latitude), String(a.longitude),
        ]);
      });
    }
  });

  const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fazenda-cafe-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────
// MODAL PRINCIPAL
// ─────────────────────────────────────────────────────────────────
export function RelatorioModal({ open, onClose, talhoes }: RelatorioModalProps) {
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>("executivo");
  const [formato, setFormato] = useState<FormatoRelatorio>("pdf");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loadingArmadilhas, setLoadingArmadilhas] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [armadilhasPorTalhao, setArmadilhasPorTalhao] = useState<Map<number, Armadilha[]>>(new Map());
  const timeoutRef = useRef<any>(null);

  // Seleciona todos ao abrir
  useEffect(() => {
    if (open) {
      setSelectedIds(talhoes.map(t => t.id));
      setConcluido(false);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [open, talhoes]);

  // Busca armadilhas ao selecionar talhões
  useEffect(() => {
    if (!open || selectedIds.length === 0) return;
    const fetch_ = async () => {
      setLoadingArmadilhas(true);
      const map = new Map<number, Armadilha[]>();
      await Promise.all(
        selectedIds.map(async id => {
          const arm = await fetchArmadilhasDeTalhao(id);
          map.set(id, arm);
        })
      );
      setArmadilhasPorTalhao(map);
      setLoadingArmadilhas(false);
    };
    fetch_();
  }, [open, selectedIds.join(",")]); // eslint-disable-line

  const toggleTalhao = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedIds(prev => prev.length === talhoes.length ? [] : talhoes.map(t => t.id));
  };

  const totalPontos = Array.from(armadilhasPorTalhao.values()).reduce((s, a) => s + a.length, 0);

  const handleGerar = async () => {
    if (selectedIds.length === 0) return;
    setGerando(true);
    try {
      if (formato === "pdf") {
        await gerarPDF(tipoRelatorio, talhoes, armadilhasPorTalhao, selectedIds);
      } else if (formato === "excel") {
        await gerarExcel(talhoes, armadilhasPorTalhao, selectedIds);
      } else {
        gerarCSV(talhoes, armadilhasPorTalhao, selectedIds);
      }
      setConcluido(true);
      timeoutRef.current = setTimeout(() => setConcluido(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setGerando(false);
    }
  };

  const getStatusColor = (s: string | null) => {
    const m: Record<string, string> = {
      baixo: "#8B4513", medio: "#C8860A", alto: "#D4780A", critico: "#dc2626",
    };
    return m[s ?? ""] ?? "#6b7280";
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: "fixed", inset: 0, background: "rgba(10,5,2,0.75)", backdropFilter: "blur(8px)", zIndex: 5000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 28 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            onClick={e => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 680, maxHeight: "92vh", borderRadius: "1.5rem", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,83,0.15)", display: "flex", flexDirection: "column" }}
          >
            {/* ── HEADER ── */}
            <div style={{ background: "linear-gradient(135deg, #1a0f0a 0%, #2C1810 60%, #3d1f12 100%)", padding: "1.75rem 2rem", position: "relative", overflow: "hidden", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: -50, right: -30, width: 200, height: 200, background: "radial-gradient(circle, rgba(212,168,83,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
                <div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(212,168,83,0.55)", marginBottom: "0.4rem" }}>
                    Geração de Relatórios
                  </div>
                  <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#fff", lineHeight: 1.2, display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <BarChart3 size={22} style={{ color: "#D4A853" }} />
                    Relatórios
                  </h2>
                  <p style={{ margin: "0.4rem 0 0", fontSize: "0.82rem", color: "rgba(212,168,83,0.55)", fontWeight: 400 }}>
                    Configure e baixe relatórios do seu sistema
                  </p>
                </div>
                <button onClick={onClose} style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.625rem", cursor: "pointer", color: "rgba(255,255,255,0.5)", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                  <X size={17} />
                </button>
              </div>

              {/* Mini stats */}
              <div style={{ display: "flex", gap: "0.625rem", marginTop: "1.25rem", position: "relative", flexWrap: "wrap" }}>
                {[
                  { icon: <Layers size={13} />,   label: `${selectedIds.length} talhões` },
                  { icon: <Camera size={13} />,    label: loadingArmadilhas ? "carregando…" : `${totalPontos} pontos de foto` },
                  { icon: <Coffee size={13} />,    label: `${talhoes.filter(t => selectedIds.includes(t.id)).reduce((s, t) => s + (t.totalPragas ?? 0), 0)} brocas` },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.2)", borderRadius: "999px", padding: "0.3rem 0.75rem", fontSize: "0.75rem", color: "rgba(212,168,83,0.8)", fontWeight: 600 }}>
                    {s.icon}{s.label}
                  </div>
                ))}
              </div>
            </div>

            {/* ── BODY ── */}
            <div style={{ background: "#fdf8f3", padding: "1.5rem 2rem", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Tipo de relatório */}
              <Section label="Tipo de Relatório">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.625rem" }}>
                  {([
                    { id: "executivo", icon: <FileText size={18} />,      label: "Executivo",     desc: "Resumo geral e KPIs" },
                    { id: "pontos",    icon: <Camera size={18} />,         label: "Pontos de Foto",desc: "Lista completa de pontos" },
                    { id: "completo",  icon: <BarChart3 size={18} />,      label: "Completo",      desc: "Tudo + estatísticas" },
                  ] as const).map(opt => {
                    const sel = tipoRelatorio === opt.id;
                    return (
                      <button key={opt.id} onClick={() => setTipoRelatorio(opt.id)}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem", padding: "0.875rem 0.5rem", background: sel ? "rgba(139,69,19,0.08)" : "white", border: `2px solid ${sel ? "#8B4513" : "#e8ddd5"}`, borderRadius: "0.875rem", cursor: "pointer", transition: "all 0.18s", textAlign: "center" }}
                        onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = "#c9b5a8"; } }}
                        onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = "#e8ddd5"; } }}>
                        <div style={{ color: sel ? "#8B4513" : "#9b8070" }}>{opt.icon}</div>
                        <div style={{ fontSize: "0.82rem", fontWeight: sel ? 700 : 600, color: sel ? "#4A2C2A" : "#6b4c3a" }}>{opt.label}</div>
                        <div style={{ fontSize: "0.68rem", color: "#9b8070", lineHeight: 1.3 }}>{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* Formato */}
              <Section label="Formato de Saída">
                <div style={{ display: "flex", gap: "0.625rem" }}>
                  {([
                    { id: "pdf",   icon: <FileText size={16} />,        label: "PDF",   color: "#dc2626", desc: "Formatado, pronto para imprimir" },
                    { id: "excel", icon: <FileSpreadsheet size={16} />, label: "Excel", color: "#16a34a", desc: "Planilha com múltiplas abas" },
                    { id: "csv",   icon: <Download size={16} />,        label: "CSV",   color: "#2563eb", desc: "Dados brutos para análise" },
                  ] as const).map(opt => {
                    const sel = formato === opt.id;
                    return (
                      <button key={opt.id} onClick={() => setFormato(opt.id)}
                        style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", padding: "0.75rem 0.5rem", background: sel ? `${opt.color}10` : "white", border: `2px solid ${sel ? opt.color : "#e8ddd5"}`, borderRadius: "0.875rem", cursor: "pointer", transition: "all 0.18s" }}>
                        <div style={{ color: sel ? opt.color : "#9b8070" }}>{opt.icon}</div>
                        <div style={{ fontSize: "0.82rem", fontWeight: sel ? 700 : 600, color: sel ? "#2C1810" : "#6b4c3a" }}>{opt.label}</div>
                        <div style={{ fontSize: "0.65rem", color: "#9b8070", textAlign: "center", lineHeight: 1.3 }}>{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* Seleção de talhões */}
              <Section label="Talhões">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.625rem" }}>
                  <span style={{ fontSize: "0.78rem", color: "#9b8070", fontWeight: 500 }}>
                    {selectedIds.length}/{talhoes.length} selecionados
                  </span>
                  <button onClick={toggleAll} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, color: "#8B4513", textDecoration: "underline" }}>
                    {selectedIds.length === talhoes.length ? "Desmarcar todos" : "Selecionar todos"}
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", maxHeight: 200, overflowY: "auto" }}>
                  {talhoes.map(t => {
                    const sel = selectedIds.includes(t.id);
                    const arm = armadilhasPorTalhao.get(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => toggleTalhao(t.id)}
                        style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.875rem", background: sel ? "rgba(139,69,19,0.06)" : "white", border: `2px solid ${sel ? "#8B4513" : "#e8ddd5"}`, borderRadius: "0.75rem", cursor: "pointer", transition: "all 0.15s" }}
                      >
                        <div style={{ width: 18, height: 18, borderRadius: "5px", border: `2px solid ${sel ? "#8B4513" : "#c9b5a8"}`, background: sel ? "#8B4513" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                          {sel && <CheckCircle size={12} style={{ color: "white" }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#2C1810", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.nome}</div>
                          <div style={{ fontSize: "0.7rem", color: "#9b8070", display: "flex", gap: "0.5rem", marginTop: 2, flexWrap: "wrap" }}>
                            <span>{(t.area ?? 0).toFixed(1)} ha</span>
                            <span>·</span>
                            <span style={{ color: getStatusColor(t.status) }}>● {statusLabel(t.status)}</span>
                            <span>·</span>
                            <span>{t.totalPragas ?? 0} brocas</span>
                          </div>
                        </div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8B4513", background: "rgba(139,69,19,0.08)", padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>
                          {loadingArmadilhas || !arm
                            ? "…"
                            : `📸 ${arm.length}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            </div>

            {/* ── FOOTER / BOTÃO ── */}
            <div style={{ background: "#fdf8f3", borderTop: "1px solid #ede4da", padding: "1.25rem 2rem 1.5rem", flexShrink: 0 }}>
              {/* Preview do que vai gerar */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                <PreviewTag color="#dc2626" show={formato === "pdf"}>
                  PDF — {tipoRelatorio === "executivo" ? "Resumo + KPIs" : tipoRelatorio === "pontos" ? "Lista de pontos" : "Relatório completo"}
                </PreviewTag>
                <PreviewTag color="#16a34a" show={formato === "excel"}>
                  Excel — {selectedIds.length} talhões, {totalPontos} pontos
                </PreviewTag>
                <PreviewTag color="#2563eb" show={formato === "csv"}>
                  CSV — {totalPontos} linhas de dados
                </PreviewTag>
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button onClick={onClose} style={{ flex: 1, padding: "0.9rem", background: "white", border: "2px solid #e8ddd5", borderRadius: "0.875rem", color: "#6b4c3a", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}>
                  Cancelar
                </button>
                <motion.button
                  onClick={handleGerar}
                  disabled={gerando || selectedIds.length === 0 || loadingArmadilhas}
                  whileHover={!gerando && selectedIds.length > 0 ? { scale: 1.02, y: -1 } : {}}
                  whileTap={!gerando ? { scale: 0.98 } : {}}
                  style={{ flex: 2, padding: "0.9rem", border: "none", borderRadius: "0.875rem", color: "white", fontWeight: 700, fontSize: "0.95rem", cursor: gerando || selectedIds.length === 0 ? "not-allowed" : "pointer", background: concluido ? "linear-gradient(135deg, #15803d, #16a34a)" : gerando || selectedIds.length === 0 ? "#c9b5a8" : "linear-gradient(135deg, #3d1f12 0%, #8B4513 60%, #a05220 100%)", boxShadow: gerando || selectedIds.length === 0 ? "none" : "0 4px 16px rgba(139,69,19,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "background 0.3s" }}
                >
                  {concluido ? (
                    <><CheckCircle size={18} /> Baixado com sucesso!</>
                  ) : gerando ? (
                    <><Loader size={18} style={{ animation: "spin 1s linear infinite" }} /> Gerando...</>
                  ) : (
                    <><Download size={18} /> Gerar e Baixar {formato.toUpperCase()}</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Sub-components ────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b4c3a", marginBottom: "0.625rem" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function PreviewTag({ color, show, children }: { color: string; show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: `${color}10`, border: `1px solid ${color}30`, padding: "0.3rem 0.75rem", borderRadius: 999, fontSize: "0.75rem", color, fontWeight: 600 }}>
      <Download size={11} />{children}
    </div>
  );
}
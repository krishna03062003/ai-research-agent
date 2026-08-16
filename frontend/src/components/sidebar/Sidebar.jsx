import React from "react";
import {
  Sparkles,
  Bot,
  FileText,
  Globe,
  Calculator,
  BrainCircuit,
  RotateCcw,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { DocumentCard } from "./DocumentCard";
import { StatusIndicator } from "./StatusIndicator";

export function Sidebar({
  isOpen,
  onClose,
  documentStatus,
  onOpenUpload,
  onResetDocument,
  onClearChat,
  onSelectPrompt,
}) {
  const routesInfo = [
    { icon: FileText, label: "Document QA", color: "#38bdf8", desc: "Extracts grounded facts from PDF" },
    { icon: Globe, label: "Web Search", color: "#34d399", desc: "Tavily + authoritative source ranking" },
    { icon: Calculator, label: "Calculator", color: "#fbbf24", desc: "Safe AST arithmetic engine" },
    { icon: Sparkles, label: "Creative", color: "#f472b6", desc: "Original poems, stories, ideas" },
    { icon: BrainCircuit, label: "General QA", color: "#a78bfa", desc: "Broad general knowledge" },
  ];

  return (
    <aside
      style={{
        width: "320px",
        minWidth: "320px",
        height: "100vh",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 16px",
        zIndex: 30,
        transition: "transform var(--transition-normal)",
      }}
      className={`sidebar ${isOpen ? "open" : ""}`}
    >
      {/* Top Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto" }}>
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-md)",
              background: "var(--gradient-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "var(--shadow-glow-indigo)",
            }}
          >
            <Bot size={22} />
          </div>

          <div>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.3px",
              }}
            >
              ResearchAgent
            </h1>
            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 500 }}>
              AI Document & Research Hub
            </div>
          </div>
        </div>

        {/* Backend Status */}
        <StatusIndicator />

        {/* Document Ingestion Hub */}
        <DocumentCard
          documentStatus={documentStatus}
          onOpenUpload={onOpenUpload}
          onResetDocument={onResetDocument}
        />

        {/* Intelligence Routes Overview */}
        <div
          style={{
            background: "rgba(0, 0, 0, 0.2)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.5px" }}>
            AUTONOMOUS INTENT ROUTES
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {routesInfo.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "6px 8px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.02)",
                  }}
                >
                  <div
                    style={{
                      color: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#e2e8f0" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <button
          onClick={onClearChat}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "9px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-secondary)",
            fontSize: "0.82rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <RotateCcw size={14} /> Clear Conversation
        </button>

        <div style={{ textAlign: "center", fontSize: "0.7rem", color: "var(--text-dim)" }}>
          Powered by Gemini 3.5 & ChromaDB
        </div>
      </div>
    </aside>
  );
}

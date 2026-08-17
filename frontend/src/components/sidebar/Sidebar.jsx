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
  X,
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
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Top Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "18px", overflowY: "auto" }}>
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "var(--radius-md)",
                background: "var(--gradient-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "var(--shadow-glow-indigo)",
                flexShrink: 0,
              }}
            >
              <Bot size={20} />
            </div>

            <div>
              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "-0.3px",
                }}
              >
                ResearchAgent
              </h1>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500 }}>
                AI Document & Research Hub
              </div>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px",
              display: isOpen ? "flex" : "none",
            }}
            title="Close sidebar"
          >
            <X size={20} />
          </button>
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
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.5px" }}>
            AUTONOMOUS INTENT ROUTES
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={14} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#e2e8f0" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
          paddingTop: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <button
          onClick={onClearChat}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "8px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-secondary)",
            fontSize: "0.8rem",
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
          <RotateCcw size={13} /> Clear Conversation
        </button>

        <div style={{ textAlign: "center", fontSize: "0.68rem", color: "var(--text-dim)" }}>
          Powered by Gemini 3.5 & ChromaDB
        </div>
      </div>
    </aside>
  );
}

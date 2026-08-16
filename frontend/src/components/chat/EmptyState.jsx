import React from "react";
import { Sparkles, FileText, Globe, Calculator, ArrowRight } from "lucide-react";

export function EmptyState({ onSelectPrompt, hasDocument, documentName }) {
  const promptSuggestions = [
    {
      category: "DOCUMENT RAG",
      icon: FileText,
      color: "#38bdf8",
      bg: "rgba(14, 165, 233, 0.1)",
      border: "rgba(14, 165, 233, 0.25)",
      title: hasDocument ? `Query ${documentName}` : "Query PDF Document",
      prompt: "What does the document say about romantic poetry?",
    },
    {
      category: "LIVE WEB RESEARCH",
      icon: Globe,
      color: "#34d399",
      bg: "rgba(16, 185, 129, 0.1)",
      border: "rgba(16, 185, 129, 0.25)",
      title: "Latest Information",
      prompt: "What is the latest version of Python?",
    },
    {
      category: "CALCULATOR",
      icon: Calculator,
      color: "#fbbf24",
      bg: "rgba(245, 158, 11, 0.1)",
      border: "rgba(245, 158, 11, 0.25)",
      title: "Math & Percentages",
      prompt: "Calculate 25 percent of 800",
    },
    {
      category: "CREATIVE & GENERAL",
      icon: Sparkles,
      color: "#f472b6",
      bg: "rgba(244, 63, 94, 0.1)",
      border: "rgba(244, 63, 94, 0.25)",
      title: "Creative Generation",
      prompt: "Write a beautiful romantic Urdu shayari.",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "40px 20px",
        textAlign: "center",
        maxWidth: "840px",
        margin: "0 auto",
      }}
    >
      {/* Glow Icon */}
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "var(--radius-lg)",
          background: "var(--gradient-brand)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          boxShadow: "0 0 35px rgba(99, 102, 241, 0.35)",
          marginBottom: "20px",
        }}
      >
        <Sparkles size={32} />
      </div>

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.85rem",
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "-0.5px",
          marginBottom: "8px",
        }}
      >
        AI Research & Document Assistant
      </h2>

      <p
        style={{
          fontSize: "0.95rem",
          color: "var(--text-secondary)",
          maxWidth: "520px",
          lineHeight: 1.6,
          marginBottom: "36px",
        }}
      >
        Autonomous intelligence engine routing questions dynamically between Document RAG, authoritative live web research, safe arithmetic, and Gemini 3.5.
      </p>

      {/* Starter Prompts Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "14px",
          width: "100%",
        }}
      >
        {promptSuggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-card)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                transition: "all var(--transition-fast)",
                boxShadow: "var(--shadow-sm)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-card-hover)";
                e.currentTarget.style.borderColor = item.color;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--bg-card)";
                e.currentTarget.style.borderColor = "var(--border-card)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: item.color,
                  }}
                >
                  <Icon size={13} />
                  <span>{item.category}</span>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </div>

              <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-primary)" }}>
                "{item.prompt}"
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

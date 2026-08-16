import React, { useState } from "react";
import { ChevronDown, ChevronUp, Cpu, Gauge, Zap } from "lucide-react";
import { formatConfidence } from "../../utils/formatters";

export function AgentDetailsModal({ route, confidence, metadata = {} }) {
  const [isOpen, setIsOpen] = useState(false);

  const conf = formatConfidence(confidence);

  return (
    <div style={{ marginTop: "10px" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-sm)",
          padding: "4px 8px",
          fontSize: "0.72rem",
          color: "var(--text-muted)",
          cursor: "pointer",
          transition: "all var(--transition-fast)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--text-secondary)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-muted)";
          e.currentTarget.style.borderColor = "var(--border-subtle)";
        }}
      >
        <Cpu size={12} />
        <span>Agent Inspection Details</span>
        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {isOpen && (
        <div
          style={{
            marginTop: "8px",
            padding: "12px",
            background: "rgba(0, 0, 0, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.75rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "10px",
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          <div>
            <div style={{ color: "var(--text-dim)", marginBottom: "2px" }}>Selected Route</div>
            <div style={{ fontWeight: 600, color: "#f8fafc" }}>{route}</div>
          </div>

          {conf && (
            <div>
              <div style={{ color: "var(--text-dim)", marginBottom: "2px" }}>Retrieval Confidence</div>
              <div style={{ fontWeight: 600, color: conf.color }}>
                {conf.pct}% ({conf.label})
              </div>
            </div>
          )}

          {metadata.best_distance !== undefined && (
            <div>
              <div style={{ color: "var(--text-dim)", marginBottom: "2px" }}>Best Vector Distance</div>
              <div style={{ fontWeight: 600, color: "#94a3b8", fontFamily: "var(--font-mono)" }}>
                {metadata.best_distance ? metadata.best_distance.toFixed(4) : "N/A"}
              </div>
            </div>
          )}

          {metadata.gap !== undefined && (
            <div>
              <div style={{ color: "var(--text-dim)", marginBottom: "2px" }}>Result Gap Separation</div>
              <div style={{ fontWeight: 600, color: "#94a3b8", fontFamily: "var(--font-mono)" }}>
                {metadata.gap ? metadata.gap.toFixed(4) : "0.0000"}
              </div>
            </div>
          )}

          {metadata.expression && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ color: "var(--text-dim)", marginBottom: "2px" }}>Parsed AST Expression</div>
              <div style={{ fontWeight: 600, color: "#fbbf24", fontFamily: "var(--font-mono)" }}>
                {metadata.expression}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

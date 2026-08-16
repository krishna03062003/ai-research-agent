import React, { useState } from "react";
import {
  ExternalLink,
  BookOpen,
  Globe,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Award,
} from "lucide-react";
import { extractDomain } from "../../utils/formatters";

export function SourcesSection({ sources = [], documentCitations = [], route }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasWebSources = sources && sources.length > 0;
  const hasDocCitations = documentCitations && documentCitations.length > 0;

  if (!hasWebSources && !hasDocCitations) {
    return null;
  }

  const getAuthorityBadge = (sourceType) => {
    switch (sourceType) {
      case "OFFICIAL":
      case "DOCUMENTATION":
        return { label: "Official", color: "#38bdf8", bg: "rgba(14, 165, 233, 0.15)" };
      case "GOVERNMENT":
        return { label: "Gov", color: "#34d399", bg: "rgba(16, 185, 129, 0.15)" };
      case "ACADEMIC":
        return { label: "Academic", color: "#a78bfa", bg: "rgba(139, 92, 246, 0.15)" };
      case "WIKIPEDIA":
        return { label: "Wikipedia", color: "#facc15", bg: "rgba(250, 204, 21, 0.15)" };
      default:
        return { label: "General", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)" };
    }
  };

  return (
    <div
      style={{
        marginTop: "14px",
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: "12px",
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: "transparent",
          border: "none",
          color: "var(--text-secondary)",
          fontSize: "0.78rem",
          fontWeight: 600,
          cursor: "pointer",
          padding: "4px 0",
          marginBottom: isExpanded ? "10px" : "0",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {hasWebSources ? (
            <Globe size={14} color="#34d399" />
          ) : (
            <BookOpen size={14} color="#38bdf8" />
          )}
          <span>
            {hasWebSources
              ? `VERIFIED WEB SOURCES (${sources.length})`
              : `DOCUMENT CITATIONS (${documentCitations.length})`}
          </span>
        </div>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isExpanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Web Sources */}
          {hasWebSources &&
            sources.map((src, idx) => {
              const domain = extractDomain(src.url);
              const auth = getAuthorityBadge(src.source_type);

              return (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    padding: "10px 12px",
                    background: "rgba(0, 0, 0, 0.25)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "var(--radius-sm)",
                    textDecoration: "none",
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(16, 185, 129, 0.08)";
                    e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0, 0, 0, 0.25)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "0.83rem",
                        fontWeight: 600,
                        color: "#f1f5f9",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {src.title || domain}
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          color: auth.color,
                          background: auth.bg,
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {auth.label}
                      </span>
                      <ExternalLink size={12} color="var(--text-muted)" />
                    </div>
                  </div>

                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {domain} {src.final_score ? `• Score: ${src.final_score}` : ""}
                  </div>

                  {src.content && (
                    <div
                      style={{
                        fontSize: "0.74rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.4,
                        marginTop: "2px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      "{src.content}"
                    </div>
                  )}
                </a>
              );
            })}

          {/* Document Citations */}
          {hasDocCitations &&
            documentCitations.map((cite, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px 12px",
                  background: "rgba(14, 165, 233, 0.06)",
                  border: "1px solid rgba(14, 165, 233, 0.2)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#38bdf8" }}>
                    {cite.source ? `${cite.source}` : "Document Chunk"}
                  </span>
                  {cite.page && (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        background: "rgba(14, 165, 233, 0.15)",
                        color: "#7dd3fc",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      Page {cite.page}
                    </span>
                  )}
                </div>
                {cite.text && (
                  <div style={{ fontSize: "0.74rem", color: "#cbd5e1", lineHeight: 1.4, fontStyle: "italic" }}>
                    "{cite.text}"
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

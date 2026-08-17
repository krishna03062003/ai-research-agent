import React, { useState } from "react";
import { Bot, User, Copy, Check, Sparkles, Globe, X } from "lucide-react";
import { RouteBadge } from "./RouteBadge";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { SourcesSection } from "./SourcesSection";
import { AgentDetailsModal } from "./AgentDetailsModal";
import { formatTime } from "../../utils/formatters";

export function MessageItem({ message, onConfirmWebSearch, onDismissWebSearch }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === "user";

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div
        className="animate-fade-in"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "20px",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            maxWidth: "85%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "6px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              color: "#ffffff",
              padding: "12px 18px",
              borderRadius: "18px 18px 4px 18px",
              fontSize: "0.95rem",
              lineHeight: 1.5,
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {message.content}
          </div>

          <span style={{ fontSize: "0.7rem", color: "var(--text-dim)", paddingRight: "4px" }}>
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        gap: "14px",
        marginBottom: "24px",
        padding: "0 16px",
        maxWidth: "920px",
        margin: "0 auto 24px auto",
        width: "100%",
        minWidth: 0,
      }}
    >
      {/* Assistant Avatar */}
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "var(--radius-md)",
          background: message.isError
            ? "rgba(244, 63, 94, 0.15)"
            : "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
          color: message.isError ? "#f43f5e" : "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: message.isError ? "none" : "0 0 16px rgba(99, 102, 241, 0.3)",
          marginTop: "2px",
        }}
      >
        {message.isError ? <Bot size={20} /> : <Sparkles size={19} />}
      </div>

      {/* Assistant Message Card */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          background: "var(--bg-card)",
          border: `1px solid ${message.isError ? "rgba(244, 63, 94, 0.3)" : "var(--border-card)"}`,
          borderRadius: "var(--radius-lg)",
          padding: "16px 20px",
          boxShadow: "var(--shadow-md)",
          backdropFilter: "blur(12px)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          position: "relative",
        }}
      >
        {/* Top bar with Route Badge and Copy Button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
          <RouteBadge route={message.route} />

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
              {formatTime(message.timestamp)}
            </span>

            <button
              onClick={handleCopyMessage}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                transition: "color var(--transition-fast)",
              }}
              title="Copy message"
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Markdown Content */}
        <MarkdownRenderer content={message.content} />

        {/* Interactive Web Search Prompt when document info is not found */}
        {message.can_search_web && !message.actionTaken && (
          <div
            style={{
              marginTop: "12px",
              padding: "12px 14px",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.22)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "200px" }}>
              <Globe size={15} color="#34d399" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "0.82rem", color: "#e2e8f0", fontWeight: 500 }}>
                Would you like to search the web for general/external information?
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <button
                type="button"
                id="btn-confirm-web-search"
                onClick={() =>
                  onConfirmWebSearch?.(
                    message.id,
                    message.original_question || message.query
                  )
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--gradient-web)",
                  color: "#ffffff",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-glow-emerald)",
                  transition: "opacity var(--transition-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <Globe size={13} /> Yes, Search Web
              </button>

              <button
                type="button"
                id="btn-dismiss-web-search"
                onClick={() => onDismissWebSearch?.(message.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                <X size={13} /> No
              </button>
            </div>
          </div>
        )}

        {message.can_search_web && message.actionTaken === "no" && (
          <div
            style={{
              marginTop: "8px",
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <X size={13} color="var(--text-muted)" />
            <span>Web search dismissed.</span>
          </div>
        )}

        {message.can_search_web && message.actionTaken === "yes" && (
          <div
            style={{
              marginTop: "8px",
              fontSize: "0.78rem",
              color: "#34d399",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Globe size={13} color="#34d399" />
            <span>Web search initiated.</span>
          </div>
        )}

        {/* Sources & Citations */}
        <SourcesSection
          sources={message.sources}
          documentCitations={message.document_citations}
          route={message.route}
        />

        {/* Agent Details Inspector */}
        {!message.isError && (
          <AgentDetailsModal
            route={message.route}
            confidence={message.confidence}
            metadata={message.metadata}
          />
        )}
      </div>
    </div>
  );
}

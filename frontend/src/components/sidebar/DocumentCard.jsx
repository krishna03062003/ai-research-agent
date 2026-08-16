import React from "react";
import { FileText, Layers, Trash2, UploadCloud, CheckCircle2 } from "lucide-react";

export function DocumentCard({
  documentStatus,
  onOpenUpload,
  onResetDocument,
  isResetting,
}) {
  const hasDoc = documentStatus?.has_document;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-lg)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={18} color="var(--accent-cyan)" />
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "0.3px" }}>
            ACTIVE DOCUMENT
          </span>
        </div>

        {hasDoc && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(14, 165, 233, 0.12)",
              color: "#38bdf8",
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.72rem",
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={11} /> READY
          </span>
        )}
      </div>

      {hasDoc ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{
              background: "rgba(0, 0, 0, 0.25)",
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <div
              style={{
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "#f8fafc",
                wordBreak: "break-all",
                marginBottom: "6px",
              }}
            >
              {documentStatus.filename || "Document.pdf"}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Layers size={13} color="var(--accent-cyan)" />
                {documentStatus.chunks_count} Vector Chunks
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={onOpenUpload}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                fontSize: "0.8rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)")}
            >
              <UploadCloud size={14} /> Replace PDF
            </button>

            <button
              onClick={onResetDocument}
              disabled={isResetting}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 10px",
                background: "rgba(244, 63, 94, 0.1)",
                border: "1px solid rgba(244, 63, 94, 0.25)",
                borderRadius: "var(--radius-sm)",
                color: "#fda4af",
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              title="Clear active document"
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(244, 63, 94, 0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(244, 63, 94, 0.1)")}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "16px 8px",
            background: "rgba(0, 0, 0, 0.2)",
            borderRadius: "var(--radius-md)",
            border: "1px dashed var(--border-subtle)",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(14, 165, 233, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-cyan)",
            }}
          >
            <FileText size={18} />
          </div>

          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: "2px" }}>
              No PDF Loaded
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Upload a document to enable targeted RAG research
            </div>
          </div>

          <button
            onClick={onOpenUpload}
            style={{
              marginTop: "4px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              background: "var(--accent-cyan)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              color: "#090d16",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity var(--transition-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <UploadCloud size={14} /> Upload PDF
          </button>
        </div>
      )}
    </div>
  );
}

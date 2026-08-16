import React, { useState, useRef } from "react";
import { UploadCloud, X, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export function UploadModal({ isOpen, onClose, onUpload, isUploading, uploadError }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [localError, setLocalError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    setLocalError(null);
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setLocalError("Please select a valid PDF document (.pdf).");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setLocalError("File size exceeds 25MB limit.");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || isUploading) return;

    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      onClose();
    } catch {
      // Error handled via uploadError
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: "480px",
          padding: "24px",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          position: "relative",
          animation: "fadeIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>
              Upload Document
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Upload a PDF to extract, chunk, and index into ChromaDB
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isUploading}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "4px",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Banner */}
        {(localError || uploadError) && (
          <div
            style={{
              background: "rgba(244, 63, 94, 0.12)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.82rem",
              color: "#fda4af",
            }}
          >
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{localError || uploadError}</span>
          </div>
        )}

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? "var(--accent-indigo)" : "var(--border-subtle)"}`,
            borderRadius: "var(--radius-md)",
            padding: "28px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            cursor: "pointer",
            background: dragActive ? "rgba(99, 102, 241, 0.08)" : "rgba(0, 0, 0, 0.2)",
            transition: "all var(--transition-fast)",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(99, 102, 241, 0.12)",
              color: "var(--accent-indigo)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UploadCloud size={24} />
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
              {selectedFile ? selectedFile.name : "Drag & drop your PDF file here"}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
              {selectedFile
                ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to change`
                : "or click to browse from your computer (max 25MB)"}
            </div>
          </div>
        </div>

        {/* Ingestion Status indicator */}
        {isUploading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.82rem",
              color: "#c7d2fe",
            }}
          >
            <Loader2 size={16} className="animate-spin-slow" />
            <span>Extracting pages, generating embeddings & updating vector store...</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 18px",
              background: !selectedFile || isUploading ? "rgba(99, 102, 241, 0.4)" : "var(--accent-indigo)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              color: "#ffffff",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: !selectedFile || isUploading ? "not-allowed" : "pointer",
              boxShadow: !selectedFile || isUploading ? "none" : "var(--shadow-glow-indigo)",
              transition: "all var(--transition-fast)",
            }}
          >
            {isUploading ? (
              <>
                <Loader2 size={14} className="animate-spin-slow" /> Ingesting...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} /> Start Ingestion
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

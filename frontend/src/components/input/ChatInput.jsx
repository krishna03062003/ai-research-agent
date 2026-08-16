import React, { useState, useRef, useEffect } from "react";
import { Send, UploadCloud, CornerDownLeft, Sparkles } from "lucide-react";

export function ChatInput({ onSendMessage, onOpenUpload, isLoading, hasDocument }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      style={{
        padding: "12px 16px 20px 16px",
        background: "linear-gradient(to top, rgba(8, 12, 20, 0.95) 70%, transparent 100%)",
        width: "100%",
        maxWidth: "920px",
        margin: "0 auto",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          padding: "10px 14px",
          display: "flex",
          alignItems: "flex-end",
          gap: "10px",
          boxShadow: "var(--shadow-md)",
          transition: "border-color var(--transition-fast)",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-focus)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-card)")}
      >
        {/* Upload Document Shortcut */}
        <button
          type="button"
          onClick={onOpenUpload}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            color: hasDocument ? "#38bdf8" : "var(--text-muted)",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "all var(--transition-fast)",
          }}
          title={hasDocument ? "Replace active PDF" : "Upload PDF for RAG"}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
        >
          <UploadCloud size={17} />
        </button>

        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your PDF, latest web info, math calculations, or general research..."
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            fontSize: "0.95rem",
            lineHeight: 1.5,
            resize: "none",
            maxHeight: "180px",
            fontFamily: "var(--font-sans)",
            padding: "6px 0",
          }}
        />

        {/* Send Action Button */}
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          style={{
            background: !input.trim() || isLoading ? "rgba(255, 255, 255, 0.08)" : "var(--accent-indigo)",
            color: !input.trim() || isLoading ? "var(--text-dim)" : "#ffffff",
            border: "none",
            borderRadius: "var(--radius-sm)",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: !input.trim() || isLoading ? "not-allowed" : "pointer",
            flexShrink: 0,
            boxShadow: !input.trim() || isLoading ? "none" : "var(--shadow-glow-indigo)",
            transition: "all var(--transition-fast)",
          }}
          title="Send query (Enter)"
        >
          <Send size={16} />
        </button>
      </form>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          marginTop: "8px",
          fontSize: "0.72rem",
          color: "var(--text-dim)",
        }}
      >
        <span>
          Press <strong style={{ color: "var(--text-muted)" }}>Enter</strong> to send,{" "}
          <strong style={{ color: "var(--text-muted)" }}>Shift + Enter</strong> for new line
        </span>
      </div>
    </div>
  );
}

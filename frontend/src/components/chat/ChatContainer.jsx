import React, { useEffect, useRef } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { MessageItem } from "./MessageItem";
import { EmptyState } from "./EmptyState";

export function ChatContainer({
  messages,
  isLoading,
  currentStep,
  onSelectPrompt,
  hasDocument,
  documentName,
}) {
  const scrollEndRef = useRef(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, currentStep]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div
        className="chat-container"
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          minWidth: 0,
          width: "100%",
        }}
      >
        <EmptyState
          onSelectPrompt={onSelectPrompt}
          hasDocument={hasDocument}
          documentName={documentName}
        />
      </div>
    );
  }

  return (
    <div
      className="chat-container"
      style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        padding: "24px 0",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        width: "100%",
      }}
    >
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}

      {/* Dynamic Step Loading Indicator */}
      {isLoading && (
        <div
          className="animate-fade-in"
          style={{
            display: "flex",
            gap: "14px",
            padding: "0 16px",
            maxWidth: "920px",
            margin: "0 auto 20px auto",
            width: "100%",
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              background:
                "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 0 16px rgba(99, 102, 241, 0.3)",
            }}
          >
            <Sparkles size={18} className="animate-spin-slow" />
          </div>

          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-card)",
              borderRadius: "var(--radius-lg)",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "var(--shadow-sm)",
              minWidth: 0,
              maxWidth: "100%",
            }}
          >
            <Loader2
              size={16}
              color="var(--accent-indigo)"
              className="animate-spin-slow"
              style={{ flexShrink: 0 }}
            />

            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                fontWeight: 500,
                minWidth: 0,
                overflowWrap: "anywhere",
              }}
            >
              {currentStep || "Processing research query..."}
            </span>
          </div>
        </div>
      )}

      <div ref={scrollEndRef} style={{ height: "1px", flexShrink: 0 }} />
    </div>
  );
}
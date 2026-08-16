import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

export function MarkdownRenderer({ content }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopyCode = (codeText, idx) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ node, href, children, ...props }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");

            if (!inline && match) {
              return (
                <div
                  style={{
                    position: "relative",
                    margin: "12px 0",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    border: "1px solid var(--border-subtle)",
                    background: "#080c14",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 12px",
                      background: "rgba(255, 255, 255, 0.04)",
                      borderBottom: "1px solid var(--border-subtle)",
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <span>{match[1]}</span>
                    <button
                      onClick={() => handleCopyCode(codeString, match[1])}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.72rem",
                      }}
                    >
                      {copiedIndex === match[1] ? (
                        <>
                          <Check size={12} color="#10b981" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre style={{ margin: 0, padding: "14px", overflowX: "auto" }}>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

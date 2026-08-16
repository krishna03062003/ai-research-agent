import React, { useState, useEffect } from "react";
import { Activity, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { checkHealth } from "../../services/api";

export function StatusIndicator() {
  const [health, setHealth] = useState({ status: "checking", latency: null });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const verifyHealth = async () => {
    setIsRefreshing(true);
    const start = performance.now();
    try {
      const res = await checkHealth();
      const end = performance.now();
      setHealth({
        status: res.status === "healthy" ? "healthy" : "offline",
        latency: Math.round(end - start),
      });
    } catch {
      setHealth({ status: "offline", latency: null });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    verifyHealth();
    const interval = setInterval(verifyHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = health.status === "healthy";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        background: isHealthy ? "rgba(16, 185, 129, 0.08)" : "rgba(244, 63, 94, 0.08)",
        border: `1px solid ${isHealthy ? "rgba(16, 185, 129, 0.25)" : "rgba(244, 63, 94, 0.25)"}`,
        borderRadius: "var(--radius-md)",
        fontSize: "0.82rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            display: "inline-block",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: isHealthy ? "#10b981" : "#f43f5e",
            boxShadow: isHealthy ? "0 0 8px #10b981" : "0 0 8px #f43f5e",
          }}
        />
        <span style={{ color: isHealthy ? "#a7f3d0" : "#fecdd3", fontWeight: 500 }}>
          {isHealthy ? "Backend Connected" : "Backend Offline"}
        </span>
        {isHealthy && health.latency && (
          <span style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>
            ({health.latency}ms)
          </span>
        )}
      </div>

      <button
        onClick={verifyHealth}
        disabled={isRefreshing}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--text-muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: "4px",
          borderRadius: "4px",
          transition: "color var(--transition-fast)",
        }}
        title="Check connection"
      >
        <RefreshCw size={13} className={isRefreshing ? "animate-spin-slow" : ""} />
      </button>
    </div>
  );
}

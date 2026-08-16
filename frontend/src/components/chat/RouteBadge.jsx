import React from "react";
import {
  FileText,
  Globe,
  Compass,
  Calculator,
  Sparkles,
  BrainCircuit,
  Bot,
} from "lucide-react";
import { getRouteConfig } from "../../utils/formatters";

const ICON_MAP = {
  FileText,
  Globe,
  Compass,
  Calculator,
  Sparkles,
  BrainCircuit,
  Bot,
};

export function RouteBadge({ route }) {
  const config = getRouteConfig(route);
  const IconComponent = ICON_MAP[config.icon] || Bot;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: "var(--radius-full)",
        fontSize: "0.74rem",
        fontWeight: 600,
        color: config.color,
        letterSpacing: "0.2px",
        userSelect: "none",
      }}
      title={config.description}
    >
      <IconComponent size={12} />
      <span>{config.label.toUpperCase()}</span>
    </div>
  );
}

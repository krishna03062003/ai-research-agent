/**
 * Route metadata: display names, descriptions, and styling classes.
 */
export const ROUTE_CONFIG = {
  DOCUMENT: {
    label: "Document RAG",
    icon: "FileText",
    color: "#38bdf8",
    bg: "rgba(14, 165, 233, 0.12)",
    border: "rgba(14, 165, 233, 0.3)",
    description: "Answered directly from uploaded PDF document",
  },
  WEB: {
    label: "Web Research",
    icon: "Globe",
    color: "#34d399",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.3)",
    description: "Researched and verified across authoritative live web sources",
  },
  "WEB (Fallback)": {
    label: "Web (Document Fallback)",
    icon: "Compass",
    color: "#2dd4bf",
    bg: "rgba(20, 184, 166, 0.12)",
    border: "rgba(20, 184, 166, 0.3)",
    description: "Not found in document; verified via live web research",
  },
  CALCULATOR: {
    label: "Calculator",
    icon: "Calculator",
    color: "#fbbf24",
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.3)",
    description: "Computed using safe Python AST arithmetic engine",
  },
  CREATIVE: {
    label: "Creative Generation",
    icon: "Sparkles",
    color: "#f472b6",
    bg: "rgba(244, 63, 94, 0.12)",
    border: "rgba(244, 63, 94, 0.3)",
    description: "Generated original creative content via Gemini 3.5",
  },
  GENERAL: {
    label: "General Knowledge",
    icon: "BrainCircuit",
    color: "#a78bfa",
    bg: "rgba(139, 92, 246, 0.12)",
    border: "rgba(139, 92, 246, 0.3)",
    description: "Direct knowledge response via Gemini 3.5",
  },
  UNKNOWN: {
    label: "Assistant",
    icon: "Bot",
    color: "#94a3b8",
    bg: "rgba(148, 163, 184, 0.12)",
    border: "rgba(148, 163, 184, 0.3)",
    description: "General assistant response",
  },
};

export function getRouteConfig(route) {
  if (!route) return ROUTE_CONFIG.GENERAL;
  const upper = route.toUpperCase();
  if (upper.includes("FALLBACK")) return ROUTE_CONFIG["WEB (Fallback)"];
  if (upper.includes("DOC")) return ROUTE_CONFIG.DOCUMENT;
  if (upper.includes("WEB")) return ROUTE_CONFIG.WEB;
  if (upper.includes("CALC")) return ROUTE_CONFIG.CALCULATOR;
  if (upper.includes("CREATIVE")) return ROUTE_CONFIG.CREATIVE;
  if (upper.includes("GENERAL")) return ROUTE_CONFIG.GENERAL;
  return ROUTE_CONFIG.GENERAL;
}

export function formatConfidence(score) {
  if (score === null || score === undefined) return null;
  const pct = Math.round(score * 100);
  if (pct >= 70) return { label: "High", pct, color: "#10b981" };
  if (pct >= 40) return { label: "Medium", pct, color: "#f59e0b" };
  return { label: "Low", pct, color: "#94a3b8" };
}

export function extractDomain(url) {
  try {
    const parsed = new URL(url);
    let hostname = parsed.hostname;
    if (hostname.startsWith("www.")) {
      hostname = hostname.slice(4);
    }
    return hostname;
  } catch {
    return url;
  }
}

export function formatTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
}

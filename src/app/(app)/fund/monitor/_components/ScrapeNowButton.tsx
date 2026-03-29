"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ScrapeNowButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setState("running");
    setMessage(null);
    try {
      const res = await fetch("/api/fund/scrape?platform=upright", { method: "POST" });
      const data = await res.json() as { error?: string; inserted?: number; updated?: number; aiSummary?: string | null };

      if (!res.ok || data.error) {
        setState("error");
        setMessage(data.error ?? "Scrape failed");
        return;
      }

      setState("done");
      setMessage(
        `Done — ${data.inserted} new, ${data.updated} updated` +
          (data.aiSummary ? ` · AI brief generated` : "")
      );
      router.refresh();
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Network error");
    }
  }

  const label =
    state === "running"
      ? "Scraping Upright…"
      : state === "done"
      ? "Done ✓"
      : state === "error"
      ? "Retry"
      : "Scrape Upright Now";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      <button
        onClick={handleClick}
        disabled={state === "running"}
        style={{
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          background: state === "error" ? "rgba(239,68,68,0.15)" : state === "done" ? "rgba(34,197,94,0.15)" : "var(--accent)",
          color: state === "error" ? "#ef4444" : state === "done" ? "#22c55e" : "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: state === "running" ? "not-allowed" : "pointer",
          opacity: state === "running" ? 0.6 : 1,
          transition: "opacity 0.15s",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {state === "running" && (
          <span
            style={{
              width: 12,
              height: 12,
              border: "2px solid currentColor",
              borderTopColor: "transparent",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.8s linear infinite",
            }}
          />
        )}
        {label}
      </button>

      {message && (
        <span
          style={{
            fontSize: 11,
            color: state === "error" ? "#ef4444" : "var(--text-muted)",
            maxWidth: 280,
            textAlign: "right",
          }}
        >
          {message}
        </span>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

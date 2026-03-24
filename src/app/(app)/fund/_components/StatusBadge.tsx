import { STATUS_LABELS, type HoldingStatus } from "@/db/schema/fund";

const STATUS_STYLES: Record<
  HoldingStatus,
  { bg: string; color: string; dot: string }
> = {
  PERFORMING:          { bg: "rgba(0,168,107,0.12)", color: "#00a86b", dot: "#00a86b" },
  LATE_PAYMENT:        { bg: "rgba(255,176,0,0.12)", color: "#c47e00", dot: "#ffb000" },
  LOSS_MITIGATION:     { bg: "rgba(255,140,0,0.12)", color: "#c05a00", dot: "#ff8c00" },
  FORECLOSURE_EARLY:   { bg: "rgba(239,104,32,0.12)", color: "#c24000", dot: "#ef6820" },
  FORECLOSURE_MID:     { bg: "rgba(220,38,38,0.12)", color: "#b91c1c", dot: "#dc2626" },
  FORECLOSURE_LATE:    { bg: "rgba(185,28,28,0.15)", color: "#991b1b", dot: "#b91c1c" },
  REO:                 { bg: "rgba(124,58,237,0.12)", color: "#7c3aed", dot: "#7c3aed" },
  REO_LISTED:          { bg: "rgba(109,40,217,0.12)", color: "#6d28d9", dot: "#7c3aed" },
  REO_UNDER_CONTRACT:  { bg: "rgba(0,104,95,0.12)", color: "var(--accent)", dot: "var(--accent)" },
  BORROWER_WORKOUT:    { bg: "rgba(59,130,246,0.12)", color: "#1d4ed8", dot: "#3b82f6" },
  PAYOFF_EXPECTED:     { bg: "rgba(16,185,129,0.12)", color: "#059669", dot: "#10b981" },
  BANKRUPTCY:          { bg: "rgba(239,68,68,0.15)", color: "#dc2626", dot: "#ef4444" },
  TITLE_ISSUE:         { bg: "rgba(245,158,11,0.12)", color: "#b45309", dot: "#f59e0b" },
  NOTE_SALE:           { bg: "rgba(107,114,128,0.12)", color: "#4b5563", dot: "#9ca3af" },
  PARTIAL_RECOVERY:    { bg: "rgba(0,168,107,0.12)", color: "#00a86b", dot: "#00a86b" },
  SETTLED:             { bg: "rgba(107,114,128,0.10)", color: "#6b7280", dot: "#9ca3af" },
  WRITTEN_OFF:         { bg: "rgba(75,85,99,0.10)", color: "#6b7280", dot: "#6b7280" },
};

interface Props {
  status: HoldingStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: Props) {
  const style = STATUS_STYLES[status];
  const fontSize = size === "sm" ? 10 : 11;
  const padding = size === "sm" ? "2px 7px" : "3px 9px";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: style.bg,
        color: style.color,
        fontSize,
        fontWeight: 700,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        borderRadius: 100,
        padding,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: style.dot,
          flexShrink: 0,
        }}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PlatformBadge({ platform }: { platform: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    upright:     { bg: "rgba(0,104,95,0.10)", color: "var(--accent)" },
    sharestates: { bg: "rgba(59,130,246,0.10)", color: "#1d4ed8" },
    upgrade:     { bg: "rgba(124,58,237,0.10)", color: "#7c3aed" },
  };
  const labels: Record<string, string> = {
    upright: "Upright",
    sharestates: "Sharestates",
    upgrade: "Upgrade",
  };
  const s = styles[platform] ?? { bg: "rgba(107,114,128,0.10)", color: "#6b7280" };

  return (
    <span
      style={{
        display: "inline-block",
        background: s.bg,
        color: s.color,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        borderRadius: 100,
        padding: "2px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {labels[platform] ?? platform}
    </span>
  );
}

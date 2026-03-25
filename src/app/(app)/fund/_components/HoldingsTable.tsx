"use client";

import { useState, useMemo } from "react";
import { Pencil, AlertTriangle } from "lucide-react";
import { StatusBadge, PlatformBadge } from "./StatusBadge";
import { HoldingEditModal } from "./HoldingEditModal";
import type { FundHolding, Platform, HoldingStatus } from "@/db/schema/fund";
import { STATUS_LABELS } from "@/db/schema/fund";

// ─── Formatting ───────────────────────────────────────────────────────────────
const usd = (cents: number | null | undefined) => {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
};

const relativeDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
};

// Stale if no update in 90+ days
const isStale = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return true;
  const diff = Date.now() - new Date(dateStr).getTime();
  return diff > 90 * 24 * 60 * 60 * 1000;
};

// ─── Filters ──────────────────────────────────────────────────────────────────
const ALL_PLATFORMS: { value: Platform | "all"; label: string }[] = [
  { value: "all", label: "All Platforms" },
  { value: "upright", label: "Upright / FTF" },
  { value: "sharestates", label: "Sharestates" },
  { value: "upgrade", label: "Upgrade" },
];

const STATUS_GROUPS = [
  { value: "all", label: "All Statuses" },
  { value: "near_resolution", label: "Near Resolution" },
  { value: "in_progress", label: "In Progress" },
  { value: "stalled", label: "Stalled / At Risk" },
  { value: "resolved", label: "Resolved" },
];

const NEAR_RESOLUTION: HoldingStatus[] = ["PAYOFF_EXPECTED", "REO_UNDER_CONTRACT", "BORROWER_WORKOUT", "PARTIAL_RECOVERY"];
const IN_PROGRESS: HoldingStatus[] = ["PERFORMING", "FORECLOSURE_MID", "FORECLOSURE_LATE", "REO", "REO_LISTED", "NOTE_SALE", "LOSS_MITIGATION"];
const STALLED: HoldingStatus[] = ["LATE_PAYMENT", "FORECLOSURE_EARLY", "BANKRUPTCY", "TITLE_ISSUE"];
const RESOLVED: HoldingStatus[] = ["SETTLED", "WRITTEN_OFF"];

// ─── Summary bar ─────────────────────────────────────────────────────────────
function SummaryBar({ holdings }: { holdings: FundHolding[] }) {
  const totalCostBasis = holdings.reduce((s, h) => s + (h.costBasisApex ?? 0), 0);
  const totalLow = holdings.reduce((s, h) => s + (h.liquidationEstimateLow ?? 0), 0);
  const totalHigh = holdings.reduce((s, h) => s + (h.liquidationEstimateHigh ?? 0), 0);
  const staleCount = holdings.filter((h) => isStale(h.lastUpdateDate)).length;

  const cards = [
    { label: "Cost Basis (Apex)", value: usd(totalCostBasis), sub: "Total invested" },
    { label: "Positions", value: String(holdings.length), sub: "Active + resolved" },
    { label: "Recovery Est. Low", value: usd(totalLow), sub: "Conservative" },
    { label: "Recovery Est. High", value: usd(totalHigh), sub: "Optimistic" },
    ...(staleCount > 0
      ? [{ label: "Stale (>90 days)", value: String(staleCount), sub: "No recent update", warn: true }]
      : []),
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cards.length}, 1fr)`,
        gap: 16,
        marginBottom: 24,
      }}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="dashboard-card"
          style={{ padding: "14px 18px" }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: (card as { warn?: boolean }).warn ? "var(--warning)" : "var(--text-muted)",
              marginBottom: 4,
            }}
          >
            {card.label}
          </div>
          <div
            className="num"
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: (card as { warn?: boolean }).warn ? "var(--warning)" : "var(--text-primary)",
              lineHeight: 1,
              fontFamily: "var(--font-heebo, var(--font-sans))",
            }}
          >
            {card.value}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  initialHoldings: FundHolding[];
}

export function HoldingsTable({ initialHoldings }: Props) {
  const [holdings, setHoldings] = useState(initialHoldings);
  const [editTarget, setEditTarget] = useState<FundHolding | null>(null);
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [statusGroup, setStatusGroup] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let rows = holdings;

    if (platformFilter !== "all") {
      rows = rows.filter((h) => h.platform === platformFilter);
    }

    if (statusGroup !== "all") {
      const groups: Record<string, HoldingStatus[]> = {
        near_resolution: NEAR_RESOLUTION,
        in_progress: IN_PROGRESS,
        stalled: STALLED,
        resolved: RESOLVED,
      };
      const validStatuses = groups[statusGroup] ?? [];
      rows = rows.filter((h) => validStatuses.includes(h.status));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (h) =>
          h.propertyAddress?.toLowerCase().includes(q) ||
          h.offeringId.toLowerCase().includes(q) ||
          h.city?.toLowerCase().includes(q) ||
          h.state?.toLowerCase().includes(q) ||
          STATUS_LABELS[h.status].toLowerCase().includes(q)
      );
    }

    return rows;
  }, [holdings, platformFilter, statusGroup, search]);

  function handleSaved(updated: FundHolding) {
    setHoldings((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
  }

  return (
    <div>
      <SummaryBar holdings={holdings} />

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search address, ID, status..."
          style={{
            flex: "1 1 200px",
            padding: "8px 14px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            background: "var(--surface-input)",
            color: "var(--text-primary)",
            fontSize: 13,
            outline: "none",
          }}
        />
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value as Platform | "all")}
          style={{
            padding: "8px 32px 8px 12px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            background: "var(--surface-input)",
            color: "var(--text-primary)",
            fontSize: 13,
            cursor: "pointer",
            outline: "none",
          }}
        >
          {ALL_PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <select
          value={statusGroup}
          onChange={(e) => setStatusGroup(e.target.value)}
          style={{
            padding: "8px 32px 8px 12px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            background: "var(--surface-input)",
            color: "var(--text-primary)",
            fontSize: 13,
            cursor: "pointer",
            outline: "none",
          }}
        >
          {STATUS_GROUPS.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginInlineStart: 4 }}>
          {filtered.length} of {holdings.length} positions
        </span>
      </div>

      {/* Table */}
      <div
        className="dashboard-card"
        style={{ overflow: "hidden", padding: 0 }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border)",
                  background: "var(--surface-elevated)",
                }}
              >
                {[
                  "Platform",
                  "ID",
                  "Property",
                  "Status",
                  "Invested",
                  "Principal",
                  "Recovery Range",
                  "Last Update",
                  "",
                ].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      padding: "48px 24px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: 13,
                    }}
                  >
                    No holdings match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((holding) => {
                  const stale = isStale(holding.lastUpdateDate);
                  return (
                    <tr
                      key={holding.id}
                      style={{
                        borderBottom: "1px solid var(--border)",
                        transition: "background 0.1s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background =
                          "var(--surface-elevated)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                      }}
                      onClick={() => setEditTarget(holding)}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <PlatformBadge platform={holding.platform} />
                        {holding.isRbnf && (
                          <span
                            style={{
                              marginLeft: 4,
                              fontSize: 9,
                              fontWeight: 700,
                              background: "rgba(124,58,237,0.10)",
                              color: "#7c3aed",
                              borderRadius: 100,
                              padding: "1px 5px",
                            }}
                          >
                            RBNF
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontFamily: "var(--font-mono, monospace)",
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {holding.offeringId}
                      </td>
                      <td style={{ padding: "12px 14px", minWidth: 180 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            lineHeight: 1.3,
                          }}
                        >
                          {holding.propertyAddress || "—"}
                        </div>
                        {holding.city && (
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                            {holding.city}{holding.state ? `, ${holding.state}` : ""}
                          </div>
                        )}
                        {holding.hurricaneDamage && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                              fontSize: 9,
                              fontWeight: 700,
                              color: "#ef6820",
                              marginTop: 2,
                            }}
                          >
                            <AlertTriangle style={{ width: 9, height: 9 }} />
                            Hurricane
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <StatusBadge status={holding.status} size="sm" />
                        {holding.subStatus && (
                          <div
                            style={{
                              fontSize: 10,
                              color: "var(--text-muted)",
                              marginTop: 3,
                              maxWidth: 180,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={holding.subStatus}
                          >
                            {holding.subStatus}
                          </div>
                        )}
                      </td>
                      <td
                        className="num"
                        style={{
                          padding: "12px 14px",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {usd(holding.originalInvestment)}
                      </td>
                      <td
                        className="num"
                        style={{
                          padding: "12px 14px",
                          fontSize: 13,
                          color: "var(--text-secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {usd(holding.currentPrincipal)}
                      </td>
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        {holding.liquidationEstimateLow != null ||
                        holding.liquidationEstimateHigh != null ? (
                          <div>
                            <span
                              className="num"
                              style={{
                                fontSize: 13,
                                color: "var(--text-secondary)",
                              }}
                            >
                              {usd(holding.liquidationEstimateLow)} – {usd(holding.liquidationEstimateHigh)}
                            </span>
                            {holding.liquidationTimelineMonths != null && (
                              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
                                ~{holding.liquidationTimelineMonths}mo
                                {holding.liquidationConfidence && (
                                  <span
                                    style={{
                                      marginLeft: 4,
                                      fontWeight: 700,
                                      color:
                                        holding.liquidationConfidence === "high"
                                          ? "#00a86b"
                                          : holding.liquidationConfidence === "medium"
                                          ? "#c47e00"
                                          : "#b91c1c",
                                    }}
                                  >
                                    · {holding.liquidationConfidence}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            color: stale ? "var(--warning)" : "var(--text-muted)",
                            fontWeight: stale ? 700 : 400,
                          }}
                        >
                          {stale && <AlertTriangle style={{ width: 12, height: 12 }} />}
                          {relativeDate(holding.lastUpdateDate)}
                        </div>
                        {holding.lastUpdateSource && (
                          <div
                            style={{
                              fontSize: 9,
                              color: "var(--text-muted)",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              marginTop: 2,
                            }}
                          >
                            {holding.lastUpdateSource.replace("_", " ")}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditTarget(holding);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "5px 10px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border)",
                            background: "transparent",
                            color: "var(--text-secondary)",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Pencil style={{ width: 11, height: 11 }} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editTarget && (
        <HoldingEditModal
          holding={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

import { getInvestors } from "@/lib/actions/investors";
import type { MondayInvestor } from "@/lib/monday";

// ─── Formatters ───────────────────────────────────────────────────────────────

const usd = (cents: number | null) =>
  cents == null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(cents / 100);

const pct = (a: number | null, b: number | null) => {
  if (!a || !b || b === 0) return "—";
  return `${((a / b) * 100).toFixed(1)}%`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${accent ? "var(--accent)" : "var(--border)"}`,
        padding: "20px 24px",
        flex: 1,
        minWidth: 160,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: "var(--text-muted)",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 900,
          letterSpacing: "-0.04em",
          color: accent ? "var(--accent)" : "var(--text-primary)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string | null }) {
  if (!status) return <span style={{ color: "var(--text-muted)" }}>—</span>;
  const lower = status.toLowerCase();
  const color =
    lower.includes("active") || lower.includes("current")
      ? "#22c55e"
      : lower.includes("exit") || lower.includes("redeem") || lower.includes("closed")
      ? "#6b7280"
      : lower.includes("pend") || lower.includes("prospect")
      ? "#eab308"
      : "var(--text-secondary)";
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 100,
        background: `${color}20`,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function SetupCard({ missingToken, missingBoard }: { missingToken: boolean; missingBoard: boolean }) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid rgba(99,102,241,0.3)",
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 6,
          }}
        >
          Connect Monday.com to view LP investor data
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
          Your investor register lives in Monday.com. Add two environment variables in Railway
          to activate this module.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <SetupStep
          done={!missingToken}
          name="MONDAY_API_TOKEN"
          hint="Monday.com → Profile → Developer → API → Generate or copy your personal token"
        />
        <SetupStep
          done={!missingBoard}
          name="MONDAY_INVESTORS_BOARD_ID"
          hint="Open your LP investors board in Monday → the numeric ID is in the URL (e.g. /boards/1234567890)"
        />
      </div>

      <div
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
          background: "var(--surface-elevated)",
          borderRadius: 8,
          padding: "10px 14px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ marginBottom: 4, color: "var(--text-secondary)", fontFamily: "inherit" }}>
          In Railway dashboard → your service → Variables:
        </div>
        {missingToken && <div>MONDAY_API_TOKEN=eyJhbGciO…</div>}
        {missingBoard && <div>MONDAY_INVESTORS_BOARD_ID=1234567890</div>}
      </div>
    </div>
  );
}

function SetupStep({
  done,
  name,
  hint,
}: {
  done: boolean;
  name: string;
  hint: string;
}) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: done ? "#22c55e" : "var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {done ? (
          <span style={{ color: "#fff", fontSize: 12 }}>✓</span>
        ) : (
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>○</span>
        )}
      </div>
      <div>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            fontWeight: 700,
            color: done ? "#22c55e" : "var(--text-primary)",
          }}
        >
          {name}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{hint}</div>
      </div>
    </div>
  );
}

// ─── Investor table row ───────────────────────────────────────────────────────

function InvestorRow({ inv, rank }: { inv: MondayInvestor; rank: number }) {
  const callPct = pct(inv.calledCents, inv.commitmentCents);
  const extraEntries = Object.entries(inv.extra).slice(0, 3);

  return (
    <tr
      style={{
        borderBottom: "1px solid var(--border)",
      }}
    >
      <td
        style={{
          padding: "12px 16px",
          fontSize: 12,
          color: "var(--text-muted)",
          fontFamily: "monospace",
          width: 32,
        }}
      >
        {rank}
      </td>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
          {inv.name}
        </div>
        {inv.entityType && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            {inv.entityType}
          </div>
        )}
        {inv.email && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
            {inv.email}
          </div>
        )}
      </td>
      <td
        style={{
          padding: "12px 16px",
          fontSize: 13,
          fontVariantNumeric: "tabular-nums",
          textAlign: "right",
          color: "var(--text-primary)",
        }}
      >
        {usd(inv.commitmentCents)}
      </td>
      <td
        style={{
          padding: "12px 16px",
          textAlign: "right",
          fontSize: 13,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <div style={{ color: "var(--text-primary)" }}>{usd(inv.calledCents)}</div>
        {callPct !== "—" && (
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{callPct} drawn</div>
        )}
      </td>
      <td
        style={{
          padding: "12px 16px",
          textAlign: "right",
          fontSize: 13,
          fontVariantNumeric: "tabular-nums",
          color: "var(--text-primary)",
        }}
      >
        {usd(inv.navCents)}
      </td>
      <td
        style={{
          padding: "12px 16px",
          textAlign: "right",
          fontSize: 13,
          fontVariantNumeric: "tabular-nums",
          color: "var(--text-secondary)",
        }}
      >
        {usd(inv.returnedCents)}
      </td>
      <td style={{ padding: "12px 16px" }}>
        <StatusPill status={inv.investorStatus} />
      </td>
      {extraEntries.length > 0 && (
        <td style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {extraEntries.map(([k, v]) => (
              <div key={k} style={{ fontSize: 11, color: "var(--text-muted)" }}>
                <span style={{ fontWeight: 600 }}>{k}:</span> {v}
              </div>
            ))}
          </div>
        </td>
      )}
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default async function FundInvestorsPage() {
  const hasToken = !!process.env.MONDAY_API_TOKEN;
  const hasBoard = !!process.env.MONDAY_INVESTORS_BOARD_ID;

  if (!hasToken || !hasBoard) {
    return (
      <div style={{ maxWidth: 600 }}>
        <SetupCard missingToken={!hasToken} missingBoard={!hasBoard} />
      </div>
    );
  }

  const result = await getInvestors();

  if (result.error) {
    return (
      <div
        style={{
          background: "var(--surface-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid rgba(239,68,68,0.3)",
          padding: 24,
          color: "var(--text-secondary)",
          fontSize: 13,
        }}
      >
        <div style={{ fontWeight: 700, color: "#ef4444", marginBottom: 6 }}>
          Monday.com connection error
        </div>
        {result.error.message}
      </div>
    );
  }

  const { investors, boardName } = result.data;

  // ── KPI calculations ──────────────────────────────────────────────────
  const totalCommitment = investors.reduce((s, i) => s + (i.commitmentCents ?? 0), 0);
  const totalCalled = investors.reduce((s, i) => s + (i.calledCents ?? 0), 0);
  const totalNav = investors.reduce((s, i) => s + (i.navCents ?? 0), 0);
  const totalReturned = investors.reduce((s, i) => s + (i.returnedCents ?? 0), 0);

  const activeCount = investors.filter(
    (i) => i.investorStatus && /active|current/i.test(i.investorStatus)
  ).length;

  // Sort by commitment desc, then by name
  const sorted = [...investors].sort((a, b) => {
    const diff = (b.commitmentCents ?? 0) - (a.commitmentCents ?? 0);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });

  const hasExtraColumns = investors.some((i) => Object.keys(i.extra).length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Board header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Monday board:
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--text-primary)",
              background: "var(--surface-elevated)",
              borderRadius: 6,
              padding: "2px 8px",
            }}
          >
            {boardName}
          </span>
        </div>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {investors.length} LP{investors.length !== 1 ? "s" : ""}
          {activeCount > 0 && ` · ${activeCount} active`}
        </span>
      </div>

      {/* KPI row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KpiCard
          label="Total Committed"
          value={usd(totalCommitment || null)}
          sub={`${investors.length} limited partners`}
          accent
        />
        <KpiCard
          label="Capital Called"
          value={usd(totalCalled || null)}
          sub={totalCommitment ? `${((totalCalled / totalCommitment) * 100).toFixed(0)}% of commitment` : undefined}
        />
        <KpiCard
          label="Current NAV"
          value={usd(totalNav || null)}
          sub="Fair market value"
        />
        <KpiCard
          label="Distributions"
          value={usd(totalReturned || null)}
          sub="Capital returned to LPs"
        />
      </div>

      {/* LP table */}
      <div
        style={{
          background: "var(--surface-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--text-muted)",
          }}
        >
          LP Register
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border)",
                  background: "var(--surface-elevated)",
                }}
              >
                <th style={{ padding: "10px 16px", textAlign: "left", width: 32 }} />
                <th
                  style={{
                    padding: "10px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--text-muted)",
                  }}
                >
                  Investor
                </th>
                <th
                  style={{
                    padding: "10px 16px",
                    textAlign: "right",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--text-muted)",
                  }}
                >
                  Commitment
                </th>
                <th
                  style={{
                    padding: "10px 16px",
                    textAlign: "right",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--text-muted)",
                  }}
                >
                  Called
                </th>
                <th
                  style={{
                    padding: "10px 16px",
                    textAlign: "right",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--text-muted)",
                  }}
                >
                  NAV
                </th>
                <th
                  style={{
                    padding: "10px 16px",
                    textAlign: "right",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--text-muted)",
                  }}
                >
                  Distributions
                </th>
                <th
                  style={{
                    padding: "10px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--text-muted)",
                  }}
                >
                  Status
                </th>
                {hasExtraColumns && (
                  <th
                    style={{
                      padding: "10px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--text-muted)",
                    }}
                  >
                    More
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((inv, i) => (
                <InvestorRow key={inv.id} inv={inv} rank={i + 1} />
              ))}
            </tbody>
          </table>
        </div>

        {investors.length === 0 && (
          <div
            style={{
              padding: 48,
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: 13,
            }}
          >
            No investors found in this board.
          </div>
        )}
      </div>

      {/* Column mapping note */}
      <div
        style={{
          fontSize: 11,
          color: "var(--text-muted)",
          lineHeight: 1.6,
        }}
      >
        Data synced live from Monday.com board &ldquo;{boardName}&rdquo; · Financial
        columns auto-detected from column names · Reload page to refresh
      </div>
    </div>
  );
}

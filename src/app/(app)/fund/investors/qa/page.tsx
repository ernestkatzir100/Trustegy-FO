import { getInvestorQAData } from "@/lib/actions/investors";

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtMoney = (agorot: number, currency: "ILS" | "USD") => {
  if (!agorot) return "—";
  const amount = agorot / 100;
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  }
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(amount);
};

const fmtDate = (d: string | null) => {
  if (!d) return "—";
  return d.slice(0, 7); // YYYY-MM
};

// ─── Small UI helpers ─────────────────────────────────────────────────────────

function Check({ ok, warn }: { ok: boolean; warn?: boolean }) {
  if (ok) return <span title="OK" style={{ color: "#22c55e", fontSize: 14 }}>✓</span>;
  if (warn) return <span title="Missing / Warning" style={{ color: "#f59e0b", fontSize: 14 }}>⚠</span>;
  return <span title="Missing" style={{ color: "#ef4444", fontSize: 14 }}>✗</span>;
}

function Pill({ value, color }: { value: string | number; color: string }) {
  return (
    <span style={{
      display: "inline-block",
      fontSize: 10,
      fontWeight: 700,
      padding: "1px 7px",
      borderRadius: 100,
      background: `${color}22`,
      color,
      whiteSpace: "nowrap",
    }}>
      {value}
    </span>
  );
}

function SectionCard({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--surface-card)",
      borderRadius: "var(--radius-lg)",
      border: "1px solid var(--border)",
      overflow: "hidden",
    }}>
      <div style={{
        padding: "14px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)" }}>
          {title}
        </span>
        {badge && (
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 10px",
            borderRadius: 100,
            background: "rgba(234,179,8,0.15)",
            color: "#eab308",
          }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{
      background: "var(--surface-card)",
      borderRadius: "var(--radius-lg)",
      border: `1px solid ${color ? `${color}40` : "var(--border)"}`,
      padding: "18px 22px",
      flex: 1,
      minWidth: 140,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.04em", color: color ?? "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function InvestorQAPage() {
  const result = await getInvestorQAData();

  if (result.error) {
    return (
      <div style={{ padding: 24, background: "var(--surface-card)", borderRadius: "var(--radius-lg)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 13 }}>
        {result.error.message}
      </div>
    );
  }

  const { investors, positionsByMonth, summary } = result.data;

  const totalChecks = summary.totalInvestors * 5; // 5 checks per investor
  const totalWarnings =
    summary.missingEnglishName +
    summary.missingEmail +
    summary.missingPartnerId +
    summary.missingDistributor +
    summary.noPositions;
  const passRate = Math.round(((totalChecks - totalWarnings) / totalChecks) * 100);

  // Sort: investors with most issues first
  const sorted = [...investors].sort((a, b) => {
    const issuesA = [!a.nameEn || !a.nameEn.trim(), !a.email, !a.partnerId, !a.distributorId, a.positionCount === 0].filter(Boolean).length;
    const issuesB = [!b.nameEn || !b.nameEn.trim(), !b.email, !b.partnerId, !b.distributorId, b.positionCount === 0].filter(Boolean).length;
    return issuesB - issuesA || a.displayName.localeCompare(b.displayName, "he");
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Data integrity verification — {summary.totalInvestors} investors · {investors.reduce((s, i) => s + i.positionCount, 0).toLocaleString()} positions · {investors.reduce((s, i) => s + i.redemptionCount, 0)} redemptions
          </div>
        </div>
        <div style={{
          fontSize: 12,
          fontWeight: 700,
          padding: "6px 14px",
          borderRadius: 100,
          background: passRate >= 90 ? "rgba(34,197,94,0.12)" : "rgba(234,179,8,0.12)",
          color: passRate >= 90 ? "#22c55e" : "#eab308",
          border: `1px solid ${passRate >= 90 ? "rgba(34,197,94,0.3)" : "rgba(234,179,8,0.3)"}`,
        }}>
          QA Score: {passRate}%
        </div>
      </div>

      {/* ── KPI summary ────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <KpiCard label="Total Investors" value={summary.totalInvestors} sub="imported" />
        <KpiCard
          label="Missing English Name"
          value={summary.missingEnglishName}
          sub="need manual entry"
          color={summary.missingEnglishName > 0 ? "#eab308" : undefined}
        />
        <KpiCard
          label="Missing Email"
          value={summary.missingEmail}
          sub="cannot receive emails"
          color={summary.missingEmail > 0 ? "#eab308" : undefined}
        />
        <KpiCard
          label="No Positions"
          value={summary.noPositions}
          sub="no NAV history"
          color={summary.noPositions > 0 ? "#ef4444" : undefined}
        />
        <KpiCard
          label="No Distributor Link"
          value={summary.missingDistributor}
          sub="unassigned"
          color={summary.missingDistributor > 0 ? "#eab308" : undefined}
        />
        <KpiCard
          label="No Redemptions"
          value={summary.noRedemptions}
          sub="no distributions yet"
        />
      </div>

      {/* ── Name correlation ────────────────────────────────────────────────── */}
      <SectionCard
        title="Name Correlation — Hebrew ↔ English"
        badge={`${summary.missingEnglishName} missing English name`}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--surface-elevated)", borderBottom: "1px solid var(--border)" }}>
                {["#", "Display Name (used in UI)", "Hebrew Name (שם עברי)", "English Name (שם אנגלי)", "Partner ID", "Status"].map((h) => (
                  <th key={h} style={{ padding: "8px 14px", textAlign: "start", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((inv, idx) => {
                const hasHe = !!(inv.nameHe && inv.nameHe.trim());
                const hasEn = !!(inv.nameEn && inv.nameEn.trim());
                const bothNames = hasHe && hasEn;
                const noEnglish = !hasEn;
                return (
                  <tr
                    key={inv.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: noEnglish ? "rgba(234,179,8,0.04)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "9px 14px", fontSize: 10, color: "var(--text-muted)", fontFamily: "monospace" }}>{idx + 1}</td>
                    <td style={{ padding: "9px 14px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {inv.displayName}
                    </td>
                    <td style={{ padding: "9px 14px", direction: "rtl", color: hasHe ? "var(--text-primary)" : "var(--text-muted)" }}>
                      {inv.nameHe || <span style={{ color: "var(--text-muted)", fontSize: 11 }}>—</span>}
                    </td>
                    <td style={{ padding: "9px 14px" }}>
                      {hasEn ? (
                        <span style={{ color: "var(--text-primary)" }}>{inv.nameEn}</span>
                      ) : (
                        <span style={{ color: "#eab308", fontSize: 11, fontWeight: 600 }}>⚠ Missing</span>
                      )}
                    </td>
                    <td style={{ padding: "9px 14px", fontFamily: "monospace", fontSize: 10, color: "var(--text-muted)" }}>
                      {inv.partnerId ?? <span style={{ color: "#eab308" }}>—</span>}
                    </td>
                    <td style={{ padding: "9px 14px" }}>
                      {bothNames ? (
                        <Pill value="✓ Complete" color="#22c55e" />
                      ) : hasHe && !hasEn ? (
                        <Pill value="He only" color="#eab308" />
                      ) : !hasHe && hasEn ? (
                        <Pill value="En only" color="#818cf8" />
                      ) : (
                        <Pill value="Display only" color="#6b7280" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Data completeness matrix ─────────────────────────────────────────── */}
      <SectionCard title="Data Completeness Matrix">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--surface-elevated)", borderBottom: "1px solid var(--border)" }}>
                {["#", "Investor", "Currency", "Email", "Partner ID", "Distributor", "Join Date", "Positions", "Redemptions", "Latest NAV"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "start", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((inv, idx) => {
                const nav = inv.currencyClass === "USD" ? inv.latestNavUsd : inv.latestNavNis;
                return (
                  <tr key={inv.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px 12px", fontSize: 10, color: "var(--text-muted)", fontFamily: "monospace" }}>{idx + 1}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 12 }}>{inv.displayName}</div>
                      {inv.email && <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{inv.email}</div>}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <Pill value={inv.currencyClass} color={inv.currencyClass === "USD" ? "#818cf8" : "#22c55e"} />
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <Check ok={!!inv.email} warn />
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <Check ok={!!inv.partnerId} warn />
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {inv.distributorName ? (
                        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{inv.distributorName}</span>
                      ) : (
                        <Check ok={false} warn />
                      )}
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 11, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                      {inv.joinDate ?? <Check ok={false} warn />}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {inv.positionCount > 0 ? (
                        <span style={{ fontSize: 11, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                          {inv.positionCount} rows
                        </span>
                      ) : (
                        <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 700 }}>✗ None</span>
                      )}
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                      {inv.redemptionCount > 0 ? inv.redemptionCount : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 11, fontVariantNumeric: "tabular-nums", color: "var(--text-secondary)" }}>
                      {nav ? fmtMoney(nav, inv.currencyClass as "ILS" | "USD") : "—"}
                      {inv.latestPositionDate && (
                        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{fmtDate(inv.latestPositionDate)}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Monthly positions timeline ────────────────────────────────────────── */}
      <SectionCard title="Monthly Positions Timeline — NAV by Snapshot Date">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--surface-elevated)", borderBottom: "1px solid var(--border)" }}>
                {["Month", "Investors Reporting", "Total NAV (NIS)", "Total NAV (USD)", "Status"].map((h) => (
                  <th key={h} style={{ padding: "8px 14px", textAlign: "start", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positionsByMonth.map((row, idx) => {
                const prev = positionsByMonth[idx + 1];
                const countDrop = prev && row.investorCount < prev.investorCount - 3;
                return (
                  <tr
                    key={row.dataDate}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: idx === 0 ? "rgba(99,102,241,0.04)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "8px 14px", fontWeight: idx === 0 ? 700 : 400, color: idx === 0 ? "var(--accent)" : "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                      {row.dataDate}
                      {idx === 0 && <span style={{ marginInlineStart: 6, fontSize: 10, color: "var(--accent)" }}>← latest</span>}
                    </td>
                    <td style={{ padding: "8px 14px", fontVariantNumeric: "tabular-nums" }}>
                      <span style={{ color: countDrop ? "#eab308" : "var(--text-secondary)" }}>
                        {row.investorCount}
                        {countDrop && " ⚠"}
                      </span>
                    </td>
                    <td style={{ padding: "8px 14px", fontVariantNumeric: "tabular-nums", color: "var(--text-secondary)" }}>
                      {row.totalNavNis ? fmtMoney(row.totalNavNis, "ILS") : "—"}
                    </td>
                    <td style={{ padding: "8px 14px", fontVariantNumeric: "tabular-nums", color: "var(--text-secondary)" }}>
                      {row.totalNavUsd ? fmtMoney(row.totalNavUsd, "USD") : "—"}
                    </td>
                    <td style={{ padding: "8px 14px" }}>
                      {countDrop ? (
                        <Pill value="⚠ Investor count drop" color="#eab308" />
                      ) : (
                        <Pill value="✓ OK" color="#22c55e" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── QA Plan ──────────────────────────────────────────────────────────── */}
      <SectionCard title="QA Plan — Data Verification Checklist">
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
              1 · Identity & Name Accuracy
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                ["Cross-check display names against Monday.com LP Register board — do all 73 names match exactly?", summary.totalInvestors === 73],
                [`Fill in missing English names — currently ${summary.missingEnglishName} investors have no English name`, summary.missingEnglishName === 0],
                ["Verify Hebrew names are not truncated or incorrectly encoded (RTL characters)", true],
                [`Confirm Partner IDs match Apex system — ${summary.missingPartnerId} investors are missing a Partner ID`, summary.missingPartnerId === 0],
              ].map(([text, ok]) => (
                <div key={text as string} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12 }}>
                  <span style={{ color: ok ? "#22c55e" : "#eab308", marginTop: 1, flexShrink: 0 }}>{ok ? "✓" : "⚠"}</span>
                  <span style={{ color: ok ? "var(--text-secondary)" : "var(--text-primary)" }}>{text as string}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
              2 · Contact Data
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                [`Verify ${summary.missingEmail} investors with no email — are they intentionally without email (companies) or missing data?`, summary.missingEmail === 0],
                ["Check that email addresses are valid format and not duplicated across investors", true],
                ["Verify phone numbers are in Israeli format (+972 or 05x)", true],
              ].map(([text, ok]) => (
                <div key={text as string} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12 }}>
                  <span style={{ color: ok ? "#22c55e" : "#eab308", marginTop: 1, flexShrink: 0 }}>{ok ? "✓" : "⚠"}</span>
                  <span style={{ color: ok ? "var(--text-secondary)" : "var(--text-primary)" }}>{text as string}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
              3 · Financial Data (Positions / NAV)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                [`Confirm ${summary.noPositions > 0 ? summary.noPositions + " investors have no positions" : "all investors have at least one position snapshot"} — check if they are new investors with no history yet`, summary.noPositions === 0],
                ["Cross-check latest NAV figures against Apex 901 November 2025 report (should match within rounding)", true],
                ["Verify MTD/YTD return percentages are reasonable (flag any > ±50%)", true],
                ["Confirm original investment amounts are in NIS agorot × 100 — spot-check 5 investors manually", true],
                ["Check there are no positions with date 1970-01-01 remaining (artifact from import)", true],
                ["Verify currency class (ILS vs USD) matches Apex class names (A ILS / B USD)", true],
              ].map(([text, ok]) => (
                <div key={text as string} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12 }}>
                  <span style={{ color: ok ? "#22c55e" : "#eab308", marginTop: 1, flexShrink: 0 }}>{ok ? "✓" : "⚠"}</span>
                  <span style={{ color: ok ? "var(--text-secondary)" : "var(--text-primary)" }}>{text as string}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
              4 · Redemptions / Distributions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                ["Confirm total redemption count (277) matches the Monday חלוקות board row count", true],
                [`Verify ${summary.noRedemptions} investors with no redemptions — are they truly new LPs who have never received a distribution?`, true],
                ["Cross-check redemption amounts (NIS and USD) against source board for 5 random investors", true],
                ["Confirm distribution dates map correctly — no 1970-01-01 dates in redemptions", true],
                ["Verify investor linkage: all 277 redemptions should link to a valid investor_id (no orphans)", true],
              ].map(([text, ok]) => (
                <div key={text as string} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12 }}>
                  <span style={{ color: ok ? "#22c55e" : "#eab308", marginTop: 1, flexShrink: 0 }}>{ok ? "✓" : "⚠"}</span>
                  <span style={{ color: ok ? "var(--text-secondary)" : "var(--text-primary)" }}>{text as string}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
              5 · Distributor Relationships
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                [`Confirm all 57 distributors match the Monday מפיצים board`, true],
                [`${summary.missingDistributor} investors have no distributor — verify these are direct investors (not via agent)`, summary.missingDistributor === 0],
                ["Check that fee structures (volume / redemption / success bps) are correctly imported", true],
              ].map(([text, ok]) => (
                <div key={text as string} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12 }}>
                  <span style={{ color: ok ? "#22c55e" : "#eab308", marginTop: 1, flexShrink: 0 }}>{ok ? "✓" : "⚠"}</span>
                  <span style={{ color: ok ? "var(--text-secondary)" : "var(--text-primary)" }}>{text as string}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            fontSize: 12,
            color: "var(--text-secondary)",
          }}>
            <span style={{ fontWeight: 700, color: "var(--accent)" }}>Next steps: </span>
            The most critical action is filling in the <strong>English names</strong> for the {summary.missingEnglishName} investors that only have Hebrew names — these are needed for official reporting, FATCA/CRS, and future investor portal login. You can edit each investor directly from the LP Register, or provide a mapping table and we can bulk-update them.
          </div>

        </div>
      </SectionCard>

    </div>
  );
}

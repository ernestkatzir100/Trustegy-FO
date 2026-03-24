export default function FundAnalyticsPage() {
  return <PlaceholderPage title="Analytics" description="Recovery charts, timeline waterfall, and cash flow projections — coming in Phase 3." />;
}

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 320,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-lg)",
        border: "1px dashed var(--border)",
        padding: 48,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 32,
          fontWeight: 900,
          color: "var(--border-strong)",
          letterSpacing: "-0.04em",
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 400, lineHeight: 1.6 }}>
        {description}
      </p>
      <span
        style={{
          marginTop: 16,
          display: "inline-block",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          background: "var(--surface-elevated)",
          borderRadius: 100,
          padding: "4px 12px",
        }}
      >
        Coming soon
      </span>
    </div>
  );
}

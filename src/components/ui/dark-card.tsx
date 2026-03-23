"use client";

interface DarkCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function DarkCard({
  children,
  className = "",
  hover = false,
}: DarkCardProps) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-subtle, var(--border-subtle))",
        borderRadius: "16px",
        padding: "20px 24px",
        transition: hover
          ? "box-shadow 0.2s ease, transform 0.2s ease"
          : undefined,
      }}
      onMouseEnter={
        hover
          ? (e) => {
              e.currentTarget.style.boxShadow =
                "0 8px 32px rgba(0,0,0,0.3)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          : undefined
      }
      onMouseLeave={
        hover
          ? (e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }
          : undefined
      }
      className={className}
    >
      {children}
    </div>
  );
}

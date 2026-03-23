import { getTranslations } from "next-intl/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppShell } from "@/components/layout/AppShell";
import { ShefaPanel } from "@/components/layout/ShefaPanel";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("viewport");

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Viewport warning for screens below 1280px */}
      <div
        className="hidden max-[1279px]:flex fixed inset-0 z-[200] items-center justify-center p-10"
        style={{ background: "var(--bg)" }}
      >
        <p style={{ fontSize: 15, color: "var(--text-secondary)", textAlign: "center" }}>
          {t("warning")}
        </p>
      </div>

      <Sidebar />
      <AppShell>{children}</AppShell>
      <ShefaPanel />
    </div>
  );
}

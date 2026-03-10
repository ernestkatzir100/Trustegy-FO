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
    <div className="flex min-h-screen bg-cream">
      {/* Viewport warning for screens below 1280px */}
      <div className="hidden max-[1279px]:flex fixed inset-0 z-[200] bg-cream items-center justify-center p-10">
        <p className="text-text-secondary text-center text-[15px]">
          {t("warning")}
        </p>
      </div>

      <Sidebar />
      <AppShell>{children}</AppShell>
      <ShefaPanel />
    </div>
  );
}

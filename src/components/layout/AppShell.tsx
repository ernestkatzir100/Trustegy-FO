import { ThemeToggle } from "./ThemeToggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 ms-[256px] min-h-screen">
      {/* Sticky top bar — glass style matching Stitch */}
      <header
        className="sticky top-0 z-40 flex items-center justify-end"
        style={{
          padding: "16px 48px",
          background: "rgba(255, 255, 255, 0.90)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <ThemeToggle />
      </header>
      <div
        className="animate-[fade-in_300ms_ease] motion-reduce:animate-none"
        style={{ padding: "40px 48px", maxWidth: 1280, margin: "0 auto" }}
      >
        {children}
      </div>
    </main>
  );
}

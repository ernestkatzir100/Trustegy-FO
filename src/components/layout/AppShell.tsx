import { ThemeToggle } from "./ThemeToggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 ms-[56px] overflow-y-auto">
      {/* Top bar with theme toggle */}
      <div
        className="flex items-center justify-end px-10 py-3"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <ThemeToggle />
      </div>
      <div className="mx-auto max-w-[1120px] px-10 py-8 animate-[fade-in_300ms_ease] motion-reduce:animate-none">
        {children}
      </div>
    </main>
  );
}

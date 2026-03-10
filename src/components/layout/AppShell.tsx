export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 ms-[56px] overflow-y-auto">
      <div className="mx-auto max-w-[1120px] px-10 py-8 animate-[fade-in_300ms_ease] motion-reduce:animate-none">
        {children}
      </div>
    </main>
  );
}

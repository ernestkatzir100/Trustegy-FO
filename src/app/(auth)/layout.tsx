export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="w-full px-6">
        <div className="mx-auto flex flex-col items-center">
          {children}
        </div>
      </div>
    </div>
  );
}

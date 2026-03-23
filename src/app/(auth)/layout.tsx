export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "linear-gradient(135deg, #0F1117 0%, #161B27 100%)" }}>
      <div className="w-full px-6">
        <div className="mx-auto flex flex-col items-center">
          {children}
        </div>
      </div>
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import { loginWithGoogle, loginWithMicrosoft, loginWithCredentials } from "@/lib/auth/actions";

const isDev = process.env.DEV_LOGIN_ENABLED === "true";

export default async function SignInPage() {
  const tApp = await getTranslations("app");
  const tAuth = await getTranslations("auth");

  const inputStyle = {
    width: "100%",
    height: 44,
    borderRadius: 12,
    background: "var(--bg-tint)",
    border: "1px solid var(--border-subtle)",
    padding: "0 16px",
    fontSize: 14,
    color: "var(--text-primary)",
    outline: "none",
  } as const;

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-[360px]">
      {/* Brand */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="flex items-center justify-center"
          style={{ width: 48, height: 48, borderRadius: 16, background: "#0d9488", boxShadow: "0 4px 20px rgba(13,148,136,0.3)" }}
        >
          <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1 }}>ש</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            {tApp("name")}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{tApp("tagline")}</p>
        </div>
      </div>

      {/* Dev credentials login */}
      {isDev && (
        <form action={loginWithCredentials} className="flex flex-col gap-3 w-full">
          <div style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "#f59e0b", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: "4px 12px" }}>
            Dev Login
          </div>
          <input
            name="email"
            type="email"
            defaultValue="dev@shefa.local"
            placeholder="Email"
            style={inputStyle}
          />
          <input
            name="password"
            type="password"
            defaultValue="dev123"
            placeholder="Password"
            style={inputStyle}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              height: 44,
              borderRadius: 12,
              background: "#0d9488",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            {tAuth("signIn")}
          </button>
        </form>
      )}

      {isDev && (
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1" style={{ height: 1, background: "var(--border-subtle)" }} />
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>או</span>
          <div className="flex-1" style={{ height: 1, background: "var(--border-subtle)" }} />
        </div>
      )}

      {/* OAuth buttons */}
      <div className="flex flex-col gap-3 w-full">
        <form action={loginWithGoogle}>
          <button
            type="submit"
            className="flex items-center justify-center gap-3 w-full transition-colors"
            style={{
              height: 44,
              borderRadius: 12,
              background: "var(--bg-tint)",
              border: "1px solid var(--border-strong)",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {tAuth("signInWith", { provider: "Google" })}
          </button>
        </form>

        <form action={loginWithMicrosoft}>
          <button
            type="submit"
            className="flex items-center justify-center gap-3 w-full transition-colors"
            style={{
              height: 44,
              borderRadius: 12,
              background: "var(--bg-tint)",
              border: "1px solid var(--border-strong)",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#F25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
              <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
            {tAuth("signInWith", { provider: "Microsoft" })}
          </button>
        </form>
      </div>
    </div>
  );
}

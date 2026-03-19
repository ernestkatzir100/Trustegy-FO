import { getTranslations } from "next-intl/server";
import { loginWithGoogle, loginWithMicrosoft, loginWithCredentials } from "@/lib/auth/actions";

const isDev = process.env.DEV_LOGIN_ENABLED === "true";

export default async function SignInPage() {
  const tApp = await getTranslations("app");
  const tAuth = await getTranslations("auth");

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-[360px]">
      {/* Brand */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gold flex items-center justify-center shadow-md">
          <span className="text-[20px] font-bold text-white leading-none">ש</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-[28px] font-semibold text-text-primary tracking-tight">
            {tApp("name")}
          </h1>
          <p className="text-text-secondary text-[14px]">{tApp("tagline")}</p>
        </div>
      </div>

      {/* Dev credentials login */}
      {isDev && (
        <form action={loginWithCredentials} className="flex flex-col gap-3 w-full">
          <div className="text-center text-[12px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            Dev Login
          </div>
          <input
            name="email"
            type="email"
            defaultValue="dev@shefa.local"
            placeholder="Email"
            className="w-full h-11 rounded-xl bg-white border border-cream-darker px-4 text-[14px] text-text-primary focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
          <input
            name="password"
            type="password"
            defaultValue="dev123"
            placeholder="Password"
            className="w-full h-11 rounded-xl bg-white border border-cream-darker px-4 text-[14px] text-text-primary focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-gold hover:bg-gold/90 text-white text-[14px] font-medium transition-colors shadow-sm"
          >
            {tAuth("signIn")}
          </button>
        </form>
      )}

      {isDev && (
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-cream-darker" />
          <span className="text-[12px] text-text-secondary">או</span>
          <div className="flex-1 h-px bg-cream-darker" />
        </div>
      )}

      {/* OAuth buttons */}
      <div className="flex flex-col gap-3 w-full">
        <form action={loginWithGoogle}>
          <button
            type="submit"
            className="flex items-center justify-center gap-3 w-full h-11 rounded-xl bg-white hover:bg-cream-dark border border-cream-darker transition-colors text-[14px] font-medium text-text-primary shadow-sm"
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
            className="flex items-center justify-center gap-3 w-full h-11 rounded-xl bg-white hover:bg-cream-dark border border-cream-darker transition-colors text-[14px] font-medium text-text-primary shadow-sm"
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

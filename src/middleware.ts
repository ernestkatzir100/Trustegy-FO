import NextAuth from "next-auth";
import authConfig from "@/lib/auth/config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnSignIn = req.nextUrl.pathname.startsWith("/sign-in");
  const isOnAuthApi = req.nextUrl.pathname.startsWith("/api/auth");
  const isOnHealthApi = req.nextUrl.pathname.startsWith("/api/health");
  const isOnSetupApi = req.nextUrl.pathname.startsWith("/api/setup-db");
  const isOnTwoFactor = req.nextUrl.pathname.startsWith("/two-factor");

  if (isOnAuthApi || isOnHealthApi || isOnSetupApi) return;

  if (!isLoggedIn && !isOnSignIn) {
    return Response.redirect(new URL("/sign-in", req.nextUrl));
  }

  if (isLoggedIn && isOnSignIn) {
    return Response.redirect(new URL("/", req.nextUrl));
  }

  // 2FA gate: user is logged in but hasn't completed TOTP verification
  if (
    isLoggedIn &&
    req.auth?.twoFactorVerified === false &&
    !isOnTwoFactor &&
    !isOnSignIn
  ) {
    return Response.redirect(new URL("/two-factor", req.nextUrl));
  }

  // If user has already verified 2FA (or doesn't have it), don't let them visit /two-factor
  if (isLoggedIn && req.auth?.twoFactorVerified !== false && isOnTwoFactor) {
    return Response.redirect(new URL("/", req.nextUrl));
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

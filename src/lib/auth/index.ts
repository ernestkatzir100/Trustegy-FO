import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import authConfig from "./config";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  twoFactorAuth,
} from "@/db/schema/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }

      // On initial sign-in, check if user has TOTP enabled
      if (trigger === "signIn" && token.id) {
        const totpRecord = await db
          .select({ enabled: twoFactorAuth.enabled })
          .from(twoFactorAuth)
          .where(eq(twoFactorAuth.userId, token.id as string))
          .limit(1);

        const hasTOTP = totpRecord.length > 0 && totpRecord[0].enabled;
        token.twoFactorEnabled = hasTOTP;
        token.twoFactorVerified = !hasTOTP; // If no TOTP, auto-verified
      }

      // On update trigger (after TOTP verification), mark as verified
      if (trigger === "update" && token.twoFactorEnabled) {
        token.twoFactorVerified = true;
      }

      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      session.twoFactorVerified = (token.twoFactorVerified as boolean) ?? true;
      return session;
    },
  },
});

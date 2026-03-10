import messages from "../messages/he.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: "he-IL";
    Messages: typeof messages;
  }
}

declare module "next-auth" {
  interface Session {
    twoFactorVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    twoFactorEnabled?: boolean;
    twoFactorVerified?: boolean;
  }
}
